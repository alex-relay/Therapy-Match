"""
This module provides the routes for users.
"""
from uuid import uuid4
from datetime import timedelta
from typing import Optional
from typing import Annotated
from fastapi import APIRouter, status, Depends, HTTPException, Cookie
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse
from backend.core.database import SessionDep
from backend.models.user import AnonymousPatient
from backend.core.logging import get_logger
from backend.routers.users.user_types import UserOption
from backend.schemas.users import (
    PatientRead,
    TherapistRead,
    UserCreate,
    AnonymousSessionPatientBase,
    AnonymousSessionPatientResponse,
)
from backend.routers.scores.exceptions import PersonalityTestScoreCreationError

from backend.services.scores import (
    create_patient_personality_test_score,
    format_personality_test,
)


from .exceptions import (
    PatientNotFoundError,
    InvalidPostalCodeError,
    GeocodingServiceError,
    UserCreationError,
    PatientCreationError,
)

from .dependencies import (
    get_anonymous_patient,
)

from ...services.users import (
    create_patient,
    create_therapist,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    authenticate_user,
    create_access_token,
    Token,
    create_user,
    create_anonymous_patient_session,
    TokenUser,
    get_user_by_email_and_type,
    patch_anonymous_patient_session,
    update_user_roles,
)

router = APIRouter()
logger = get_logger(__name__)


@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: SessionDep,
) -> Token:
    """Authenticate and create token"""
    try:
        user = authenticate_user(session, form_data.username, form_data.password)
    except ValueError as e:
        logger.exception("Unable to authenticate user")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        ) from e
    except Exception as e:
        logger.exception("Error in authenticating user")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error in authenticating user",
            headers={"WWW-Authenticate": "Bearer"},
        ) from e

    if not user:
        raise HTTPException(status_code=404, detail="Unable to find user")

    try:
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email_address}, expires_delta=access_token_expires
        )
        return Token(
            access_token=access_token,
            token_type="bearer",
            user=TokenUser(email_address=user.email_address),
            roles=user.roles,
        )

    except Exception as e:
        logger.exception("Could not create access token")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not create access token",
        ) from e


# @router.post("/users", status_code=status.HTTP_201_CREATED, response_model=UserRead)
# async def register_user(data: UserCreate, session: SessionDep) -> UserRead:
#     """Create a new user."""

#     existing_user = get_user_by_email(data.email_address, session)

#     if existing_user:
#         logger.error(
#             "Attempt to register with existing email: %s",
#             data.email_address,
#             exc_info=True,
#         )
#         raise HTTPException(status_code=409, detail="User already exists")

#     logger.info("Registering user: %s", data.email_address)

#     try:
#         user = create_user(data, session)

#         logger.info("Created user: %s with id %s", user.email_address, user.id)

#         return UserRead(
#             id=user.id,
#             first_name=user.first_name,
#             last_name=user.last_name,
#             email_address=user.email_address,
#         )
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e)) from e


@router.post(
    "/patients", status_code=status.HTTP_201_CREATED, response_model=PatientRead
)
def register_patient(
    data: UserCreate,
    session: SessionDep,
    anonymous_patient: Annotated[AnonymousPatient, Depends(get_anonymous_patient)],
):
    """Register a new patient."""
    if not anonymous_patient:
        logger.error("No anonymous patient found in session")
        raise HTTPException(
            status_code=400, detail="No anonymous patient found in session"
        )

    existing_user = get_user_by_email_and_type(
        data.email_address, data.user_type, session
    )

    is_patient_in_user_roles = (
        UserOption.PATIENT in (existing_user.roles or []) if existing_user else False
    )

    if is_patient_in_user_roles:
        raise HTTPException(status_code=409, detail="Patient already exists")

    logger.info("Registering patient")

    try:
        user = existing_user if existing_user else create_user(data, session)

        session.refresh(anonymous_patient)

        patient = create_patient(anonymous_patient, user.id, session)

        update_user_roles(user, UserOption.PATIENT, session)

        formatted_personality_test_score = format_personality_test(
            anonymous_patient.personality_test
        )

        patient_with_personality_test_score = create_patient_personality_test_score(
            patient, formatted_personality_test_score, session
        )

        return PatientRead(
            id=patient_with_personality_test_score.id,
        )

    except ValueError as e:
        logger.exception("Issue with data on the creation of the patient")
        raise HTTPException(status_code=400, detail=str(e)) from e

    except (
        UserCreationError,
        PatientCreationError,
        PersonalityTestScoreCreationError,
    ) as e:
        logger.exception("Error creating a patient")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post(
    "/therapists",
    status_code=status.HTTP_201_CREATED,
    response_model=TherapistRead,
)
def register_therapist(data: UserCreate, session: SessionDep):
    """Register a new therapist."""

    existing_therapist = get_user_by_email_and_type(
        data.email_address, data.user_type, session
    )

    if existing_therapist:
        logger.warning(
            "Attempt to register with existing email: %s", data.email_address
        )
        raise HTTPException(status_code=409, detail="Therapist already exists")

    logger.info("Registering therapist: %s", data.email_address)

    try:
        user = create_user(data, session)

        therapist = create_therapist(data, user.id, session)

        logger.info("Created therapist")

        if not therapist.id:
            raise ValueError("Therapist creation failed")

        return TherapistRead(
            id=therapist.id,
        )
    except ValueError as e:
        logger.exception("Issue with data on therapist creation")
        raise HTTPException(status_code=400, detail=str(e)) from e
    except UserCreationError as e:
        logger.exception("Error creating therapist user")
        raise HTTPException(status_code=500, detail=str(e)) from e
    except Exception as e:
        logger.exception("Unexpected error during therapist registration")
        raise HTTPException(status_code=500, detail="An internal error occurred") from e


@router.post("/anonymous-sessions")
def create_anonymous_session(
    session: SessionDep,
    anonymous_session: Optional[str] = Cookie(None, alias="anonymous_session"),
) -> JSONResponse:
    """creates an anonymous patient session and sets a cookie"""

    if anonymous_session:
        return JSONResponse({"messsage": "Cookie has already been created"})

    content = {"message": "Anonymous patient session created successfully"}
    session_id = str(uuid4())

    try:
        logger.info("Creating the access token")

        access_token = create_access_token({"sub": session_id}, timedelta(minutes=60))

        logger.info("Creating the anonymous session")

        create_anonymous_patient_session(session_id, session)

        response = JSONResponse(content=content)
        response.set_cookie(
            key="anonymous_session",
            value=access_token,
            httponly=True,
            max_age=60 * 60,
            path="/",
            samesite="none",
            secure=True,
        )

        return response

    except Exception as e:
        logger.exception("Unable to create an anonymous session")
        raise HTTPException(
            status_code=500,
            detail=str("An internal error occurred"),
        ) from e


@router.patch(
    "/anonymous-sessions",
    status_code=status.HTTP_200_OK,
    response_model=AnonymousSessionPatientResponse,
)
def patch_anonymous_patient(
    data: AnonymousSessionPatientBase,
    anonymous_patient: Annotated[AnonymousPatient, Depends(get_anonymous_patient)],
    db_session: SessionDep,
):
    """updates an anonymous patient session via session id from cookie and patch data"""

    try:
        logger.info("Creating the anonymous session")

        updated_anonymous_session = patch_anonymous_patient_session(
            anonymous_patient, data, db_session
        )

        return AnonymousSessionPatientResponse(
            **updated_anonymous_session.model_dump(exclude={"session_id"})
        )

    except (PatientNotFoundError, InvalidPostalCodeError) as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

    except GeocodingServiceError as e:
        raise HTTPException(status_code=503, detail=str(e)) from e

    except ValueError as e:
        logger.exception("Patch failed due to unexpected error")
        raise HTTPException(status_code=500, detail="An internal error occurred") from e


@router.get("/anonymous-sessions", response_model=AnonymousSessionPatientResponse)
def get_anonymous_patient_data(
    anonymous_patient: Annotated[AnonymousPatient, Depends(get_anonymous_patient)]
):
    """retrive an anonymous session"""
    logger.info("retrieving the anonymous patient")

    return AnonymousSessionPatientResponse(
        **anonymous_patient.model_dump(exclude={"session_id"})
    )
