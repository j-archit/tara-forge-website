from dataclasses import dataclass
from pathlib import Path

from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload


SCOPES = (
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/spreadsheets",
)


class GoogleIntegrationError(RuntimeError):
    pass


@dataclass(frozen=True)
class GoogleConfig:
    credentials_path: Path
    drive_folder_id: str
    sheet_id: str


class GoogleIntegration:
    def __init__(self, drive_service, sheets_service, drive_folder_id: str, sheet_id: str):
        self.drive = drive_service
        self.sheets = sheets_service
        self.drive_folder_id = drive_folder_id
        self.sheet_id = sheet_id

    @classmethod
    def from_config(cls, config: GoogleConfig) -> "GoogleIntegration":
        if not config.credentials_path.is_file():
            raise GoogleIntegrationError("Google service-account credential file is unavailable")
        credentials = service_account.Credentials.from_service_account_file(
            str(config.credentials_path), scopes=SCOPES
        )
        return cls(
            build("drive", "v3", credentials=credentials, cache_discovery=False),
            build("sheets", "v4", credentials=credentials, cache_discovery=False),
            config.drive_folder_id,
            config.sheet_id,
        )

    def upload_once(self, file_path: Path, filename: str, media_type: str, submission_id: str) -> str:
        escaped = submission_id.replace("'", "\\'")
        query = (
            f"'{self.drive_folder_id}' in parents and trashed = false "
            f"and appProperties has {{ key='taraforge_submission_id' and value='{escaped}' }}"
        )
        existing = self.drive.files().list(q=query, fields="files(id)", pageSize=1).execute()
        if existing.get("files"):
            return existing["files"][0]["id"]

        media = MediaFileUpload(str(file_path), mimetype=media_type, resumable=True)
        created = self.drive.files().create(
            body={
                "name": filename,
                "parents": [self.drive_folder_id],
                "appProperties": {"taraforge_submission_id": submission_id},
            },
            media_body=media,
            fields="id",
        ).execute()
        return created["id"]

    def upsert_sheet_row(self, values: list[object], submission_id: str) -> None:
        result = self.sheets.spreadsheets().values().get(
            spreadsheetId=self.sheet_id,
            range="Sheet1!I:I",
        ).execute()
        identifiers = result.get("values", [])
        matching_row = next(
            (index for index, row in enumerate(identifiers, start=1) if row and row[0] == submission_id),
            None,
        )
        values_api = self.sheets.spreadsheets().values()
        if matching_row:
            values_api.update(
                spreadsheetId=self.sheet_id,
                range=f"Sheet1!A{matching_row}:K{matching_row}",
                valueInputOption="RAW",
                body={"values": [values]},
            ).execute()
        else:
            values_api.append(
                spreadsheetId=self.sheet_id,
                range="Sheet1!A:K",
                valueInputOption="RAW",
                insertDataOption="INSERT_ROWS",
                body={"values": [values]},
            ).execute()
