""" schemas for the user router """

import re
from uuid import UUID
from typing import Optional
from pydantic import EmailStr, Field, field_validator, ConfigDict, StrictBool
from sqlmodel import SQLModel
from pydantic_extra_types.coordinate import Coordinate
from backend.routers.users.user_types import GenderOption


class UserBase(SQLModel):
    """User Base"""

    first_name: str = Field(min_length=2)
    last_name: str = Field(min_length=2)
    email_address: EmailStr
    is_anonymous: bool = True


class AnonymousSessionCookie(SQLModel):
    """session cookie for the anonymous patient session"""

    anonymous_session: str


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
        """Validates password strength"""
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
    latitude: float | None = None
    longitude: float | None = None
    description: Optional[str] = None
    age: int = Field(ge=10, le=120)
    gender: GenderOption | None = None
    is_lgbtq_therapist_preference: StrictBool | None = None
    is_religious_therapist_preference: StrictBool | None = None


class TherapistCreate(SQLModel):
    """Therapist Create Model"""

    therapist_type: str
    specializations: list[str]
    personality_test_id: Optional[UUID] = None
    location: Coordinate
    description: Optional[str] = None
    age: int = Field(ge=10, le=120)
    gender: GenderOption


class PatientRead(PatientCreate):
    """PatientRead Model"""

    id: UUID | None = None


class LocationCoordinate(SQLModel):
    """coordinates model"""

    lat: float
    lon: float


POSTAL_CODE_REGEX = re.compile(r"^[ABCEGHJ-NPRSTVXY]\d[A-Z][ -]?\d[A-Z]\d$")


class AnonymousSessionPatientBase(SQLModel):
    """base model for anonymous session patient"""

    therapy_needs: list[str] | None = None
    personality_test_id: UUID | None = None
    description: str | None = None
    age: int | None = None
    gender: GenderOption | None = None
    is_lgbtq_therapist_preference: StrictBool | None = None
    is_religious_therapist_preference: StrictBool | None = None
    postal_code: str | None = None

    model_config = ConfigDict(extra="forbid")

    @field_validator("postal_code")
    @classmethod
    def validate_postal_code(cls, value):
        """Validates the canadian postal code format"""
        if value is None:
            return value
        if not POSTAL_CODE_REGEX.match(value):
            raise ValueError("Invalid Canadian postal code format")
        return value


class AnonymousSessionPatientRead(AnonymousSessionPatientBase):
    """read model for pulling an anonymous patient session in the db"""

    id: UUID
    session_id: str
    latitude: float | None = None
    longitude: float | None = None


class AnonymousSessionPatientResponse(AnonymousSessionPatientBase):
    """response model for an anonymous patient session"""

    id: UUID
    latitude: float | None = None
    longitude: float | None = None


class TherapistRead(TherapistCreate):
    """Therapist Read Model"""

    id: UUID
