"""add position column for persistent sort order

Revision ID: 0004_position
Revises: 0003_archived_at
Create Date: 2026-04-15 00:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0004_position"
down_revision: str | None = "0003_archived_at"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    with op.batch_alter_table("todos") as batch:
        batch.add_column(sa.Column("position", sa.Integer(), nullable=False, server_default="0"))
    # Backfill existing rows so position matches current id order.
    op.execute(
        "UPDATE todos SET position = (SELECT COUNT(*) FROM todos AS t2 WHERE t2.id < todos.id)"
    )
    with op.batch_alter_table("todos") as batch:
        batch.alter_column("position", server_default=None)


def downgrade() -> None:
    with op.batch_alter_table("todos") as batch:
        batch.drop_column("position")
