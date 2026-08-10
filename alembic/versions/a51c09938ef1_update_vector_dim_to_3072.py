"""update_vector_dim_to_3072

Revision ID: a51c09938ef1
Revises: b8462122de00
Create Date: 2026-08-10 14:51:57.690737

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a51c09938ef1'
down_revision: Union[str, Sequence[str], None] = 'b8462122de00'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("ALTER TABLE embeddings ALTER COLUMN embedding TYPE vector(3072);")


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("ALTER TABLE embeddings ALTER COLUMN embedding TYPE vector(768);")
