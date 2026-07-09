import logging
import json
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage

from app.api import deps
from app.core.config import settings
from app.db.session import get_db
from app.utils.responses import standard_response

logger = logging.getLogger(__name__)
router = APIRouter()

# Static Crop Advisories Fallback (from HEWS Farmer Heatwave Advisory PDF)
CROP_FALLBACKS = {
    "cotton": {
        "action": "DEEP NIGHT IRRIGATION & REDUCE STRESS",
        "depth_mm": 80,
        "best_time": "8 PM - 5 AM",
        "reason": "Excessive heat causes yellow ring on stem making it vulnerable to bacterial wilting. Avoid nitrogen fertilizer during peak heat.",
        "confidence": 0.85
    },
    "tomato": {
        "action": "ERECT 30-40% SHADE NET & POTASSIUM SPRAY",
        "depth_mm": 30,
        "best_time": "Before 9 AM or After 6 PM",
        "reason": "Prevents flower drop and sunscald on fruit above 35°C. Foliar potassium nitrate (1%) improves heat tolerance.",
        "confidence": 0.80
    },
    "pepper": {
        "action": "ERECT 30-40% SHADE NET & POTASSIUM SPRAY",
        "depth_mm": 30,
        "best_time": "Before 9 AM or After 6 PM",
        "reason": "Prevents flower drop and sunscald on fruit above 35°C. Foliar potassium nitrate (1%) improves heat tolerance.",
        "confidence": 0.80
    },
    "eggplant": {
        "action": "ERECT 30-40% SHADE NET & POTASSIUM SPRAY",
        "depth_mm": 30,
        "best_time": "Before 9 AM or After 6 PM",
        "reason": "Prevents flower drop and sunscald on fruit above 35°C. Foliar potassium nitrate (1%) improves heat tolerance.",
        "confidence": 0.80
    },
    "chilli": {
        "action": "LIGHT & FREQUENT IRRIGATION WITH AFTERNOON SHADE",
        "depth_mm": 25,
        "best_time": "Before 8 AM",
        "reason": "High temperatures cause flower/fruit drop and pollination failure. Light frequent watering cools the root zone.",
        "confidence": 0.82
    },
    "okra": {
        "action": "LIGHT & FREQUENT IRRIGATION WITH AFTERNOON SHADE",
        "depth_mm": 25,
        "best_time": "Before 8 AM",
        "reason": "High temperatures cause pollination failure. Light frequent watering cools the root zone.",
        "confidence": 0.82
    },
    "cucurbits": {
        "action": "LIGHT & FREQUENT IRRIGATION WITH AFTERNOON SHADE",
        "depth_mm": 25,
        "best_time": "Before 8 AM",
        "reason": "High temperatures cause pollination failure and flower drop. Light frequent watering cools the root zone.",
        "confidence": 0.82
    },
    "bitter gourd": {
        "action": "ERECT SHADE NETS ON TRELLIS",
        "depth_mm": 20,
        "best_time": "Before 9 AM",
        "reason": "Trellised bitter gourd is highly vulnerable to sun-burn on exposed fruit surfaces. Increase irrigation frequency.",
        "confidence": 0.78
    },
    "mango": {
        "action": "WHITE-WASH TRUNKS & ERECT THATCH SHADE",
        "depth_mm": 50,
        "best_time": "After sunset",
        "reason": "Trunks develop sunburn, bark cracking and moisture loss. White-wash (25kg slaked lime + 500g copper sulphate + 500g gum suresh in 100L water) reflects heat.",
        "confidence": 0.90
    },
    "litchi": {
        "action": "WHITE-WASH TRUNKS & ERECT THATCH SHADE",
        "depth_mm": 50,
        "best_time": "After sunset",
        "reason": "Trunks develop sunburn, bark cracking and moisture loss. White-wash (25kg slaked lime + 500g copper sulphate + 500g gum suresh in 100L water) reflects heat.",
        "confidence": 0.90
    },
    "citrus": {
        "action": "WHITE-WASH TRUNKS & ERECT THATCH SHADE",
        "depth_mm": 50,
        "best_time": "After sunset",
        "reason": "Trunks develop sunburn, bark cracking and moisture loss. White-wash (25kg slaked lime + 500g copper sulphate + 500g gum suresh in 100L water) reflects heat.",
        "confidence": 0.90
    },
    "guava": {
        "action": "WHITE-WASH TRUNKS & ERECT THATCH SHADE",
        "depth_mm": 50,
        "best_time": "After sunset",
        "reason": "Trunks develop sunburn, bark cracking and moisture loss. White-wash (25kg slaked lime + 500g copper sulphate + 500g gum suresh in 100L water) reflects heat.",
        "confidence": 0.90
    },
    "papaya": {
        "action": "WHITE-WASH TRUNKS & ERECT THATCH SHADE",
        "depth_mm": 50,
        "best_time": "After sunset",
        "reason": "Trunks develop sunburn, bark cracking and moisture loss. White-wash (25kg slaked lime + 500g copper sulphate + 500g gum suresh in 100L water) reflects heat.",
        "confidence": 0.90
    },
    "groundnut": {
        "action": "MAINTAIN DEEP SOIL MOISTURE",
        "depth_mm": 40,
        "best_time": "Early morning before 9 AM",
        "reason": "Groundnut suffers poor pod-filling above 36°C. Keep soil moist and harvest early if forecast worsens.",
        "confidence": 0.84
    },
    "pulses": {
        "action": "PROMPT HARVESTING",
        "depth_mm": 0,
        "best_time": "Before 9 AM",
        "reason": "Pulses (Tur, Moong) experience flower sterility above 37°C. Harvest immediately at first sign of commercial maturity.",
        "confidence": 0.88
    },
    "tur": {
        "action": "PROMPT HARVESTING",
        "depth_mm": 0,
        "best_time": "Before 9 AM",
        "reason": "Pulses experience flower sterility above 37°C. Harvest immediately at first sign of commercial maturity.",
        "confidence": 0.88
    },
    "moong": {
        "action": "PROMPT HARVESTING",
        "depth_mm": 0,
        "best_time": "Before 9 AM",
        "reason": "Pulses experience flower sterility above 37°C. Harvest immediately at first sign of commercial maturity.",
        "confidence": 0.88
    },
    "paddy": {
        "action": "KEEP FIELD FLOODED & MIDDAY CANOPY SPRAY",
        "depth_mm": 60,
        "best_time": "8 PM - 5 AM",
        "reason": "Paddy suffers spikelet sterility during panicle initiation under high heat. Midday canopy spray helps reduce micro-climate temperature.",
        "confidence": 0.86
    },
    "maize": {
        "action": "MAINTAIN MOISTURE & OPTIONAL SHADE NET",
        "depth_mm": 35,
        "best_time": "Before 9 AM",
        "reason": "Maize experience silk desiccation above 38°C. Ensure adequate water during tasseling to protect pollination.",
        "confidence": 0.79
    },
    "leafy vegetables": {
        "action": "AFTERNOON SHADE & TWICE-DAILY IRRIGATION",
        "depth_mm": 15,
        "best_time": "5-7 AM and 6-8 PM",
        "reason": "Lettuce, spinach, and cauliflower suffer growth impairment and bolting above 32-35°C. Afternoon shade is essential.",
        "confidence": 0.83
    }
}

@router.get("/advisories")
async def get_farmer_advisories(
    crop_type: str = Query(..., description="Type of crop"),
    temp: float = Query(35.0, description="Current temperature in C"),
    humidity: float = Query(60.0, description="Current relative humidity %"),
    wind: float = Query(10.0, description="Current wind speed in km/h"),
    db: AsyncSession = Depends(get_db)
):
    """
    Fetches customized agricultural plant safety advice for a specific crop and weather context.
    Uses Gemini LLM to synthesize recommendation if API key is present; falls back to static guidelines.
    """
    crop_key = crop_type.lower().strip()
    
    # Locate best fallback match
    fallback = None
    for k, v in CROP_FALLBACKS.items():
        if k in crop_key or crop_key in k:
            fallback = v
            break
            
    if not fallback:
        # Generic fallback
        fallback = {
            "action": "MONITOR SOIL MOISTURE & IRRIGATION",
            "depth_mm": 30,
            "best_time": "Early morning before 9 AM",
            "reason": f"Under current conditions ({temp}°C, {humidity}% humidity), keep the crop well irrigated and avoid applying nitrogen fertilizers.",
            "confidence": 0.70
        }

    # If Gemini is configured, use it for dynamic synthesis
    if settings.GEMINI_API_KEY and len(settings.GEMINI_API_KEY) > 5:
        try:
            llm = ChatGoogleGenerativeAI(
                model="gemini-2.5-flash",
                temperature=0.2,
                google_api_key=settings.GEMINI_API_KEY
            )
            
            system_prompt = (
                "You are an expert agronomist advisor specializing in Karnataka crops and heat stress management. "
                "You must output ONLY a valid JSON object matching the requested schema. Do not output markdown, preambles, or backticks."
            )
            
            user_prompt = f"""
            Generate agricultural safety advice for the crop: '{crop_type}' under the following weather conditions:
            - Temperature: {temp}°C
            - Relative Humidity: {humidity}%
            - Wind Speed: {wind} km/h
            
            Format your response strictly as a JSON object with these keys:
            - "action": Specific recommended action (string, max 8 words)
            - "depth_mm": Recommending irrigation depth in mm if applicable, else 0 (integer)
            - "best_time": Best time of day to perform action (string, max 5 words)
            - "reason": Scientific reason based on evapotranspiration and heat thresholds (string, max 30 words)
            - "confidence": Float between 0.0 and 1.0 (float)
            
            Example:
            {{
              "action": "DEEP IRRIGATION & STOP NITROGEN",
              "depth_mm": 80,
              "best_time": "8 PM to 5 AM",
              "reason": "High heat causes yellow ring on stem. Water cools root zone and prevents bacterial wilting.",
              "confidence": 0.85
            }}
            """
            
            response = await llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt)
            ])
            
            raw_text = response.content.strip()
            # Clean possible backticks
            if raw_text.startswith("```json"):
                raw_text = raw_text.split("```json")[1].split("```")[0].strip()
            elif raw_text.startswith("```"):
                raw_text = raw_text.split("```")[1].split("```")[0].strip()
                
            parsed = json.loads(raw_text)
            
            return standard_response(
                status="success",
                data={
                    "crop_type": crop_type,
                    "action": parsed.get("action", fallback["action"]),
                    "depth_mm": parsed.get("depth_mm", fallback["depth_mm"]),
                    "best_time": parsed.get("best_time", fallback["best_time"]),
                    "reason": parsed.get("reason", fallback["reason"]),
                    "confidence": parsed.get("confidence", fallback["confidence"])
                },
                message="Dynamic agricultural advisory generated."
            )
        except Exception as e:
            logger.error(f"Gemini farmer advisory failed: {e}. Cascading to fallback.")
            
    # Return static fallback
    return standard_response(
        status="success",
        data={
            "crop_type": crop_type,
            "action": fallback["action"],
            "depth_mm": fallback["depth_mm"],
            "best_time": fallback["best_time"],
            "reason": fallback["reason"],
            "confidence": fallback["confidence"]
        },
        message="Static agricultural advisory retrieved (fallback)."
    )
