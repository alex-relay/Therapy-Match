from typing import Annotated
import jwt
from fastapi import status, Depends, HTTPException, Cookie
from sqlmodel import select
from backend.core.database import SessionDep
from backend.models.user import AnonymousPatient
from backend.core.logging import get_logger
from ...schemas.users import AnonymousSessionCookie
from ...services.users import SECRET_KEY, ALGORITHM

logger = get_logger(__name__)


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
