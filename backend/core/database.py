from typing import Annotated
from fastapi import Depends
from sqlmodel import Session, SQLModel, create_engine
from backend.models.match import Match  # pylint: disable=unused-import
from backend.models.user import (  # pylint: disable=unused-import
    Patient,
    Therapist,
    PersonalityTestScore,
)
from backend.core.config import DATABASE_URL

engine = create_engine(DATABASE_URL, echo="debug")


def create_db_and_tables():
    """Create database and tables"""
    SQLModel.metadata.create_all(engine)


def get_session():
    """Provide a database session"""
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_session)]
