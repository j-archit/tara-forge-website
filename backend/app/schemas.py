from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


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
