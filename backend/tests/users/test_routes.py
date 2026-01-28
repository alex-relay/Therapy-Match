from uuid import UUID
from datetime import timedelta
import numpy as np
import pandas as pd
from sqlmodel import select
from backend.routers.users.user_types import UserOption
from backend.tests.test_utils import (
    add_test_patient,
    add_test_therapist,
    add_test_user,
    add_anonymous_patient,
    add_personality_test_score,
    USER_ID,
    TEST_USER_BASE,
    TEST_USER_PASSWORD,
)
from backend.models.user import GenderOption, AnonymousPatient, User
from backend.services.users import create_access_token

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

    add_personality_test_score(session_fixture, personality_test_overrides)

    access_token = create_access_token({"sub": USER_ID}, timedelta(minutes=60))

    response = client_fixture.post(
        "/patients",
        json={
            "first_name": "Patient",
            "last_name": "Last",
            "email_address": TEST_USER_BASE["email_address"],
            "password": "HashedPassword1",
            "user_type": UserOption.PATIENT.value,
        },
        headers={**mock_auth_headers, "Cookie": f"anonymous_session={access_token}"},
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

    add_personality_test_score(session_fixture, personality_test_overrides)

    access_token = create_access_token({"sub": USER_ID}, timedelta(minutes=60))

    response = client_fixture.post(
        "/patients",
        json={
            "first_name": "User",
            "last_name": "Last",
            "email_address": "a@b.com",
            "password": "Hashedpassword1",
            "user_type": UserOption.PATIENT.value,
        },
        headers={**mock_auth_headers, "Cookie": f"anonymous_session={access_token}"},
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
        headers={**mock_auth_headers, "Cookie": f"anonymous_session={USER_ID}"},
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
        headers={**mock_auth_headers, "Cookie": f"anonymous_session={USER_ID}"},
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
        headers={**mock_auth_headers, "Cookie": f"anonymous_session={USER_ID}"},
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
        headers={**mock_auth_headers, "Cookie": f"anonymous_session={USER_ID}"},
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

    access_token = create_access_token({"sub": USER_ID}, timedelta(minutes=60))

    response = client_fixture.post(
        "/patients",
        json={
            "first_name": "First",
            "last_name": "Last",
            "email_address": "a@b.com",
            "password": "HashedPassword1",
            "user_type": UserOption.PATIENT.value,
        },
        headers={**mock_auth_headers, "Cookie": f"anonymous_session={access_token}"},
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

    access_token = create_access_token({"sub": USER_ID}, timedelta(minutes=60))

    response = client_fixture.patch(
        "/anonymous-sessions",
        json={
            "age": 30,
        },
        headers={**mock_auth_headers, "Cookie": f"anonymous_session={access_token}"},
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
        "/anonymous-sessions",
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
        "/anonymous-sessions",
        json={"postal_code": "M5A 4L1"},
        headers={**mock_auth_headers, "Cookie": f"anonymous_session={access_token}"},
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

    access_token = create_access_token({"sub": USER_ID}, timedelta(minutes=60))

    response = client_fixture.patch(
        "/anonymous-sessions",
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
    """Test that patching with an unresolvable postal code returns an error"""
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
        "/anonymous-sessions",
        json={"postal_code": "L4J 6B6"},
        headers={**mock_auth_headers, "Cookie": f"anonymous_session={access_token}"},
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

    access_token = create_access_token({"sub": USER_ID}, timedelta(minutes=60))

    response = client_fixture.patch(
        "/anonymous-sessions",
        json={"is_lgbtq_therapist_preference": True},
        headers={**mock_auth_headers, "Cookie": f"anonymous_session={access_token}"},
    )

    data = response.json()

    assert response.status_code == 200
    assert data["is_lgbtq_therapist_preference"] is True


def test_patch_anonymous_patient_lgbtq_preference_invalid_value(
    client_fixture, session_fixture, mock_auth_headers
):
    """Test that non-boolean value for LGBTQ preference returns 422"""
    add_anonymous_patient(session_fixture)

    access_token = create_access_token({"sub": USER_ID}, timedelta(minutes=60))

    response = client_fixture.patch(
        "/anonymous-sessions",
        json={"is_lgbtq_therapist_preference": 1},
        headers={**mock_auth_headers, "Cookie": f"anonymous_session={access_token}"},
    )

    data = response.json()

    assert response.status_code == 422
    assert data["detail"][0]["msg"] == "Input should be a valid boolean"


def test_get_anonymous_patient(client_fixture, session_fixture, mock_auth_headers):
    """Test to get an anonymous patient"""
    add_anonymous_patient(session_fixture, {"gender": "male", "age": 29})

    access_token = create_access_token({"sub": USER_ID}, timedelta(minutes=60))

    response = client_fixture.get(
        "/anonymous-sessions",
        headers={**mock_auth_headers, "Cookie": f"anonymous_session={access_token}"},
    )

    data = response.json()

    assert response.status_code == 200
    assert data["age"] == 29
    assert data["gender"] == "male"


def test_get_anonymous_patient_returns_404_nonexisting_patient(
    client_fixture, session_fixture, mock_auth_headers
):
    """test if the dataframe is empty from pgeocode"""
    add_anonymous_patient(session_fixture, {"session_id": "1234"})

    access_token = create_access_token({"sub": USER_ID}, timedelta(minutes=60))

    response = client_fixture.get(
        "/anonymous-sessions",
        headers={**mock_auth_headers, "Cookie": f"anonymous_session={access_token}"},
    )

    data = response.json()["detail"]
    assert response.status_code == 404
    assert data == "Anonymous patient not found"
