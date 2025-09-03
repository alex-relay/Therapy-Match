from typing import Annotated
from fastapi import Depends
from sqlmodel import Session, SQLModel, create_engine
from alembic import command
from alembic.config import Config
from passlib.context import CryptContext
from backend.models.match import *  # pylint: disable=wildcard-import
from backend.models.user import *  # pylint: disable=wildcard-import
from backend.core.config import DATABASE_URL

engine = create_engine(DATABASE_URL, echo="debug")
model = SQLModel.metadata

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_db_and_tables():
    """Create database and tables"""
    model.create_all(engine)


def run_migrations():
    alembic_cfg = Config("alembic.ini")
    command.upgrade(alembic_cfg, "head")


def get_session() -> Session:
    """Provide a database session"""
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_session)]
