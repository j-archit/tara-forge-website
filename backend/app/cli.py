import argparse
import getpass

from sqlalchemy import select

from .config import get_settings
from .database import create_database_engine, create_session_factory
from .defaults import seed_defaults
from .models import Admin
from .security import hash_password, normalize_email


def create_admin(email: str, password: str) -> None:
    settings = get_settings()
    factory = create_session_factory(create_database_engine(settings.database_url))
    with factory() as db:
        normalized = normalize_email(email)
        admin = db.scalar(select(Admin).where(Admin.email == normalized))
        if admin:
            admin.password_hash = hash_password(password)
            admin.active = True
        else:
            db.add(Admin(email=normalized, password_hash=hash_password(password)))
        db.commit()


def main() -> None:
    parser = argparse.ArgumentParser(description="TaraForge3D backend administration")
    subcommands = parser.add_subparsers(dest="command", required=True)
    create = subcommands.add_parser("create-admin")
    create.add_argument("email")
    create.add_argument("password", nargs="?", help="omit to enter it without exposing it in shell history")
    subcommands.add_parser("seed-defaults")
    args = parser.parse_args()
    if args.command == "create-admin":
        password = args.password or getpass.getpass("Administrator password: ")
        if len(password) < 12:
            parser.error("administrator password must contain at least 12 characters")
        create_admin(args.email, password)
    elif args.command == "seed-defaults":
        settings = get_settings()
        factory = create_session_factory(create_database_engine(settings.database_url))
        with factory() as db:
            seed_defaults(db)


if __name__ == "__main__":
    main()
