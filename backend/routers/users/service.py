from backend.models.user import Therapist, Patient
from backend.core.logging import get_logger
from backend.routers.users.schemas import (
    TherapistCreate,
    TherapistRead,
    PatientCreate,
    PatientRead,
)
from sqlmodel import Session, select

logger = get_logger(__name__)


def create_therapist(user_data: TherapistCreate, session: Session) -> TherapistRead:

    coordinate = str(user_data.location)

    therapist = Therapist(
        **{
            **user_data.model_dump(),
            "location": coordinate,
        }
    )

    session.add(therapist)
    session.commit()
    session.refresh(therapist)

    return TherapistRead(**{**therapist.model_dump(), "id": str(therapist.id)})


def create_patient(user_data: Patient, session: Session) -> PatientRead:

    coordinate = str(user_data.location)

    patient = Patient(
        **{
            **user_data.model_dump(),
            "location": coordinate,
        }
    )

    session.add(patient)
    session.commit()
    session.refresh(patient)

    return PatientRead(**{**patient.model_dump(), "id": str(patient.id)})


def get_user_by_email(email: str, session: Session, user_type="therapist"):
    """Retrieve a user by email."""

    if user_type == "patient":
        user = session.exec(
            select(Patient).where(Patient.email_address == email)
        ).first()
        return user

    user = session.exec(
        select(Therapist).where(Therapist.email_address == email)
    ).first()
    return user
