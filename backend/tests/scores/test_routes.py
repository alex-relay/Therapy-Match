from sqlmodel import select
from backend.models.user import Patient, Therapist, PersonalityTestScore
from backend.tests.test_utils import add_test_patient, add_test_therapist, add_test_user


def test_create_therapist_personality_test_score(client_fixture, session_fixture):

    add_test_user(session_fixture)
    add_test_therapist(session_fixture)

    therapist = session_fixture.exec(select(Therapist)).first()

    response = client_fixture.post(
        f"/therapists/{str(therapist.id)}/personality-scores",
        json={
            "agreeableness": [1, 4, 1, 5, 3, 5, 3, 3, 5, 4],
            "extroversion": [1, 4, 3, 5, 4, 3, 2, 5, 1, 4],
            "openness": [1, 2, 3, 4, 5, 1, 2, 3, 4, 5],
            "conscientiousness": [5, 1, 5, 1, 4, 2, 5, 1, 5, 5],
            "neuroticism": [4, 2, 5, 4, 2, 4, 3, 2, 3, 2],
        },
    )

    assert response.status_code == 201
    data = response.json()

    assert data["neuroticism"] == 1.9
    assert data["conscientiousness"] == 3.8
    assert data["agreeableness"] == 3.2
    assert data["openness"] == 2.4
    assert data["extroversion"] == 1.0

    assert therapist.personality_test is not None

    assert therapist.personality_test.therapist_id is not None
    assert therapist.personality_test.patient_id is None

    personality_test_score = session_fixture.exec(select(PersonalityTestScore)).first()
    test_score_dict = personality_test_score.model_dump()

    assert test_score_dict["agreeableness"] is not None
    assert test_score_dict["openness"] is not None
    assert test_score_dict["extroversion"] is not None
    assert test_score_dict["conscientiousness"] is not None
    assert test_score_dict["neuroticism"] is not None


def test_create_patient_personality_test_score(client_fixture, session_fixture):

    add_test_user(session_fixture)
    add_test_patient(session_fixture)

    patient = session_fixture.exec(select(Patient)).first()

    response = client_fixture.post(
        f"/patients/{str(patient.id)}/personality-scores",
        json={
            "agreeableness": [1, 4, 1, 5, 3, 5, 3, 3, 5, 4],
            "extroversion": [1, 4, 3, 5, 4, 3, 2, 5, 1, 4],
            "openness": [1, 2, 3, 4, 5, 1, 2, 3, 4, 5],
            "conscientiousness": [5, 1, 5, 1, 4, 2, 5, 1, 5, 5],
            "neuroticism": [4, 2, 5, 4, 2, 4, 3, 2, 3, 2],
        },
    )

    assert response.status_code == 201
    data = response.json()

    assert data["neuroticism"] == 1.9
    assert data["conscientiousness"] == 3.8
    assert data["agreeableness"] == 3.2
    assert data["openness"] == 2.4
    assert data["extroversion"] == 1.0

    assert patient.personality_test is not None

    assert patient.personality_test.therapist_id is None
    assert patient.personality_test.patient_id == patient.id

    personality_test_score = session_fixture.exec(select(PersonalityTestScore)).first()
    test_score_dict = personality_test_score.model_dump()

    assert test_score_dict["agreeableness"] is not None
    assert test_score_dict["openness"] is not None
    assert test_score_dict["extroversion"] is not None
    assert test_score_dict["conscientiousness"] is not None
    assert test_score_dict["neuroticism"] is not None


def test_create_personality_test_score_invalid_scores(client_fixture, session_fixture):
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
