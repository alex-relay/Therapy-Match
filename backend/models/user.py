from uuid import UUID, uuid4
from typing import Optional, List
from decimal import Decimal
from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import ARRAY
from sqlmodel import Field, SQLModel, Relationship


class User(SQLModel, table=True):
    """Base user model"""

    __tablename__ = "users"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    first_name: str
    last_name: str
    email_address: str
    password: str


class Therapist(SQLModel, table=True):
    """Therapist model"""

    __tablename__ = "therapists"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(default=None, foreign_key="users.id", nullable=False)
    description: str | None = Field(default=None)
    location: str
    therapist_type: str
    specializations: List[str] = Field(sa_column=Column(ARRAY(String)))

    personality_test: Optional["PersonalityTestScore"] = Relationship(
        back_populates="therapist",
        sa_relationship_kwargs={"cascade": "all, delete-orphan", "single_parent": True},
    )


class Patient(SQLModel, table=True):
    """Patient model"""

    __tablename__ = "patients"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(default=None, foreign_key="users.id", nullable=False)
    location: str
    description: str | None = Field(default=None)
    therapy_needs: List[str] = Field(sa_column=Column(ARRAY(String)))

    personality_test: Optional["PersonalityTestScore"] = Relationship(
        back_populates="patient",
        sa_relationship_kwargs={"cascade": "all, delete-orphan", "single_parent": True},
    )


class PersonalityTestScore(SQLModel, table=True):
    """Personality test scores model"""

    __tablename__ = "personality_test_scores"

    id: int | None = Field(default=None, primary_key=True)
    neuroticism: Decimal = Field(default=0, max_digits=5, decimal_places=3)
    openness: Decimal = Field(default=0, max_digits=5, decimal_places=3)
    extraversion: Decimal = Field(default=0, max_digits=5, decimal_places=3)
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
