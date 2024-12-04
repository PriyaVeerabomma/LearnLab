from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from unittest.mock import MagicMock

# Create a mock engine and session
mock_engine = MagicMock()
mock_session = MagicMock()

# Create a mock Base
Base = declarative_base()

# Mock the create_all method
Base.metadata.create_all = MagicMock()