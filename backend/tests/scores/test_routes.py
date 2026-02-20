from uuid import UUID
from datetime import timedelta
from sqlmodel import select
from backend.routers.users.user_types import UserOption
from backend.models.user import Patient, TherapistPersonalityTest
from backend.types.scores_types import PersonalityTestCategory
from backend.tests.test_utils import (
    add_test_patient,
    add_test_therapist,
    add_test_user,
    add_anonymous_patient,
    USER_ID,
    MOCK_PERSONALITY_TEST,
    add_anonymous_personality_test_score,
    add_therapist_personality_test,
    add_therapist_personality_test_score,
)
from backend.services.users import create_access_token
from backend.services.scores import format_personality_test


def test_create_therapist_personality_test(
    client_fixture, session_fixture, mock_auth_headers
):
    """test for creating a therapist personality test score"""
    add_test_user(session_fixture, {"roles": [UserOption.THERAPIST.value]})
    add_test_user(
        session_fixture,
        {
            "roles": [UserOption.THERAPIST.value],
            "id": UUID("b658ffce-d810-4341-a8ef-2d3651489daf"),
        },
    )

    therapist = add_test_therapist(session_fixture)

    response = client_fixture.post(
        "/therapists/me/personality-tests", headers=mock_auth_headers
    )

    data = response.json()

    assert response.status_code == 201
    assert data["id"] is not None
    assert data["agreeableness"] == []
    assert data["openness"] == []
    assert data["extroversion"] == []
    assert data["conscientiousness"] == []
    assert data["neuroticism"] == []

    personality_test_score = session_fixture.exec(
        select(TherapistPersonalityTest).where(
            TherapistPersonalityTest.therapist_id == therapist.id
        )
    ).first()

    test_score_dict = personality_test_score.model_dump()

    assert test_score_dict["therapist_id"] == therapist.id


def test_create_therapist_personality_test_with_existing_score(
    session_fixture, client_fixture, mock_auth_headers
):
    """Test to raise an exception if a therapist that has a personality test tries to create one"""
    add_test_user(session_fixture, {"roles": [UserOption.THERAPIST.value]})

    therapist = add_test_therapist(session_fixture)
    personality_test = add_therapist_personality_test(
        session_fixture, {"therapist_id": therapist.id, **(MOCK_PERSONALITY_TEST)}
    )

    formatted_personality_test = format_personality_test(personality_test)

    add_therapist_personality_test_score(
        therapist=therapist,
        personality_test_scores=formatted_personality_test,
        session_fixture=session_fixture,
    )

    response = client_fixture.post(
        "/therapists/me/personality-tests", headers=mock_auth_headers
    )

    assert response.status_code == 409
    data = response.json()

    assert data["detail"] == "Personality test already exists"


def test_create_personality_test_score_invalid_scores(client_fixture, session_fixture):
    """test for creating a patient personality test for invalid scores"""

    add_test_user(session_fixture)
    add_test_patient(session_fixture)

    patient = session_fixture.exec(select(Patient)).first()

    response = client_fixture.post(
        f"/patients/{str(patient.id)}/personality-scores",
        json={
            "agreeableness": [1, 4, 1, 5, 3, 5, 3, 3, 5, 4],
            "extroversion": [1, 4, 3, 5, 4, 3, 2, 5, 1, 4],
            "openness": [1, 2, 4, 5, 1, 2, 3, 4, 5],
            "conscientiousness": [5, 1, 5, 1, 4, 2, 5, 1, 5, 5],
            "neuroticism": [4, 2, 5, 4, 2, 4, 3, 2, 3, 2],
        },
    )

    assert response.status_code == 400
    data = response.json()
    assert (
        data["detail"]
        == "Openness score could not be calculated due to invalid scores list."
    )


def test_get_anonymous_personality_test_score(
    client_fixture, session_fixture, mock_auth_headers
):
    """Test for retrieving a personality test"""
    patient = add_anonymous_patient(session_fixture, {"anonymous_patient_id": USER_ID})
    add_anonymous_personality_test_score(
        session_fixture, {"anonymous_patient_id": patient.id}
    )

    access_token = create_access_token({"sub": USER_ID}, timedelta(minutes=60))

    response = client_fixture.get(
        "/anonymous-sessions/personality-tests",
        headers={**mock_auth_headers, "Cookie": f"anonymous_session={access_token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data == {
        "agreeableness": [],
        "conscientiousness": [],
        "extroversion": [],
        "id": data["id"],
        "neuroticism": [],
        "openness": [],
    }


def test_get_undefined_test_score(client_fixture, session_fixture, mock_auth_headers):
    """Test for retrieving a non-existent personality test"""
    add_anonymous_patient(session_fixture, {"anonymous_patient_id": USER_ID})

    access_token = create_access_token({"sub": USER_ID}, timedelta(minutes=60))

    response = client_fixture.get(
        "/anonymous-sessions/personality-tests",
        headers={**mock_auth_headers, "Cookie": f"anonymous_session={access_token}"},
    )

    assert response.status_code == 404
    data = response.json()
    assert data == {"detail": "Personality test not found on the anonymous patient"}


def test_create_anonymous_session_scores(
    client_fixture, session_fixture, mock_auth_headers
):
    """test for creating an anonymous session personality test score"""
    add_anonymous_patient(session_fixture, {"anonymous_patient_id": USER_ID})

    access_token = create_access_token({"sub": USER_ID}, timedelta(minutes=60))

    response = client_fixture.post(
        "/anonymous-sessions/personality-tests",
        headers={**mock_auth_headers, "Cookie": f"anonymous_session={access_token}"},
    )

    assert response.status_code == 201
    data = response.json()
    assert data == {
        "id": data["id"],
        "agreeableness": [],
        "conscientiousness": [],
        "extroversion": [],
        "neuroticism": [],
        "openness": [],
    }


def test_create_anonymous_session_scores_existing_score(
    client_fixture, session_fixture, mock_auth_headers
):
    """test for creating an anonymous session personality test score"""
    patient = add_anonymous_patient(session_fixture)
    add_anonymous_personality_test_score(
        session_fixture, {"anonymous_patient_id": patient.id}
    )

    access_token = create_access_token({"sub": USER_ID}, timedelta(minutes=60))

    response = client_fixture.post(
        "/anonymous-sessions/personality-tests",
        headers={**mock_auth_headers, "Cookie": f"anonymous_session={access_token}"},
    )

    assert response.status_code == 409
    data = response.json()
    assert data["detail"] == "Anonymous patient already has personality test scores"


def test_patch_anonymous_session_test_score_existing_data(
    client_fixture, session_fixture, mock_auth_headers
):
    """test if the existing data is updated"""
    patient = add_anonymous_patient(session_fixture)
    add_anonymous_personality_test_score(
        session_fixture,
        {
            "anonymous_patient_id": patient.id,
            "agreeableness": [
                {
                    "id": "1",
                    "category": PersonalityTestCategory.AGREEABLENESS,
                    "score": 3,
                },
                {
                    "id": "2",
                    "category": PersonalityTestCategory.AGREEABLENESS,
                    "score": 2,
                },
                {
                    "id": "3",
                    "category": PersonalityTestCategory.AGREEABLENESS,
                    "score": 1,
                },
            ],
        },
    )

    access_token = create_access_token({"sub": USER_ID}, timedelta(minutes=60))

    response = client_fixture.patch(
        "/anonymous-sessions/personality-tests",
        headers={**mock_auth_headers, "Cookie": f"anonymous_session={access_token}"},
        json={"id": "1", "category": "agreeableness", "score": 5},
    )

    data = response.json()
    assert response.status_code == 200
    assert data == {
        "extroversion": [],
        "conscientiousness": [],
        "openness": [],
        "neuroticism": [],
        "agreeableness": [
            {"id": "1", "category": PersonalityTestCategory.AGREEABLENESS, "score": 5},
            {"id": "2", "category": PersonalityTestCategory.AGREEABLENESS, "score": 2},
            {"id": "3", "category": PersonalityTestCategory.AGREEABLENESS, "score": 1},
        ],
        "id": data["id"],
    }


def test_patch_anonymous_session_test_score_non_existing_data(
    client_fixture, session_fixture, mock_auth_headers
):
    """test if the dataframe is empty from pgeocode"""
    patient = add_anonymous_patient(session_fixture)
    add_anonymous_personality_test_score(
        session_fixture,
        {
            "anonymous_patient_id": patient.id,
        },
    )

    access_token = create_access_token({"sub": USER_ID}, timedelta(minutes=60))

    response = client_fixture.patch(
        "/anonymous-sessions/personality-tests",
        headers={**mock_auth_headers, "Cookie": f"anonymous_session={access_token}"},
        json={"id": "1", "category": "agreeableness", "score": 5},
    )

    data = response.json()
    assert response.status_code == 200
    assert data == {
        "extroversion": [],
        "conscientiousness": [],
        "openness": [],
        "neuroticism": [],
        "agreeableness": [
            {"id": "1", "category": PersonalityTestCategory.AGREEABLENESS, "score": 5},
        ],
        "id": data["id"],
    }


def test_patch_anonymous_session_test_score_existing_data_with_new_entry(
    client_fixture, session_fixture, mock_auth_headers
):
    """test if the dataframe is empty from pgeocode"""
    patient = add_anonymous_patient(session_fixture)
    add_anonymous_personality_test_score(
        session_fixture,
        {
            "anonymous_patient_id": patient.id,
            "agreeableness": [
                {
                    "id": "1",
                    "category": PersonalityTestCategory.AGREEABLENESS,
                    "score": 3,
                },
                {
                    "id": "2",
                    "category": PersonalityTestCategory.AGREEABLENESS,
                    "score": 2,
                },
                {
                    "id": "3",
                    "category": PersonalityTestCategory.AGREEABLENESS,
                    "score": 1,
                },
            ],
            "openness": [
                {"id": "1", "category": PersonalityTestCategory.OPENNESS, "score": 3},
            ],
        },
    )

    access_token = create_access_token({"sub": USER_ID}, timedelta(minutes=60))

    response = client_fixture.patch(
        "/anonymous-sessions/personality-tests",
        headers={**mock_auth_headers, "Cookie": f"anonymous_session={access_token}"},
        json={"id": "4", "category": "agreeableness", "score": 4},
    )

    data = response.json()
    assert response.status_code == 200
    assert data == {
        "extroversion": [],
        "conscientiousness": [],
        "openness": [
            {"id": "1", "category": "openness", "score": 3},
        ],
        "neuroticism": [],
        "agreeableness": [
            {"id": "1", "category": PersonalityTestCategory.AGREEABLENESS, "score": 3},
            {"id": "2", "category": PersonalityTestCategory.AGREEABLENESS, "score": 2},
            {"id": "3", "category": PersonalityTestCategory.AGREEABLENESS, "score": 1},
            {"id": "4", "category": PersonalityTestCategory.AGREEABLENESS, "score": 4},
        ],
        "id": data["id"],
    }
