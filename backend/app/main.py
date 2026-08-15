import json
from contextlib import asynccontextmanager

from fastapi import Cookie, Depends, FastAPI, File, Form, Header, HTTPException, Response, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, text
from sqlalchemy.orm import Session, selectinload

from .config import Settings, get_settings
from .database import Base, create_database_engine, create_session_factory, session_dependency
from .models import Admin, AuditEvent, Client, Job, Submission
from .schemas import AdminView, IntakeResult, LoginRequest, SessionView, SubmissionView, submission_view
from .security import hash_secret, issue_session, normalize_email, resolve_session, revoke_session, verify_password
from .storage import InvalidUpload, UploadTooLarge, store_upload


def create_app(settings: Settings | None = None, *, create_schema: bool = False) -> FastAPI:
    app_settings = settings or get_settings()
    engine = create_database_engine(app_settings.database_url)
    session_factory = create_session_factory(engine)
    get_db = session_dependency(session_factory)

    if create_schema:
        Base.metadata.create_all(engine)

    @asynccontextmanager
    async def lifespan(_app: FastAPI):
        app_settings.vault_path.mkdir(parents=True, exist_ok=True)
        yield
        engine.dispose()

    app = FastAPI(title="TaraForge3D API", version="3.0.0", lifespan=lifespan)
    app.state.settings = app_settings
    app.state.engine = engine
    app.state.session_factory = session_factory
    app.add_middleware(
        CORSMiddleware,
        allow_origins=app_settings.allowed_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "X-CSRF-Token", "Idempotency-Key"],
    )

    def current_session(
        db: Session = Depends(get_db),
        session_token: str | None = Cookie(default=None, alias=app_settings.session_cookie_name),
    ):
        resolved = resolve_session(db, session_token)
        if not resolved:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
        return resolved

    def csrf_session(
        admin_session=Depends(current_session),
        csrf_cookie: str | None = Cookie(default=None, alias=app_settings.csrf_cookie_name),
        csrf_header: str | None = Header(default=None, alias="X-CSRF-Token"),
    ):
        if not csrf_cookie or not csrf_header or csrf_cookie != csrf_header:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid CSRF token")
        if hash_secret(csrf_header) != admin_session.csrf_hash:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid CSRF token")
        return admin_session

    @app.get("/health")
    def health():
        return {"status": "ok", "service": "taraforge-api"}

    @app.get("/ready")
    def ready(db: Session = Depends(get_db)):
        db.execute(text("SELECT 1"))
        return {"status": "ready"}

    @app.post("/api/auth/login", response_model=SessionView)
    def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)):
        admin = db.scalar(select(Admin).where(Admin.email == normalize_email(payload.email)))
        if not admin or not admin.active or not verify_password(admin.password_hash, payload.password):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        issued = issue_session(db, admin, app_settings.session_ttl_hours)
        cookie_options = {
            "secure": app_settings.secure_cookies,
            "samesite": "strict",
            "path": "/",
            "max_age": app_settings.session_ttl_hours * 3600,
        }
        response.set_cookie(
            app_settings.session_cookie_name,
            issued.session_token,
            httponly=True,
            **cookie_options,
        )
        response.set_cookie(
            app_settings.csrf_cookie_name,
            issued.csrf_token,
            httponly=False,
            **cookie_options,
        )
        db.add(AuditEvent(admin_id=admin.id, event_type="auth.login"))
        db.commit()
        return SessionView(admin=AdminView.model_validate(admin))

    @app.post("/api/auth/logout", status_code=204)
    def logout(
        response: Response,
        db: Session = Depends(get_db),
        _admin_session=Depends(csrf_session),
        session_token: str | None = Cookie(default=None, alias=app_settings.session_cookie_name),
    ):
        revoke_session(db, session_token)
        response.delete_cookie(app_settings.session_cookie_name, path="/")
        response.delete_cookie(app_settings.csrf_cookie_name, path="/")

    @app.get("/api/auth/session", response_model=SessionView)
    def session_view(admin_session=Depends(current_session)):
        return SessionView(admin=AdminView.model_validate(admin_session.admin))

    @app.post("/api/intake", response_model=IntakeResult, status_code=202)
    async def intake(
        name: str = Form(min_length=1, max_length=200),
        email: str = Form(min_length=3, max_length=320),
        projectType: str = Form(min_length=1, max_length=80),
        material: str = Form(min_length=1, max_length=40),
        description: str = Form(min_length=1, max_length=5000),
        hp_id: str = Form(default="", max_length=200),
        file: UploadFile | None = File(default=None),
        idempotency_key: str | None = Header(default=None, alias="Idempotency-Key"),
        db: Session = Depends(get_db),
    ):
        if hp_id:
            raise HTTPException(status_code=400, detail="Invalid submission")
        normalized_email = normalize_email(email)
        if "@" not in normalized_email:
            raise HTTPException(status_code=422, detail="Invalid email")

        existing = None
        if idempotency_key:
            existing = db.scalar(
                select(Submission).where(
                    Submission.idempotency_hash == hash_secret(idempotency_key)
                )
            )
        if existing:
            return IntakeResult(id=existing.id, status=existing.status)

        stored = None
        try:
            if file and file.filename:
                stored = await store_upload(file, app_settings.vault_path, app_settings.max_upload_bytes)
        except UploadTooLarge as exc:
            raise HTTPException(status_code=413, detail=str(exc)) from exc
        except InvalidUpload as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from exc

        client = db.scalar(select(Client).where(Client.email == normalized_email))
        if not client:
            client = Client(email=normalized_email, name=name.strip())
            db.add(client)
            db.flush()
        else:
            client.name = name.strip()

        submission = Submission(
            client_id=client.id,
            project_type=projectType.strip().casefold(),
            material=material.strip().upper(),
            description=description.strip(),
            original_filename=stored.original_filename if stored else None,
            stored_file_key=stored.key if stored else None,
            media_type=stored.media_type if stored else None,
            byte_size=stored.byte_size if stored else None,
            file_checksum=stored.checksum if stored else None,
            idempotency_hash=hash_secret(idempotency_key) if idempotency_key else None,
        )
        db.add(submission)
        db.flush()
        db.add(
            Job(
                type="process_submission",
                submission_id=submission.id,
                payload_json=json.dumps({"submission_id": submission.id}),
            )
        )
        try:
            db.commit()
        except Exception:
            db.rollback()
            if stored:
                (app_settings.vault_path / stored.key).unlink(missing_ok=True)
            raise
        return IntakeResult(id=submission.id, status=submission.status)

    @app.get("/api/admin/submissions", response_model=list[SubmissionView])
    def list_submissions(
        db: Session = Depends(get_db),
        _admin_session=Depends(current_session),
    ):
        submissions = db.scalars(
            select(Submission)
            .options(selectinload(Submission.client))
            .order_by(Submission.created_at.desc())
        ).all()
        return [submission_view(item) for item in submissions]

    @app.get("/api/admin/clients")
    def list_clients(
        db: Session = Depends(get_db),
        _admin_session=Depends(current_session),
    ):
        clients = db.scalars(select(Client).order_by(Client.name.asc())).all()
        return [
            {
                "id": client.id,
                "email": client.email,
                "name": client.name,
                "createdAt": client.created_at,
            }
            for client in clients
        ]

    return app


app = create_app()
