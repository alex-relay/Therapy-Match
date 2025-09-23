from uuid import UUID, uuid4
from typing import Optional, List
from decimal import Decimal
from sqlalchemy import Column, String
from pydantic import EmailStr
from sqlalchemy.dialects.postgresql import ARRAY
from sqlmodel import Field, SQLModel, Relationship
from backend.routers.users.user_types import GenderOption


class User(SQLModel, table=True):
    """Base user model"""

    __tablename__ = "users"

    id: UUID | None = Field(default_factory=uuid4, primary_key=True)
    first_name: str
    last_name: str
    email_address: EmailStr
    password: str
    is_anonymous: bool = Field(nullable=False)


class Therapist(SQLModel, table=True):
    """Therapist model"""

    __tablename__ = "therapists"

    id: UUID | None = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID | None = Field(default=None, foreign_key="users.id")
    description: str | None = Field(default=None)
    location: str
    therapist_type: str
    specializations: List[str] = Field(sa_column=Column(ARRAY(String)))
    age: int = Field(ge=10, le=120)
    gender: GenderOption

    personality_test: Optional["PersonalityTestScore"] = Relationship(
        back_populates="therapist",
        sa_relationship_kwargs={"cascade": "all, delete-orphan", "single_parent": True},
    )


class Patient(SQLModel, table=True):
    """Patient model"""

    __tablename__ = "patients"

    id: UUID | None = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID | None = Field(default=None, foreign_key="users.id")
    location: str
    description: str | None = Field(default=None)
    therapy_needs: List[str] = Field(sa_column=Column(ARRAY(String)))
    age: int = Field(ge=10, le=120)
    gender: GenderOption

    personality_test: Optional["PersonalityTestScore"] = Relationship(
        back_populates="patient",
        sa_relationship_kwargs={"cascade": "all, delete-orphan", "single_parent": True},
    )


class PersonalityTestScore(SQLModel, table=True):
    """Personality test scores model"""

    __tablename__ = "personality_test_scores"

    id: UUID | None = Field(default_factory=uuid4, primary_key=True)
    neuroticism: Decimal = Field(default=0, max_digits=5, decimal_places=3)
    openness: Decimal = Field(default=0, max_digits=5, decimal_places=3)
    extroversion: Decimal = Field(default=0, max_digits=5, decimal_places=3)
    conscientiousness: Decimal = Field(default=0, max_digits=5, decimal_places=3)
    agreeableness: Decimal = Field(default=0, max_digits=5, decimal_places=3)

    patient_id: UUID | None = Field(
        default=None, foreign_key="patients.id", unique=True
    )
    therapist_id: UUID | None = Field(
        default=None, foreign_key="therapists.id", unique=True
    )

    therapist: Optional[Therapist] = Relationship(back_populates="personality_test")
    patient: Optional[Patient] = Relationship(back_populates="personality_test")
