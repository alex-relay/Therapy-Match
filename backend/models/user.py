from uuid import UUID, uuid4
from typing import Optional, List
from decimal import Decimal
from sqlalchemy import Column, String, Integer
from pydantic import EmailStr
from sqlalchemy.dialects.postgresql import ARRAY, ENUM as PG_ENUM
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


class AnonymousPatient(SQLModel, table=True):
    """anonymous patient model"""

    __tablename__ = "anonymous_patients"

    id: UUID | None = Field(default_factory=uuid4, primary_key=True)
    session_id: str = Field(index=True, unique=True)
    latitude: float | None = Field(default=None)
    longitude: float | None = Field(default=None)
    postal_code: str | None = Field(default=None)
    description: str | None = Field(default=None)
    therapy_needs: List[str] = Field(
        default_factory=list, sa_column=Column(ARRAY(String))
    )
    gender: GenderOption | None = Field(
        default=None, sa_column=Column(PG_ENUM(GenderOption, name="genderoption"))
    )
    age: int | None = Field(ge=10, le=120, default=None)
    is_lgbtq_therapist_preference: bool | None = Field(default=None)
    is_religious_therapist_preference: bool | None = Field(default=None)

    personality_test: Optional["AnonymousPersonalityTestScore"] = Relationship(
        back_populates="anonymous_patient",
        sa_relationship_kwargs={"cascade": "all, delete-orphan", "single_parent": True},
    )


class Therapist(SQLModel, table=True):
    """Therapist model"""

    __tablename__ = "therapists"

    id: UUID | None = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID | None = Field(default=None, foreign_key="users.id", unique=True)
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
    user_id: UUID | None = Field(default=None, foreign_key="users.id", unique=True)
    location: str
    description: str | None = Field(default=None)
    therapy_needs: List[str] = Field(sa_column=Column(ARRAY(String)))
    age: int = Field(ge=10, le=120)
    gender: GenderOption
    is_lgbtq_therapist_preference: bool
    is_religious_therapist_preference: bool

    personality_test: Optional["PersonalityTestScore"] = Relationship(
        back_populates="patient",
        sa_relationship_kwargs={"cascade": "all, delete-orphan", "single_parent": True},
    )


class AnonymousPersonalityTestScore(SQLModel, table=True):
    """Anonymous personality test scores for patient model"""

    __tablename__ = "anonymous_personality_test_scores"

    id: UUID | None = Field(default_factory=uuid4, primary_key=True)
    neuroticism: list[int] = Field(
        sa_column=Column(ARRAY(Integer)), default_factory=list
    )
    openness: list[int] = Field(sa_column=Column(ARRAY(Integer)), default_factory=list)
    extroversion: list[int] = Field(
        sa_column=Column(ARRAY(Integer)), default_factory=list
    )
    conscientiousness: list[int] = Field(
        sa_column=Column(ARRAY(Integer)), default_factory=list
    )
    agreeableness: list[int] = Field(
        sa_column=Column(ARRAY(Integer)), default_factory=list
    )

    anonymous_patient_id: UUID = Field(foreign_key="anonymous_patients.id", unique=True)

    anonymous_patient: AnonymousPatient = Relationship(
        back_populates="personality_test",
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
