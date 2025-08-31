from datetime import datetime, timedelta, timezone
from typing import Annotated
import jwt
from fastapi import status, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, select, SQLModel
from passlib.context import CryptContext
from backend.core.database import SessionDep
from backend.models.user import Therapist, Patient, User
from backend.core.logging import get_logger
from backend.routers.users.schemas import (
    TherapistCreate,
    TherapistRead,
    PatientRead,
)
from backend.core.config import settings

logger = get_logger(__name__)

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 1 day
SECRET_KEY = settings.secret_key

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


class Token(SQLModel):
    access_token: str
    token_type: str


class TokenData(SQLModel):
    username: str | None = None


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


def get_user_by_email(email: str | None, session: Session) -> User | None:
    """Retrieve a user by email."""
    if not email:
        return None
    user = session.exec(select(User).where(User.email_address == email)).first()
    return user


def verify_password(plain_password, hashed_password):
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        raise e


def get_password_hash(password):
    return pwd_context.hash(password)


def get_user(db, email_address: str):
    try:
        user = [user for user in db if user["email_address"] == email_address][0]
        return user
    except Exception as e:
        logger.error("Error retrieving user from fake DB: %s", e)
        raise e


def authenticate_user(fake_db, email_address: str, password: str):
    # user = get_user_by_email(fake_db, email_address)
    user = get_user(fake_db, email_address)
    if not user:
        return False
    if not verify_password(password, user.get("hashed_password")):
        return False
    return user


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)], session: SessionDep
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except Exception as e:
        raise e
    try:
        # user = get_user_by_email(token_data.username, session)
        user = get_user_by_email(token_data.username, session)
        return user
    except:
        raise credentials_exception


async def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)],
):
    try:
        if current_user["disabled"]:
            raise HTTPException(status_code=400, detail="Inactive user")
        return {
            "full_name": current_user["full_name"],
            "email_address": current_user["email_address"],
            "disabled": current_user["disabled"],
        }
    except Exception as e:
        logger.error("Error retrieving active user: %s", e)
