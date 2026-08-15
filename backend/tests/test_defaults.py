from sqlalchemy import func, select

from app.defaults import seed_defaults
from app.models import EmailTemplate, GalleryItem, SlicerProfile, StoreItem


def test_seed_defaults_is_idempotent(app):
    with app.state.session_factory() as db:
        seed_defaults(db)
        seed_defaults(db)
        profiles = db.scalars(select(SlicerProfile).order_by(SlicerProfile.material)).all()
        assert [profile.material for profile in profiles] == ["PETG", "PLA", "TPU"]
        assert db.scalar(select(func.count()).select_from(EmailTemplate)) == 1
        assert db.scalar(select(func.count()).select_from(GalleryItem)) == 6
        assert db.scalar(select(func.count()).select_from(StoreItem)) == 6
        assert db.get(EmailTemplate, "estimate").subject_template.startswith("3D Printing")
