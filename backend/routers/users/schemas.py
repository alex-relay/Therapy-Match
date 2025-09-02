import re
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field, validator
from sqlmodel import SQLModel
from typing import Optional
from pydantic_extra_types.coordinate import Coordinate


class UserBase(SQLModel):
    first_name: str = Field(min_length=2)
    last_name: str = Field(min_length=2)
    email_address: EmailStr


class UserCreate(UserBase):
    password: str = Field(
        min_length=8,
        max_length=16,
        regex=r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$",
        description="Password must contain at least one uppercase, one lowercase, and one digit",
    )

    @validator("password")
    def password_strength(cls, v: str) -> str:
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one digit")
        return v


class UserRead(UserBase):
    id: str


class PatientCreate(SQLModel):
    user_id: str = ""
    therapy_needs: list[str]
    personality_test_id: Optional[UUID] = None
    location: Coordinate
    description: Optional[str] = None


class TherapistCreate(SQLModel):
    user_id: str = ""
    therapist_type: str
    specializations: list[str]
    personality_test_id: Optional[UUID] = None
    location: Coordinate
    description: Optional[str] = None


class PatientRead(PatientCreate):
    id: str


class TherapistRead(TherapistCreate):
    id: str


class UserPersonalityTestCreate(BaseModel):
    user_id: UUID
    extraversion: int
    conscientiousness: int
    openness: int
    neuroticism: int
    agreeableness: int


class UserPersonalityTestRead(UserPersonalityTestCreate):
    id: str
