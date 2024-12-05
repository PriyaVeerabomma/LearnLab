# Development Stage
FROM python:3.12-slim AS development

WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry
ENV POETRY_HOME=/opt/poetry
RUN curl -sSL https://install.python-poetry.org | python3 - && \
    cd /usr/local/bin && \
    ln -s /opt/poetry/bin/poetry && \
    poetry config virtualenvs.create false

# Copy Poetry files
COPY pyproject.toml poetry.lock ./

# Copy application
COPY . .

# Install dependencies including development ones
RUN poetry install --no-interaction --no-root



# Expose port
EXPOSE 8000

# Start development server with hot reload
CMD ["poetry", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# Production Stage
FROM python:3.12-slim AS production

WORKDIR /app

# Install system dependencies with minimal footprint
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    curl \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry
ENV POETRY_HOME=/opt/poetry
ENV POETRY_VIRTUALENVS_CREATE=false
ENV PORT=8000
ENV PYTHONPATH=/app

RUN curl -sSL https://install.python-poetry.org | python3 - && \
    cd /usr/local/bin && \
    ln -s /opt/poetry/bin/poetry

# Copy Poetry files and install only production dependencies
COPY pyproject.toml poetry.lock ./

# Copy application
COPY . .

RUN poetry install --no-dev --no-interaction --no-ansi



# Create non-root user for security
RUN addgroup --system appgroup && \
    adduser --system --group appuser && \
    chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE $PORT

# Add healthcheck after exposing port
# HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
#     CMD curl -f http://localhost:8000/health || exit 1

# Start production server with optimized settings
CMD ["sh", "-c", "poetry run uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 4 --proxy-headers"]