"""Router for calculating and storing personality test scores."""

from typing import Annotated
from fastapi import APIRouter, status, HTTPException, Depends
from sqlalchemy.exc import SQLAlchemyError
from backend.core.database import SessionDep
from backend.models.user import AnonymousPatient, Therapist, TherapistPersonalityTest
from backend.routers.users.dependencies import (
    get_anonymous_patient,
    get_therapist_by_user_id,
)
from backend.routers.scores.exceptions import TestScoreCreationError
from backend.schemas.scores import (
    AnonymousPersonalityTestRead,
    AggregateUserPersonalityTestRead,
    PersonalityTestQuestion,
)
from backend.services.scores import (
    create_therapist_personality_test_instance,
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
    "/therapists/me/personality-tests",
    status_code=status.HTTP_201_CREATED,
    response_model=AggregateUserPersonalityTestRead,
)
def create_therapist_personality_test(
    therapist: Annotated[Therapist, Depends(get_therapist_by_user_id)],
    session: SessionDep,
):
    """Create a personality test record for a therapist."""

    if therapist.personality_test:
        logger.exception("Personality test already exists")
        raise HTTPException(status_code=409, detail="Personality test already exists")

    if not therapist.id:
        logger.exception("Therapist id is not present")
        raise HTTPException(status_code=422, detail="Therapist id not provided")

    logger.info("Creating the personality test")

    try:
        personality_test = TherapistPersonalityTest(therapist_id=therapist.id)

        create_therapist_personality_test_instance(personality_test, session)
        logger.info("Personality test created")

        return AggregateUserPersonalityTestRead(**personality_test.model_dump())

    except (TestScoreCreationError, SQLAlchemyError) as e:
        logger.exception(str(e))
        raise HTTPException(status_code=422, detail=str(e)) from e
    except Exception as e:
        logger.exception("Unable to create a therapist personality test")
        raise HTTPException(
            status_code=500, detail="Error in creating a therapist personality test"
        ) from e


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
            status_code=409,
            detail="Anonymous patient already has personality test scores",
        )

    logger.info("Creating anonymous session test score to db")

    try:
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
