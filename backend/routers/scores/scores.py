"""Router for calculating and storing personality test scores."""

from dataclasses import asdict
from typing import Annotated
from fastapi import APIRouter, status, HTTPException, Depends
from backend.core.database import SessionDep
from backend.models.user import PersonalityTestScore, AnonymousPatient
from backend.routers.users.dependencies import get_anonymous_patient
from backend.routers.scores.schemas import (
    UserPersonalityTestCreate,
    UserPersonalityTestRead,
    AggregateScores,
)
from backend.services.scores import (
    calculate_test_scores,
    create_anonymous_session_test_score,
)

from backend.core.logging import get_logger

router = APIRouter()
logger = get_logger(__name__)

PERSONALITY_TRAITS = [
    "extroversion",
    "openness",
    "neuroticism",
    "conscientiousness",
    "agreeableness",
]


@router.post(
    "/therapists/{therapist_id}/personality-scores",
    status_code=status.HTTP_201_CREATED,
    response_model=UserPersonalityTestRead,
)
def create_therapist_test_scores(
    therapist_id: str,
    data: UserPersonalityTestCreate,
    session: SessionDep,
):
    """Create a test score for either patient or therapist."""

    aggregate_scores = {
        key: value for key, value in data.__dict__.items() if key in PERSONALITY_TRAITS
    }

    logger.info(msg="Calculating test scores")
    scores = calculate_test_scores(AggregateScores(**aggregate_scores))

    if not scores:
        logger.error(msg="Calculation of test scores is incomplete")
        raise HTTPException(status_code=400, detail="Scores not found")

    logger.info("Saving test score to db")

    try:
        personality_test_score = PersonalityTestScore(
            **asdict(scores), therapist_id=therapist_id
        )
        session.add(personality_test_score)
        session.commit()
        session.refresh(personality_test_score)

    except Exception as e:
        session.rollback()
        logger.error("Failed to save therapist test scores %s", e)
        raise e

    logger.info("Saving test score completed")

    return UserPersonalityTestRead(
        extroversion=personality_test_score.extroversion,
        agreeableness=personality_test_score.agreeableness,
        openness=personality_test_score.openness,
        neuroticism=personality_test_score.neuroticism,
        conscientiousness=personality_test_score.conscientiousness,
        id=str(personality_test_score.id),
    )


@router.post(
    "/anonymous-sessions/personality-tests",
    status_code=status.HTTP_201_CREATED,
    response_model=UserPersonalityTestCreate,
)
def create_anonymous_session_test_scores(
    anonymous_patient: Annotated[AnonymousPatient, Depends(get_anonymous_patient)],
    session: SessionDep,
):
    """Create a test score for an anonymous session."""
    if anonymous_patient.personality_test:
        logger.exception("Anonymous patient already has personality test scores")
        raise HTTPException(
            status_code=400,
            detail="Anonymous patient already has personality test scores",
        )

    try:
        logger.info("Creating anonymous session test score to db")
        test_score = create_anonymous_session_test_score(anonymous_patient, session)

        return UserPersonalityTestCreate(**test_score.model_dump())

    except Exception as e:
        logger.exception("Failed to create anonymous session test scores")
        raise HTTPException(
            status_code=500,
            detail=str(e),
        ) from e


@router.post(
    "/patients/{patient_id}/personality-scores",
    status_code=status.HTTP_201_CREATED,
    response_model=UserPersonalityTestRead,
)
def create_patient_test_scores(
    patient_id: str,
    data: UserPersonalityTestCreate,
    session: SessionDep,
):
    """Create a test score for either patient or therapist."""

    aggregate_scores = {
        key: value for key, value in data.__dict__.items() if key in PERSONALITY_TRAITS
    }
    logger.info(msg="Calculating test scores")
    scores = calculate_test_scores(AggregateScores(**aggregate_scores))

    if not scores:
        logger.error("Calculation of test scores is incomplete")
        raise HTTPException(status_code=400, detail="Scores not found")

    logger.info("Saving test score to db")

    try:
        personality_test_score = PersonalityTestScore(
            **asdict(scores), patient_id=patient_id
        )

        session.add(personality_test_score)
        session.commit()
        session.refresh(personality_test_score)
    except Exception as e:
        session.rollback()
        logger.exception("Failed to save patient test scores")
        raise e

    logger.info("Saving test score completed")

    return UserPersonalityTestRead(
        extroversion=personality_test_score.extroversion,
        agreeableness=personality_test_score.agreeableness,
        openness=personality_test_score.openness,
        neuroticism=personality_test_score.neuroticism,
        conscientiousness=personality_test_score.conscientiousness,
        id=str(personality_test_score.id),
    )
