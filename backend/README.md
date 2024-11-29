# LearnLab Backend Service

## Overview
FastAPI-based backend service handling the core business logic and API endpoints for the LearnLab platform.

## Technical Stack
- **Language**: Python 3.9
- **Framework**: FastAPI
- **Database**: PostgreSQL
- **Dependency Management**: Poetry
- **Docker Image**: python:3.9.6-slim

## Project Structure
```
backend/
├── app/               # Application source code
│   ├── __init__.py
│   └── main.py       # Main application entry point
├── .env              # Environment variables
├── .env.example      # Example environment file
├── Dockerfile        # Docker configuration
├── poetry.toml       # Poetry configuration
├── poetry.lock       # Locked dependencies
└── pyproject.toml    # Project dependencies and metadata
```

## Dependencies
```toml
[tool.poetry.dependencies]
python = "^3.9"
fastapi = "^0.104.1"
uvicorn = "^0.24.0"
sqlalchemy = "^2.0.23"
pydantic = "^2.5.1"
python-dotenv = "^1.0.0"
alembic = "^1.12.1"
psycopg2-binary = "^2.9.9"
```

## Docker Configuration
The service uses a multi-stage Dockerfile with development and production stages:
- Development stage includes full build tools and hot-reload
- Production stage optimized for size and security
- Uses poetry for dependency management
- Runs on port 8000

## Environment Variables
Required environment variables:
```env
DATABASE_URL=postgresql://postgres:postgres@db:5432/learnlab
CORS_ORIGINS=["http://localhost:3000","http://localhost:8501"]
DEBUG=True
SECRET_KEY=your-secret-key-here
```

## API Endpoints
Base URL: http://localhost:8000

Current implemented endpoints:
- GET / - Health check endpoint

## Development
1. Local Setup:
```bash
python -m venv .venv
source .venv/bin/activate
pip install poetry
poetry install
```

2. Run Development Server:
```bash
poetry run uvicorn app.main:app --reload
```

## Docker Commands
```bash
# Build the service
docker-compose build backend

# Run the service
docker-compose up backend

# View logs
docker-compose logs -f backend
```

## Database
- Uses PostgreSQL 15
- Automatically connects to the shared database service
- Database migrations handled by Alembic

## Note on Development Progress
Current implementation includes:
- Basic FastAPI setup
- Docker configuration
- Poetry dependency management
- Database connection
- Health check endpoint

Next planned implementations:
- User authentication
- Core API endpoints
- Database migrations
- Integration with Airflow for data processing