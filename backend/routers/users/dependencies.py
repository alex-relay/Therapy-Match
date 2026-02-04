from typing import Annotated
from fastapi.security import OAuth2PasswordBearer
import jwt
from fastapi import status, Depends, HTTPException, Cookie
from sqlmodel import select
from backend.core.database import SessionDep
from backend.models.user import AnonymousPatient, Patient, User
from backend.core.logging import get_logger
from ...schemas.users import AnonymousSessionCookie
from ...services.users import (
    SECRET_KEY,
    ALGORITHM,
    get_user_by_id,
)

logger = get_logger(__name__)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def get_current_session_id(cookie: Annotated[AnonymousSessionCookie, Cookie()]):
    """gets the current session id"""
    try:
        token = cookie.anonymous_session
        if not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Anonymous session cookie is missing.",
            )

        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        session_id = payload.get("sub")

        if not session_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid session token: 'sub' claim is missing.",
            )
        return session_id

    except (jwt.PyJWTError, Exception) as e:
        logger.exception("Invalid or expired session token.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session token.",
        ) from e


def get_anonymous_patient(
    db_session: SessionDep, session_id: Annotated[str, Depends(get_current_session_id)]
) -> AnonymousPatient | None:
    """gets an anonymous patient by session id"""

    try:
        anonymous_patient = db_session.exec(
            select(AnonymousPatient).where(AnonymousPatient.session_id == session_id)
        ).first()

        if not anonymous_patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Anonymous patient not found",
            )

        return anonymous_patient

    except Exception as e:
        logger.exception("Unable to get anonymous patient")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving patient data.",
        ) from e


def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)], session: SessionDep
) -> User:
    """Get the current user based on the token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")

        if user_id is None:
            raise credentials_exception

        user = get_user_by_id(user_id, session)

        if user is None:
            raise credentials_exception

    except jwt.InvalidTokenError as e:
        logger.exception("Invalid token error")
        raise credentials_exception from e
    except Exception as e:
        logger.exception("Error retrieving current user")
        raise credentials_exception from e

    return user


def get_patient_by_user_id(
    user: Annotated[User, Depends(get_current_user)], db_session: SessionDep
) -> Patient | None:
    """Retrieve a patient by user ID."""

    if not user.id:
        return None

    try:
        patient = db_session.exec(
            select(Patient).where(Patient.user_id == user.id)
        ).first()

    except Exception as e:
        logger.exception("Unable to get patient by user id")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving patient data.",
        ) from e

    if not patient:
        logger.exception("Patient id not found")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found",
        )

    return patient
