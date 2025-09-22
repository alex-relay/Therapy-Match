from dataclasses import dataclass
from sqlmodel import SQLModel


class UserPersonalityTestCreate(SQLModel):
    """User Personality Test Create"""

    extroversion: list[float]
    conscientiousness: list[float]
    openness: list[float]
    neuroticism: list[float]
    agreeableness: list[float]


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
    extroversion: float
    conscientiousness: float
    openness: float
    neuroticism: float
    agreeableness: float


@dataclass
class AggregateScores:
    extroversion: list[float]
    conscientiousness: list[float]
    openness: list[float]
    neuroticism: list[float]
    agreeableness: list[float]
