-- Create databases
CREATE DATABASE airflow;
CREATE DATABASE learnlab;

-- Connect to airflow database and set up extensions
\c airflow;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Connect to learnlab database and set up extensions
\c learnlab;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";