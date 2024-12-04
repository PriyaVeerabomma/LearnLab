import os
import sys
from pathlib import Path

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
    "DATABASE_URL": "postgresql://postgres:postgres@34.57.145.110:5432/learnlab",
    "DEBUG": "True",
    "ENVIRONMENT": "test"
})