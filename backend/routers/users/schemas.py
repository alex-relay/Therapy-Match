import re
from uuid import UUID
from typing import Optional
from pydantic import EmailStr, Field, field_validator
from sqlmodel import SQLModel
from pydantic_extra_types.coordinate import Coordinate


class UserBase(SQLModel):
    """User Base"""

    first_name: str = Field(min_length=2)
    last_name: str = Field(min_length=2)
    email_address: EmailStr


class UserCreate(UserBase):
    """User Create Model"""

    password: str = Field(
        min_length=8,
        max_length=16,
        description="Password must contain at least one uppercase, one lowercase, and one digit",
    )

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one digit")
        return v


class UserRead(UserBase):
    """User Read model"""

    id: UUID


class PatientCreate(SQLModel):
    """Patient Create Model"""

    therapy_needs: list[str]
    personality_test_id: Optional[UUID] = None
    location: Coordinate
    description: Optional[str] = None


class TherapistCreate(SQLModel):
    """Therapist Create Model"""

    therapist_type: str
    specializations: list[str]
    personality_test_id: Optional[UUID] = None
    location: Coordinate
    description: Optional[str] = None


class PatientRead(PatientCreate):
    """PatientRead Model"""

    id: UUID


class TherapistRead(TherapistCreate):
    """Therapist Read Model"""

    id: UUID
