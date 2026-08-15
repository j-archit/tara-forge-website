import hashlib
import re
import uuid
from dataclasses import dataclass
from pathlib import Path

from fastapi import UploadFile


ALLOWED_EXTENSIONS = {".stl", ".step", ".stp", ".3mf", ".obj"}
SAFE_FILENAME = re.compile(r"[^A-Za-z0-9._-]+")


class InvalidUpload(ValueError):
    pass


class UploadTooLarge(InvalidUpload):
    pass


@dataclass(frozen=True)
class StoredUpload:
    original_filename: str
    key: str
    media_type: str
    byte_size: int
    checksum: str


def sanitized_filename(filename: str) -> str:
    name = Path(filename).name.strip()
    cleaned = SAFE_FILENAME.sub("_", name).strip("._")
    return cleaned[:180] or "model"


async def store_upload(upload: UploadFile, vault: Path, max_bytes: int) -> StoredUpload:
    original = sanitized_filename(upload.filename or "model")
    extension = Path(original).suffix.casefold()
    if extension not in ALLOWED_EXTENSIONS:
        raise InvalidUpload("Unsupported model file type")

    vault.mkdir(parents=True, exist_ok=True)
    key = f"{uuid.uuid4()}{extension}"
    destination = vault / key
    temporary = vault / f".{key}.uploading"
    digest = hashlib.sha256()
    total = 0

    try:
        with temporary.open("wb") as output:
            while chunk := await upload.read(1024 * 1024):
                total += len(chunk)
                if total > max_bytes:
                    raise UploadTooLarge(f"File exceeds the {max_bytes} byte limit")
                digest.update(chunk)
                output.write(chunk)
        if total == 0:
            raise InvalidUpload("Uploaded model is empty")
        temporary.replace(destination)
    except Exception:
        temporary.unlink(missing_ok=True)
        destination.unlink(missing_ok=True)
        raise
    finally:
        await upload.close()

    return StoredUpload(
        original_filename=original,
        key=key,
        media_type=upload.content_type or "application/octet-stream",
        byte_size=total,
        checksum=digest.hexdigest(),
    )
