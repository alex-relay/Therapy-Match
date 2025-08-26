from backend.models.user import Patient, Therapist


def test_read_main(client_fixture):
    response = client_fixture.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello World"}


def add_test_patient(session_fixture):
    """Add a test patient to the database."""
    existing_patient = Patient(
        first_name="Existing",
        last_name="Patient",
        location="40.7128, -74.0060",
        email_address="a@b.com",
        description="Existing patient for testing",
        therapy_needs=["anxiety"],
    )

    session_fixture.add(existing_patient)
    session_fixture.commit()
    session_fixture.refresh(existing_patient)


def add_test_therapist(session_fixture):
    """Add a test therapist to the database."""
    therapist = Therapist(
        first_name="Existing",
        last_name="Patient",
        location="40.7128, -74.0060",
        email_address="a@b.com",
        description="Existing patient for testing",
        therapy_needs=["anxiety"],
        therapist_type="licensed",
    )

    session_fixture.add(therapist)
    session_fixture.commit()
    session_fixture.refresh(therapist)


def test_create_therapist(client_fixture, session_fixture):
    """Test creating a new therapist."""
    add_test_therapist(session_fixture)
    response = client_fixture.post(
        "/register/therapist",
        json={
            "first_name": "John",
            "last_name": "Doe",
            "location": "40.7128, -74.0060",
            "email_address": "f@b.com",
            "description": "Experienced therapist",
            "specializations": ["anxiety", "depression"],
            "therapist_type": "licensed",
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert data["first_name"] == "John"
    assert data["last_name"] == "Doe"


def test_create_patient(client_fixture, session_fixture):
    """Test creating a new patient."""
    add_test_patient(session_fixture)

    response = client_fixture.post(
        "/register/patient",
        json={
            "first_name": "John",
            "last_name": "Doe",
            "location": "40.7128, -74.0060",
            "email_address": "f@b.com",
            "description": "Experienced therapist",
            "therapy_needs": ["anxiety", "depression"],
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert data["first_name"] == "John"
    assert data["last_name"] == "Doe"
    assert data["therapy_needs"] == ["anxiety", "depression"]
    assert "id" in data
    assert data["description"] == "Experienced therapist"
    assert data["email_address"] == "f@b.com"
    assert data["location"] == {"latitude": 40.7128, "longitude": -74.006}


def test_create_patient_returns_409_for_existing_patient(
    client_fixture, session_fixture
):
    """Test that creating a patient with an existing email returns 409."""
    add_test_patient(session_fixture)

    response = client_fixture.post(
        "/register/patient",
        json={
            "first_name": "Existing",
            "last_name": "Patient",
            "location": "40.7128, -74.0060",
            "email_address": "a@b.com",
            "description": "Existing patient for testing",
            "therapy_needs": ["anxiety"],
        },
    )

    assert response.status_code == 409
    assert response.json() == {"detail": "Patient already exists"}


def test_create_therapist_returns_409_for_existing_therapist(
    client_fixture, session_fixture
):
    """Test that creating a therapist with an existing email returns 409."""
    add_test_therapist(session_fixture)

    response = client_fixture.post(
        "/register/therapist",
        json={
            "first_name": "Existing",
            "last_name": "Patient",
            "location": "40.7128, -74.0060",
            "email_address": "a@b.com",
            "description": "Existing patient for testing",
            "specializations": ["anxiety"],
            "therapist_type": "licensed",
        },
    )

    assert response.status_code == 409
    assert response.json() == {"detail": "Therapist already exists"}
