import os
from unittest.mock import patch
import pytest
from fastapi.testclient import TestClient

# Import app with mocked database
with patch('sqlalchemy.create_engine'):
    with patch('sqlalchemy.orm.declarative_base.metadata.create_all'):
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