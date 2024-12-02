#!/bin/bash
set -e

# Wait for the database
poetry run airflow db check

# Initialize the database
poetry run airflow db init

# Create admin user if it doesn't exist
poetry run airflow users list | grep -q "admin" || \
poetry run airflow users create \
    --username admin \
    --firstname admin \
    --lastname admin \
    --role Admin \
    --email admin@example.com \
    --password admin

# Start Airflow webserver
exec poetry run airflow webserver