from fastapi import HTTPException
from sqlmodel import Session
from sqlalchemy.exc import SQLAlchemyError
from backend.models.user import AnonymousPersonalityTestScore, AnonymousPatient
from backend.schemas.scores import Scores, AggregateScores
from backend.routers.scores.exceptions import TestScoreCreationError

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
