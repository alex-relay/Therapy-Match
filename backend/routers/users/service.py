from backend.models.user import Therapist, Patient
from backend.core.logging import get_logger
from backend.routers.users.schemas import TherapistCreate, TherapistRead, PatientRead
from sqlmodel import Session
from sqlalchemy import select

logger = get_logger(__name__)

def create_therapist(user_data: TherapistCreate, session: Session) -> TherapistRead:

    coordinate = str(user_data.location)

    therapist = Therapist(
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        location=coordinate,
        email_address=user_data.email_address,
        description=user_data.description,
        therapist_type=user_data.therapist_type,
        specializations=user_data.specializations,
        personality_test_id=user_data.personality_test_id if user_data.personality_test_id else None,
    )

    session.add(therapist)
    session.commit()
    session.refresh(therapist)

    return TherapistRead(
        id=str(therapist.id),
        first_name=therapist.first_name,
        last_name=therapist.last_name,
        location=therapist.location,
        email_address=therapist.email_address,
        description=therapist.description,
        therapist_type=therapist.therapist_type,
        specializations=therapist.specializations,
        personality_test_id=therapist.personality_test_id
    )

def get_user_by_email(email: str, session: Session, user_type = 'therapist'):
    """Retrieve a user by email."""

    if user_type == 'patient':
        user = session.exec(select(Patient).where(Patient.email_address == email)).first()
        return user
    
    user = session.exec(select(Therapist).where(Therapist.email_address == email)).first()
    return user
