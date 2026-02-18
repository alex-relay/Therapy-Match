"""utility functions for creating users, therapists and patients for testing"""
from uuid import UUID
from decimal import Decimal
from backend.models.user import (
    Patient,
    Therapist,
    User,
    GenderOption,
    TherapistTypeOption,
    AnonymousPatient,
    PersonalityTestScore,
    AnonymousPersonalityTestScore,
    TherapistPersonalityTest,
)
from backend.schemas.scores import Scores
from backend.routers.users.user_types import UserOption
from backend.services.users import get_password_hash

MOCK_PERSONALITY_TEST = {
    "anonymous_patient_id": "c303282d-f2e6-46ca-a04a-35d3d873712d",
    "extroversion": [
        {"id": "1", "category": "extroversion", "score": 2},
        {"id": "2", "category": "extroversion", "score": 2},
        {"id": "3", "category": "extroversion", "score": 2},
        {"id": "4", "category": "extroversion", "score": 5},
        {"id": "5", "category": "extroversion", "score": 2},
        {"id": "6", "category": "extroversion", "score": 2},
        {"id": "7", "category": "extroversion", "score": 3},
        {"id": "8", "category": "extroversion", "score": 4},
        {"id": "9", "category": "extroversion", "score": 2},
        {"id": "10", "category": "extroversion", "score": 4},
    ],
    "conscientiousness": [
        {"id": "1", "category": "conscientiousness", "score": 4},
        {"id": "2", "category": "conscientiousness", "score": 5},
        {"id": "3", "category": "conscientiousness", "score": 2},
        {"id": "4", "category": "conscientiousness", "score": 3},
        {"id": "5", "category": "conscientiousness", "score": 3},
        {"id": "6", "category": "conscientiousness", "score": 4},
        {"id": "7", "category": "conscientiousness", "score": 1},
        {"id": "8", "category": "conscientiousness", "score": 4},
        {"id": "9", "category": "conscientiousness", "score": 2},
        {"id": "10", "category": "conscientiousness", "score": 1},
    ],
    "openness": [
        {"id": "1", "category": "openness", "score": 1},
        {"id": "2", "category": "openness", "score": 3},
        {"id": "3", "category": "openness", "score": 4},
        {"id": "4", "category": "openness", "score": 1},
        {"id": "5", "category": "openness", "score": 1},
        {"id": "6", "category": "openness", "score": 4},
        {"id": "7", "category": "openness", "score": 3},
        {"id": "8", "category": "openness", "score": 3},
        {"id": "9", "category": "openness", "score": 4},
        {"id": "10", "category": "openness", "score": 4},
    ],
    "neuroticism": [
        {"id": "1", "category": "neuroticism", "score": 2},
        {"id": "2", "category": "neuroticism", "score": 4},
        {"id": "3", "category": "neuroticism", "score": 3},
        {"id": "4", "category": "neuroticism", "score": 2},
        {"id": "5", "category": "neuroticism", "score": 2},
        {"id": "6", "category": "neuroticism", "score": 5},
        {"id": "7", "category": "neuroticism", "score": 2},
        {"id": "8", "category": "neuroticism", "score": 4},
        {"id": "9", "category": "neuroticism", "score": 3},
        {"id": "10", "category": "neuroticism", "score": 2},
    ],
    "agreeableness": [
        {"id": "1", "category": "agreeableness", "score": 3},
        {"id": "2", "category": "agreeableness", "score": 3},
        {"id": "3", "category": "agreeableness", "score": 1},
        {"id": "4", "category": "agreeableness", "score": 4},
        {"id": "5", "category": "agreeableness", "score": 3},
        {"id": "6", "category": "agreeableness", "score": 3},
        {"id": "7", "category": "agreeableness", "score": 2},
        {"id": "8", "category": "agreeableness", "score": 5},
        {"id": "9", "category": "agreeableness", "score": 1},
        {"id": "10", "category": "agreeableness", "score": 2},
    ],
    "id": "256bea15-0b6d-437c-81a7-a5c5ff49737c",
}

USER_ID = "c658ffce-d810-4341-a8ef-2d3651489daf"

TEST_USER_PASSWORD = "hashedpassword"

TEST_USER_BASE = {
    "id": UUID(USER_ID),
    "first_name": "Existing",
    "last_name": "User",
    "email_address": "a@b.com",
    "password": get_password_hash(TEST_USER_PASSWORD),
    "roles": [UserOption.PATIENT.value],
}

TEST_PATIENT_BASE = {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "description": "Patient for testing",
    "therapy_needs": ["anxiety"],
    "gender": GenderOption.PREFER_NOT_TO_SAY,
    "is_lgbtq_therapist_preference": True,
    "is_religious_therapist_preference": False,
    "age": 30,
    "user_id": UUID(USER_ID),
}

TEST_THERAPIST_PERSONALITY_TEST = {
    "id": "b658ffce-d810-4341-a8ef-2d3651489daf",
    "extroversion": [],
    "conscientiousness": [],
    "openness": [],
    "neuroticism": [],
    "agreeableness": [],
}


def add_test_patient(session_fixture, mock_overrides=None):
    """Add a test patient to the database."""

    patient_data = {
        **TEST_PATIENT_BASE,
        **(mock_overrides or {}),
    }

    existing_patient = Patient(**patient_data)

    session_fixture.add(existing_patient)
    session_fixture.commit()
    session_fixture.refresh(existing_patient)

    return existing_patient


def add_test_therapist(session_fixture):
    """Add a test therapist to the database."""
    therapist = Therapist(
        latitude=40.7128,
        longitude=-74.0060,
        description="Existing patient for testing",
        specializations=["anxiety", "depression"],
        therapist_type=TherapistTypeOption.PSYCHOLOGIST,
        gender=GenderOption.FEMALE,
        age=45,
        user_id=UUID(USER_ID),
    )

    session_fixture.add(therapist)
    session_fixture.commit()
    session_fixture.refresh(therapist)

    return therapist


def add_test_user(session_fixture, mock_overrides=None):
    """Add a test user to the database."""

    input_data = {
        **TEST_USER_BASE,
        **(mock_overrides or {}),
    }
    user = User(**input_data)

    session_fixture.add(user)
    session_fixture.commit()
    session_fixture.refresh(user)

    return user


def add_anonymous_patient(session_fixture, mock_overrides=None):
    """add an anonymous patient for the tests"""
    input_data = {
        "session_id": USER_ID,
        "location": None,
        "description": None,
        "therapy_needs": None,
        "gender": None,
        "age": None,
        "personality_test": None,
        "is_lgbtq_therapist_preference": None,
        "is_religious_therapist_preference": None,
        **(mock_overrides or {}),
    }

    patient = AnonymousPatient(**input_data)

    session_fixture.add(patient)
    session_fixture.commit()
    session_fixture.refresh(patient)

    return patient


def add_anonymous_personality_test_score(session_fixture, mock_overrides=None):
    """add an anonymous personality test score for the tests"""
    if not mock_overrides:
        mock_overrides = {}
    test_score = AnonymousPersonalityTestScore(**{**mock_overrides})
    session_fixture.add(test_score)
    session_fixture.commit()
    session_fixture.refresh(test_score)


def add_therapist_personality_test_score(
    therapist: Therapist,
    personality_test_scores: Scores,
    session_fixture,
    mock_overrides=None,
):
    """add a personality test score to a therapist model"""
    therapist.personality_test = PersonalityTestScore(
        extroversion=Decimal(personality_test_scores.extroversion),
        conscientiousness=Decimal(personality_test_scores.conscientiousness),
        agreeableness=Decimal(personality_test_scores.agreeableness),
        neuroticism=Decimal(personality_test_scores.neuroticism),
        openness=Decimal(personality_test_scores.openness),
        **(mock_overrides or {})
    )

    session_fixture.add(therapist)
    session_fixture.commit()
    session_fixture.refresh(therapist)

    return therapist


def add_therapist_personality_test(session_fixture, mock_overrides=None):
    """Add a personality test record to the therapist personality test table"""
    personality_test = TherapistPersonalityTest(**(mock_overrides or {}))

    session_fixture.add(personality_test)
    session_fixture.commit()
    session_fixture.refresh(personality_test)

    return personality_test
