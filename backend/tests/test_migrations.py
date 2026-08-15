from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, inspect


def test_initial_migration_round_trip(tmp_path, monkeypatch):
    database_path = tmp_path / "migration.db"
    database_url = f"sqlite:///{database_path}"
    monkeypatch.setenv("DATABASE_URL", database_url)
    config = Config("alembic.ini")

    command.upgrade(config, "head")
    tables = set(inspect(create_engine(database_url)).get_table_names())
    assert {"admins", "clients", "submissions", "jobs", "slicer_runs"} <= tables

    command.downgrade(config, "base")
    tables_after_downgrade = set(inspect(create_engine(database_url)).get_table_names())
    assert not ({"admins", "clients", "submissions", "jobs"} & tables_after_downgrade)

    command.upgrade(config, "head")
    assert "submissions" in inspect(create_engine(database_url)).get_table_names()
