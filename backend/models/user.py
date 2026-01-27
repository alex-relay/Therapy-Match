from uuid import UUID, uuid4
from typing import Optional, List
from decimal import Decimal
from pydantic import EmailStr, ConfigDict, field_validator, ValidationError
from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import ARRAY, JSON
from sqlmodel import Field, SQLModel, Relationship
from backend.routers.users.user_types import (
    GenderOption,
    TherapistTypeOption,
)
from backend.schemas.scores import PersonalityTestQuestion


class User(SQLModel, table=True):
    """Base user model"""

    __tablename__ = "users"

    id: UUID | None = Field(default_factory=uuid4, primary_key=True)
    first_name: str
    last_name: str
    email_address: EmailStr
    password: str
    roles: List[str] = Field(sa_column=Column(ARRAY(String)), default_factory=list)


class ProfileMixin(SQLModel):
    """profile mixin for the therapist and patient"""

    latitude: float | None = Field(default=None)
    longitude: float | None = Field(default=None)
    description: str | None = Field(default=None)
    age: int | None = Field(ge=10, le=120, default=None)
    gender: GenderOption | None = Field(default=None)


class AnonymousPatient(ProfileMixin, table=True):
    """anonymous patient model"""

    __tablename__ = "anonymous_patients"

    id: UUID | None = Field(default_factory=uuid4, primary_key=True)
    session_id: str = Field(index=True, unique=True)
    postal_code: str | None = Field(default=None)
    therapy_needs: List[str] = Field(
        default_factory=list, sa_column=Column(ARRAY(String))
    )
    is_lgbtq_therapist_preference: bool | None = Field(default=None)
    is_religious_therapist_preference: bool | None = Field(default=None)

    personality_test: Optional["AnonymousPersonalityTestScore"] = Relationship(
        back_populates="anonymous_patient",
        sa_relationship_kwargs={"cascade": "all, delete-orphan", "single_parent": True},
    )


class Therapist(ProfileMixin, table=True):
    """Therapist model"""

    __tablename__ = "therapists"

    id: UUID | None = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID | None = Field(default=None, foreign_key="users.id", unique=True)
    therapist_type: TherapistTypeOption | None = Field(default=None)
    specializations: List[str] = Field(sa_column=Column(ARRAY(String)))

    personality_test: Optional["PersonalityTestScore"] = Relationship(
        back_populates="therapist",
        sa_relationship_kwargs={"cascade": "all, delete-orphan", "single_parent": True},
    )


class Patient(ProfileMixin, table=True):
    """Patient model"""

    __tablename__ = "patients"

    id: UUID | None = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID | None = Field(default=None, foreign_key="users.id", unique=True)
    therapy_needs: List[str] = Field(sa_column=Column(ARRAY(String)))
    is_lgbtq_therapist_preference: bool | None = Field(default=None)
    is_religious_therapist_preference: bool | None = Field(default=None)
    personality_test: Optional["PersonalityTestScore"] = Relationship(
        back_populates="patient",
        sa_relationship_kwargs={"cascade": "all, delete-orphan", "single_parent": True},
    )


class PersonalityTestScoreBaseMixin(SQLModel):
    """Mixin for the personality test score for patients and therapists."""

    neuroticism: list[dict] = Field(sa_type=JSON, default_factory=list)
    openness: list[dict] = Field(sa_type=JSON, default_factory=list)
    extroversion: list[dict] = Field(sa_type=JSON, default_factory=list)
    conscientiousness: list[dict] = Field(sa_type=JSON, default_factory=list)
    agreeableness: list[dict] = Field(sa_type=JSON, default_factory=list)

    model_config = ConfigDict(validate_assignment=True)  # type: ignore

    @field_validator(
        "neuroticism", "openness", "extroversion", "conscientiousness", "agreeableness"
    )
    @classmethod
    def validate_questions(cls, v: list[dict]):
        """validate that each item in the list conforms to PersonalityTestQuestion"""
        for item in v:
            try:
                PersonalityTestQuestion(**item)
            except ValidationError as e:
                raise ValueError(f"Invalid question format: {e}") from e
        return v


class AnonymousPersonalityTestScore(PersonalityTestScoreBaseMixin, table=True):
    """Anonymous personality test scores for patient model"""

    __tablename__ = "anonymous_personality_test_scores"

    id: UUID | None = Field(default_factory=uuid4, primary_key=True)

    anonymous_patient_id: UUID = Field(
        foreign_key="anonymous_patients.id", unique=True, ondelete="CASCADE"
    )

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
        default=None, foreign_key="patients.id", unique=True, ondelete="CASCADE"
    )
    therapist_id: UUID | None = Field(
        default=None, foreign_key="therapists.id", unique=True, ondelete="CASCADE"
    )

    therapist: Optional[Therapist] = Relationship(back_populates="personality_test")
    patient: Optional[Patient] = Relationship(back_populates="personality_test")
