# Development Stage
FROM python:3.9.6-slim

# Prevent apt from showing prompts
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1
ENV POETRY_VERSION=1.8.2
ENV POETRY_HOME="/opt/poetry"
ENV POETRY_VIRTUALENVS_CREATE=false
ENV PATH="$POETRY_HOME/bin:$PATH"
ENV AIRFLOW_HOME=/opt/airflow

# Install system dependencies as root
USER root
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    git \
    libpq-dev \
    netcat \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry - Uses the established POETRY_HOME
RUN curl -sSL https://install.python-poetry.org | python3 - && \
    chmod a+x /opt/poetry/bin/poetry && \
    poetry config virtualenvs.create false

# Create airflow user and set up directories
RUN useradd -ms /bin/bash -d ${AIRFLOW_HOME} airflow && \
    mkdir -p ${AIRFLOW_HOME}/dags ${AIRFLOW_HOME}/logs ${AIRFLOW_HOME}/plugins ${AIRFLOW_HOME}/config && \
    chown -R airflow:airflow ${AIRFLOW_HOME}

# Copy poetry files
COPY pyproject.toml poetry.lock ./

# Install dependencies as root
RUN poetry install --no-interaction --no-root && \
    chown -R airflow:airflow /usr/local/lib/python3.9/site-packages/ && \
    chown -R airflow:airflow /usr/local/bin/

# Create initialization script
RUN echo '#!/bin/bash\n\
    set -e\n\
    \n\
    airflow() {\n\
    poetry run airflow "$@"\n\
    }\n\
    \n\
    # Wait for PostgreSQL
    until nc -z -v -w30 db 5432; do\n\
    echo "Waiting for PostgreSQL..."\n\
    sleep 2\n\
    done\n\
    \n\
    # Initialize Airflow database\n\
    airflow db migrate\n\
    \n\
    # Create admin user\n\
    airflow users create \\\n\
    --username admin \\\n\
    --firstname admin \\\n\
    --lastname admin \\\n\
    --role Admin \\\n\
    --email admin@admin.com \\\n\
    --password admin\n\
    \n\
    # Start webserver\n\
    exec airflow webserver\n' > /entrypoint.sh && \
    chmod +x /entrypoint.sh

# Switch to airflow user and directory
USER airflow
WORKDIR ${AIRFLOW_HOME}

# Copy Airflow files
COPY --chown=airflow:airflow dags ${AIRFLOW_HOME}/dags
COPY --chown=airflow:airflow config ${AIRFLOW_HOME}/config

EXPOSE 8080

# Start with initialization script
CMD ["/entrypoint.sh"]
