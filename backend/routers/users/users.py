from datetime import timedelta
from typing import Annotated
from fastapi import APIRouter, status, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from backend.core.database import SessionDep
from backend.models.user import Patient, User
from backend.routers.users.schemas import (
    TherapistCreate,
    PatientRead,
    TherapistRead,
)
from backend.routers.users.service import Token

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

fake_users_db = [
    {
        "full_name": "John Doe",
        "email_address": "johndoe@example.com",
        "hashed_password": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",
        "disabled": False,
    }
]


@router.post("/token")
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
) -> Token:
    try:
        user = authenticate_user(fake_users_db, form_data.username, form_data.password)
    except:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user["email_address"]}, expires_delta=access_token_expires
        )

        return Token(access_token=access_token, token_type="bearer")

    except:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not create access token",
        )


@router.post(
    "/register/patient", status_code=status.HTTP_201_CREATED, response_model=PatientRead
)
async def patient_register(data: Patient, session: SessionDep):
    """Register a new patient."""

    existing_user = get_user_by_email(data.email_address, session)
    if existing_user:
        logger.error(
            "Attempt to register with existing email: %s",
            data.email_address,
            exc_info=True,
        )
        raise HTTPException(status_code=409, detail="Patient already exists")

    logger.info("Registering patient: %s", data.email_address)

    user = create_patient(data, session)

    logger.info("Created patient: %s with ", user.email_address)

    return user


@router.post(
    "/register/therapist",
    status_code=status.HTTP_201_CREATED,
    response_model=TherapistRead,
)
def therapist_register(data: TherapistCreate, session: SessionDep):
    """Register a new therapist."""

    existing_user = get_user_by_email(data.email_address, session)

    if existing_user:
        logger.error("Attempt to register with %s:", data.email_address, exc_info=True)
        raise HTTPException(status_code=409, detail="Therapist already exists")

    logger.info("Registering therapist: %s", data.email_address, exc_info=True)

    user = create_therapist(data, session)

    return user


@router.get("/users/", tags=["users"])
async def read_users(current_user: Annotated[User, Depends(get_current_active_user)]):
    """Retrieve a list of users. For demonstration purposes only."""
    print(current_user)
    return [{"username": "Rick"}, {"username": "Morty"}]
