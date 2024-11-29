#!/bin/bash

# Make script executable
chmod +x ./setup-env.sh

# Function to copy env files if they don't exist
copy_env_file() {
    if [ ! -f "$1/.env" ]; then
        if [ -f "$1/.env.example" ]; then
            cp "$1/.env.example" "$1/.env"
            echo "Created .env file in $1"
        else
            echo "Warning: No .env.example found in $1"
        fi
    else
        echo ".env file already exists in $1"
    fi
}

# Create .env files for each service
copy_env_file "./frontend"
copy_env_file "./backend"
copy_env_file "./streamlit-ui"
copy_env_file "./airflow"

# Generate Fernet key for Airflow
if [ -f "./airflow/.env" ]; then
    FERNET_KEY=$(python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())")
    sed -i '' "s/your-fernet-key-here/$FERNET_KEY/" "./airflow/.env"
    echo "Generated Fernet key for Airflow"
fi

# Create necessary directories
mkdir -p ./airflow/dags ./airflow/logs
mkdir -p ./backend/app
mkdir -p ./streamlit-ui/app

echo "Environment setup completed!"
echo "Please review and update the .env files with your specific configurations."
echo "You can now run 'docker-compose up' to start the services."