"""add managed public content

Revision ID: f51d7729c0b1
Revises: 422cbfa219d5
Create Date: 2026-08-15 15:20:00
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "f51d7729c0b1"
down_revision: str | None = "422cbfa219d5"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "gallery_items",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=160), nullable=False),
        sa.Column("category", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("tags_json", sa.Text(), nullable=False),
        sa.Column("image_url", sa.String(length=1000), nullable=True),
        sa.Column("gradient", sa.String(length=255), nullable=False),
        sa.Column("accent", sa.String(length=80), nullable=False),
        sa.Column("published", sa.Boolean(), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_gallery_items_category"), "gallery_items", ["category"])
    op.create_index(op.f("ix_gallery_items_published"), "gallery_items", ["published"])
    op.create_index(op.f("ix_gallery_items_sort_order"), "gallery_items", ["sort_order"])
    op.create_table(
        "store_items",
        sa.Column("id", sa.String(length=100), nullable=False),
        sa.Column("title", sa.String(length=160), nullable=False),
        sa.Column("category", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("price_paise", sa.Integer(), nullable=False),
        sa.Column("currency", sa.String(length=8), nullable=False),
        sa.Column("image_url", sa.String(length=1000), nullable=True),
        sa.Column("gradient", sa.String(length=255), nullable=False),
        sa.Column("accent", sa.String(length=80), nullable=False),
        sa.Column("badge", sa.String(length=80), nullable=True),
        sa.Column("published", sa.Boolean(), nullable=False),
        sa.Column("available", sa.Boolean(), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_store_items_category"), "store_items", ["category"])
    op.create_index(op.f("ix_store_items_published"), "store_items", ["published"])
    op.create_index(op.f("ix_store_items_sort_order"), "store_items", ["sort_order"])


def downgrade() -> None:
    op.drop_index(op.f("ix_store_items_sort_order"), table_name="store_items")
    op.drop_index(op.f("ix_store_items_published"), table_name="store_items")
    op.drop_index(op.f("ix_store_items_category"), table_name="store_items")
    op.drop_table("store_items")
    op.drop_index(op.f("ix_gallery_items_sort_order"), table_name="gallery_items")
    op.drop_index(op.f("ix_gallery_items_published"), table_name="gallery_items")
    op.drop_index(op.f("ix_gallery_items_category"), table_name="gallery_items")
    op.drop_table("gallery_items")
