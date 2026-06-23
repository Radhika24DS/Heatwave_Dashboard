# Real-Time AI-Based Heatwave Early Warning and Risk Prediction System Using Aerosol and IMD Data

## Phase 1: Database Schema & Backend Architecture (Foundation Layer)

This directory houses the foundational backend codebase for Phase 1. It provides a production-ready, clean, scalable FastAPI directory structure, integrated with an asynchronous PostgreSQL database schema via SQLAlchemy 2.0 and migration management via Alembic.

---

## Technical Stack
- **Backend Framework:** FastAPI (async)
- **Database:** PostgreSQL 15+
- **Asynchronous ORM:** SQLAlchemy 2.0 (using `AsyncSession` & `asyncpg`)
- **Database Migrations:** Alembic
- **Schemas & Config:** Pydantic v2 & Pydantic Settings
- **ASGI Server:** Uvicorn
- **Development Tooling:** Python 3.11+

---

## Directory Structure
```text
e:\Research_Project\Major_Heatwaves\
├── .env                  # Configuration variables (git ignored)
├── .env.example          # Template for env variables
├── .gitignore            # Git ignored files template
├── alembic.ini           # Alembic migration configuration
├── requirements.txt      # Python dependencies
├── README.md             # This file
├── run.py                # Fast launch script
├── seed.py               # Seed database with sample districts
└── app/
    ├── main.py           # Application entrypoint
    ├── api/              # API endpoints / routers
    │   ├── deps.py       # Dependencies (e.g. database session)
    │   └── v1/           # API version 1 routers
    │       ├── api.py    # Merged router aggregator
    │       ├── health.py # Health check endpoint
    │       └── districts.py # District list endpoint
    ├── core/             # Core configs
    │   ├── config.py     # Pydantic setting validation
    │   └── logging.py    # Structured logging configurations
    ├── db/               # Database management
    │   ├── base.py       # Base model importing aggregator
    │   └── session.py    # Async engine & sessionmaker config
    ├── models/           # SQLAlchemy DB Models
    │   ├── advisory.py
    │   ├── alert.py
    │   ├── dataset.py
    │   ├── location.py
    │   ├── log.py
    │   ├── prediction.py
    │   ├── user.py
    │   └── weather.py
    ├── schemas/          # Pydantic validation schemas
    │   ├── advisory.py
    │   ├── alert.py
    │   ├── dataset.py
    │   ├── district.py
    │   ├── log.py
    │   ├── model.py
    │   ├── prediction.py
    │   ├── user.py
    │   └── weather.py
    ├── services/         # Business logic layer
    │   ├── base.py
    │   └── district.py
    └── utils/            # Utilities
        └── responses.py  # Envelope response format helper
```

---

## Setup Instructions

### 1. Prerequisites
Ensure you have Python 3.11+ and PostgreSQL 15+ installed.
Ensure PostgreSQL is running and you have created a database (e.g., `heatwave_db`).

### 2. Set Up Virtual Environment
```powershell
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your PostgreSQL credentials:
```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=heatwave_db
```

### 4. Run Migrations
Generate tables in your PostgreSQL database using Alembic:
```powershell
# Generate initial migrations
alembic revision --autogenerate -m "Initial schema"

# Upgrade database to head
alembic upgrade head
```

### 5. Seed Database
Inject 3 sample districts to verify database reading functionality:
```powershell
python seed.py
```

### 6. Run the Application
Start the development server using:
```powershell
python run.py
```
The server will boot on `http://localhost:8000`. You can inspect the Swagger docs at `http://localhost:8000/docs`.
