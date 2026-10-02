from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB

revision = '004_add_oauth'
down_revision = '003_add_indexes'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.add_column('users', sa.Column('oauth_google_id', sa.String(255), nullable=True))
    op.add_column('users', sa.Column('oauth_github_id', sa.String(255), nullable=True))
    op.add_column('users', sa.Column('oauth_microsoft_id', sa.String(255), nullable=True))
    op.add_column('users', sa.Column('oauth_providers', JSONB, server_default='[]'))
    op.add_column('users', sa.Column('oauth_last_login', sa.String(50), nullable=True))
    op.add_column('users', sa.Column('oauth_profile_data', JSONB, server_default='{}'))
    op.add_column('users', sa.Column('has_password', sa.Boolean, server_default='true'))
    op.add_column('users', sa.Column('is_oauth_only', sa.Boolean, server_default='false'))
    
    op.create_index('idx_users_oauth_google_id', 'users', ['oauth_google_id'], unique=True, postgresql_where=sa.text("oauth_google_id IS NOT NULL"))
    op.create_index('idx_users_oauth_github_id', 'users', ['oauth_github_id'], unique=True, postgresql_where=sa.text("oauth_github_id IS NOT NULL"))
    
    op.create_table(
        'oauth_accounts',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', UUID(as_uuid=True), nullable=False),
        sa.Column('provider', sa.String(50), nullable=False),
        sa.Column('provider_user_id', sa.String(255), nullable=False),
        sa.Column('provider_email', sa.String(255), nullable=False),
        sa.Column('provider_username', sa.String(255), nullable=True),
        sa.Column('access_token', sa.Text, nullable=True),
        sa.Column('refresh_token', sa.Text, nullable=True),
        sa.Column('token_expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('scope', sa.Text, nullable=True),
        sa.Column('profile_data', JSONB, server_default='{}'),
        sa.Column('is_active', sa.Boolean, server_default='true'),
        sa.Column('last_used_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.UniqueConstraint('provider', 'provider_user_id', name='uq_oauth_provider_user'),
    )
    
    op.create_index('idx_oauth_user_provider', 'oauth_accounts', ['user_id', 'provider'])
    op.create_index('idx_oauth_active', 'oauth_accounts', ['is_active', 'provider'])
    op.create_index('idx_oauth_provider_user', 'oauth_accounts', ['provider', 'provider_user_id'])
    
    op.create_table(
        'oauth_states',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('state', sa.String(255), nullable=False, unique=True),
        sa.Column('provider', sa.String(50), nullable=False),
        sa.Column('redirect_uri', sa.Text, nullable=True),
        sa.Column('ip_address', sa.String(45), nullable=True),
        sa.Column('user_agent', sa.Text, nullable=True),
        sa.Column('link_user_id', UUID(as_uuid=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('used_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['link_user_id'], ['users.id'], ondelete='SET NULL'),
    )
    
    op.create_index('idx_oauth_state_expires', 'oauth_states', ['expires_at'])
    op.create_index('idx_oauth_state_provider', 'oauth_states', ['provider'])

def downgrade() -> None:
    op.drop_table('oauth_states')
    op.drop_table('oauth_accounts')
    
    op.drop_index('idx_users_oauth_github_id')
    op.drop_index('idx_users_oauth_google_id')
    
    op.drop_column('users', 'is_oauth_only')
    op.drop_column('users', 'has_password')
    op.drop_column('users', 'oauth_profile_data')
    op.drop_column('users', 'oauth_last_login')
    op.drop_column('users', 'oauth_providers')
    op.drop_column('users', 'oauth_microsoft_id')
    op.drop_column('users', 'oauth_github_id')
    op.drop_column('users', 'oauth_google_id')