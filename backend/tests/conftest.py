# conftest.py
import os
import pytest
from sqlmodel import create_engine, Session, SQLModel
from sqlalchemy import text
from fastapi.testclient import TestClient
from sqlalchemy.exc import ProgrammingError
from backend.core.database import get_session
from backend.main import app
from backend.models.user import Patient

# Test database configuration
TEST_DB_CONFIG = {
    "user": "test_user",
    "password": "test_pass",
    "host": "localhost",
    "port": "5432",
    "database": "test_db",
}


def create_test_database():
    # Create admin connection to create/drop database
    admin_engine = create_engine(
        f"postgresql://{TEST_DB_CONFIG['user']}:{TEST_DB_CONFIG['password']}"
        f"@{TEST_DB_CONFIG['host']}:{TEST_DB_CONFIG['port']}/postgres"
    )

    with admin_engine.connect() as conn:
        conn.execution_options(isolation_level="AUTOCOMMIT")
        try:
            # Drop test database if it exists
            conn.execute(text(f"DROP DATABASE IF EXISTS {TEST_DB_CONFIG['database']}"))
            # Create test database
            conn.execute(text(f"CREATE DATABASE {TEST_DB_CONFIG['database']}"))
        except ProgrammingError as e:
            raise e
        finally:
            conn.close()


@pytest.fixture(scope="function")
def session_fixture():
    create_test_database()

    # Create engine for test database
    database_url = (
        f"postgresql://{TEST_DB_CONFIG['user']}:{TEST_DB_CONFIG['password']}"
        f"@{TEST_DB_CONFIG['host']}:{TEST_DB_CONFIG['port']}/{TEST_DB_CONFIG['database']}"
    )
    engine = create_engine(database_url)

    # Create all tables
    SQLModel.metadata.create_all(engine)

    with Session(engine) as session:
        yield session
        session.rollback()

    # Drop all tables after tests
    SQLModel.metadata.drop_all(engine)

    # Close engine
    engine.dispose()


@pytest.fixture
def mock_jwt_decode(monkeypatch):
    """Patch jwt.decode to always return a fixed payload."""

    def fake_decode(token, key=None, algorithms=None, options=None):
        return {
            "sub": "a@b.com",
            "exp": 9999999999,
        }

    monkeypatch.setattr("backend.routers.users.service.jwt.decode", fake_decode)
    yield


@pytest.fixture(scope="function")
def mock_auth_headers(session_fixture, mock_jwt_decode):
    # mock the return value of authorization in the headers
    return {"Authorization": "Bearer token"}


@pytest.fixture(scope="function")
def client_fixture(session_fixture: Session):
    def get_session_override():
        return session_fixture

    app.dependency_overrides[get_session] = get_session_override

    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()
