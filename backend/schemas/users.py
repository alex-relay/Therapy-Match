""" schemas for the user router """

import re
from typing import Annotated
from uuid import UUID
from pydantic import (
    EmailStr,
    Field,
    field_validator,
    ConfigDict,
    StrictBool,
    BeforeValidator,
)
from sqlmodel import SQLModel
from backend.routers.users.user_types import GenderOption, UserOption

POSTAL_CODE_REGEX = re.compile(
    r"^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d$"
)


def validate_postal_code(value: str | None) -> str | None:
    """Validates the canadian postal code format"""
    if value is None:
        return value
    value = value.upper()
    if not POSTAL_CODE_REGEX.match(value):
        raise ValueError("Invalid Canadian postal code format")
    return value


CanadianPostalCode = Annotated[str | None, BeforeValidator(validate_postal_code)]


class UserBase(SQLModel):
    """User Base"""

    first_name: str = Field(min_length=2)
    last_name: str = Field(min_length=2)
    email_address: EmailStr
    user_type: UserOption


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


class UserProfileMixin(SQLModel):
    """User profile mixin"""

    latitude: float | None = None
    longitude: float | None = None
    description: str | None = None
    age: int | None = Field(default=None, ge=10, le=120)
    gender: GenderOption | None = None
    personality_test_id: UUID | None = None
    postal_code: CanadianPostalCode = None


class PatientBase(UserProfileMixin):
    """Patient Create Model"""

    therapy_needs: list[str] = []
    is_lgbtq_therapist_preference: StrictBool | None = None
    is_religious_therapist_preference: StrictBool | None = None


class TherapistBase(UserProfileMixin):
    """Therapist Base Model"""

    therapist_type: str | None = None
    specializations: list[str] | None = None
    is_lgbtq_specialization: StrictBool | None = None
    is_religious_specialization: StrictBool | None = None
    is_profile_complete: StrictBool = False

    model_config = ConfigDict(extra="forbid")  # type: ignore


class PatientRead(PatientBase):
    """PatientRead Model"""

    id: UUID | None = None


class AnonymousSessionPatientBase(SQLModel):
    """base model for anonymous session patient"""

    therapy_needs: list[str] | None = None
    personality_test_id: UUID | None = None
    description: str | None = None
    age: int | None = None
    gender: GenderOption | None = None
    is_lgbtq_therapist_preference: StrictBool | None = None
    is_religious_therapist_preference: StrictBool | None = None
    postal_code: CanadianPostalCode = None

    model_config = ConfigDict(extra="forbid")  # type: ignore


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


class TherapistRead(TherapistBase):
    """Therapist Read Model"""

    id: UUID
