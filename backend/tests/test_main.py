from unittest.mock import patch
import pytest
from fastapi.testclient import TestClient
from app.main import app

# Create test client
client = TestClient(app)

@pytest.fixture(autouse=True)
def mock_dependencies():
    """Mock any external dependencies"""
    with patch('app.main.Base.metadata.create_all'):
        with patch('app.core.config.settings.check_aws_credentials'):
            yield

def test_read_health():
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {
        "status": "healthy",
        "message": "Service is running"
    }

def test_read_main():
    """Test root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()
    assert response.json()["message"] == "Welcome to LearnLab API"