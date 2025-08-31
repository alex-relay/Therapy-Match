from uuid import UUID
from pydantic import BaseModel
from typing import Optional
from pydantic_extra_types.coordinate import Coordinate


class BaseUser(BaseModel):
    first_name: str
    last_name: str
    email_address: str
    password: str


class UserCreate(BaseUser):
    id: str


class PatientCreate(BaseUser):
    id: str
    therapy_needs: list[str]
    personality_test_id: Optional[UUID] = None
    location: Coordinate
    description: Optional[str] = None


class TherapistCreate(BaseUser):
    id: str
    therapist_type: str
    specializations: list[str]
    personality_test_id: Optional[UUID] = None
    location: Coordinate
    description: Optional[str] = None


class PatientRead(PatientCreate):
    id: str


class TherapistRead(TherapistCreate):
    id: str
    user_id: str


class UserPersonalityTestCreate(BaseModel):
    user_id: UUID
    extraversion: int
    conscientiousness: int
    openness: int
    neuroticism: int
    agreeableness: int


class UserPersonalityTestRead(UserPersonalityTestCreate):
    id: str
