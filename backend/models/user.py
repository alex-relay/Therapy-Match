from sqlalchemy import Column, String, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from typing import Optional
from pgvector.sqlalchemy import Vector
from sqlmodel import SQLModel
from decimal import Decimal
from uuid import uuid4
from typing import List
from sqlmodel import Field, SQLModel, Relationship 


class User(SQLModel):
    id: int | None = Field(default=None, primary_key=True)
    first_name: str
    last_name: str
    location: str
    email_address: str
    description: str | None = Field(default=None)

class Therapist(User, table=True):
    __tablename__ = "therapists"

    id: int | None = Field(default=None, primary_key=True)
    personality_test_id: int | None = Field(default=None, foreign_key="personality_test_scores.id")
    specializations : List[str] = Field(sa_column=Column(ARRAY(String)))
    therapist_type : str

    personality_test: Optional["PersonalityTestScore"] = Relationship(
        back_populates="therapists",
        sa_relationship_kwargs={
            "uselist": False,
            "cascade": "all, delete-orphan",
            "single_parent": True,
        },
    )

class Patient(User, table=True):
    __tablename__ = "patients"
    
    id: int | None = Field(default=None, primary_key=True)
    personality_test_id: int | None = Field(default=None, foreign_key="personality_test_scores.id")    
    therapy_needs: List[str] = Field(sa_column=Column(ARRAY(String)))

    personality_test: Optional["PersonalityTestScore"] = Relationship(
        back_populates="patients",
        sa_relationship_kwargs={
            "uselist": False,
            "cascade": "all, delete-orphan",
            "single_parent": True,
        },
    )

class PersonalityTestScore(SQLModel, table=True):
    __tablename__= "personality_test_scores"

    id: int | None = Field(default=None, primary_key=True)
    neuroticism : Decimal = Field(default=0, max_digits=5, decimal_places=3)
    openness : Decimal = Field(default=0, max_digits=5, decimal_places=3)
    extraversion : Decimal = Field(default=0, max_digits=5, decimal_places=3)
    conscientiousness : Decimal = Field(default=0, max_digits=5, decimal_places=3)
    agreeableness : Decimal = Field(default=0, max_digits=5, decimal_places=3)



