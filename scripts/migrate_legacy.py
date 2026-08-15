import argparse
import json
from pathlib import Path
import sys

BACKEND_PATH = Path(__file__).resolve().parents[1] / "backend"
sys.path.insert(0, str(BACKEND_PATH))

from app.config import get_settings  # noqa: E402
from app.database import create_database_engine, create_session_factory  # noqa: E402
from app.legacy_import import import_legacy  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser(description="Import the legacy TaraForge3D intake database")
    parser.add_argument("source_database", type=Path)
    parser.add_argument("source_vault", type=Path)
    parser.add_argument("--report", type=Path, default=Path("migration-report.json"))
    args = parser.parse_args()

    settings = get_settings()
    factory = create_session_factory(create_database_engine(settings.database_url))
    with factory() as db:
        report = import_legacy(args.source_database, args.source_vault, settings.vault_path, db)
    args.report.write_text(json.dumps(report.to_dict(), indent=2), encoding="utf-8")
    print(json.dumps(report.to_dict(), indent=2))


if __name__ == "__main__":
    main()
