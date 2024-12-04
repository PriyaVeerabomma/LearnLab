import os
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch
from app.main import app

client = TestClient(app)

@pytest.fixture(autouse=True)
def mock_db_operations():
    """Mock database operations during tests"""
    with patch('app.main.Base.metadata.create_all'):
        yield

def test_read_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {
        "status": "healthy",
        "message": "Service is running"
    }

def test_read_main():
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()
    assert response.json()["message"] == "Welcome to LearnLab API"