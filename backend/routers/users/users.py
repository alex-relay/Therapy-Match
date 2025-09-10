"""
This module provides the routes for users.
"""

from datetime import timedelta
from typing import Annotated
from fastapi import APIRouter, status, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import select
from backend.core.database import SessionDep
from backend.models.user import Patient, User, Therapist
from backend.routers.users.schemas import (
    TherapistCreate,
    PatientRead,
    PatientCreate,
    TherapistRead,
    UserCreate,
    UserRead,
)
from backend.routers.users.service import Token, create_user, TokenUser

from backend.core.logging import get_logger
from .service import (
    create_therapist,
    get_user_by_email,
    create_patient,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    authenticate_user,
    create_access_token,
    get_current_active_user,
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
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

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
        raise e


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
        raise e

    if existing_patient:
        logger.error(
            "Attempt to register with existing patient: %s",
            current_user.email_address,
            exc_info=True,
        )
        raise HTTPException(status_code=409, detail="Patient already exists")

    logger.info("Registering patient: %s", current_user.email_address)

    try:
        user = create_patient(data, current_user.id, session)
        return user
    except Exception as e:
        raise e


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
        raise e

    if existing_therapist:
        logger.error(
            "Attempt to register with %s:", current_user.email_address, exc_info=True
        )
        raise HTTPException(status_code=409, detail="Therapist already exists")

    logger.info("Registering therapist: %s", current_user.email_address, exc_info=True)

    try:
        therapist = create_therapist(data, current_user.id, session)
        return therapist
    except Exception as e:
        raise e


@router.get("/users", tags=["users"])
async def read_users(current_user: CurrentUserDep):
    """Retrieve a list of users. For demonstration purposes only."""
    return [{"username": "Rick"}, {"username": "Morty"}]
