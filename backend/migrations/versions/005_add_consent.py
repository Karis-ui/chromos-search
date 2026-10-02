from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB

revision = '005_add_consent'
down_revision = '004_add_oauth'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'consent_profiles',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', UUID(as_uuid=True), nullable=False, unique=True),
        
        sa.Column('consent_given', sa.Boolean, nullable=False, server_default='false'),
        sa.Column('consent_version', sa.String(20), nullable=False, server_default='v1.0'),
        sa.Column('consent_given_at', sa.DateTime(timezone=True)),
        sa.Column('consent_ip_address', sa.String(45)),
        sa.Column('consent_user_agent', sa.Text),
        sa.Column('consent_signature', sa.String(255)),
        
        sa.Column('display_name', sa.String(255), nullable=False),
        sa.Column('bio', sa.Text),
        sa.Column('location', sa.String(255)),
        sa.Column('occupation', sa.String(255)),
        sa.Column('company', sa.String(255)),
        
        sa.Column('primary_face_embedding', JSONB),
        sa.Column('face_embeddings', JSONB, server_default='[]'),
        sa.Column('face_thumbnail_url', sa.Text),
        sa.Column('face_count', sa.Integer, server_default='0'),
        
        sa.Column('social_links', JSONB, server_default='{}'),
        
        sa.Column('contact_email', sa.String(255)),
        sa.Column('contact_phone', sa.String(20)),
        sa.Column('allow_direct_messages', sa.Boolean, server_default='true'),
        sa.Column('allow_email_contact', sa.Boolean, server_default='false'),
        sa.Column('allow_phone_contact', sa.Boolean, server_default='false'),
        
        sa.Column('is_active', sa.Boolean, nullable=False, server_default='true'),
        sa.Column('is_featured', sa.Boolean, server_default='false'),
        sa.Column('is_verified', sa.Boolean, server_default='false'),
        
        sa.Column('total_earnings', sa.Numeric(10, 2), server_default='0'),
        sa.Column('pending_earnings', sa.Numeric(10, 2), server_default='0'),
        sa.Column('lifetime_searches', sa.Integer, server_default='0'),
        sa.Column('monthly_searches', sa.Integer, server_default='0'),
        sa.Column('last_reward_at', sa.DateTime(timezone=True)),
        
        sa.Column('profile_views', sa.Integer, server_default='0'),
        sa.Column('search_appearances', sa.Integer, server_default='0'),
        sa.Column('click_throughs', sa.Integer, server_default='0'),
        
        sa.Column('revoked_at', sa.DateTime(timezone=True)),
        sa.Column('revocation_reason', sa.Text),
        sa.Column('revocation_ip', sa.String(45)),
        
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('last_searched_at', sa.DateTime(timezone=True)),
        
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    )
    
    op.create_index('idx_consent_active_given', 'consent_profiles', ['is_active', 'consent_given'])
    op.create_index('idx_consent_display_name', 'consent_profiles', ['display_name'])
    op.create_index('idx_consent_created', 'consent_profiles', ['created_at'])
    op.create_index('idx_consent_user', 'consent_profiles', ['user_id'])
    
    op.create_table(
        'consent_photos',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('profile_id', UUID(as_uuid=True), nullable=False),
        
        sa.Column('photo_url', sa.Text, nullable=False),
        sa.Column('thumbnail_url', sa.Text),
        sa.Column('photo_hash', sa.String(64)),
        sa.Column('file_size', sa.Integer),
        sa.Column('width', sa.Integer),
        sa.Column('height', sa.Integer),
        
        sa.Column('face_embedding', JSONB),
        sa.Column('face_bbox', JSONB),
        sa.Column('face_landmarks', JSONB),
        sa.Column('face_quality_score', sa.Float),
        sa.Column('face_confidence', sa.Float),
        
        sa.Column('is_primary', sa.Boolean, server_default='false'),
        sa.Column('is_active', sa.Boolean, server_default='true'),
        sa.Column('display_order', sa.Integer, server_default='0'),
        
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        
        sa.ForeignKeyConstraint(['profile_id'], ['consent_profiles.id'], ondelete='CASCADE'),
    )
    
    op.create_index('idx_consent_photo_profile_active', 'consent_photos', ['profile_id', 'is_active'])
    
    op.create_table(
        'consent_search_logs',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('profile_id', UUID(as_uuid=True), nullable=False),
        sa.Column('searcher_id', UUID(as_uuid=True)),
        sa.Column('search_task_id', sa.String(255)),
        
        sa.Column('similarity_score', sa.Float, nullable=False),
        sa.Column('confidence_level', sa.String(20)),
        sa.Column('rank_position', sa.Integer),
        
        sa.Column('reward_amount', sa.Numeric(10, 4), server_default='0'),
        sa.Column('reward_paid', sa.Boolean, server_default='false'),
        
        sa.Column('was_clicked', sa.Boolean, server_default='false'),
        sa.Column('was_contacted', sa.Boolean, server_default='false'),
        
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        
        sa.ForeignKeyConstraint(['profile_id'], ['consent_profiles.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['searcher_id'], ['users.id']),
    )
    
    op.create_index('idx_consent_log_profile_date', 'consent_search_logs', ['profile_id', 'created_at'])
    op.create_index('idx_consent_log_task', 'consent_search_logs', ['search_task_id'])
    
    op.create_table(
        'reward_ledger',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', UUID(as_uuid=True), nullable=False),
        sa.Column('profile_id', UUID(as_uuid=True)),
        
        sa.Column('amount', sa.Numeric(10, 4), nullable=False),
        sa.Column('reward_type', sa.String(50), nullable=False),
        sa.Column('description', sa.Text),
        
        sa.Column('status', sa.String(20), server_default='pending'),
        
        sa.Column('search_log_id', UUID(as_uuid=True)),
        
        sa.Column('paid_at', sa.DateTime(timezone=True)),
        sa.Column('payout_method', sa.String(50)),
        sa.Column('payout_reference', sa.String(255)),
        
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['profile_id'], ['consent_profiles.id']),
        sa.ForeignKeyConstraint(['search_log_id'], ['consent_search_logs.id']),
    )
    
    op.create_index('idx_reward_user_status', 'reward_ledger', ['user_id', 'status'])
    op.create_index('idx_reward_created', 'reward_ledger', ['created_at'])


def downgrade() -> None:
    op.drop_table('reward_ledger')
    op.drop_table('consent_search_logs')
    op.drop_table('consent_photos')
    op.drop_table('consent_profiles')