"""utility functions for creating users, therapists and patients for testing"""

from backend.models.user import Patient, Therapist, User, GenderOption, AnonymousPatient

USER_ID = "c658ffce-d810-4341-a8ef-2d3651489daf"


def add_test_patient(session_fixture):
    """Add a test patient to the database."""
    existing_patient = Patient(
        location="40.7128, -74.0060",
        description="Existing patient for testing",
        therapy_needs=["anxiety"],
        gender=GenderOption.PREFER_NOT_TO_SAY.value,
        age=30,
        user_id=USER_ID,
    )

    session_fixture.add(existing_patient)
    session_fixture.commit()
    session_fixture.refresh(existing_patient)


def add_test_therapist(session_fixture):
    """Add a test therapist to the database."""
    therapist = Therapist(
        location="40.7128, -74.0060",
        description="Existing patient for testing",
        therapist_type="licensed",
        gender=GenderOption.FEMALE.value,
        age=45,
        user_id=USER_ID,
    )

    session_fixture.add(therapist)
    session_fixture.commit()
    session_fixture.refresh(therapist)


def add_test_user(session_fixture):
    """Add a test user to the database."""
    user = User(
        id=USER_ID,
        first_name="Existing",
        last_name="User",
        email_address="a@b.com",
        password="hashedpassword",
        is_anonymous=False,
    )

    session_fixture.add(user)
    session_fixture.commit()
    session_fixture.refresh(user)


def add_anonymous_patient(session_fixture, mock_overrides=None):
    if not mock_overrides:
        mock_overrides = {}
    base_data = {
        "session_id": USER_ID,
        "location": None,
        "description": None,
        "therapy_needs": None,
        "gender": None,
        "age": None,
        "personality_test": None,
    }

    patient = AnonymousPatient(**{**base_data, **mock_overrides})

    session_fixture.add(patient)
    session_fixture.commit()
    session_fixture.refresh(patient)
