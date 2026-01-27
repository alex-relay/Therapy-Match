"""utility functions for creating users, therapists and patients for testing"""
from uuid import UUID
from backend.models.user import (
    Patient,
    Therapist,
    User,
    GenderOption,
    TherapistTypeOption,
    AnonymousPatient,
    AnonymousPersonalityTestScore,
)
from backend.routers.users.user_types import UserOption
from backend.services.users import get_password_hash

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


def add_test_patient(session_fixture):
    """Add a test patient to the database."""
    existing_patient = Patient(
        latitude=40.7128,
        longitude=-74.0060,
        description="Patient for testing",
        therapy_needs=["anxiety"],
        gender=GenderOption.PREFER_NOT_TO_SAY,
        is_lgbtq_therapist_preference=True,
        is_religious_therapist_preference=False,
        age=30,
        user_id=UUID(USER_ID),
    )

    session_fixture.add(existing_patient)
    session_fixture.commit()
    session_fixture.refresh(existing_patient)


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


def add_personality_test_score(session_fixture, mock_overrides=None):
    """add an anonymous personality test score for the tests"""
    if not mock_overrides:
        mock_overrides = {}
    test_score = AnonymousPersonalityTestScore(**{**mock_overrides})
    session_fixture.add(test_score)
    session_fixture.commit()
    session_fixture.refresh(test_score)
