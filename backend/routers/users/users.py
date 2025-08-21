from fastapi import APIRouter, status, Depends
# from sqlalchemy.ext.asyncio import AsyncSession
from backend.core.logging import get_logger
from backend.routers.users.schemas import PatientCreate, TherapistCreate, PatientRead, TherapistRead

router = APIRouter()
logger = get_logger(__name__)


@router.post("/register/patient", status_code=status.HTTP_201_CREATED, response_model=PatientCreate)
async def patient_register( 
    data: PatientCreate,
) -> PatientRead:
    """Register a new patient."""
    logger.debug(f"Registering patient: {data.email}")
    user = PatientCreate(**data)
    return user


@router.post("/register/therapist", status_code=status.HTTP_201_CREATED, response_model=TherapistCreate)
async def therapist_register(
    data: TherapistCreate,
    session
):
    """Register a new therapist."""
    logger.debug(f"Registering therapist: {data.email}")
    user = TherapistCreate(**data)

    return user


@router.get("/users/", tags=["users"])
async def read_users():
    # user = PatientCreate(first_name="Alexskjsd")
    return [{"username": "Rick"}, {"username": "Morty"}]