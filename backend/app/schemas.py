from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AdminView(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str


class SessionView(BaseModel):
    admin: AdminView


class IntakeResult(BaseModel):
    id: str
    status: str
    message: str = "Project received and queued"


class ClientView(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    name: str
    createdAt: datetime


class SubmissionView(BaseModel):
    id: str
    name: str
    email: str
    projectType: str
    material: str
    description: str
    fileName: str | None
    createdAt: datetime
    status: str
    googleDriveStatus: str
    googleSheetStatus: str
    slicerStatus: str
    printTimeSeconds: int | None
    filamentGrams: float | None


def submission_view(submission) -> SubmissionView:
    return SubmissionView(
        id=submission.id,
        name=submission.client.name,
        email=submission.client.email,
        projectType=submission.project_type,
        material=submission.material,
        description=submission.description,
        fileName=submission.original_filename,
        createdAt=submission.created_at,
        status=submission.status,
        googleDriveStatus=submission.drive_status,
        googleSheetStatus=submission.sheets_status,
        slicerStatus=submission.slicer_status,
        printTimeSeconds=submission.print_time_seconds,
        filamentGrams=submission.filament_grams,
    )


class ProfileUpdate(BaseModel):
    config: dict


class TemplateUpdate(BaseModel):
    subject: str = Field(min_length=1, max_length=255)
    body: str = Field(min_length=1, max_length=20000)


def validate_image_url(value: str | None) -> str | None:
    if value is None or not value.strip():
        return None
    normalized = value.strip()
    if not (normalized.startswith("/") or normalized.startswith("https://")):
        raise ValueError("imageUrl must be a root-relative or HTTPS URL")
    return normalized


class GalleryItemPayload(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    category: str = Field(min_length=1, max_length=100)
    description: str = Field(min_length=1, max_length=4000)
    tags: list[str] = Field(default_factory=list, max_length=8)
    imageUrl: str | None = Field(default=None, max_length=1000)
    gradient: str = Field(default="from-slate-800 via-slate-950 to-slate-950", max_length=255)
    accent: str = Field(default="rgba(201,168,76,0.45)", max_length=80)
    published: bool = True
    sortOrder: int = Field(default=0, ge=0, le=10000)

    _validate_image_url = field_validator("imageUrl")(validate_image_url)


class StoreItemPayload(BaseModel):
    id: str = Field(pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$", min_length=2, max_length=100)
    title: str = Field(min_length=1, max_length=160)
    category: str = Field(min_length=1, max_length=100)
    description: str = Field(min_length=1, max_length=4000)
    pricePaise: int = Field(ge=0, le=100_000_000)
    currency: str = Field(default="₹", min_length=1, max_length=8)
    imageUrl: str | None = Field(default=None, max_length=1000)
    gradient: str = Field(default="from-slate-800 via-slate-950 to-slate-950", max_length=255)
    accent: str = Field(default="rgba(201,168,76,0.45)", max_length=80)
    badge: str | None = Field(default=None, max_length=80)
    published: bool = True
    available: bool = False
    sortOrder: int = Field(default=0, ge=0, le=10000)

    _validate_image_url = field_validator("imageUrl")(validate_image_url)
