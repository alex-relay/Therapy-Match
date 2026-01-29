from typing import Annotated, TypeVar
from uuid import UUID
from datetime import datetime, timedelta, timezone
from fastapi.params import Depends
from fastapi import HTTPException, status
import jwt
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, select, SQLModel
from passlib.context import CryptContext
from backend.models.user import Therapist, Patient, User, AnonymousPatient
from backend.core.logging import get_logger
from backend.core.config import settings
from backend.routers.users.user_types import UserOption
from ..schemas.users import (
    UserCreate,
    AnonymousSessionPatientBase,
)

from jwt.exceptions import InvalidTokenError

from .location_service import get_coordinates_from_postal_code
from ..routers.users.exceptions import (
    PatientCreationError,
    UserCreationError,
    PatientNotFoundError,
    InvalidPostalCodeError,
    GeocodingServiceError,
)

logger = get_logger(__name__)

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 1 day
SECRET_KEY = settings.secret_key
T = TypeVar("T", bound=SQLModel)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


class TokenUser(SQLModel):
    """Docstring for TokenUser"""

    email_address: str


class Token(SQLModel):
    """Docstring for Token"""

    access_token: str
    token_type: str
    user: TokenUser
    roles: list[str]


def create_user(user_data: UserCreate, session: Session) -> User:
    """creates a user"""
    hashed_password = get_password_hash(user_data.password)
    user_type = user_data.user_type
    user = User(
        **{
            **user_data.model_dump(),
            "password": hashed_password,
            "roles": [user_type],
        }
    )
    try:
        session.add(user)
        session.commit()
        session.refresh(user)
    except Exception as e:
        session.rollback()
        logger.exception("Failed to create new user")
        raise UserCreationError("Failed to create new user") from e

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
    patient: AnonymousPatient,
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

    committed_patient_to_db = commit_to_db(session, patient)

    return committed_patient_to_db


def commit_to_db(session: Session, obj: T) -> T:
    """Commits an object to the database and refreshes the instance."""
    try:
        session.add(obj)
        session.commit()
        session.refresh(obj)
        return obj
    except Exception as e:
        session.rollback()
        entity_name = type(obj).__name__
        logger.exception("Failed to commit %s to the database", entity_name)
        raise ValueError(f"Cannot commit {entity_name} to the database") from e


def update_user_roles(user: User, role: UserOption, session: Session):
    """updates user roles"""

    if not user or not role:
        raise ValueError("User and role must be provided to update roles.")

    if role.value in user.roles:
        raise ValueError("Role already exists for the user.")

    user_roles = user.roles.copy()
    user_roles.append(role.value)
    user.roles = user_roles

    updated_user = commit_to_db(session, user)

    return updated_user


def create_therapist(
    user_data: UserCreate, user_id: UUID | None, session: Session
) -> Therapist:
    """creates a therapist"""
    if not user_id:
        raise ValueError("User ID is required to create a therapist.")

    therapist = Therapist(**{**user_data.model_dump(), "user_id": user_id})

    therapist = commit_to_db(session, therapist)
    return therapist


def get_patient(
    anonymous_patient: AnonymousPatient, session: Session
) -> Patient | None:
    """Retrieve existing patient by anonymous patient ID."""
    try:
        existing_patient = session.exec(
            select(Patient).where(Patient.id == anonymous_patient.id)
        ).first()

        return existing_patient
    except Exception as e:
        logger.exception("Error trying to find existing patient")
        raise ValueError("Error retrieving existing patient") from e


def get_user_by_email(email_address: str | None, session: Session) -> User | None:
    """Retrieve a user by email."""

    if not email_address:
        return None
    user = session.exec(select(User).where(User.email_address == email_address)).first()
    return user


# async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], session: Session) -> User:
#     credentials_exception = HTTPException(
#         status_code=status.HTTP_401_UNAUTHORIZED,
#         detail="Could not validate credentials",
#         headers={"WWW-Authenticate": "Bearer"},
#     )
#     try:
#         payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
#         username = payload.get("sub")
#         if username is None:
#             raise credentials_exception
#         token_data = TokenUser(email_address)
#     except InvalidTokenError:
#         raise credentials_exception
#     user = get_user_by_email(token_data.username, session)
#     if user is None:
#         raise credentials_exception
#     return user


def get_user_by_email_and_type(
    email_address: str | None, user_type: str | None, session: Session
) -> User | None:
    """Retrieve a user by email if they have the specified role."""

    if not email_address or not user_type:
        return None
    user = session.exec(select(User).where(User.email_address == email_address)).first()

    if user and user_type in user.roles:
        return user

    return None


def create_patient(user_data: AnonymousPatient, user_id, session: Session) -> Patient:
    """creates a patient"""

    if not user_data.personality_test:
        raise ValueError("Personality test not completed.")

    try:
        patient = Patient(
            age=user_data.age or 0,
            user_id=user_id,
            therapy_needs=user_data.therapy_needs,
            is_religious_therapist_preference=user_data.is_religious_therapist_preference,
            gender=user_data.gender,
            is_lgbtq_therapist_preference=user_data.is_lgbtq_therapist_preference,
            latitude=user_data.latitude,
            longitude=user_data.longitude,
        )

        session.add(patient)
        session.commit()
        session.refresh(patient)
    except Exception as e:
        session.rollback()
        logger.exception("Failed to create patient")
        raise PatientCreationError("Cannot create a patient") from e

    return patient


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
        logger.warning("Unable to find user to authenticate")
        raise ValueError("Could not retrieve user.")

    if not verify_password(password, user.password):
        logger.warning("Authentication failed for user_id: %s", user.id)
        raise ValueError("Invalid email or password.")

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
