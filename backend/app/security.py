import hashlib
import secrets
from dataclasses import dataclass
from datetime import datetime, timedelta

from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerifyMismatchError
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from .models import Admin, AdminSession, utcnow


password_hasher = PasswordHasher()


def normalize_email(value: str) -> str:
    return value.strip().casefold()


def hash_secret(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def hash_password(password: str) -> str:
    return password_hasher.hash(password)


def verify_password(password_hash: str, password: str) -> bool:
    try:
        return password_hasher.verify(password_hash, password)
    except (VerifyMismatchError, InvalidHashError):
        return False


@dataclass(frozen=True)
class IssuedSession:
    session_token: str
    csrf_token: str
    expires_at: datetime


def issue_session(db: Session, admin: Admin, ttl_hours: int) -> IssuedSession:
    session_token = secrets.token_urlsafe(48)
    csrf_token = secrets.token_urlsafe(32)
    expires_at = utcnow() + timedelta(hours=ttl_hours)
    db.add(
        AdminSession(
            admin_id=admin.id,
            token_hash=hash_secret(session_token),
            csrf_hash=hash_secret(csrf_token),
            expires_at=expires_at,
        )
    )
    admin.last_login_at = utcnow()
    db.commit()
    return IssuedSession(session_token, csrf_token, expires_at)


def resolve_session(db: Session, token: str | None) -> AdminSession | None:
    if not token:
        return None
    session = db.scalar(
        select(AdminSession).where(AdminSession.token_hash == hash_secret(token))
    )
    if not session or session.expires_at.replace(tzinfo=session.expires_at.tzinfo or utcnow().tzinfo) <= utcnow():
        if session:
            db.delete(session)
            db.commit()
        return None
    if not session.admin.active:
        return None
    return session


def revoke_session(db: Session, token: str | None) -> None:
    if token:
        db.execute(delete(AdminSession).where(AdminSession.token_hash == hash_secret(token)))
        db.commit()
