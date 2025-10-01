from backend.tests.test_utils import add_test_patient, add_test_therapist, add_test_user
from backend.models.user import GenderOption, AnonymousPatient
from sqlmodel import select

USER_ID = "c658ffce-d810-4341-a8ef-2d3651489daf"


def test_read_main(client_fixture):
    response = client_fixture.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello World"}


def test_create_user(client_fixture, session_fixture):
    """Test creating a new user."""
    add_test_user(session_fixture)
    response = client_fixture.post(
        "/users",
        json={
            "first_name": "John",
            "last_name": "Doe",
            "email_address": "f@b.com",
            "password": "Xassword1",
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
    """invalid email test for creating a user"""
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
    assert msg == (
        "value is not a valid email address: The part after the @-sign is not valid. "
        "It should have a period."
    )


def test_create_user_invalid_password_uppercase_letter(client_fixture):
    """invalid password test for creating a user"""
    response = client_fixture.post(
        "/users",
        json={
            "first_name": "John",
            "last_name": "Doe",
            "email_address": "f@b.com",
            "password": "hashedpassword",
        },
    )

    assert response.status_code == 422
    error_detail = response.json()["detail"]
    assert (
        error_detail[0]["msg"]
        == "Value error, Password must contain at least one uppercase letter"
    )


def test_create_user_invalid_password_lowercase_letter(client_fixture):
    """invalid password test for creating a user"""
    response = client_fixture.post(
        "/users",
        json={
            "first_name": "John",
            "last_name": "Doe",
            "email_address": "f@b.com",
            "password": "HASHEDPASSWORD1",
        },
    )

    assert response.status_code == 422
    error_detail = response.json()["detail"]
    assert (
        error_detail[0]["msg"]
        == "Value error, Password must contain at least one lowercase letter"
    )


def test_create_user_invalid_password_number(client_fixture):
    """invalid password number test"""
    response = client_fixture.post(
        "/users",
        json={
            "first_name": "John",
            "last_name": "Doe",
            "email_address": "f@b.com",
            "password": "HaSHEDPASSWORD",
        },
    )

    assert response.status_code == 422
    error_detail = response.json()["detail"]
    assert (
        error_detail[0]["msg"]
        == "Value error, Password must contain at least one digit"
    )


def test_invalid_first_name(client_fixture):
    """invalid first name test"""
    response = client_fixture.post(
        "/users",
        json={
            "first_name": "J",
            "last_name": "Doe",
            "email_address": "f@b.com",
            "password": "HaSHEDPASSWORD1",
        },
    )

    assert response.status_code == 422
    error_detail = response.json()["detail"]
    assert error_detail[0]["msg"] == "String should have at least 2 characters"


def test_invalid_last_name(client_fixture):
    """invalid last name test"""
    response = client_fixture.post(
        "/users",
        json={
            "first_name": "John",
            "last_name": "D",
            "email_address": "f@b.com",
            "password": "HaSHEDPASSWORD1",
        },
    )

    assert response.status_code == 422
    error_detail = response.json()["detail"]
    assert error_detail[0]["msg"] == "String should have at least 2 characters"


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
            "gender": GenderOption.NON_BINARY.value,
            "age": 27,
        },
        headers=mock_auth_headers,
    )

    assert response.status_code == 201
    data = response.json()
    assert data["description"] == "Experienced therapist"
    assert data["specializations"] == ["anxiety", "depression"]
    assert data["therapist_type"] == "licensed"
    assert data["location"] == {"latitude": 40.7128, "longitude": -74.006}


def test_create_anonymous_session(client_fixture, session_fixture):
    response = client_fixture.post(
        "/anonymous-session",
    )

    set_cookie_header = response.headers.get("set-cookie")

    assert response.status_code == 200
    assert response.json() == {
        "message": "Anonymous patient session created successfully"
    }
    assert "anonymous_session" in set_cookie_header
    assert "HttpOnly" in set_cookie_header
    assert "Max-Age=3600" in set_cookie_header
    assert "Path=/questions" in set_cookie_header

    anon_session_record = session_fixture.exec(select(AnonymousPatient)).first()
    assert anon_session_record is not None

    assert anon_session_record.session_id is not None
    assert anon_session_record.location is None
    assert anon_session_record.gender is None
    assert anon_session_record.age is None
    assert len(anon_session_record.therapy_needs) == 0
    assert anon_session_record.description is None


def test_create_patient(client_fixture, session_fixture, mock_auth_headers):
    """Test creating a new patient."""
    add_test_user(session_fixture)

    response = client_fixture.post(
        "/patients",
        json={
            "location": "40.7128, -74.0060",
            "therapy_needs": ["anxiety", "depression"],
            "description": "This is a test description",
            "gender": GenderOption.NON_BINARY.value,
            "age": 22,
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
            "age": 30,
            "gender": GenderOption.MALE.value,
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
            "age": 30,
            "gender": GenderOption.MALE.value,
        },
        headers=mock_auth_headers,
    )

    assert response.status_code == 409
    assert response.json() == {"detail": "Therapist already exists"}
