from enum import Enum
from uuid import UUID
from pydantic import BaseModel, Field
from typing import Optional, List
from pydantic_extra_types.coordinate import Coordinate


class UserType(str, Enum):
    therapist = "therapist"
    patient = "patient"


class BaseUser(BaseModel):
    first_name: str
    last_name: str
    location: Coordinate
    email_address: str
    description: Optional[str] = None


class PatientCreate(BaseUser):
    therapy_needs: list[str]
    personality_test_id: Optional[UUID] = None


class TherapistCreate(BaseUser):
    therapist_type: str
    specializations: list[str]
    personality_test_id: Optional[UUID] = None


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
