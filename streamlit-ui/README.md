# LearnLab Streamlit UI Service

## Overview
Streamlit-based analytics dashboard providing data visualization and interactive analysis capabilities for the LearnLab platform.

## Technical Stack
- **Language**: Python 3.9
- **Framework**: Streamlit 1.28.2
- **Visualization**: Plotly
- **Dependency Management**: Poetry
- **Docker Image**: python:3.9.6-slim

## Project Structure
```
streamlit-ui/
├── app/               # Application source code
│   └── __init__.py
├── app.py            # Main Streamlit application
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
python = ">=3.9,<3.9.7 || >3.9.7,<4.0"
streamlit = "^1.28.2"
pandas = "^2.1.3"
plotly = "^5.18.0"
requests = "^2.31.0"
python-dotenv = "^1.0.0"
```

## Docker Configuration
The service uses a multi-stage Dockerfile:
- Development stage with hot-reload
- Production stage optimized for size
- Poetry for dependency management
- Runs on port 8501

## Environment Variables
```env
BACKEND_API_URL=http://backend:8000
DEBUG=True
```

## Features
Current implemented features:
- Basic Streamlit dashboard setup
- Integration with backend API
- Docker configuration with hot reload

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
poetry run streamlit run app.py
```

## Docker Commands
```bash
# Build the service
docker-compose build streamlit

# Run the service
docker-compose up streamlit

# View logs
docker-compose logs -f streamlit
```

## Data Visualization
- Uses Plotly for interactive visualizations
- Pandas for data manipulation
- Direct integration with backend API

## Development Progress
Current implementation includes:
- Basic Streamlit setup
- Docker configuration
- Poetry dependency management
- Basic dashboard structure

Next planned implementations:
- Advanced data visualizations
- Interactive analysis features
- Real-time data updates
- Custom dashboard components