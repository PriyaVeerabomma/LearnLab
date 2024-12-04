import os
import sys
from pathlib import Path
import pytest
from unittest.mock import patch

# Add the parent directory to PYTHONPATH
root_dir = Path(__file__).parent.parent
sys.path.insert(0, str(root_dir))

# Set required environment variables for testing
os.environ.update({
    "JWT_SECRET_KEY": "test_secret_key",
    "JWT_ALGORITHM": "HS256",
    "ACCESS_TOKEN_EXPIRE_MINUTES": "30",
    "REFRESH_TOKEN_EXPIRE_DAYS": "7",
    "AWS_ACCESS_KEY_ID": "test_aws_key",
    "AWS_SECRET_ACCESS_KEY": "test_aws_secret",
    "AWS_BUCKET_NAME": "test_bucket",
    "AWS_REGION": "us-east-1",
    "DEBUG": "True",
    "ENVIRONMENT": "test",
    "DATABASE_URL": "postgresql://postgres:postgres@34.57.145.110:5432/learnlab"
})

# Mock SQLAlchemy's create_engine to prevent actual database connections
@pytest.fixture(autouse=True)
def mock_db():
    with patch('sqlalchemy.create_engine'), \
         patch('sqlalchemy.orm.declarative_base'), \
         patch('sqlalchemy.orm.sessionmaker'), \
         patch('app.core.database.Base.metadata.create_all'):
        yield