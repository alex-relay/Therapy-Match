from sqlmodel import SQLModel
from backend.models.user import TherapistPersonalityTest, PersonalityTestScore


class TherapistDashboardRead(SQLModel):
    """Read the therapist dashboard model"""

    personality_test_scores: TherapistPersonalityTest | None
    completed_personality_test: PersonalityTestScore | None
    is_profile_complete: bool = False
