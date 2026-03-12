from decimal import Decimal
from fastapi import HTTPException
from sqlmodel import Session, select
from sqlalchemy.exc import SQLAlchemyError
from backend.models.user import (
    AnonymousPersonalityTestScore,
    AnonymousPatient,
    Patient,
    PersonalityTestScore,
    TherapistPersonalityTest,
    Therapist,
)
from backend.schemas.scores import Scores, AggregateScores, PersonalityTestQuestion
from backend.routers.scores.exceptions import (
    TestScoreCreationError,
    TestScoreUpdateError,
    PersonalityTestScoreCreationError,
)
from backend.core.logging import get_logger

logger = get_logger(__name__)

ScoresType = list[float]

PERSONALITY_TEST_LENGTH = 50

PERSONALITY_TRAITS = frozenset(
    [
        "extroversion",
        "openness",
        "neuroticism",
        "conscientiousness",
        "agreeableness",
    ]
)


def _calculate_extroversion_score(scores: ScoresType) -> float | None:
    """Calculates the decimal score for extroversion"""
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
    """Calculates the decimal score for agreeableness"""
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
    """Calculates the decimal score for openness"""
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
    """Calculates the decimal score for neuroticism"""

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


def _calculate_conscientiousness_score(scores: ScoresType) -> float | None:
    """Calculates the decimal score for conscientiousness"""
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


# TODO: Refactor to break out the logic to calculated the personality test score
# into its own method.
def format_personality_test(
    personality_test: AnonymousPersonalityTestScore | TherapistPersonalityTest | None,
) -> Scores:
    """Filters for the scores in each of the personality test categries"""
    if not personality_test:
        raise ValueError("Personality test not provided")

    personality_test_dict = personality_test.model_dump()

    personality_test_score_aggregate = AggregateScores(
        extroversion=[
            entry["score"] for entry in personality_test_dict["extroversion"]
        ],
        conscientiousness=[
            entry["score"] for entry in personality_test_dict["conscientiousness"]
        ],
        agreeableness=[
            entry["score"] for entry in personality_test_dict["agreeableness"]
        ],
        neuroticism=[entry["score"] for entry in personality_test_dict["neuroticism"]],
        openness=[entry["score"] for entry in personality_test_dict["openness"]],
    )

    calculated_personality_test_score = calculate_test_scores(
        personality_test_score_aggregate
    )

    return calculated_personality_test_score


def create_patient_personality_test_score(
    patient: Patient, scores: Scores, session: Session
):
    """create a personality test score record for a patient"""
    if not patient:
        raise ValueError("Patient not provided")

    if not scores:
        raise ValueError("Scores not provided")

    try:
        patient.personality_test = PersonalityTestScore(
            extroversion=Decimal(scores.extroversion),
            conscientiousness=Decimal(scores.conscientiousness),
            agreeableness=Decimal(scores.agreeableness),
            neuroticism=Decimal(scores.neuroticism),
            openness=Decimal(scores.openness),
            patient_id=patient.id,
        )

        session.add(patient)
        session.commit()
        session.refresh(patient)

    except Exception as e:
        session.rollback()
        logger.exception("Unable to create a personality test score")
        raise PersonalityTestScoreCreationError(
            "Unable to create a personality test score"
        ) from e

    return patient


def calculate_test_scores(scores: AggregateScores) -> Scores:
    """Calculate each category's decimal score from all of the personality test answers"""
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
    conscientiousness_score = _calculate_conscientiousness_score(
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
    if not anonymous_session.id:
        raise ValueError("Anonymous patient id not provided.")
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


def create_therapist_personality_test_instance(
    personality_test: TherapistPersonalityTest, session: Session
) -> TherapistPersonalityTest:
    """Commit the therapist test resource to the DB"""
    if not personality_test:
        raise ValueError("Personality test score not provided.")

    try:
        session.add(personality_test)
        session.commit()
        session.refresh(personality_test)

        return personality_test
    except SQLAlchemyError as e:
        session.rollback()
        logger.exception("Error in saving a therapist test score")
        raise TestScoreCreationError("Failed to create a therapist test score") from e


def get_anonymous_test_score(
    anonymous_test_score_id: str, session: Session
) -> AnonymousPersonalityTestScore | None:
    """Retrieve an anonymous patient's test score from the corresponding table"""
    try:
        statement = select(AnonymousPersonalityTestScore).where(
            anonymous_test_score_id == AnonymousPersonalityTestScore.id
        )
        anonymous_test_score = session.exec(statement).first()

        return anonymous_test_score
    except Exception as e:
        raise ValueError("Unable to retrieve anonymous test score") from e


def _get_existing_answer(data: dict, category_answers: list[dict]) -> int | None:
    """Helper function to check if a question has already been answered in a category"""
    for idx, answer in enumerate(category_answers):
        if data["id"] == answer["id"]:
            return idx

    return None


def update_anonymous_session_test_score_category(
    data: PersonalityTestQuestion, personality_test: AnonymousPersonalityTestScore
) -> dict[str, list[PersonalityTestQuestion]]:
    """Update a category of an anonymous session test score."""
    if not personality_test:
        raise ValueError("Personality test id not found")

    if not data:
        raise ValueError("Updated data is not present")

    personality_test_obj = personality_test.model_dump()
    personality_test_answer = data.model_dump()
    category_answers = personality_test_obj.get(data.category)

    if category_answers is None:
        raise ValueError("Invalid category index")

    existing_answer_index = _get_existing_answer(
        personality_test_answer, category_answers
    )

    if existing_answer_index is not None:
        category_answers[existing_answer_index] = personality_test_answer
    else:
        category_answers.append(personality_test_answer)

    return {data.category: category_answers}


def update_therapist_personality_test_category(
    answer: PersonalityTestQuestion, personality_test: TherapistPersonalityTest
):
    """Update a category of a therapist personality test model."""
    if answer is None:
        raise ValueError("No update provided for the test")

    if personality_test is None:
        raise ValueError("Personality test not provided")

    answer_to_object = answer.model_dump()
    personality_test_to_object = personality_test.model_dump()
    category_answers = personality_test_to_object.get(answer.category)

    if category_answers is None:
        raise ValueError("Invalid category index")

    existing_answer_index = _get_existing_answer(answer_to_object, category_answers)

    if existing_answer_index is not None:
        category_answers[existing_answer_index] = answer_to_object
    else:
        category_answers.append(answer_to_object)

    return {answer.category: category_answers}


def patch_therapist_test_score_category(
    data: dict, personality_test: TherapistPersonalityTest, session: Session
) -> TherapistPersonalityTest:
    """Persist the category update to the DB"""
    if data is None:
        raise ValueError("Updated category is not provided")
    if personality_test is None:
        raise ValueError("Personality test not provided")

    updated_personality_test = personality_test.sqlmodel_update(data)

    try:
        session.add(updated_personality_test)
        session.commit()
        session.refresh(updated_personality_test)
    except SQLAlchemyError as e:
        session.rollback()
        logger.exception("Unable to persist the therapist personality test score")
        raise TestScoreUpdateError(
            "Unable to persist the personality test to the DB"
        ) from e

    return updated_personality_test


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


def get_is_personality_test_complete(
    personality_test: TherapistPersonalityTest,
) -> bool:
    if not personality_test:
        raise ValueError("A personality test was not provided")

    personality_test_to_obj = personality_test.model_dump()

    total_answers = sum(
        len(answers)
        for category, answers in personality_test_to_obj.items()
        if category in PERSONALITY_TRAITS
    )

    return total_answers == PERSONALITY_TEST_LENGTH


def add_therapist_personality_test_score(
    therapist: Therapist, personality_test_scores: Scores, session: Session
) -> TherapistPersonalityTest | None:
    if not therapist:
        raise ValueError("Therapist not provided")

    if not personality_test_scores:
        raise ValueError("Personality test scores weren't provided")

    try:
        therapist.personality_test = PersonalityTestScore(
            therapist_id=therapist.id,
            extroversion=Decimal(personality_test_scores.extroversion),
            conscientiousness=Decimal(personality_test_scores.conscientiousness),
            agreeableness=Decimal(personality_test_scores.agreeableness),
            neuroticism=Decimal(personality_test_scores.neuroticism),
            openness=Decimal(personality_test_scores.openness),
        )
        session.add(therapist)
        session.commit()
        session.refresh(therapist)

        return therapist.raw_personality_scores
    except SQLAlchemyError as e:
        session.rollback()
        logger.exception("Unable to update the therapist personality test")
        raise TestScoreUpdateError(
            "Unable to update the therapist personality test"
        ) from e
