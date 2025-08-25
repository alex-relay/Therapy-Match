from fastapi import APIRouter, status, Depends, HTTPException
from backend.core.logging import get_logger
from .service import create_therapist, get_user_by_email, create_patient
from backend.core.database import get_session, SessionDep
from backend.models.user import Patient
from backend.routers.users.schemas import (
    TherapistCreate,
    PatientRead,
    TherapistRead,
)


router = APIRouter()
logger = get_logger(__name__)


@router.post(
    "/register/patient", status_code=status.HTTP_201_CREATED, response_model=PatientRead
)
async def patient_register(data: Patient, session: SessionDep):
    """Register a new patient."""

    existing_user = get_user_by_email(data.email_address, session, user_type="patient")
    if existing_user:
        logger.error(f"Attempt to register with existing email: {data.email_address}")
        raise HTTPException(status_code=409, detail="Patient already exists")

    logger.debug(f"Registering patient: {data.email_address}")

    user = create_patient(data, session)

    logger.debug(f"Created patient: {user.email_address} with ID {user.id}")

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
        logger.error(f"Attempt to register with existing email: {data.email_address}")
        raise HTTPException(status_code=409, detail="Therapist already exists")

    logger.debug(f"Registering therapist: {data.email_address}")

    user = create_therapist(data, session)

    return user


@router.get("/users/", tags=["users"])
async def read_users(session: SessionDep):
    return [{"username": "Rick"}, {"username": "Morty"}]
