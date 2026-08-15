from collections.abc import Generator

from sqlalchemy import Engine, create_engine, event
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker


class Base(DeclarativeBase):
    pass


def create_database_engine(database_url: str) -> Engine:
    connect_args = {"check_same_thread": False, "timeout": 30} if database_url.startswith("sqlite") else {}
    engine = create_engine(database_url, connect_args=connect_args, pool_pre_ping=True)

    if database_url.startswith("sqlite"):
        @event.listens_for(engine, "connect")
        def configure_sqlite(dbapi_connection, _connection_record) -> None:
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.execute("PRAGMA journal_mode=WAL")
            cursor.execute("PRAGMA busy_timeout=30000")
            cursor.close()

    return engine


def create_session_factory(engine: Engine) -> sessionmaker[Session]:
    return sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def session_dependency(factory: sessionmaker[Session]):
    def get_db() -> Generator[Session, None, None]:
        with factory() as session:
            yield session

    return get_db
