"""
This module provides the routes for users.
"""
from uuid import uuid4
from datetime import timedelta
from typing import Optional
from typing import Annotated
import jwt
from fastapi import APIRouter, status, Depends, HTTPException, Cookie
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse
from sqlmodel import select
from backend.core.config import settings
from backend.core.database import SessionDep
from backend.models.user import Patient, User, Therapist
from backend.routers.users.schemas import (
    TherapistCreate,
    PatientRead,
    PatientCreate,
    TherapistRead,
    UserCreate,
    UserRead,
    AnonymousSessionCookie,
    AnonymousSessionPatientUpdate,
    AnonymousSessionPatientResponse,
    LocationCoordinate,
)

from backend.core.logging import get_logger
from .service import (
    create_therapist,
    get_user_by_email,
    create_patient,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    authenticate_user,
    create_access_token,
    get_current_active_user,
    Token,
    create_user,
    create_anonymous_patient_session,
    TokenUser,
    patch_anonymous_patient_session,
    get_anonymous_patient,
)

router = APIRouter()
logger = get_logger(__name__)

CurrentUserDep = Annotated[User, Depends(get_current_active_user)]


@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: SessionDep,
) -> Token:
    """Authenticate and create token"""
    try:
        user = authenticate_user(session, form_data.username, form_data.password)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        ) from e

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email_address}, expires_delta=access_token_expires
        )
        return Token(
            access_token=access_token,
            token_type="bearer",
            user=TokenUser(email_address=user.email_address),
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not create access token",
        ) from e


@router.post("/users", status_code=status.HTTP_201_CREATED, response_model=UserRead)
async def register_user(data: UserCreate, session: SessionDep) -> UserRead:
    """Create a new user."""

    existing_user = get_user_by_email(data.email_address, session)

    if existing_user:
        logger.error(
            "Attempt to register with existing email: %s",
            data.email_address,
            exc_info=True,
        )
        raise HTTPException(status_code=409, detail="User already exists")

    logger.info("Registering user: %s", data.email_address)

    try:
        user = create_user(data, session)

        logger.info("Created user: %s with id %s", user.email_address, user.id)

        return UserRead(
            id=str(user.id),
            first_name=user.first_name,
            last_name=user.last_name,
            email_address=user.email_address,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post(
    "/patients", status_code=status.HTTP_201_CREATED, response_model=PatientRead
)
def register_patient(
    data: PatientCreate, session: SessionDep, current_user: CurrentUserDep
):
    """Register a new patient."""

    try:
        existing_patient = session.exec(
            select(Patient).where(Patient.user_id == current_user.id)
        ).first()
    except Exception as e:
        logger.exception("cannot find patient: %s", e)
        raise HTTPException(status_code=400, detail="Unable to find patient") from e

    if existing_patient:
        logger.exception(
            "Attempt to register with existing patient: %s",
            current_user.email_address,
        )
        raise HTTPException(status_code=409, detail="Patient already exists")

    logger.info("Registering patient: %s", current_user.email_address)

    try:
        user = create_patient(data, current_user.id, session)
        return user
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post(
    "/therapists",
    status_code=status.HTTP_201_CREATED,
    response_model=TherapistRead,
)
def register_therapist(
    data: TherapistCreate, session: SessionDep, current_user: CurrentUserDep
):
    """Register a new therapist."""

    try:
        existing_therapist = session.exec(
            select(Therapist).where(Therapist.user_id == current_user.id)
        ).first()
    except Exception as e:
        logger.exception("error: %s", e)
        raise HTTPException(
            status_code=400, detail="Unable to find existing therapist"
        ) from e

    if existing_therapist:
        logger.error(
            "Attempt to register with %s:", current_user.email_address, exc_info=True
        )
        raise HTTPException(status_code=409, detail="Therapist already exists")

    logger.info("Registering therapist: %s", current_user.email_address)

    try:
        therapist = create_therapist(data, current_user.id, session)
        return therapist
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.get("/users", tags=["users"])
async def read_users():
    """Retrieve a list of users. For demonstration purposes only."""
    return [{"username": "Rick"}, {"username": "Morty"}]


@router.post("/anonymous-session")
def create_anonymous_session(
    session: SessionDep,
    anonymous_session: Optional[str] = Cookie(None, alias="anonymous_session"),
) -> JSONResponse:
    if anonymous_session:
        return JSONResponse({"messsage": "Cookie has already been created"})

    content = {"message": "Anonymous patient session created successfully"}
    try:
        logger.info("Creating the access token")

        session_id = str(uuid4())
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
        logger.exception("error: %s", e)
        raise HTTPException(
            status_code=500,
            detail=str(e),
        ) from e


@router.patch("/anonymous-session", response_model=AnonymousSessionPatientResponse)
def patch_anonymous_patient(
    data: AnonymousSessionPatientUpdate,
    cookie: Annotated[AnonymousSessionCookie, Cookie()],
    db_session: SessionDep,
):
    anonymous_session = jwt.decode(
        cookie.anonymous_session, settings.secret_key, algorithms=["HS256"]
    )

    session_id = anonymous_session.get("sub")

    if not session_id:
        raise HTTPException(
            status_code=401,
            detail="Anonymous session does not exist",
        )

    try:
        anonymous_patient = get_anonymous_patient(db_session, session_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e

    if not anonymous_patient:
        raise HTTPException(status_code=404, detail="Anonymous patient not found")

    try:
        updated_anonymous_session = patch_anonymous_patient_session(
            anonymous_patient, data, db_session
        )

        location = None

        if updated_anonymous_session.latitude and updated_anonymous_session.longitude:
            location = LocationCoordinate(
                lat=updated_anonymous_session.latitude,
                lon=updated_anonymous_session.longitude,
            )

        return AnonymousSessionPatientResponse(
            id=updated_anonymous_session.id,
            therapy_needs=updated_anonymous_session.therapy_needs,
            latitude=location.lat if location and location.lat else None,
            longitude=location.lon if location and location.lon else None,
            age=updated_anonymous_session.age,
            gender=updated_anonymous_session.gender,
            description=updated_anonymous_session.description,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
