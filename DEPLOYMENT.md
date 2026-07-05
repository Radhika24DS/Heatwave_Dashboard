# Real-Time AI Heatwave EWS - Deployment Guide

This document provides a comprehensive, step-by-step guide to deploying the entire **Real-Time AI Heatwave Early Warning System (EWS)** project.

We will host:
1. **Database & Object Storage**: [Supabase](https://supabase.com) (PostgreSQL with `pgvector` + Supabase Storage)
2. **Backend API**: [Render](https://render.com) (FastAPI Python Service)
3. **Frontend**: [Vercel](https://vercel.com) (Vite + React SPA)

---

## Architecture Overview

```mermaid
graph TD
    User([User Browser]) -->|HTTPS| Vercel[Vercel Frontend: Vite/React]
    Vercel -->|REST API Requests| Render[Render Backend: FastAPI]
    Render -->|Embeddings API| Gemini[Google Gemini API]
    Render -->|Postgres Connection| SupabaseDB[(Supabase Database: pgvector)]
    Render -->|Object Storage SDK| SupabaseStore[(Supabase Storage: hews-documents)]
```

---

## Prerequisites

Before starting, ensure you have accounts with:
*   [GitHub](https://github.com) (where your code is pushed)
*   [Supabase](https://supabase.com)
*   [Render](https://render.com)
*   [Vercel](https://vercel.com)
*   [Google AI Studio](https://aistudio.google.com/) (to get a Gemini API Key)

---

## Step 1: Database & Storage Setup (Supabase)

Supabase provides the PostgreSQL database and the bucket storage for PDF documents.

### 1.1 Create a New Supabase Project
1. Log in to [Supabase Console](https://supabase.com/dashboard) and click **New Project**.
2. Select your organization, name your project (e.g., `heatwave-ews`), and set a secure database password (save this password!).
3. Choose a region close to your target users and click **Create New Project**. It will take a couple of minutes to provision.

### 1.2 Enable the pgvector Extension
The backend uses vectors for document search. You must enable `pgvector` on your database:
1. In the Supabase sidebar, click on **SQL Editor**.
2. Click **New query**.
3. Paste the following SQL query and click **Run**:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
4. Verify that the query returns successfully.

### 1.3 Create the Document Storage Bucket
The backend expects a storage bucket named `hews-documents` to store documents:
1. In the Supabase sidebar, click on **Storage**.
2. Click **New Bucket**.
3. Set the Bucket Name to exactly `hews-documents`.
4. Keep the bucket **Public** (or configure appropriate RLS/Access policies if you prefer private storage, though the service-role key will have full bypass permissions).
5. Click **Save**.

### 1.4 Get Database and API Credentials
Navigate to **Project Settings** (gear icon) -> **API** or **Database**:
*   **Database Connection URL**: Under **Database**, scroll to **Connection string** -> choose **URI** format. Copy the URL. It will look like this:
    `postgresql://postgres.[your-project-ref]:[your-password]@aws-0-[region].pooler.supabase.com:6543/postgres`
    > [!IMPORTANT]  
    > Use the **Session Pooler** (port 5432) or **Direct Connection** (port 5432) for migrations and standard operations, or use the **Transaction Pooler** (port 6543). Disabling statement caches is already configured in the code, making the Transaction Pooler safe.
*   **Project URL**: Under **API**, copy the **Project URL** (used as `SUPABASE_URL`).
*   **Service Role JWT**: Under **API**, find the `service_role` key (reveal and copy it; this is used as `SUPABASE_SERVICE_ROLE_KEY`). Do not expose this key to the frontend!

---

## Step 2: Backend Deployment (Render)

Render will host the FastAPI service. Since the codebase contains both backend (root level) and frontend (in the `frontend` folder), we configure Render to only build and deploy the backend.

### 2.1 Create the Web Service
1. Go to [Render Dashboard](https://dashboard.render.com) and click **New** -> **Web Service**.
2. Connect your GitHub repository containing the project.
3. Configure the following service settings:
    *   **Name**: `heatwave-backend` (or similar)
    *   **Language**: `Python 3`
    *   **Root Directory**: `.` (leave as empty or root, since the backend code and `requirements.txt` are in the root directory)
    *   **Branch**: `main` (or your active development branch)
    *   **Build Command**:
        ```bash
        pip install -r requirements.txt
        ```
    *   **Start Command**:
        ```bash
        uvicorn app.main:app --host 0.0.0.0 --port $PORT
        ```

### 2.2 Configure the Release Command (Automated Migrations & Seeding)
To automatically apply database migrations and seed default Indian districts when deploying:
1. Scroll down to **Advanced** settings on the Web Service creation page (or go to settings after creation).
2. Under **Release Command**, enter:
   ```bash
   alembic upgrade head && python seed.py && python seed_admin.py
   ```
   *This command runs after a successful build but before the new deployment goes live, ensuring the database is always in sync with your models and populated with initial data.*

### 2.3 Set Backend Environment Variables
In the **Environment Variables** section on Render, add the following keys:

| Environment Variable | Recommended Value / Source |
| :--- | :--- |
| `PROJECT_NAME` | `Real-Time AI Heatwave EWS` |
| `API_V1_STR` | `/api/v1` |
| `SECRET_KEY` | *[Generate a long random secure string for JWT signing]* |
| `JWT_ALGORITHM` | `HS256` |
| `DATABASE_URL` | *[Your Supabase Database Connection URI. Replace `postgresql://` with `postgresql+asyncpg://` if manual, or paste as-is since the backend config will auto-convert it]* |
| `SUPABASE_URL` | *[Your Supabase Project URL, e.g. `https://xxx.supabase.co`]* |
| `SUPABASE_SERVICE_ROLE_KEY` | *[Your Supabase `service_role` private key]* |
| `GOOGLE_API_KEY` | *[Your Google Gemini API Key from Google AI Studio]* |
| `ALLOWED_ORIGINS` | `http://localhost:5173,https://your-frontend.vercel.app` <br>*(Update this after Vercel deployment with your production URL to prevent CORS blocks)* |

---

## Step 3: Frontend Deployment (Vercel)

Vercel will build and host the Vite + React frontend.

### 3.1 Create the Vercel Project
1. Log in to the [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New** -> **Project**.
2. Import the same GitHub repository.
3. Configure the Project Setup:
    *   **Framework Preset**: `Vite`
    *   **Root Directory**: Click *Edit* and select **`frontend`** (this is crucial since the React code is inside the subfolder).
    *   **Build Command**: `npm run build` (default for Vite)
    *   **Output Directory**: `dist` (default for Vite)
4. Add the following **Environment Variable** under the Environment Variables section:
    *   **Key**: `VITE_API_BASE_URL`
    *   **Value**: `https://your-backend-service.onrender.com/api/v1` *(Use your actual Render Web Service URL. Include the `/api/v1` suffix).*
5. Click **Deploy**. Vercel will build the React app and deploy it.

### 3.2 SPA Routing (Vercel Configuration)
The frontend uses `react-router-dom` for client-side routing. If a user refreshes their browser on page `/dashboard`, Vercel will attempt to serve a file at `/dashboard/index.html` and return a 404.
We have configured a `frontend/vercel.json` in the root of the frontend folder:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
*This ensures all routes are redirected back to `index.html` so React Router can handle them internally.*

---

## Step 4: Link Frontend & Backend (CORS Update)

Now that both services are deployed, update the CORS origins to authorize requests between them:

1. Copy your Vercel deployment URL (e.g. `https://heatwave-dashboard.vercel.app`).
2. Go to your **Render Dashboard** -> Select the `heatwave-backend` service -> Go to **Environment**.
3. Edit the `ALLOWED_ORIGINS` variable. Add your Vercel URL separated by a comma (keep `http://localhost:5173` if you want to continue debugging locally):
   ```text
   http://localhost:5173,https://heatwave-dashboard.vercel.app
   ```
4. Click **Save Changes**. Render will automatically redeploy the service to apply the new environment settings.

---

## Step 5: Post-Deployment Verification

To verify that all components are connected correctly, you can run the deployment verification script:

1. Locally, configure your `.env` file to point to the production database and services:
   *   Set `DATABASE_URL` to your production Supabase database.
   *   Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to your production Supabase credentials.
   *   Set `GEMINI_API_KEY` to your API key.
2. Run the verification script:
   ```bash
   python verify_deployment.py
   ```
3. Ensure all checks return `[PASS]`:
   *   **Database Extension**: Verification that `vector` is enabled.
   *   **Tables**: Verification that the `users`, `districts`, etc. tables are migrated and seeded.
   *   **Supabase Storage**: Verification that bucket `hews-documents` is accessible.
   *   **Gemini API**: Verification that embeddings are successfully generated using Gemini.

Alternatively, visit the Swagger docs of your live backend:
`https://your-backend-service.onrender.com/docs`
You should see all API endpoints and be able to hit the `/health` endpoint successfully.

---

## Troubleshooting Guide

### 1. Database migrations failing on Render
*   **Error**: `Relation "..." does not exist` or connection timeout.
*   **Solution**: Ensure your `DATABASE_URL` is correct, and that `pgvector` has been enabled. Render might run out of database connections if you are using Supabase's direct connection. Switch to the Supabase connection pooler string (port `6543` with `?pgbouncer=true` if required, although `asyncpg` has transaction-level bypass enabled).

### 2. CORS Errors in Frontend Browser Console
*   **Error**: `Access to fetch at ... has been blocked by CORS policy`
*   **Solution**: Double-check the `ALLOWED_ORIGINS` variable in your Render dashboard environment settings. Ensure there are no spaces after commas, and the URL does *not* end with a trailing slash `/` (e.g., use `https://my-app.vercel.app`, not `https://my-app.vercel.app/`).

### 3. Vercel returns 404 when navigating or reloading pages
*   **Error**: Vercel `404: NOT_FOUND`
*   **Solution**: Ensure `vercel.json` exists inside the `frontend` folder (not the project root) and contains the routing rewrite rule. Make sure it is committed to GitHub and deployed by Vercel.

### 4. Admin Seeding Account
The `seed_admin.py` script automatically creates an administrator account for you.
*   **Admin Email**: `admin_RDS@gmail.com`
*   **Admin Password**: `AdminPassword123!`
Use these credentials to log in to the system. Change this password immediately after logging in for security!
