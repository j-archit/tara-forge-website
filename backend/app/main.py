import json
import shutil
from contextlib import asynccontextmanager
from urllib.parse import quote

from fastapi import Cookie, Depends, FastAPI, File, Form, Header, HTTPException, Request, Response, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, select, text, update
from sqlalchemy.orm import Session, selectinload

from .config import Settings, get_settings
from .database import Base, create_database_engine, create_session_factory, session_dependency
from .models import (
    Admin,
    AuditEvent,
    Client,
    EmailTemplate,
    GalleryItem,
    Job,
    JobStatus,
    SlicerProfile,
    SlicerRun,
    Submission,
    StoreItem,
    utcnow,
)
from .schemas import (
    AdminView,
    IntakeResult,
    GalleryItemPayload,
    LoginRequest,
    ProfileUpdate,
    SessionView,
    SubmissionView,
    StoreItemPayload,
    TemplateUpdate,
    submission_view,
)
from .rate_limit import RateLimiter
from .security import hash_secret, issue_session, normalize_email, resolve_session, revoke_session, verify_password
from .storage import InvalidUpload, UploadTooLarge, store_upload


def gallery_item_view(item: GalleryItem) -> dict:
    return {
        "id": item.id,
        "title": item.title,
        "category": item.category,
        "description": item.description,
        "tags": json.loads(item.tags_json),
        "imageUrl": item.image_url,
        "gradient": item.gradient,
        "accent": item.accent,
        "published": item.published,
        "sortOrder": item.sort_order,
    }


def store_item_view(item: StoreItem) -> dict:
    return {
        "id": item.id,
        "title": item.title,
        "category": item.category,
        "description": item.description,
        "pricePaise": item.price_paise,
        "currency": item.currency,
        "imageUrl": item.image_url,
        "gradient": item.gradient,
        "accent": item.accent,
        "badge": item.badge,
        "published": item.published,
        "available": item.available,
        "sortOrder": item.sort_order,
    }


def create_app(settings: Settings | None = None, *, create_schema: bool = False) -> FastAPI:
    app_settings = settings or get_settings()
    engine = create_database_engine(app_settings.database_url)
    session_factory = create_session_factory(engine)
    get_db = session_dependency(session_factory)
    login_limiter = RateLimiter()
    intake_limiter = RateLimiter()

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
        if shutil.disk_usage(app_settings.vault_path).free < app_settings.minimum_free_bytes:
            raise HTTPException(status_code=503, detail="Insufficient storage space")
        return {"status": "ready"}

    @app.post("/api/auth/login", response_model=SessionView)
    def login(payload: LoginRequest, request: Request, response: Response, db: Session = Depends(get_db)):
        client_key = request.headers.get("x-forwarded-for", "").split(",", 1)[0].strip()
        client_key = client_key or (request.client.host if request.client else "unknown")
        if not login_limiter.allow(
            client_key,
            app_settings.login_rate_limit,
            app_settings.login_rate_window_seconds,
        ):
            raise HTTPException(status_code=429, detail="Too many login attempts", headers={"Retry-After": "60"})
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
        request: Request,
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
        client_key = request.headers.get("x-forwarded-for", "").split(",", 1)[0].strip()
        client_key = client_key or (request.client.host if request.client else "unknown")
        if not intake_limiter.allow(
            client_key,
            app_settings.intake_rate_limit,
            app_settings.intake_rate_window_seconds,
        ):
            raise HTTPException(status_code=429, detail="Too many submissions", headers={"Retry-After": "300"})
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

    @app.get("/api/admin/submissions/{submission_id}", response_model=SubmissionView)
    def get_submission(
        submission_id: str,
        db: Session = Depends(get_db),
        _admin_session=Depends(current_session),
    ):
        submission = db.scalar(
            select(Submission)
            .where(Submission.id == submission_id)
            .options(selectinload(Submission.client))
        )
        if not submission:
            raise HTTPException(status_code=404, detail="Submission not found")
        return submission_view(submission)

    @app.get("/api/admin/clients/{client_id}")
    def get_client(
        client_id: int,
        db: Session = Depends(get_db),
        _admin_session=Depends(current_session),
    ):
        client = db.scalar(
            select(Client)
            .where(Client.id == client_id)
            .options(selectinload(Client.submissions))
        )
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")
        return {
            "id": client.id,
            "email": client.email,
            "name": client.name,
            "createdAt": client.created_at,
            "submissions": [
                {
                    "id": item.id,
                    "projectType": item.project_type,
                    "material": item.material,
                    "fileName": item.original_filename,
                    "status": item.status,
                    "createdAt": item.created_at,
                }
                for item in sorted(client.submissions, key=lambda value: value.created_at, reverse=True)
            ],
        }

    @app.get("/api/admin/submissions/{submission_id}/runs")
    def list_slicer_runs(
        submission_id: str,
        db: Session = Depends(get_db),
        _admin_session=Depends(current_session),
    ):
        return [
            {
                "id": run.id,
                "submissionId": run.submission_id,
                "printTimeSeconds": run.print_time_seconds,
                "filamentGrams": run.filament_grams,
                "status": run.status,
                "error": run.error,
                "createdAt": run.created_at,
            }
            for run in db.scalars(
                select(SlicerRun)
                .where(SlicerRun.submission_id == submission_id)
                .order_by(SlicerRun.created_at.desc())
            ).all()
        ]

    @app.post("/api/admin/submissions/{submission_id}/slice", status_code=202)
    def queue_manual_slice(
        submission_id: str,
        db: Session = Depends(get_db),
        admin_session=Depends(csrf_session),
    ):
        submission = db.get(Submission, submission_id)
        if not submission:
            raise HTTPException(status_code=404, detail="Submission not found")
        submission.slicer_status = "pending"
        job = Job(type="process_submission", submission_id=submission.id)
        db.add(job)
        db.add(
            AuditEvent(
                admin_id=admin_session.admin_id,
                event_type="submission.slice_queued",
                entity_type="submission",
                entity_id=submission.id,
            )
        )
        db.commit()
        return {"jobId": job.id, "status": job.status}

    @app.get("/api/admin/slicer/profiles")
    def list_profiles(
        db: Session = Depends(get_db),
        _admin_session=Depends(current_session),
    ):
        profiles = db.scalars(
            select(SlicerProfile)
            .where(SlicerProfile.active.is_(True))
            .order_by(SlicerProfile.material, SlicerProfile.name)
        ).all()
        return [
            {
                "material": profile.material,
                "name": profile.name,
                "version": profile.version,
                "config": json.loads(profile.config_json),
            }
            for profile in profiles
        ]

    @app.get("/api/admin/slicer/profiles/{material}/{name}")
    def get_profile(
        material: str,
        name: str,
        db: Session = Depends(get_db),
        _admin_session=Depends(current_session),
    ):
        profile = db.scalar(
            select(SlicerProfile)
            .where(
                SlicerProfile.material == material.upper(),
                SlicerProfile.name == name,
                SlicerProfile.active.is_(True),
            )
            .order_by(SlicerProfile.version.desc())
        )
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        return {
            "material": profile.material,
            "name": profile.name,
            "version": profile.version,
            "config": json.loads(profile.config_json),
        }

    @app.put("/api/admin/slicer/profiles/{material}/{name}", status_code=201)
    def update_profile(
        material: str,
        name: str,
        payload: ProfileUpdate,
        db: Session = Depends(get_db),
        admin_session=Depends(csrf_session),
    ):
        normalized_material = material.upper()
        latest_version = db.scalar(
            select(func.max(SlicerProfile.version)).where(
                SlicerProfile.material == normalized_material,
                SlicerProfile.name == name,
            )
        ) or 0
        db.execute(
            update(SlicerProfile)
            .where(
                SlicerProfile.material == normalized_material,
                SlicerProfile.name == name,
            )
            .values(active=False)
        )
        profile = SlicerProfile(
            material=normalized_material,
            name=name,
            version=latest_version + 1,
            config_json=json.dumps(payload.config, separators=(",", ":")),
        )
        db.add(profile)
        db.add(
            AuditEvent(
                admin_id=admin_session.admin_id,
                event_type="slicer_profile.updated",
                entity_type="slicer_profile",
                entity_id=f"{normalized_material}/{name}",
            )
        )
        db.commit()
        return {"material": profile.material, "name": profile.name, "version": profile.version}

    @app.delete("/api/admin/slicer/profiles/{material}/{name}", status_code=204)
    def delete_profile(
        material: str,
        name: str,
        db: Session = Depends(get_db),
        admin_session=Depends(csrf_session),
    ):
        result = db.execute(
            update(SlicerProfile)
            .where(
                SlicerProfile.material == material.upper(),
                SlicerProfile.name == name,
                SlicerProfile.active.is_(True),
            )
            .values(active=False)
        )
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Profile not found")
        db.add(
            AuditEvent(
                admin_id=admin_session.admin_id,
                event_type="slicer_profile.deleted",
                entity_type="slicer_profile",
                entity_id=f"{material.upper()}/{name}",
            )
        )
        db.commit()

    @app.get("/api/admin/templates")
    def get_templates(
        db: Session = Depends(get_db),
        _admin_session=Depends(current_session),
    ):
        return {
            template.key: {
                "subject": template.subject_template,
                "body": template.body_template,
                "version": template.version,
            }
            for template in db.scalars(select(EmailTemplate).order_by(EmailTemplate.key)).all()
        }

    @app.put("/api/admin/templates/{template_key}")
    def update_template(
        template_key: str,
        payload: TemplateUpdate,
        db: Session = Depends(get_db),
        admin_session=Depends(csrf_session),
    ):
        template = db.get(EmailTemplate, template_key)
        if template:
            template.subject_template = payload.subject
            template.body_template = payload.body
            template.version += 1
        else:
            template = EmailTemplate(
                key=template_key,
                subject_template=payload.subject,
                body_template=payload.body,
            )
            db.add(template)
        template.updated_by_admin_id = admin_session.admin_id
        db.add(
            AuditEvent(
                admin_id=admin_session.admin_id,
                event_type="email_template.updated",
                entity_type="email_template",
                entity_id=template_key,
            )
        )
        db.commit()
        return {"key": template.key, "version": template.version}

    @app.get("/api/admin/email/{submission_id}")
    def generate_email(
        submission_id: str,
        template_key: str = "estimate",
        db: Session = Depends(get_db),
        _admin_session=Depends(current_session),
    ):
        submission = db.scalar(
            select(Submission)
            .where(Submission.id == submission_id)
            .options(selectinload(Submission.client))
        )
        template = db.get(EmailTemplate, template_key)
        if not submission or not template:
            raise HTTPException(status_code=404, detail="Submission or template not found")
        values = {
            "name": submission.client.name,
            "fileName": submission.original_filename or "your project",
            "printTimeMins": round((submission.print_time_seconds or 0) / 60),
            "filamentGrams": submission.filament_grams or 0,
            "projectType": submission.project_type,
            "material": submission.material,
        }
        try:
            subject = template.subject_template.format(**values)
            body = template.body_template.format(**values)
        except (KeyError, ValueError, IndexError) as exc:
            raise HTTPException(status_code=422, detail=f"Invalid template placeholder: {exc}") from exc
        return {
            "subject": subject,
            "body": body,
            "mailto": f"mailto:{submission.client.email}?subject={quote(subject)}&body={quote(body)}",
        }

    @app.get("/api/admin/jobs")
    def list_jobs(
        db: Session = Depends(get_db),
        _admin_session=Depends(current_session),
    ):
        return [
            {
                "id": job.id,
                "type": job.type,
                "submissionId": job.submission_id,
                "status": job.status,
                "attemptCount": job.attempt_count,
                "maxAttempts": job.max_attempts,
                "lastError": job.last_error,
                "availableAt": job.available_at,
                "createdAt": job.created_at,
            }
            for job in db.scalars(select(Job).order_by(Job.created_at.desc()).limit(200)).all()
        ]

    @app.get("/api/content/gallery")
    def public_gallery(db: Session = Depends(get_db)):
        items = db.scalars(
            select(GalleryItem)
            .where(GalleryItem.published.is_(True))
            .order_by(GalleryItem.sort_order, GalleryItem.id)
        ).all()
        return [gallery_item_view(item) for item in items]

    @app.get("/api/content/store")
    def public_store(db: Session = Depends(get_db)):
        items = db.scalars(
            select(StoreItem)
            .where(StoreItem.published.is_(True))
            .order_by(StoreItem.sort_order, StoreItem.id)
        ).all()
        return [store_item_view(item) for item in items]

    @app.get("/api/admin/content/gallery")
    def admin_gallery(db: Session = Depends(get_db), _admin_session=Depends(current_session)):
        return [
            gallery_item_view(item)
            for item in db.scalars(select(GalleryItem).order_by(GalleryItem.sort_order, GalleryItem.id)).all()
        ]

    @app.post("/api/admin/content/gallery", status_code=201)
    def create_gallery_item(
        payload: GalleryItemPayload,
        db: Session = Depends(get_db),
        admin_session=Depends(csrf_session),
    ):
        item = GalleryItem(
            title=payload.title.strip(),
            category=payload.category.strip(),
            description=payload.description.strip(),
            tags_json=json.dumps([tag.strip() for tag in payload.tags if tag.strip()]),
            image_url=payload.imageUrl,
            gradient=payload.gradient.strip(),
            accent=payload.accent.strip(),
            published=payload.published,
            sort_order=payload.sortOrder,
        )
        db.add(item)
        db.flush()
        db.add(AuditEvent(admin_id=admin_session.admin_id, event_type="gallery.created", entity_type="gallery_item", entity_id=str(item.id)))
        db.commit()
        return gallery_item_view(item)

    @app.put("/api/admin/content/gallery/{item_id}")
    def update_gallery_item(
        item_id: int,
        payload: GalleryItemPayload,
        db: Session = Depends(get_db),
        admin_session=Depends(csrf_session),
    ):
        item = db.get(GalleryItem, item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Gallery item not found")
        item.title = payload.title.strip()
        item.category = payload.category.strip()
        item.description = payload.description.strip()
        item.tags_json = json.dumps([tag.strip() for tag in payload.tags if tag.strip()])
        item.image_url = payload.imageUrl
        item.gradient = payload.gradient.strip()
        item.accent = payload.accent.strip()
        item.published = payload.published
        item.sort_order = payload.sortOrder
        db.add(AuditEvent(admin_id=admin_session.admin_id, event_type="gallery.updated", entity_type="gallery_item", entity_id=str(item.id)))
        db.commit()
        return gallery_item_view(item)

    @app.delete("/api/admin/content/gallery/{item_id}", status_code=204)
    def delete_gallery_item(
        item_id: int,
        db: Session = Depends(get_db),
        admin_session=Depends(csrf_session),
    ):
        item = db.get(GalleryItem, item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Gallery item not found")
        db.delete(item)
        db.add(AuditEvent(admin_id=admin_session.admin_id, event_type="gallery.deleted", entity_type="gallery_item", entity_id=str(item_id)))
        db.commit()

    @app.get("/api/admin/content/store")
    def admin_store(db: Session = Depends(get_db), _admin_session=Depends(current_session)):
        return [
            store_item_view(item)
            for item in db.scalars(select(StoreItem).order_by(StoreItem.sort_order, StoreItem.id)).all()
        ]

    @app.post("/api/admin/content/store", status_code=201)
    def create_store_item(
        payload: StoreItemPayload,
        db: Session = Depends(get_db),
        admin_session=Depends(csrf_session),
    ):
        if db.get(StoreItem, payload.id):
            raise HTTPException(status_code=409, detail="Store item ID already exists")
        item = StoreItem(
            id=payload.id,
            title=payload.title.strip(),
            category=payload.category.strip(),
            description=payload.description.strip(),
            price_paise=payload.pricePaise,
            currency=payload.currency,
            image_url=payload.imageUrl,
            gradient=payload.gradient.strip(),
            accent=payload.accent.strip(),
            badge=payload.badge.strip() if payload.badge else None,
            published=payload.published,
            available=payload.available,
            sort_order=payload.sortOrder,
        )
        db.add(item)
        db.add(AuditEvent(admin_id=admin_session.admin_id, event_type="store.created", entity_type="store_item", entity_id=item.id))
        db.commit()
        return store_item_view(item)

    @app.put("/api/admin/content/store/{item_id}")
    def update_store_item(
        item_id: str,
        payload: StoreItemPayload,
        db: Session = Depends(get_db),
        admin_session=Depends(csrf_session),
    ):
        item = db.get(StoreItem, item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Store item not found")
        if payload.id != item_id:
            raise HTTPException(status_code=422, detail="Store item ID cannot be changed")
        item.title = payload.title.strip()
        item.category = payload.category.strip()
        item.description = payload.description.strip()
        item.price_paise = payload.pricePaise
        item.currency = payload.currency
        item.image_url = payload.imageUrl
        item.gradient = payload.gradient.strip()
        item.accent = payload.accent.strip()
        item.badge = payload.badge.strip() if payload.badge else None
        item.published = payload.published
        item.available = payload.available
        item.sort_order = payload.sortOrder
        db.add(AuditEvent(admin_id=admin_session.admin_id, event_type="store.updated", entity_type="store_item", entity_id=item.id))
        db.commit()
        return store_item_view(item)

    @app.delete("/api/admin/content/store/{item_id}", status_code=204)
    def delete_store_item(
        item_id: str,
        db: Session = Depends(get_db),
        admin_session=Depends(csrf_session),
    ):
        item = db.get(StoreItem, item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Store item not found")
        db.delete(item)
        db.add(AuditEvent(admin_id=admin_session.admin_id, event_type="store.deleted", entity_type="store_item", entity_id=item_id))
        db.commit()

    @app.post("/api/admin/jobs/{job_id}/retry", status_code=202)
    def retry_job(
        job_id: int,
        db: Session = Depends(get_db),
        admin_session=Depends(csrf_session),
    ):
        job = db.get(Job, job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        job.status = JobStatus.PENDING.value
        job.attempt_count = 0
        job.available_at = utcnow()
        job.completed_at = None
        job.lease_owner = None
        job.lease_expires_at = None
        db.add(
            AuditEvent(
                admin_id=admin_session.admin_id,
                event_type="job.retried",
                entity_type="job",
                entity_id=str(job.id),
            )
        )
        db.commit()
        return {"id": job.id, "status": job.status}

    return app


app = create_app()
