from backend.models.user import Patient, Therapist, User


def test_read_main(client_fixture):
    response = client_fixture.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello World"}


def add_test_patient(session_fixture):
    """Add a test patient to the database."""
    existing_patient = Patient(
        location="40.7128, -74.0060",
        description="Existing patient for testing",
        therapy_needs=["anxiety"],
        user_id=1,
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
    )

    session_fixture.add(therapist)
    session_fixture.commit()
    session_fixture.refresh(therapist)


def add_test_user(session_fixture):
    """Add a test user to the database."""
    user = User(
        first_name="Existing",
        last_name="User",
        email_address="a@b.com",
        password="hashedpassword",
    )

    session_fixture.add(user)
    session_fixture.commit()
    session_fixture.refresh(user)


def test_create_user(client_fixture, session_fixture):
    """Test creating a new user."""
    add_test_user(session_fixture)
    response = client_fixture.post(
        "/users",
        json={
            "first_name": "John",
            "last_name": "Doe",
            "email_address": "f@b.com",
            "password": "hashedpassword",
        },
    )
    assert response.status_code == 201
    data = response.json()

    assert data["first_name"] == "John"
    assert data["last_name"] == "Doe"
    assert "id" in data
    assert data["email_address"] == "f@b.com"
    assert "password" not in data


def test_create_user_invalid_email(client_fixture):
    response = client_fixture.post(
        "/users",
        json={
            "first_name": "John",
            "last_name": "Doe",
            "email_address": "f@b",
            "password": "hashedpassword",
        },
    )

    assert response.status_code == 422
    data = response.json()["detail"]
    msg = data[0]["msg"]
    assert (
        msg
        == "value is not a valid email address: The part after the @-sign is not valid. It should have a period."
    )


def test_create_therapist(client_fixture, session_fixture, mock_auth_headers):
    """Test creating a new therapist."""
    add_test_user(session_fixture)
    response = client_fixture.post(
        "/therapists",
        json={
            "location": "40.7128, -74.0060",
            "description": "Experienced therapist",
            "specializations": ["anxiety", "depression"],
            "therapist_type": "licensed",
        },
        headers=mock_auth_headers,
    )

    assert response.status_code == 201
    data = response.json()
    assert data["description"] == "Experienced therapist"
    assert data["specializations"] == ["anxiety", "depression"]
    assert data["therapist_type"] == "licensed"
    assert data["location"] == {"latitude": 40.7128, "longitude": -74.006}


def test_create_patient(client_fixture, session_fixture, mock_auth_headers):
    """Test creating a new patient."""
    add_test_user(session_fixture)

    response = client_fixture.post(
        "/patients",
        json={
            "location": "40.7128, -74.0060",
            "therapy_needs": ["anxiety", "depression"],
            "description": "This is a test description",
        },
        headers=mock_auth_headers,
    )

    assert response.status_code == 201
    data = response.json()
    assert data["therapy_needs"] == ["anxiety", "depression"]
    assert "id" in data
    assert data["description"] == "This is a test description"
    assert data["location"] == {"latitude": 40.7128, "longitude": -74.006}


def test_create_patient_invalid_data(
    client_fixture, session_fixture, mock_auth_headers
):
    add_test_user(session_fixture)
    response = client_fixture.post(
        "/patients",
        json={
            "location": 40.7128,
            "therapy_needs": ["anxiety", "depression"],
            "description": "This is a test description",
        },
        headers=mock_auth_headers,
    )

    error_detail = response.json()["detail"]
    assert response.status_code == 422
    assert (
        error_detail[0]["msg"]
        == "Input should be a dictionary or an instance of Coordinate"
    )


def test_create_patient_returns_409_for_existing_patient(
    client_fixture, session_fixture, mock_auth_headers
):
    """Test that creating a patient with an existing email returns 409."""
    add_test_user(session_fixture)
    add_test_patient(session_fixture)

    response = client_fixture.post(
        "/patients",
        json={
            "location": "40.7128, -74.0060",
            "therapy_needs": ["anxiety", "depression"],
            "description": "This is a test description",
        },
        headers=mock_auth_headers,
    )

    assert response.status_code == 409
    assert response.json() == {"detail": "Patient already exists"}


def test_create_therapist_returns_409_for_existing_therapist(
    client_fixture, session_fixture, mock_auth_headers
):
    """Test that creating a therapist with an existing email returns 409."""
    add_test_user(session_fixture)
    add_test_therapist(session_fixture)

    response = client_fixture.post(
        "/therapists",
        json={
            "location": "40.7128, -74.0060",
            "description": "Experienced therapist",
            "specializations": ["anxiety", "depression"],
            "therapist_type": "licensed",
        },
        headers=mock_auth_headers,
    )

    assert response.status_code == 409
    assert response.json() == {"detail": "Therapist already exists"}
