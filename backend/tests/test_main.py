import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

# First mock the database to prevent any database operations
engine_mock = MagicMock()
with patch('sqlalchemy.create_engine', return_value=engine_mock), \
     patch('app.core.database.Base.metadata.create_all'):
    from app.main import app

client = TestClient(app)

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