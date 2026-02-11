"""Router for calculating and storing personality test scores."""

from dataclasses import asdict
from typing import Annotated
from fastapi import APIRouter, status, HTTPException, Depends
from sqlalchemy.exc import SQLAlchemyError
from backend.core.database import SessionDep
from backend.models.user import PersonalityTestScore, AnonymousPatient, Therapist
from backend.routers.users.dependencies import (
    get_anonymous_patient,
    get_therapist_by_user_id,
)
from backend.routers.scores.exceptions import TestScoreCreationError
from backend.schemas.scores import (
    UserPersonalityTestCreate,
    UserPersonalityTestRead,
    AggregateScores,
    AnonymousPersonalityTestRead,
    PersonalityTestQuestion,
)
from backend.services.scores import (
    calculate_test_scores,
    create_anonymous_session_test_score,
    update_anonymous_session_test_score_category,
    patch_anonymous_test_score_category,
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
    "/therapists/me/personality-scores",
    status_code=status.HTTP_201_CREATED,
    response_model=UserPersonalityTestRead,
)
def create_therapist_test_scores(
    therapist: Annotated[Therapist, Depends(get_therapist_by_user_id)],
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
            **asdict(scores), therapist_id=therapist.id
        )
        session.add(personality_test_score)
        session.commit()
        session.refresh(personality_test_score)

    except Exception as e:
        session.rollback()
        logger.exception("Failed to save therapist test scores")
        raise HTTPException(
            status_code=500, detail="Error saving therapist test scores"
        ) from e

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
    response_model=AnonymousPersonalityTestRead,
)
def create_anonymous_session_test_scores(
    anonymous_patient: Annotated[AnonymousPatient, Depends(get_anonymous_patient)],
    session: SessionDep,
):
    """Create a test score for an anonymous session."""
    if anonymous_patient.personality_test:
        logger.warning("Anonymous patient already has personality test scores")
        raise HTTPException(
            status_code=400,
            detail="Anonymous patient already has personality test scores",
        )

    try:
        logger.info("Creating anonymous session test score to db")
        test_score = create_anonymous_session_test_score(anonymous_patient, session)
        logger.info("Anonymous test score created")

        return test_score

    except TestScoreCreationError as e:
        logger.exception("Failed to create anonymous session test scores")
        raise HTTPException(
            status_code=500,
            detail=e,
        ) from e


@router.get(
    "/anonymous-sessions/personality-tests",
    status_code=status.HTTP_200_OK,
    response_model=AnonymousPersonalityTestRead,
)
def get_anonymous_session_personality_test(
    anonymous_patient: Annotated[AnonymousPatient, Depends(get_anonymous_patient)],
):
    """Get answers to a personality test"""
    personality_test = anonymous_patient.personality_test

    if not personality_test:
        logger.warning("Personality test not found on the anonymous patient")
        raise HTTPException(
            status_code=404,
            detail="Personality test not found on the anonymous patient",
        )

    return personality_test


@router.patch(
    "/anonymous-sessions/personality-tests",
    status_code=status.HTTP_200_OK,
    response_model=AnonymousPersonalityTestRead,
)
def patch_personality_test(
    data: PersonalityTestQuestion,
    anonymous_patient: Annotated[AnonymousPatient, Depends(get_anonymous_patient)],
    session: SessionDep,
):
    """patch route to update the answers of the personality test"""
    personality_test = anonymous_patient.personality_test

    if not personality_test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Personality test not found"
        )

    try:
        updated_personality_test_object = update_anonymous_session_test_score_category(
            data, personality_test
        )
        patch_anonymous_test_score_persist = patch_anonymous_test_score_category(
            updated_personality_test_object, personality_test, session
        )
        return patch_anonymous_test_score_persist

    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from e

    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        ) from e
    except Exception as e:
        logger.exception("Error on personality test patch")
        raise HTTPException(
            status_code=500, detail="Error on personality test patch"
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
