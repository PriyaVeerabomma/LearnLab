# Development Stage
FROM python:3.12 AS development

WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry
ENV POETRY_HOME=/opt/poetry
RUN curl -sSL https://install.python-poetry.org | python3 - && \
    cd /usr/local/bin && \
    ln -s /opt/poetry/bin/poetry && \
    poetry config virtualenvs.create false

# Copy Poetry files
COPY pyproject.toml poetry.lock ./

# Install dependencies
RUN poetry install --no-interaction --no-root

# Copy application
COPY . .

# Install application
RUN poetry install --no-interaction

# Expose port
EXPOSE 8000

# Start development server
CMD ["poetry", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# Production Stage
FROM python:3.9.6-slim AS production

WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry
ENV POETRY_HOME=/opt/poetry
RUN curl -sSL https://install.python-poetry.org | python3 - && \
    cd /usr/local/bin && \
    ln -s /opt/poetry/bin/poetry && \
    poetry config virtualenvs.create false

# Copy Poetry files
COPY pyproject.toml poetry.lock ./

# Install dependencies
RUN poetry install --no-interaction --no-root --no-dev

# Copy application
COPY . .

# Install application
RUN poetry install --no-interaction --no-dev

# Expose port
EXPOSE 8000

# Start production server
CMD ["poetry", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
