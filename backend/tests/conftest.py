# conftest.py
import os
import pytest
from sqlmodel import create_engine, text
from sqlmodel import Session, SQLModel

# Set environment variables before importing app
os.environ.update({
    "DB_USER": "test_user",
    "DB_PASSWORD": "test_pass",
    "DB_HOST": "localhost",
    "DB_PORT": "5432",
    "DB_NAME": "test_db"
})

# Now import the app after environment variables are set
from backend.core.database import get_session
from backend.main import app
from fastapi.testclient import TestClient

@pytest.fixture(scope="session", autouse=True)
def mock_test_env():
    """Mock environment setup"""
    yield

@pytest.fixture(scope="function")
def session_fixture():
    TEST_DATABASE_URL = (
        f"postgresql+psycopg2://{os.environ['DB_USER']}:{os.environ['DB_PASSWORD']}"
        f"@{os.environ['DB_HOST']}:{os.environ['DB_PORT']}/{os.environ['DB_NAME']}"
    )
    engine = create_engine(TEST_DATABASE_URL)

    SQLModel.metadata.create_all(engine)

    with Session(engine) as session:
        yield session
        session.rollback()

@pytest.fixture(scope="function")
def client_fixture(session_fixture: Session):  
    def get_session_override():  
        return session_fixture 

    app.dependency_overrides[get_session] = get_session_override  

    client = TestClient(app)  
    yield client  
    app.dependency_overrides.clear()