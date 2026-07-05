# Render Setup & Environment Key Generation Guide

This guide details how to generate, retrieve, and configure all environment keys required for the **Real-Time AI Heatwave EWS** backend on Render.

---

## 1. Generating & Retrieving the Environment Keys

The backend requires 9 environment variables to run. Here is the step-by-step process for getting or generating each one:

### 1.1 Generating a Secure JWT `SECRET_KEY`
The `SECRET_KEY` is used to sign and verify JSON Web Tokens (JWT) for user authentication. It must be a cryptographically secure random string.

*   **Generation Process**:
    Open your local terminal and run the following command using Python:
    ```bash
    python -c "import secrets; print(secrets.token_hex(32))"
    ```
*   **Result**: This will output a 64-character hexadecimal string (e.g., `8f8e02d681c9ab7b5791cbf5d96a7b...`). Copy this value.

---

### 1.2 Retrieving Supabase Database & API Keys
You will get these from your project dashboard on [Supabase](https://supabase.com).

#### A. Database URL (`DATABASE_URL`)
1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Click on your project and go to the **Project Settings** (gear icon at the bottom of the left sidebar).
3. Select **Database** from the settings menu.
4. Scroll down to the **Connection String** section and select the **URI** tab.
5. Copy the connection string. It will look like this:
   ```text
   postgresql://postgres.[your-ref]:[your-password]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```
6. **Replace `[your-password]`** with the database password you chose when creating the Supabase project.
7. Note: The backend configuration will automatically prepend `+asyncpg` (so it becomes `postgresql+asyncpg://...`) upon startup, so you can paste this URI exactly as it is.

#### B. Supabase URL (`SUPABASE_URL`) & Service Role Key (`SUPABASE_SERVICE_ROLE_KEY`)
1. In the **Project Settings** menu, select **API**.
2. Under **Project API keys**:
   *   Find the **Project URL** at the top. Copy this value (e.g. `https://your-project.supabase.co`). This is your `SUPABASE_URL`.
   *   Find the key labeled **`service_role` (secret)**. Click **Reveal** and copy the long token. This is your `SUPABASE_SERVICE_ROLE_KEY`.
   > [!WARNING]  
   > The `service_role` key has full administrative bypass for Row Level Security (RLS). Keep it private and **never** expose it in frontend environments or client code.

---

### 1.3 Generating Google Gemini API Key (`GOOGLE_API_KEY`)
The backend uses Google Gemini embeddings for processing and retrieving documents (RAG).

1. Log in to [Google AI Studio](https://aistudio.google.com/).
2. Click the **Get API Key** button in the top left or center.
3. Click **Create API Key**.
4. Choose either:
   *   *Create API key in new project* (easiest, creates a free GCP project for you).
   *   *Create API key in existing project* (if you have an existing Google Cloud Console project).
5. Copy the generated API key (it starts with `AIzaSy...`).

---

### 1.4 Setting ALLOWED_ORIGINS
This tells the FastAPI backend which frontend domains are allowed to send API requests (CORS policy).

*   **Value**: Add your local address and your Vercel production URL separated by a comma (no spaces!):
    ```text
    http://localhost:5173,https://your-frontend.vercel.app
    ```

---

## 2. Step-by-Step Render Setup

### 2.1 Connecting GitHub to Render
1. Go to [Render Dashboard](https://dashboard.render.com/) and sign in.
2. Click the **New** button in the top-right corner and select **Web Service**.
3. If you haven't linked your GitHub account yet, follow the prompts under **Connect Repository** to authenticate with GitHub and authorize Render to access the repository.
4. Select your project repository from the list.

### 2.2 Configuring the Web Service
Configure the settings as follows:

*   **Name**: `heatwave-backend`
*   **Region**: Select a region close to your database (e.g., if your Supabase project is in AWS Mumbai `ap-south-1`, choose Render's Singapore region).
*   **Branch**: `main`
*   **Root Directory**: Leave blank (representing the root directory `.`)
*   **Runtime**: `Python 3`
*   **Instance Type**: `Free` (or any tier of your choice)
*   **Build Command**:
    ```bash
    pip install -r requirements.txt
    ```
*   **Start Command**:
    ```bash
    uvicorn app.main:app --host 0.0.0.0 --port $PORT
    ```

### 2.3 Setting up the Release Command
To automatically apply migrations and seed the database every time a deploy is made:
1. Scroll down to the bottom of the creation screen and click the **Advanced** button.
2. Find the **Release Command** field.
3. Paste the following:
   ```bash
   alembic upgrade head && python seed.py && python seed_admin.py
   ```

### 2.4 Entering Environment Variables on Render
Under the **Environment Variables** section, click **Add Environment Variable** and enter the following key-value pairs:

| Key | Value | Notes |
| :--- | :--- | :--- |
| `PROJECT_NAME` | `Real-Time AI Heatwave EWS` | Static configuration |
| `API_V1_STR` | `/api/v1` | Static configuration |
| `SECRET_KEY` | *[Your generated 64-char hex string]* | From step 1.1 |
| `JWT_ALGORITHM` | `HS256` | Static configuration |
| `DATABASE_URL` | *[Your Supabase Connection URI]* | From step 1.2A |
| `SUPABASE_URL` | *[Your Supabase Project URL]* | From step 1.2B |
| `SUPABASE_SERVICE_ROLE_KEY` | *[Your Supabase Service Role Key]* | From step 1.2B |
| `GOOGLE_API_KEY` | *[Your Google Gemini API Key]* | From step 1.3 |
| `ALLOWED_ORIGINS` | `http://localhost:5173,https://your-frontend.vercel.app` | Update this after Vercel is deployed |

---

## 3. Saving & Triggering Deployment
1. Click **Create Web Service** at the bottom of the page.
2. Render will spin up a build container, install your dependencies, run the **Release Command** (to migrate and seed your Supabase database), and launch the FastAPI server.
3. Once the build log says `Live`, copy your service's URL (e.g. `https://heatwave-backend.onrender.com`). You will use this in Vercel as `VITE_API_BASE_URL`.
