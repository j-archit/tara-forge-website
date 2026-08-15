import json
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import EmailTemplate, SlicerProfile


DEFAULT_PROFILE_ROOT = Path(__file__).resolve().parents[1] / "slicing" / "profiles"


def seed_defaults(db: Session, profile_root: Path = DEFAULT_PROFILE_ROOT) -> None:
    for profile_path in sorted(profile_root.glob("*/standard.json")):
        material = profile_path.parent.name.upper()
        existing = db.scalar(
            select(SlicerProfile).where(
                SlicerProfile.material == material,
                SlicerProfile.name == "standard",
                SlicerProfile.version == 1,
            )
        )
        if not existing:
            config = json.loads(profile_path.read_text(encoding="utf-8"))
            db.add(
                SlicerProfile(
                    material=material,
                    name="standard",
                    version=1,
                    config_json=json.dumps(config, separators=(",", ":")),
                )
            )

    if not db.get(EmailTemplate, "estimate"):
        db.add(
            EmailTemplate(
                key="estimate",
                subject_template="3D Printing Estimate - TaraForge3D",
                body_template=(
                    "Hi {name},\n\nThank you for your inquiry. Here is the estimate for "
                    "{fileName}:\n\nPrint time: {printTimeMins} minutes\nMaterial: "
                    "{filamentGrams} g\nMaterial type: {material}\n\nBest,\nTaraForge3D"
                ),
            )
        )
    db.commit()
