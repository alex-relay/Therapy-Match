from backend.models.user import TherapistPersonalityTest, PersonalityTestScore
from sqlmodel import SQLModel


class TherapistDashboardRead(SQLModel):
    """Read the therapist dashboard model"""

    personality_test_scores: TherapistPersonalityTest | None
    completed_personality_test: PersonalityTestScore | None
