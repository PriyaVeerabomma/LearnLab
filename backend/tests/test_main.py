import sys
from unittest.mock import patch
import pytest
from fastapi.testclient import TestClient

# Create mock patches
mock_patches = {
    'app.core.database.Base': patch('app.core.database.Base.metadata.create_all'),
    'app.core.database.engine': patch('app.core.database.engine'),
    'app.core.database.SessionLocal': patch('app.core.database.SessionLocal')
}

# Apply all patches
for mock in mock_patches.values():
    mock.start()

# Import app after patches are applied
from app.main import app

# Stop all patches after import
for mock in mock_patches.values():
    mock.stop()

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