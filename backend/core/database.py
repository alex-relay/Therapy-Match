from typing import Annotated
from fastapi import Depends
from sqlmodel import Session, SQLModel, create_engine
from alembic import command
from alembic.config import Config
from backend.models.match import Match  # pylint: disable=unused-import
from backend.models.user import *  # pylint: disable=wildcard-import
from backend.core.config import DATABASE_URL

engine = create_engine(DATABASE_URL, echo="debug")
model = SQLModel.metadata


def create_db_and_tables():
    """Create database and tables"""
    model.create_all(engine)


def run_migrations():
    alembic_cfg = Config("alembic.ini")
    command.upgrade(alembic_cfg, "head")


def get_session():
    """Provide a database session"""
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_session)]
