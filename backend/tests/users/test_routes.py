from uuid import UUID
import numpy as np
import pandas as pd
from sqlmodel import select
from backend.routers.users.user_types import UserOption
from backend.tests.test_utils import (
    add_test_patient,
    add_test_therapist,
    add_test_user,
    add_anonymous_patient,
    add_anonymous_personality_test_score,
    USER_ID,
    TEST_USER_BASE,
    TEST_USER_PASSWORD,
    MOCK_PERSONALITY_TEST,
)
from backend.models.user import GenderOption, AnonymousPatient, User


def test_user_login_for_multiple_roles(client_fixture, session_fixture):
    """Test user login route"""
    add_test_user(
        session_fixture,
        {
            "roles": [UserOption.THERAPIST.value, UserOption.PATIENT.value],
            "id": UUID("d658ffce-d810-4341-a8ef-2d3651489daf"),
        },
    )

    response = client_fixture.post(
        "/token",
        data={
            "username": TEST_USER_BASE["email_address"],
            "password": TEST_USER_PASSWORD,
        },
    )

    assert response.status_code == 200
    data = response.json()

    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email_address"] == TEST_USER_BASE["email_address"]
    assert set(data["roles"]) == {UserOption.PATIENT.value, UserOption.THERAPIST.value}


def test_login_invalid_password(client_fixture, session_fixture):
    """Test user login route with invalid password"""
    add_test_user(session_fixture)

    response = client_fixture.post(
        "/token",
        data={
            "username": TEST_USER_BASE["email_address"],
            "password": "WrongPassword1",
        },
    )

    assert response.status_code == 401
    data = response.json()

    assert data["detail"] == "Invalid credentials"


def test_login_invalid_email(client_fixture, session_fixture):
    """Test user login route with invalid email"""
    add_test_user(session_fixture)

    response = client_fixture.post(
        "/token",
        data={"username": "y@z.com", "password": TEST_USER_PASSWORD},
    )

    assert response.status_code == 401
    data = response.json()

    assert data["detail"] == "Invalid credentials"


def test_therapist_login(client_fixture, session_fixture):
    """Test user login route"""
    add_test_user(
        session_fixture,
        {
            "roles": [UserOption.THERAPIST.value],
            "id": UUID("d658ffce-d810-4341-a8ef-2d3651489daf"),
        },
    )

    response = client_fixture.post(
        "/token",
        data={
            "username": TEST_USER_BASE["email_address"],
            "password": TEST_USER_PASSWORD,
        },
    )

    assert response.status_code == 200
    data = response.json()

    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email_address"] == TEST_USER_BASE["email_address"]
    assert data["roles"] == [UserOption.THERAPIST.value]


def test_patient_login(client_fixture, session_fixture):
    """Test user login route"""
    add_test_user(session_fixture)

    response = client_fixture.post(
        "/token",
        data={
            "username": TEST_USER_BASE["email_address"],
            "password": TEST_USER_PASSWORD,
        },
    )

    assert response.status_code == 200
    data = response.json()

    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email_address"] == TEST_USER_BASE["email_address"]
    assert data["roles"] == [UserOption.PATIENT.value]


def test_create_therapist(client_fixture, mock_auth_headers):
    """Test creating a new therapist."""
    response = client_fixture.post(
        "/therapists",
        json={
            "first_name": "Therapist",
            "last_name": "Last",
            "email_address": "a@b.com",
            "password": "HashedPassword1",
            "user_type": UserOption.THERAPIST.value,
        },
        headers=mock_auth_headers,
    )

    assert response.status_code == 201
    data = response.json()
    assert data["id"] is not None


def test_create_therapist_with_existing_user(
    client_fixture, session_fixture, mock_auth_headers
):
    """Test creating a new therapist with an existing user."""
    add_test_user(
        session_fixture,
    )

    response = client_fixture.post(
        "/therapists",
        json={
            "first_name": "Therapist",
            "last_name": "Last",
            "email_address": TEST_USER_BASE["email_address"],
            "password": "HashedPassword1",
            "user_type": UserOption.THERAPIST.value,
        },
        headers=mock_auth_headers,
    )

    data = response.json()
    assert response.status_code == 201

    user = session_fixture.exec(
        select(User).where(User.email_address == TEST_USER_BASE["email_address"])
    ).first()

    assert set(user.roles) == {UserOption.THERAPIST.value, UserOption.PATIENT.value}
    assert data["id"] is not None


def test_get_authenticated_patient(client_fixture, session_fixture, mock_auth_headers):
    """Test getting authenticated patient."""

    add_test_user(session_fixture)
    add_test_patient(session_fixture)

    response = client_fixture.get("/patients/me", headers=mock_auth_headers)

    assert response.status_code == 200
    data = response.json()

    assert "id" in data
    assert data["latitude"] == 40.7128
    assert data["longitude"] == -74.006
    assert data["description"] == "Patient for testing"
    assert data["age"] == 30
    assert data["gender"] == "prefer_not_to_say"
    assert data["personality_test_id"] is None
    assert data["therapy_needs"] == ["anxiety"]
    assert data["is_lgbtq_therapist_preference"] is True
    assert data["is_religious_therapist_preference"] is False


def test_authenticated_patient_not_found(
    client_fixture, session_fixture, mock_auth_headers, mock_jwt_decode
):
    """Test getting authenticated patient when not found."""
    test_alternative_user_id = UUID("b658ffce-d810-4341-a8ef-2d3651489daf")

    add_test_user(session_fixture)
    add_test_user(session_fixture, {"id": test_alternative_user_id})

    add_test_patient(session_fixture)

    mock_jwt_decode.return_value = {
        "sub": str(test_alternative_user_id),
        "exp": 9999999999,
    }

    response = client_fixture.get("/patients/me", headers=mock_auth_headers)

    assert response.status_code == 404
    data = response.json()
    assert data == {"detail": "Patient not found"}


def test_authenticated_user_not_found(
    client_fixture, session_fixture, mock_auth_headers, mock_jwt_decode
):
    """Test getting authenticated patient returns 401 when user cannot be validated."""

    test_alternative_user_id = UUID("b758ffce-d810-4341-a8ef-2d3651489daf")

    add_test_user(session_fixture)
    add_test_user(session_fixture, {"id": UUID("b658ffce-d810-4341-a8ef-2d3651489daf")})

    add_test_patient(session_fixture)

    mock_jwt_decode.return_value = {
        "sub": str(test_alternative_user_id),
        "exp": 9999999999,
    }

    response = client_fixture.get(
        "/patients/me",
        headers=mock_auth_headers,
    )

    assert response.status_code == 401
    data = response.json()
    assert data == {"detail": "Could not validate credentials"}


def test_create_patient_with_existing_user(
    client_fixture, session_fixture, mock_auth_headers
):
    """Test creating a new patient object with an existing user."""
    add_test_user(
        session_fixture,
        {"roles": [UserOption.THERAPIST.value]},
    )

    anonymous_patient = add_anonymous_patient(session_fixture)

    personality_test_overrides = {
        **MOCK_PERSONALITY_TEST,
        "anonymous_patient_id": anonymous_patient.id,
    }

    add_anonymous_personality_test_score(session_fixture, personality_test_overrides)

    response = client_fixture.post(
        "/patients",
        json={
            "first_name": "Patient",
            "last_name": "Last",
            "email_address": TEST_USER_BASE["email_address"],
            "password": "HashedPassword1",
            "user_type": UserOption.PATIENT.value,
        },
        headers=mock_auth_headers,
    )

    data = response.json()

    assert response.status_code == 201

    user = session_fixture.exec(
        select(User).where(User.email_address == TEST_USER_BASE["email_address"])
    ).first()

    assert set(user.roles) == {UserOption.THERAPIST.value, UserOption.PATIENT.value}
    assert data["id"] is not None


def test_create_anonymous_session(client_fixture, session_fixture):
    """create anonymous session"""
    response = client_fixture.post(
        "/anonymous-sessions",
    )

    assert response.status_code == 200
    data = response.json()

    assert data["access_token"] is not None
    assert data["user_id"] is not None

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

    anonymous_patient_overrides = {
        "latitude": 43.6555,
        "longitude": -19.6345,
        "description": None,
        "therapy_needs": ["anxiety", "depression"],
        "gender": GenderOption.FEMALE,
        "age": 27,
        "personality_test": None,
        "is_lgbtq_therapist_preference": True,
        "is_religious_therapist_preference": True,
    }

    anonymous_patient = add_anonymous_patient(
        session_fixture, anonymous_patient_overrides
    )

    personality_test_overrides = {
        **MOCK_PERSONALITY_TEST,
        "anonymous_patient_id": anonymous_patient.id,
    }

    add_anonymous_personality_test_score(session_fixture, personality_test_overrides)

    response = client_fixture.post(
        "/patients",
        json={
            "first_name": "User",
            "last_name": "Last",
            "email_address": "a@b.com",
            "password": "Hashedpassword1",
            "user_type": UserOption.PATIENT.value,
        },
        headers=mock_auth_headers,
    )

    assert response.status_code == 201
    data = response.json()

    assert data["id"] is not None


def test_create_patient_without_personality_test(
    client_fixture, session_fixture, mock_auth_headers
):
    """Test creating a new patient."""

    overrides = {
        "latitude": 43.6555,
        "longitude": -19.6345,
        "description": None,
        "therapy_needs": ["anxiety", "depression"],
        "gender": GenderOption.MALE,
        "age": 27,
        "personality_test": None,
        "is_lgbtq_therapist_preference": True,
        "is_religious_therapist_preference": True,
    }

    add_anonymous_patient(session_fixture, overrides)

    response = client_fixture.post(
        "/patients",
        json={
            "first_name": "User",
            "last_name": "Last",
            "email_address": "a@b.com",
            "password": "Hashedpassword1",
            "user_type": UserOption.PATIENT.value,
        },
        headers=mock_auth_headers,
    )

    data = response.json()
    assert data["detail"] == "Personality test not completed."
    assert response.status_code == 400


def test_create_patient_with_invalid_first_name(
    client_fixture, session_fixture, mock_auth_headers
):
    """invalid first name data for creating a patient"""

    overrides = {
        "latitude": 43.6555,
        "longitude": -19.6345,
        "description": None,
        "therapy_needs": ["anxiety", "depression"],
        "gender": GenderOption.MALE,
        "age": 27,
        "personality_test": None,
        "is_lgbtq_therapist_preference": True,
        "is_religious_therapist_preference": True,
    }

    add_anonymous_patient(session_fixture, overrides)

    response = client_fixture.post(
        "/patients",
        json={
            "first_name": 1,
            "last_name": "Last",
            "email_address": "a@b.com",
            "password": "Hashedpassword1",
            "user_type": UserOption.PATIENT.value,
        },
        headers=mock_auth_headers,
    )

    data = response.json()["detail"]
    assert response.status_code == 422
    assert data == [
        {
            "type": "string_type",
            "loc": ["body", "first_name"],
            "msg": "Input should be a valid string",
            "input": 1,
        }
    ]


def test_create_patient_with_invalid_email(
    client_fixture, session_fixture, mock_auth_headers
):
    """invalid data create patient"""
    overrides = {
        "latitude": 43.6555,
        "longitude": -19.6345,
        "description": None,
        "therapy_needs": ["anxiety", "depression"],
        "gender": GenderOption.MALE,
        "age": 27,
        "personality_test": None,
        "is_lgbtq_therapist_preference": True,
        "is_religious_therapist_preference": True,
    }

    add_anonymous_patient(session_fixture, overrides)

    response = client_fixture.post(
        "/patients",
        json={
            "first_name": "First",
            "last_name": "Last",
            "email_address": "abc",
            "password": "Hashedpassword1",
            "user_type": UserOption.PATIENT.value,
        },
        headers=mock_auth_headers,
    )

    data = response.json()["detail"]
    assert response.status_code == 422
    assert (
        data[0]["msg"]
        == "value is not a valid email address: An email address must have an @-sign."
    )


def test_create_patient_with_null_password_value(
    client_fixture, session_fixture, mock_auth_headers
):
    """invalid data create patient"""
    overrides = {
        "latitude": 43.6555,
        "longitude": -19.6345,
        "description": None,
        "therapy_needs": ["anxiety", "depression"],
        "gender": GenderOption.MALE,
        "age": 27,
        "personality_test": None,
        "is_lgbtq_therapist_preference": True,
        "is_religious_therapist_preference": True,
    }

    add_anonymous_patient(session_fixture, overrides)

    response = client_fixture.post(
        "/patients",
        json={
            "first_name": "First",
            "last_name": "Last",
            "email_address": "a@b.com",
            "password": None,
            "user_type": UserOption.PATIENT.value,
        },
        headers=mock_auth_headers,
    )

    data = response.json()["detail"]
    assert response.status_code == 422
    assert data[0]["msg"] == "Input should be a valid string"


def test_create_patient_returns_409_for_existing_patient(
    client_fixture, session_fixture, mock_auth_headers
):
    """Test that creating a patient with an existing email returns 409."""
    add_test_user(session_fixture)
    add_test_patient(session_fixture)

    overrides = {
        "session_id": USER_ID,
        "latitude": 43.6555,
        "longitude": -19.6345,
        "description": None,
        "therapy_needs": ["anxiety", "depression"],
        "gender": GenderOption.MALE,
        "age": 27,
        "personality_test": None,
        "is_lgbtq_therapist_preference": True,
        "is_religious_therapist_preference": True,
    }

    add_anonymous_patient(session_fixture, overrides)

    response = client_fixture.post(
        "/patients",
        json={
            "first_name": "First",
            "last_name": "Last",
            "email_address": "a@b.com",
            "password": "HashedPassword1",
            "user_type": UserOption.PATIENT.value,
        },
        headers=mock_auth_headers,
    )

    assert response.status_code == 409
    assert response.json() == {"detail": "Patient already exists"}


def test_create_therapist_returns_409_for_existing_therapist(
    client_fixture, session_fixture, mock_auth_headers
):
    """Test that creating a therapist with an existing email returns 409."""

    add_test_user(session_fixture, {"roles": [UserOption.THERAPIST.value]})
    add_test_therapist(session_fixture)

    response = client_fixture.post(
        "/therapists",
        json={
            "first_name": "First",
            "last_name": "Last",
            "email_address": "a@b.com",
            "password": "HashedPassword1",
            "user_type": UserOption.THERAPIST.value,
        },
        headers=mock_auth_headers,
    )

    assert response.status_code == 409
    assert response.json() == {"detail": "Therapist already exists"}


def test_patch_anonymous_patient_updates(
    client_fixture, session_fixture, mock_auth_headers
):
    """Test that a patch request to an anonymous patient updates the record"""

    add_anonymous_patient(session_fixture)

    response = client_fixture.patch(
        "/anonymous-sessions",
        json={
            "age": 30,
        },
        headers=mock_auth_headers,
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
        "/anonymous-sessions",
        json={
            "age": 30,
        },
        headers=mock_auth_headers,
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

    add_anonymous_patient(session_fixture, mock_overrides)

    response = client_fixture.patch(
        "/anonymous-sessions",
        json={
            "age": 30,
        },
        headers=mock_auth_headers,
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

    response = client_fixture.patch(
        "/anonymous-sessions",
        json={"postal_code": "M5A 4L1"},
        headers=mock_auth_headers,
    )

    assert response.status_code == 200

    data = response.json()
    assert data["longitude"] == -79.3626
    assert data["latitude"] == 43.6555
    assert data["postal_code"] == "M5A 4L1"


def test_patch_anonymous_patient_invalid_location_coordinates(
    client_fixture, session_fixture, mock_auth_headers
):
    """Check that a postal code does not saves invalid lon and lat coordinates"""

    add_anonymous_patient(session_fixture)

    response = client_fixture.patch(
        "/anonymous-sessions",
        json={"postal_code": "123 456"},
        headers=mock_auth_headers,
    )

    data = response.json()

    assert (
        data["detail"][0]["msg"] == "Value error, Invalid Canadian postal code format"
    )
    assert response.status_code == 422


def test_patch_anonymous_patient_no_location(
    client_fixture, session_fixture, mock_auth_headers, mocker
):
    """Test that patching with an unresolvable postal code returns an error"""
    add_anonymous_patient(session_fixture)

    mock_location = pd.Series(
        {
            "latitude": np.nan,
            "longitude": np.nan,
        }
    )

    mocker.patch("pgeocode.Nominatim.query_postal_code", return_value=mock_location)

    response = client_fixture.patch(
        "/anonymous-sessions",
        json={"postal_code": "L4J 6B6"},
        headers=mock_auth_headers,
    )

    data = response.json()

    assert data == {
        "detail": "Postal code 'L4J 6B6' is invalid or could not be geocoded."
    }


def test_patch_anonymous_patient_lgbtq_preference(
    client_fixture, session_fixture, mock_auth_headers
):
    """test if the dataframe is empty from pgeocode"""
    add_anonymous_patient(session_fixture)

    response = client_fixture.patch(
        "/anonymous-sessions",
        json={"is_lgbtq_therapist_preference": True},
        headers=mock_auth_headers,
    )

    data = response.json()

    assert response.status_code == 200
    assert data["is_lgbtq_therapist_preference"] is True


def test_patch_anonymous_patient_lgbtq_preference_invalid_value(
    client_fixture, session_fixture, mock_auth_headers
):
    """Test that non-boolean value for LGBTQ preference returns 422"""
    add_anonymous_patient(session_fixture)

    response = client_fixture.patch(
        "/anonymous-sessions",
        json={"is_lgbtq_therapist_preference": 1},
        headers=mock_auth_headers,
    )

    data = response.json()

    assert response.status_code == 422
    assert data["detail"][0]["msg"] == "Input should be a valid boolean"


def test_get_anonymous_patient(client_fixture, session_fixture, mock_auth_headers):
    """Test to get an anonymous patient"""
    add_anonymous_patient(session_fixture, {"gender": "male", "age": 29})

    response = client_fixture.get("/anonymous-sessions", headers=mock_auth_headers)

    data = response.json()

    assert response.status_code == 200
    assert data["age"] == 29
    assert data["gender"] == "male"


def test_get_anonymous_patient_returns_404_nonexisting_patient(
    client_fixture, session_fixture, mock_auth_headers
):
    """test if the dataframe is empty from pgeocode"""
    add_anonymous_patient(session_fixture, {"session_id": "1234"})

    response = client_fixture.get(
        "/anonymous-sessions",
        headers=mock_auth_headers,
    )

    data = response.json()["detail"]
    assert response.status_code == 404
    assert data == "Anonymous patient not found"
