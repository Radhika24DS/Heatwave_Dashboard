import os
import io
import logging
from typing import List, Dict, Optional
from datetime import datetime
import asyncio

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession
from supabase import create_client, Client
from pypdf import PdfReader

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage

from app.core.config import settings
from app.models.document import Document
from app.models.document_chunk import DocumentChunk
from app.models.embeddings import Embedding
from app.models.advisory import Advisory
from app.models.enums import AdvisoryRole, RiskLevel

logger = logging.getLogger(__name__)

class RagService:
    def __init__(self):
        # Initialize Supabase client for storage
        self.supabase: Client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY
        )
        self.bucket_name = "hews-documents"
        
        # Initialize Gemini components
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/gemini-embedding-2",
            google_api_key=settings.GEMINI_API_KEY
        )
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash", 
            temperature=0.2,
            google_api_key=settings.GEMINI_API_KEY
        )
        
        # Chunking strategy
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50,
            separators=["\n\n", "\n", " ", ""]
        )

    async def ingest_from_supabase(self, db: AsyncSession, admin_user_id: int) -> Dict[str, any]:
        """
        Downloads PDFs from the Supabase bucket, chunks, embeds, and stores them in pgvector.
        Avoids duplicate processing by checking filename.
        """
        logger.info(f"Starting PDF ingestion from Supabase bucket '{self.bucket_name}'...")
        
        try:
            files_response = self.supabase.storage.from_(self.bucket_name).list()
        except Exception as e:
            logger.error(f"Failed to list files in Supabase bucket '{self.bucket_name}': {e}")
            raise

        pdf_files = [f for f in files_response if f.get("name", "").lower().endswith(".pdf")]
        if not pdf_files:
            return {"status": "success", "message": "No PDF files found in bucket.", "processed": 0, "skipped": 0}

        processed_count = 0
        skipped_count = 0

        for file_meta in pdf_files:
            filename = file_meta["name"]
            
            # Check if document already exists
            existing_doc = await db.execute(select(Document).where(Document.filename == filename))
            if existing_doc.scalars().first():
                logger.info(f"Skipping '{filename}' - already ingested.")
                skipped_count += 1
                continue
                
            category_str = "PUBLIC"
            fname_lower = filename.lower()
            if "farmer" in fname_lower:
                category_str = "FARMER"
            elif "traveller" in fname_lower or "travel" in fname_lower:
                category_str = "TRAVELLER"

            logger.info(f"Processing '{filename}' as category {category_str}...")
            
            try:
                file_bytes = self.supabase.storage.from_(self.bucket_name).download(filename)
            except Exception as e:
                logger.error(f"Failed to download '{filename}': {e}")
                continue

            try:
                reader = PdfReader(io.BytesIO(file_bytes))
                full_text = ""
                for page in reader.pages:
                    extracted = page.extract_text()
                    if extracted:
                        full_text += extracted + "\n"
            except Exception as e:
                logger.error(f"Failed to parse PDF '{filename}': {e}")
                continue

            chunks = self.text_splitter.split_text(full_text)
            if not chunks:
                logger.warning(f"No text extracted from '{filename}'.")
                continue

            try:
                vectors = self.embeddings.embed_documents(chunks)
            except Exception as e:
                logger.error(f"Failed to embed chunks for '{filename}': {e}")
                continue

            new_doc = Document(
                uploaded_by_user_id=admin_user_id,
                filename=filename,
                storage_path=f"{self.bucket_name}/{filename}",
                category=category_str
            )
            db.add(new_doc)
            await db.flush()

            for idx, (chunk_text, vector) in enumerate(zip(chunks, vectors)):
                doc_chunk = DocumentChunk(
                    document_id=new_doc.id,
                    chunk_index=idx,
                    content=chunk_text
                )
                db.add(doc_chunk)
                await db.flush()
                
                embedding_rec = Embedding(
                    chunk_id=doc_chunk.id,
                    embedding=vector
                )
                db.add(embedding_rec)

            processed_count += 1
            logger.info(f"Successfully ingested '{filename}' with {len(chunks)} chunks.")

        try:
            await db.commit()
            return {
                "status": "success",
                "message": f"Ingestion complete. Processed {processed_count} files, skipped {skipped_count}.",
                "processed": processed_count,
                "skipped": skipped_count
            }
        except Exception as e:
            await db.rollback()
            logger.error(f"Failed to commit ingestion transaction: {e}")
            raise


    async def retrieve_and_generate(
        self,
        db: AsyncSession,
        query: str,
        role: AdvisoryRole,
        district_name: str,
        current_weather: str,
        severity_tier: str,
        alert_level: str,
        risk_level_enum: RiskLevel
    ) -> Optional[Advisory]:
        """
        Retrieves relevant chunks based on role mapping and uses Gemini LLM
        to synthesize an advisory. Saves and returns the Advisory.
        """
        logger.info(f"Generating RAG advisory for role '{role.value}', alert '{alert_level}' in '{district_name}'")

        try:
            query_vector = self.embeddings.embed_query(query)
        except Exception as e:
            logger.error(f"Failed to embed query: {e}")
            return None

        allowed_categories = ["PUBLIC"]
        if role == AdvisoryRole.FARMER:
            allowed_categories = ["FARMER"]
        elif role == AdvisoryRole.TRAVELLER:
            allowed_categories = ["TRAVELLER"]
        elif role in [AdvisoryRole.AUTHORITY, AdvisoryRole.ADMIN, AdvisoryRole.RESEARCH]:
            allowed_categories = ["PUBLIC", "FARMER", "TRAVELLER"]

        k = 5
        sql_query = text(f"""
            SELECT dc.content, d.filename, d.category, 1 - (e.embedding <=> :vector) AS similarity
            FROM embeddings e
            JOIN document_chunks dc ON e.chunk_id = dc.id
            JOIN documents d ON dc.document_id = d.id
            WHERE d.category = ANY(:categories)
            ORDER BY e.embedding <=> :vector
            LIMIT :k
        """)
        
        result = await db.execute(sql_query, {
            "vector": f"[{','.join(map(str, query_vector))}]",
            "categories": tuple(allowed_categories),
            "k": k
        })
        
        rows = result.fetchall()
        
        threshold = 0.3
        valid_chunks = []
        sources = set()
        for row in rows:
            if row.similarity >= threshold:
                valid_chunks.append(f"Source: {row.filename}\nContent:\n{row.content}\n---")
                sources.add(row.filename)

        if not valid_chunks:
            logger.warning(f"No chunks met similarity > {threshold}. Using fallback.")
            advisory_text = (
                f"Please take standard precautions for a {severity_tier} heatwave. "
                "Stay hydrated, avoid direct sunlight during peak hours, and check on vulnerable individuals."
            )
            document_source = "Fallback (No relevant documents retrieved)"
        else:
            context_str = "\n".join(valid_chunks)
            system_prompt = (
                "You are an expert meteorological safety advisor. "
                "Your task is to generate a concise, actionable advisory (150-250 words) based ONLY on the provided context."
                "Do not hallucinate advice outside the context. Synthesize the context clearly."
            )
            
            user_prompt = f"""
            Scenario:
            - User Role: {role.value}
            - District: {district_name}
            - Current Weather: {current_weather}
            - Forecast Severity: {severity_tier}
            - Alert Level: {alert_level}
            
            Retrieved Context:
            {context_str}
            
            Please provide a personalized advisory for this user.
            """
            
            try:
                response = self.llm.invoke([
                    SystemMessage(content=system_prompt),
                    HumanMessage(content=user_prompt)
                ])
                advisory_text = response.content.strip()
                document_source = ", ".join(sources)
            except Exception as e:
                logger.error(f"LLM generation failed: {e}")
                advisory_text = "Standard precautions apply. Stay hydrated and avoid peak heat."
                document_source = "Fallback (LLM Error)"

        advisory_title = f"{alert_level} Heatwave Advisory for {role.value.capitalize()}s in {district_name}"
        advisory_record = Advisory(
            role=role,
            risk_level=risk_level_enum,
            title=advisory_title,
            content=advisory_text,
            document_source=document_source
        )
        
        db.add(advisory_record)
        try:
            await db.commit()
            return advisory_record
        except Exception as e:
            await db.rollback()
            logger.error(f"Failed to save generated advisory: {e}")
            return None
