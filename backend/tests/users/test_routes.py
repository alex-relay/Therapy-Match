from datetime import timedelta
import numpy as np
import pandas as pd
from sqlmodel import select
from backend.tests.test_utils import (
    add_test_patient,
    add_test_therapist,
    add_test_user,
    add_anonymous_patient,
    USER_ID,
)
from backend.models.user import GenderOption, AnonymousPatient
from backend.routers.users.service import create_access_token


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
    """create anonymous session"""
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
    assert "Path=/" in set_cookie_header

    anon_session_record = session_fixture.exec(select(AnonymousPatient)).first()
    assert anon_session_record is not None

    assert anon_session_record.session_id is not None
    assert anon_session_record.latitude is None
    assert anon_session_record.longitude is None
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
            "is_lgbtq_therapist_preference": True,
            "is_religious_therapist_preference": False,
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
    """invalid data create patient"""
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
            "is_lgbtq_therapist_preference": True,
            "is_religious_therapist_preference": False,
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


def test_patch_anonyomous_patient_updates(
    client_fixture, session_fixture, mock_auth_headers
):
    """Test that a patch request to an anonymous patient updates the record"""

    add_anonymous_patient(session_fixture)

    response = client_fixture.patch(
        "/anonymous-session",
        json={
            "age": 30,
        },
        headers={**mock_auth_headers, "Cookie": f"anonymous_session={USER_ID}"},
    )

    anonymous_session_record = session_fixture.exec(select(AnonymousPatient)).first()

    assert response.status_code == 200
    assert anonymous_session_record.age == 30


def test_patch_anonyomous_patient_does_not_affect_older_data(
    client_fixture, session_fixture, mock_auth_headers
):
    """Test that a patch request to an anonymous patient updates the record"""

    mock_overrides = {"description": "test_description", "gender": "male"}

    add_anonymous_patient(session_fixture, mock_overrides)

    response = client_fixture.patch(
        "/anonymous-session",
        json={
            "age": 30,
        },
        headers={**mock_auth_headers, "Cookie": f"anonymous_session={USER_ID}"},
    )

    anonymous_session_record = session_fixture.exec(select(AnonymousPatient)).first()

    assert response.status_code == 200
    assert anonymous_session_record.age == 30
    assert anonymous_session_record.description == mock_overrides["description"]
    assert anonymous_session_record.gender == mock_overrides["gender"]


def test_patch_anonymous_patient_overwrites_previous_patch(
    client_fixture, session_fixture, mock_auth_headers
):
    """Check that a previous write can be overwritten"""
    mock_overrides = {
        "age": 29,
    }

    # Create the anonymous patient with the session ID
    add_anonymous_patient(session_fixture, mock_overrides)

    # Create a proper JWT token like the server does
    access_token = create_access_token({"sub": USER_ID}, timedelta(minutes=60))

    response = client_fixture.patch(
        "/anonymous-session",
        json={
            "age": 30,
        },
        headers={**mock_auth_headers, "Cookie": f"anonymous_session={access_token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["age"] == 30


def test_patch_anonymous_patient_saves_location_coordinates(
    client_fixture, session_fixture, mock_auth_headers, mocker
):
    """Check that a postal code saves lon and lat coordinates"""

    mock_location = pd.Series(
        {
            "latitude": np.float64(43.6555),
            "longitude": np.float64(-79.3626),
        }
    )

    mocker.patch("pgeocode.Nominatim.query_postal_code", return_value=mock_location)

    add_anonymous_patient(session_fixture)

    access_token = create_access_token({"sub": USER_ID}, timedelta(minutes=60))

    response = client_fixture.patch(
        "/anonymous-session",
        json={"postal_code": "M5A 4L1"},
        headers={**mock_auth_headers, "Cookie": f"anonymous_session={access_token}"},
    )

    assert response.status_code == 200

    data = response.json()
    assert data["longitude"] == -79.3626
    assert data["latitude"] == 43.6555


def test_patch_anonymous_patient_invalid_location_coordinates(
    client_fixture, session_fixture, mock_auth_headers
):
    """Check that a postal code does not saves invalid lon and lat coordinates"""

    add_anonymous_patient(session_fixture)

    access_token = create_access_token({"sub": USER_ID}, timedelta(minutes=60))

    response = client_fixture.patch(
        "/anonymous-session",
        json={"postal_code": "123 456"},
        headers={**mock_auth_headers, "Cookie": f"anonymous_session={access_token}"},
    )

    data = response.json()

    assert (
        data["detail"][0]["msg"] == "Value error, Invalid Canadian postal code format"
    )
    assert response.status_code == 422


def test_patch_anonymous_patient_no_location(
    client_fixture, session_fixture, mock_auth_headers, mocker
):
    """test if the dataframe is empty from pgeocode"""
    add_anonymous_patient(session_fixture)

    access_token = create_access_token({"sub": USER_ID}, timedelta(minutes=60))

    mock_location = pd.Series(
        {
            "latitude": np.nan,
            "longitude": np.nan,
        }
    )

    mocker.patch("pgeocode.Nominatim.query_postal_code", return_value=mock_location)

    response = client_fixture.patch(
        "/anonymous-session",
        json={"postal_code": "L4J 6B6"},
        headers={**mock_auth_headers, "Cookie": f"anonymous_session={access_token}"},
    )

    data = response.json()

    assert data == {"detail": "404: Invalid postal code"}


def test_patch_anonymous_patient_lgbtq_preference(
    client_fixture, session_fixture, mock_auth_headers
):
    """test if the dataframe is empty from pgeocode"""
    add_anonymous_patient(session_fixture)

    access_token = create_access_token({"sub": USER_ID}, timedelta(minutes=60))

    response = client_fixture.patch(
        "/anonymous-session",
        json={"is_lgbtq_therapist_preference": True},
        headers={**mock_auth_headers, "Cookie": f"anonymous_session={access_token}"},
    )

    data = response.json()

    assert response.status_code == 200
    assert data["is_lgbtq_therapist_preference"] is True


def test_patch_anonymous_patient_lgbtq_preference_invalid_value(
    client_fixture, session_fixture, mock_auth_headers
):
    """test if the dataframe is empty from pgeocode"""
    add_anonymous_patient(session_fixture)

    access_token = create_access_token({"sub": USER_ID}, timedelta(minutes=60))

    response = client_fixture.patch(
        "/anonymous-session",
        json={"is_lgbtq_therapist_preference": 1},
        headers={**mock_auth_headers, "Cookie": f"anonymous_session={access_token}"},
    )

    data = response.json()

    assert response.status_code == 422
    assert data["detail"][0]["msg"] == "Input should be a valid boolean"
