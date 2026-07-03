"""Update embeddings vector dim to 768

Revision ID: b8462122de00
Revises: 83c6fa37a271
Create Date: 2026-07-02 10:42:36.978548

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b8462122de00'
down_revision: Union[str, Sequence[str], None] = '83c6fa37a271'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("ALTER TABLE embeddings ALTER COLUMN embedding TYPE vector(768);")


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("ALTER TABLE embeddings ALTER COLUMN embedding TYPE vector(384);")
