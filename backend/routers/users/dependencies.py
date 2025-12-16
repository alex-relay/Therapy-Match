from typing import Annotated
import jwt
from fastapi import status, Depends, HTTPException, Cookie
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import SQLModel, select
from backend.core.database import SessionDep
from backend.models.user import User, AnonymousPatient
from backend.core.logging import get_logger
from .schemas import UserRead, AnonymousSessionCookie
from .service import get_user_by_email, SECRET_KEY, ALGORITHM

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
logger = get_logger(__name__)


class TokenData(SQLModel):
    """Docstring for TokenData"""

    username: str | None = None


def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)], session: SessionDep
):
    """gets the current user from the token"""
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
        user = get_user_by_email(token_data.username, session)
        return user
    except Exception as e:
        raise credentials_exception from e


def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)],
):
    """gets the current active user"""
    if not current_user:
        raise HTTPException(status_code=400, detail="Inactive user")

    return UserRead(
        id=current_user.id,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        email_address=current_user.email_address,
    )


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
