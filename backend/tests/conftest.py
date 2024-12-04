import os
import sys
from pathlib import Path

# Add the parent directory to PYTHONPATH
root_dir = Path(__file__).parent.parent
sys.path.insert(0, str(root_dir))

# Set test environment variables
os.environ["JWT_SECRET_KEY"] = "test_secret_key_for_testing_purposes_only"
os.environ["JWT_ALGORITHM"] = "HS256"
os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"] = "30"
os.environ["REFRESH_TOKEN_EXPIRE_DAYS"] = "7"
os.environ["AWS_ACCESS_KEY_ID"] = "test_access_key"
os.environ["AWS_SECRET_ACCESS_KEY"] = "test_secret_key"
os.environ["AWS_BUCKET_NAME"] = "test-bucket"
os.environ["AWS_REGION"] = "us-east-1"
os.environ["DATABASE_URL"] = "postgresql://postgres:postgres@localhost:5432/test_db"
os.environ["DEBUG"] = "True"
os.environ["ENVIRONMENT"] = "testing"