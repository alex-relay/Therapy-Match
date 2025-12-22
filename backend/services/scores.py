from fastapi import HTTPException
from sqlmodel import Session
from sqlalchemy.exc import SQLAlchemyError
from backend.models.user import AnonymousPersonalityTestScore, AnonymousPatient
from backend.schemas.scores import Scores, AggregateScores, PersonalityTestQuestion
from backend.routers.scores.exceptions import (
    TestScoreCreationError,
    TestScoreUpdateError,
)
from backend.core.logging import get_logger

logger = get_logger(__name__)

ScoresType = list[float]


def _calculate_extroversion_score(scores: ScoresType) -> float | None:
    if not scores or len(scores) < 10:
        return None

    scores_sum = (
        20
        + scores[0]
        - scores[1]
        + scores[2]
        - scores[3]
        + scores[4]
        - scores[5]
        + scores[6]
        - scores[7]
        + scores[8]
        - scores[9]
    )
    return scores_sum / 10


def _calculate_agreeableness_score(scores: ScoresType) -> float | None:
    if not scores or len(scores) < 10:
        return None

    scores_sum = (
        14
        - scores[0]
        + scores[1]
        - scores[2]
        + scores[3]
        - scores[4]
        + scores[5]
        - scores[6]
        + scores[7]
        + scores[8]
        + scores[9]
    )
    return scores_sum / 10


def _calculate_openness_score(scores: ScoresType) -> float | None:
    if not scores or len(scores) < 10:
        return None

    scores_sum = (
        8
        + scores[0]
        - scores[1]
        + scores[2]
        - scores[3]
        + scores[4]
        - scores[5]
        + scores[6]
        + scores[7]
        + scores[8]
        + scores[9]
    )
    return scores_sum / 10


def _calculate_neuroticism_score(scores: ScoresType) -> float | None:
    if not scores or len(scores) < 10:
        return None

    scores_sum = (
        38
        - scores[0]
        + scores[1]
        - scores[2]
        + scores[3]
        - scores[4]
        - scores[5]
        - scores[6]
        - scores[7]
        - scores[8]
        - scores[9]
    )
    return scores_sum / 10


def _calculate_concientiousness_score(scores: ScoresType) -> float | None:
    if not scores or len(scores) < 10:
        return None

    scores_sum = (
        14
        + scores[0]
        - scores[1]
        + scores[2]
        - scores[3]
        + scores[4]
        - scores[5]
        + scores[6]
        - scores[7]
        + scores[8]
        + scores[9]
    )
    return scores_sum / 10


def calculate_test_scores(scores: AggregateScores) -> Scores | None:
    if not scores:
        return None

    traits_results: Scores = Scores(
        extroversion=0.0,
        openness=0.0,
        neuroticism=0.0,
        conscientiousness=0.0,
        agreeableness=0.0,
    )

    extroversion_score = _calculate_extroversion_score(scores.extroversion)
    openness_score = _calculate_openness_score(scores.openness)
    agreeableness_score = _calculate_agreeableness_score(scores.agreeableness)
    neuroticism_score = _calculate_neuroticism_score(scores.neuroticism)
    conscientiousness_score = _calculate_concientiousness_score(
        scores.conscientiousness
    )

    if not extroversion_score:
        raise HTTPException(
            status_code=400,
            detail="Extroversion score could not be calculated due to invalid scores list.",
        )
    if not openness_score:
        raise HTTPException(
            status_code=400,
            detail="Openness score could not be calculated due to invalid scores list.",
        )
    if not agreeableness_score:
        raise HTTPException(
            status_code=400,
            detail="Agreeableness score could not be calculated due to invalid scores list.",
        )
    if not neuroticism_score:
        raise HTTPException(
            status_code=400,
            detail="Neuroticism score could not be calculated due to invalid scores list.",
        )
    if not conscientiousness_score:
        raise HTTPException(
            status_code=400,
            detail="Conscientiousness score could not be calculated due to invalid scores list.",
        )

    traits_results.openness = openness_score
    traits_results.extroversion = extroversion_score
    traits_results.agreeableness = agreeableness_score
    traits_results.neuroticism = neuroticism_score
    traits_results.conscientiousness = conscientiousness_score

    return traits_results


def create_anonymous_session_test_score(
    anonymous_session: AnonymousPatient, session: Session
):
    """Create a test score for an anonymous session."""
    try:
        personality_test_score = AnonymousPersonalityTestScore(
            anonymous_patient_id=anonymous_session.id
        )
        session.add(personality_test_score)
        session.commit()
        session.refresh(personality_test_score)

        return personality_test_score
    except SQLAlchemyError as e:
        session.rollback()
        raise TestScoreCreationError("Failed to create test score") from e


def update_anonymous_session_test_score_category(
    data: PersonalityTestQuestion, personality_test: AnonymousPersonalityTestScore
) -> dict:
    """Update a category of an anonymous session test score."""
    if not personality_test:
        raise ValueError("Personality test id not found")

    if not data:
        raise ValueError("Updated data is not present")

    personality_test_obj = personality_test.model_dump()
    category_answers = personality_test_obj.get(data.category)

    if category_answers is None:
        raise ValueError("Invalid category index")

    personality_test_answer = data.model_dump()

    is_answered_previously = False

    for idx, answer in enumerate(category_answers):
        if answer["id"] == data.id:
            category_answers[idx] = personality_test_answer
            is_answered_previously = True
            break

    if not is_answered_previously:
        category_answers.append(personality_test_answer)

    return {data.category: category_answers}


def patch_anonymous_test_score_category(
    data: dict[str, list[PersonalityTestQuestion]],
    personality_test: AnonymousPersonalityTestScore,
    session: Session,
) -> AnonymousPersonalityTestScore:
    """Persist a category update of an personality test"""
    if not data:
        raise ValueError("Updated data is not provided")

    if not personality_test:
        raise ValueError("Anonymous patient is not provided")

    personality_test.sqlmodel_update(data)

    try:
        session.add(personality_test)
        session.commit()
        session.refresh(personality_test)

        return personality_test
    except SQLAlchemyError as e:
        session.rollback()
        logger.exception(
            "Unable to persist the update anonymous personality test score"
        )
        raise TestScoreUpdateError("Failed to save the updated test score") from e
