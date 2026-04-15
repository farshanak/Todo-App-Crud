"""add archived_at column for soft-delete

Revision ID: 0003_archived_at
Revises: 0002_timestamps
Create Date: 2026-04-15 00:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0003_archived_at"
down_revision: str | None = "0002_timestamps"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    with op.batch_alter_table("todos") as batch:
        batch.add_column(sa.Column("archived_at", sa.DateTime(), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table("todos") as batch:
        batch.drop_column("archived_at")
