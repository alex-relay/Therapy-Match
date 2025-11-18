from uuid import UUID
from datetime import datetime, timedelta, timezone
import jwt
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, select, SQLModel
from passlib.context import CryptContext
from backend.models.user import Therapist, Patient, User, AnonymousPatient
from backend.core.logging import get_logger
from backend.core.config import settings
from .schemas import (
    TherapistCreate,
    TherapistRead,
    PatientRead,
    PatientCreate,
    UserCreate,
    AnonymousSessionPatientBase,
    AnonymousSessionPatientRead,
)
from .location_service import get_coordinates_from_postal_code
from .exceptions import (
    PatientNotFoundError,
    InvalidPostalCodeError,
    GeocodingServiceError,
)

logger = get_logger(__name__)

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 1 day
SECRET_KEY = settings.secret_key

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


class TokenUser(SQLModel):
    email_address: str


class Token(SQLModel):
    access_token: str
    token_type: str
    user: TokenUser


class TokenData(SQLModel):
    username: str | None = None


def create_user(user_data: UserCreate, session: Session) -> User:
    """creates a user"""
    hashed_password = get_password_hash(user_data.password)
    user = User(
        **{
            **user_data.model_dump(exclude={"id"}),
            "password": hashed_password,
        }
    )
    try:
        session.add(user)
        session.commit()
        session.refresh(user)
    except Exception as e:
        session.rollback()
        logger.exception("Failed to create anonymous patient")
        raise ValueError("Failed to create anonymous patient") from e
    return user


def create_anonymous_patient_session(
    anonymous_session_id: str, session: Session
) -> AnonymousPatient:
    """creates an anonymous patient session"""
    patient = AnonymousPatient(session_id=anonymous_session_id)

    try:
        session.add(patient)
        session.commit()
        session.refresh(patient)
    except Exception as e:
        session.rollback()
        logger.exception("Failed to create anonymous patient")
        raise ValueError("Unable to create anonymous patient session") from e

    return patient


def _get_coordinates(postal_code: str | None) -> dict[str, float]:
    if not postal_code:
        raise InvalidPostalCodeError("Postal code is required.")
    try:
        location = get_coordinates_from_postal_code(postal_code)
    except Exception as e:
        logger.exception("Unable to geocode a postal code")
        raise GeocodingServiceError(
            "Geocoding service is currently unavailable."
        ) from e

    if not location or location["latitude"] is None or location["longitude"] is None:
        raise InvalidPostalCodeError(
            f"Postal code '{postal_code}' is invalid or could not be geocoded."
        )

    return location


def patch_anonymous_patient_session(
    patient: AnonymousSessionPatientRead,
    data: AnonymousSessionPatientBase,
    session: Session,
):
    """updates an anonymous patient session via session id and patch data"""

    if not patient:
        raise PatientNotFoundError("Anonymous Patient not found.")

    patch_data_dict = data.model_dump(exclude_unset=True)

    if data.postal_code:
        postal_code = data.postal_code
        coordinates = _get_coordinates(postal_code)

        patch_data_dict["latitude"] = coordinates["latitude"]
        patch_data_dict["longitude"] = coordinates["longitude"]

    patient.sqlmodel_update(patch_data_dict)

    logger.info("Committing changes to the DB")

    try:
        session.add(patient)
        session.commit()
        session.refresh(patient)
    except Exception as e:
        session.rollback()
        logger.exception("Database error while updating patient: %s", patient.id)
        raise ValueError(
            "Unable to update anonymous session record in database."
        ) from e

    return patient


def create_therapist(
    user_data: TherapistCreate, user_id: UUID, session: Session
) -> TherapistRead:
    """creates a therapist"""
    coordinate = str(user_data.location)
    therapist = Therapist(
        **{**user_data.model_dump(), "location": coordinate, "user_id": user_id}
    )

    if not therapist:
        raise ValueError("Therapist not found")

    try:
        session.add(therapist)
        session.commit()
        session.refresh(therapist)
        return TherapistRead(
            **{
                **therapist.model_dump(),
                "id": str(therapist.id),
                "user_id": str(therapist.user_id),
            }
        )
    except Exception as e:
        session.rollback()
        logger.exception("Failed to create therapist: %s", e)
        raise ValueError("cannot create a therapist") from e


def create_patient(user_data: PatientCreate, user_id, session: Session) -> PatientRead:
    """creates a patient"""
    coordinate = str(user_data.location)

    patient = Patient(
        **{**user_data.model_dump(), "location": coordinate, "user_id": user_id}
    )

    try:
        session.add(patient)
        session.commit()
        session.refresh(patient)
        return PatientRead(
            **{
                **patient.model_dump(),
                "id": str(patient.id),
                "user_id": str(patient.user_id),
            }
        )
    except Exception as e:
        session.rollback()
        logger.exception("Failed to create patient")
        raise ValueError("Cannot create a patient") from e


def get_user_by_email(email: str | None, session: Session) -> User | None:
    """Retrieve a user by email."""

    if not email:
        return None
    user = session.exec(select(User).where(User.email_address == email)).first()
    return user


def verify_password(plain_password, hashed_password):
    """verify inputted user password to hashed password"""
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        raise e


def get_password_hash(password):
    """hash user password"""
    return pwd_context.hash(password)


def get_user(db, email_address: str):
    """get user from db"""
    try:
        user = [user for user in db if user.email_address == email_address][0]
        return user
    except Exception as e:
        logger.error("Error retrieving user from DB: %s", e)
        raise e


def authenticate_user(session, email_address: str, password: str):
    """Authenticate user"""
    user = get_user_by_email(email_address, session)
    if not user:
        logger.error("no user found %s", email_address, exc_info=True)
        return False
    if not verify_password(password, user.password):
        return False
    return user


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """Create access token"""
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
