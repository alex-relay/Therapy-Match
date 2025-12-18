from dataclasses import dataclass
from uuid import UUID
from sqlmodel import SQLModel
from backend.types.scores_types import PersonalityTestCategory


class PersonalityTestQuestion(SQLModel):
    """Docstring for PersonalityTestQuestion"""

    id: str
    category: PersonalityTestCategory
    score: int


class PersonalityTestBase(SQLModel):
    """Base model for the anonymous personality test"""

    extroversion: list[PersonalityTestQuestion]
    conscientiousness: list[PersonalityTestQuestion]
    openness: list[PersonalityTestQuestion]
    neuroticism: list[PersonalityTestQuestion]
    agreeableness: list[PersonalityTestQuestion]


class AnonymousPersonalityTestRead(PersonalityTestBase):
    """Docstring for AnonymousPersonalityTestRead"""

    id: UUID


class UserPersonalityTestCreate(SQLModel):
    """User Personality Test Create"""

    extroversion: list[int]
    conscientiousness: list[int]
    openness: list[int]
    neuroticism: list[int]
    agreeableness: list[int]


class AggregateUserPersonalityTestRead(SQLModel):
    """Aggregate User Personality Test Read"""

    id: UUID
    extroversion: list[int]
    conscientiousness: list[int]
    openness: list[int]
    neuroticism: list[int]
    agreeableness: list[int]


class UserPersonalityTestRead(SQLModel):
    """User Personality Test Read"""

    id: str
    extroversion: float
    conscientiousness: float
    openness: float
    neuroticism: float
    agreeableness: float


@dataclass
class Scores:
    """docstring for calculated individual personality scores"""

    extroversion: float
    conscientiousness: float
    openness: float
    neuroticism: float
    agreeableness: float


@dataclass
class AggregateScores:
    """docstring for aggregated individual personality scores"""

    extroversion: list[float]
    conscientiousness: list[float]
    openness: list[float]
    neuroticism: list[float]
    agreeableness: list[float]
