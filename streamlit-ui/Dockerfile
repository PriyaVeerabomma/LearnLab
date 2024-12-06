# Base Image for both Development and Production
FROM python:3.9.6-slim AS base

WORKDIR /app

# Install system dependencies and Poetry
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    curl && \
    rm -rf /var/lib/apt/lists/*

ENV POETRY_HOME=/opt/poetry
RUN curl -sSL https://install.python-poetry.org | python3 - && \
    ln -s /opt/poetry/bin/poetry /usr/local/bin/poetry && \
    poetry config virtualenvs.create false

# Copy Poetry configuration files
COPY pyproject.toml poetry.lock ./

# Install common dependencies
RUN poetry install --no-interaction --no-root

# ------------------------------------------
# Development Stage
# ------------------------------------------
FROM base AS development

# Copy application files
COPY . .

# Expose port for development
EXPOSE 8501

# Command for development
CMD ["poetry", "run", "streamlit", "run", "app.py", "--server.port=8501", "--server.address=0.0.0.0"]

# ------------------------------------------
# Production Stage
# ------------------------------------------
FROM base AS production

# Copy application files
COPY . .

# Install only production dependencies
RUN poetry install --no-dev --no-interaction

# Create non-root user
RUN addgroup --system appgroup && \
    adduser --system --group appuser && \
    chown -R appuser:appgroup /app

USER appuser

# Expose port for production
EXPOSE 8501

# Command for production
CMD ["poetry", "run", "streamlit", "run", "app.py", "--server.port=8501", "--server.address=0.0.0.0"]
