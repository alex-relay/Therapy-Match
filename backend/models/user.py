from typing import Optional, List
from decimal import Decimal
from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import ARRAY
from sqlmodel import Field, SQLModel, Relationship


class User(SQLModel, table=True):
    """Base user model"""

    __tablename__ = "users"

    id: int | None = Field(default=None, primary_key=True)
    first_name: str
    last_name: str
    email_address: str
    hashed_password: str


class Therapist(SQLModel, table=True):
    """Therapist model"""

    __tablename__ = "therapists"

    id: int | None = Field(default=None, primary_key=True)
    user_id: int | None = Field(default=None, foreign_key="users.id")
    personality_test_id: int | None = Field(
        default=None, foreign_key="personality_test_scores.id"
    )
    description: str | None = Field(default=None)
    location: str
    therapist_type: str
    specializations: List[str] = Field(sa_column=Column(ARRAY(String)))

    personality_test: Optional["PersonalityTestScore"] = Relationship(
        back_populates="therapists",
        sa_relationship_kwargs={"cascade": "all, delete-orphan", "single_parent": True},
    )


class Patient(SQLModel, table=True):
    """Patient model"""

    __tablename__ = "patients"

    id: int | None = Field(default=None, primary_key=True)
    user_id: int | None = Field(default=None, foreign_key="users.id")
    personality_test_id: int | None = Field(
        default=None, foreign_key="personality_test_scores.id"
    )
    therapy_needs: List[str] = Field(sa_column=Column(ARRAY(String)))

    personality_test: Optional["PersonalityTestScore"] = Relationship(
        back_populates="patients",
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

    therapists: List["Therapist"] = Relationship(back_populates="personality_test")
    patients: List["Patient"] = Relationship(back_populates="personality_test")
