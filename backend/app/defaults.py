import json
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import EmailTemplate, GalleryItem, SlicerProfile, StoreItem


DEFAULT_PROFILE_ROOT = Path(__file__).resolve().parents[1] / "slicing" / "profiles"

DEFAULT_GALLERY_ITEMS = [
    ("One Piece Figurine", "Artistic Prints", "High-detail resin-like finish on a custom anime collectible. Optimized for fine features and smooth surfaces.", ["PLA+", "0.12mm Layer"], "from-indigo-900 via-slate-950 to-slate-950", "rgba(96,165,250,0.55)"),
    ("Mechanical Gear Assembly", "Functional Parts", "Multi-part assembly with tight tolerances. Tested for fit and durability in a mechanical prototype.", ["PETG", "40% Infill"], "from-emerald-900 via-slate-950 to-slate-950", "rgba(45,212,191,0.55)"),
    ("Custom Drone Frame", "Prototyping", "Lightweight and rigid frame design for a custom quadcopter. Iterated through 3 design cycles.", ["Carbon PLA", "Rigid"], "from-fuchsia-900 via-slate-950 to-slate-950", "rgba(244,114,182,0.6)"),
    ("Architectural Scaled Model", "Visualization", "Detailed scale model of a modern villa. Used for client presentation and spatial analysis.", ["Matte PLA", "Scalable"], "from-blue-900 via-slate-950 to-slate-950", "rgba(59,130,246,0.5)"),
    ("Industrial Cable Organizer", "Batching", "Small-batch run of 50 units for a server room setup. Consistent quality across the entire batch.", ["PETG", "Batch Run"], "from-amber-900 via-slate-950 to-slate-950", "rgba(251,191,36,0.5)"),
    ("Ergonomic Mouse Shell", "Design Validation", "Prototype for a custom vertical mouse. Used to validate grip comfort before final production.", ["PLA", "Ergonomic"], "from-rose-900 via-slate-950 to-slate-950", "rgba(244,63,94,0.5)"),
]

DEFAULT_STORE_ITEMS = [
    ("tf-desk-organizer", "Minimalist Desk Set", "Living", "A geometric 3-piece set for your workspace. Designed for modularity and a clean aesthetic finish.", 124900, "from-blue-900/40 via-slate-900 to-slate-950", "rgba(56, 189, 248, 0.4)", "Popular"),
    ("tf-planter-stellar", "Celestial Planter", "Living", "Self-watering geometric planter with a celestial pattern. Durable PETG construction for indoor/outdoor use.", 89900, "from-purple-900/40 via-slate-900 to-slate-950", "rgba(168, 85, 247, 0.4)", None),
    ("tf-lamp-nebula", "Nebula Ambient Lamp", "Decor", "Lithophane-style light cover that projects cosmic shadows. Includes custom base and LED fitting.", 249900, "from-amber-900/40 via-slate-900 to-slate-950", "rgba(251, 191, 36, 0.4)", "Premium"),
    ("tf-keycap-forge", "Forge Edition Keycaps", "Customs", "Set of 4 artisan keycaps featuring the TaraForge3D logo. High-detail precision prints for mechanical keyboards.", 59900, "from-emerald-900/40 via-slate-900 to-slate-950", "rgba(16, 185, 129, 0.4)", None),
    ("tf-headphone-stand", "Aero Headphone Stand", "Living", "Ergonomic stand designed for weight balance and minimalistic profile. Printed in reinforced PLA.", 159900, "from-rose-900/40 via-slate-900 to-slate-950", "rgba(244, 63, 94, 0.4)", None),
    ("tf-swatch-pack", "Material Swatch Pack", "Makers", "Complete set of 12 material swatches including PLA, PETG, and Specialty filaments for tactile review.", 45000, "from-slate-800 via-slate-900 to-slate-950", "rgba(148, 163, 184, 0.4)", "Sample Kit"),
]


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

    if not db.scalar(select(GalleryItem.id).limit(1)):
        for order, (title, category, description, tags, gradient, accent) in enumerate(DEFAULT_GALLERY_ITEMS):
            db.add(GalleryItem(title=title, category=category, description=description, tags_json=json.dumps(tags), gradient=gradient, accent=accent, sort_order=order))

    if not db.scalar(select(StoreItem.id).limit(1)):
        for order, (item_id, title, category, description, price_paise, gradient, accent, badge) in enumerate(DEFAULT_STORE_ITEMS):
            db.add(StoreItem(id=item_id, title=title, category=category, description=description, price_paise=price_paise, gradient=gradient, accent=accent, badge=badge, sort_order=order))
    db.commit()
