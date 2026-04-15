"""add created_at / updated_at to todos

Revision ID: 0002_timestamps
Revises: 0001_initial
Create Date: 2026-04-15 00:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0002_timestamps"
down_revision: str | None = "0001_initial"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    with op.batch_alter_table("todos") as batch:
        batch.add_column(
            sa.Column(
                "created_at",
                sa.DateTime(),
                nullable=False,
                server_default=sa.func.now(),
            )
        )
        batch.add_column(
            sa.Column(
                "updated_at",
                sa.DateTime(),
                nullable=False,
                server_default=sa.func.now(),
            )
        )


def downgrade() -> None:
    with op.batch_alter_table("todos") as batch:
        batch.drop_column("updated_at")
        batch.drop_column("created_at")
