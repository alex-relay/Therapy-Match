from backend.models.user import Patient, Therapist, User

USER_ID = "c658ffce-d810-4341-a8ef-2d3651489daf"


def add_test_patient(session_fixture):
    """Add a test patient to the database."""
    existing_patient = Patient(
        location="40.7128, -74.0060",
        description="Existing patient for testing",
        therapy_needs=["anxiety"],
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
        therapy_needs=["anxiety"],
        therapist_type="licensed",
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
    )

    session_fixture.add(user)
    session_fixture.commit()
    session_fixture.refresh(user)
