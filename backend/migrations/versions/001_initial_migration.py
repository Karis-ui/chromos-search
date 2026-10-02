from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB, TSVECTOR
import uuid

revision = '001_initial_migration'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"")
    op.execute("CREATE EXTENSION IF NOT EXISTS \"pg_trgm\"")
    op.execute("CREATE EXTENSION IF NOT EXISTS \"vector\"")
    op.execute("CREATE EXTENSION IF NOT EXISTS \"btree_gin\"")
    
    op.execute("""
        CREATE TYPE platform AS ENUM (
            'instagram', 'facebook', 'twitter', 'tiktok',
            'telegram', 'reddit', 'youtube', 'snapchat',
            'linkedin', 'pinterest', 'discord', 'whatsapp'
        )
    """)
    
    op.execute("""
        CREATE TYPE media_type AS ENUM (
            'image', 'video', 'voice', 'text',
            'gif', 'story', 'reel', 'livestream',
            'poll', 'article'
        )
    """)
    
    op.execute("""
        CREATE TYPE search_status AS ENUM (
            'pending', 'queued', 'processing',
            'completed', 'failed', 'partial',
            'cancelled', 'expired'
        )
    """)
    
    op.execute("""
        CREATE TYPE confidence_level AS ENUM (
            'high', 'medium', 'low', 'negative', 'unknown'
        )
    """)
    
    op.execute("""
        CREATE TYPE user_role AS ENUM (
            'user', 'premium', 'moderator',
            'admin', 'super_admin', 'system'
        )
    """)
    
    op.execute("""
        CREATE TYPE verification_status AS ENUM (
            'unverified', 'pending', 'verified',
            'rejected', 'suspended'
        )
    """)
    
    op.execute("""
        CREATE TYPE notification_type AS ENUM (
            'search_complete', 'new_match', 'system_alert',
            'premium_expiry', 'feedback_request'
        )
    """)
    
    op.create_table(
        'users',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('email', sa.String(255), nullable=False, unique=True),
        sa.Column('username', sa.String(100), nullable=False, unique=True),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('salt', sa.String(64)),
        sa.Column('full_name', sa.String(255)),
        sa.Column('avatar_url', sa.Text),
        sa.Column('bio', sa.Text),
        sa.Column('phone_number', sa.String(20)),
        sa.Column('is_active', sa.Boolean, server_default='true'),
        sa.Column('is_verified', sa.Boolean, server_default='false'),
        sa.Column('verification_token', sa.String(255)),
        sa.Column('verification_token_expires', sa.DateTime(timezone=True)),
        sa.Column('role', sa.Enum('user', 'premium', 'moderator', 'admin', 'super_admin', 'system', name='user_role'), server_default='user'),
        sa.Column('permissions', JSONB),
        sa.Column('is_premium', sa.Boolean, server_default='false'),
        sa.Column('premium_until', sa.DateTime(timezone=True)),
        sa.Column('premium_features', JSONB),
        sa.Column('rate_limit_override', sa.Integer),
        sa.Column('daily_search_limit', sa.Integer, server_default='50'),
        sa.Column('searches_today', sa.Integer, server_default='0'),
        sa.Column('last_search_reset', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('preferences', JSONB),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
        sa.Column('last_login_at', sa.DateTime(timezone=True)),
        sa.Column('last_seen_at', sa.DateTime(timezone=True)),
        sa.Column('deleted_at', sa.DateTime(timezone=True)),
        sa.CheckConstraint('searches_today >= 0', name='check_searches_nonnegative'),
    )
    
    op.create_table(
        'api_keys',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('user_id', UUID(as_uuid=True), nullable=False),
        sa.Column('key', sa.String(64), nullable=False, unique=True),
        sa.Column('key_hash', sa.String(64), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('description', sa.Text),
        sa.Column('scopes', JSONB),
        sa.Column('rate_limit', sa.Integer, server_default='100'),
        sa.Column('calls_today', sa.Integer, server_default='0'),
        sa.Column('last_call_reset', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('expires_at', sa.DateTime(timezone=True)),
        sa.Column('last_used_at', sa.DateTime(timezone=True)),
        sa.Column('is_active', sa.Boolean, server_default='true'),
        sa.Column('is_revoked', sa.Boolean, server_default='false'),
        sa.Column('revoked_at', sa.DateTime(timezone=True)),
        sa.Column('revoked_reason', sa.Text),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    )
    
    op.create_table(
        'social_posts',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('platform', sa.Enum('instagram', 'facebook', 'twitter', 'tiktok', 'telegram', 'reddit', 'youtube', 'snapchat', 'linkedin', 'pinterest', 'discord', 'whatsapp', name='platform'), nullable=False),
        sa.Column('external_id', sa.String(255), nullable=False),
        sa.Column('platform_url', sa.Text, nullable=False),
        sa.Column('posted_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('crawled_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
        sa.Column('indexed_at', sa.DateTime(timezone=True)),
        sa.Column('media_type', sa.Enum('image', 'video', 'voice', 'text', 'gif', 'story', 'reel', 'livestream', 'poll', 'article', name='media_type'), nullable=False),
        sa.Column('media_url', sa.Text),
        sa.Column('thumbnail_url', sa.Text),
        sa.Column('content', sa.Text),
        sa.Column('caption', sa.Text),
        sa.Column('hashtags', JSONB),
        sa.Column('mentions', JSONB),
        sa.Column('language', sa.String(10)),
        sa.Column('content_length', sa.Integer),
        sa.Column('face_embedding', JSONB),
        sa.Column('face_embeddings_multiple', JSONB),
        sa.Column('face_detection_count', sa.Integer, server_default='0'),
        sa.Column('voice_embedding', JSONB),
        sa.Column('voice_duration', sa.Float),
        sa.Column('author_username', sa.String(255)),
        sa.Column('author_full_name', sa.String(255)),
        sa.Column('author_id', sa.String(255)),
        sa.Column('author_profile_url', sa.Text),
        sa.Column('author_follower_count', sa.BigInteger),
        sa.Column('author_verified', sa.Boolean, server_default='false'),
        sa.Column('likes', sa.BigInteger, server_default='0'),
        sa.Column('shares', sa.BigInteger, server_default='0'),
        sa.Column('comments', sa.BigInteger, server_default='0'),
        sa.Column('views', sa.BigInteger, server_default='0'),
        sa.Column('engagement_rate', sa.Numeric(10, 4)),
        sa.Column('location', JSONB),
        sa.Column('location_geo', sa.String(255)),
        sa.Column('location_place_id', sa.String(255)),
        sa.Column('parent_post_id', UUID(as_uuid=True)),
        sa.Column('search_vector', TSVECTOR),
        sa.Column('keyword_weights', JSONB),
        sa.Column('is_active', sa.Boolean, server_default='true'),
        sa.Column('archived_at', sa.DateTime(timezone=True)),
        sa.Column('deleted_at', sa.DateTime(timezone=True)),
        sa.Column('metadata_json', JSONB),
        sa.Column('verified', sa.Boolean, server_default='false'),
        sa.Column('verified_by', UUID(as_uuid=True)),
        sa.Column('verified_at', sa.DateTime(timezone=True)),
        sa.ForeignKeyConstraint(['parent_post_id'], ['social_posts.id']),
        sa.UniqueConstraint('platform', 'external_id', name='uq_post_platform_external'),
    )
    
    op.create_table(
        'search_history',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('user_id', UUID(as_uuid=True), nullable=False),
        sa.Column('task_id', sa.String(255), nullable=False, unique=True),
        sa.Column('query_media_url', sa.Text),
        sa.Column('query_media_hash', sa.String(64)),
        sa.Column('query_media_type', sa.Enum('image', 'video', 'voice', 'text', 'gif', 'story', 'reel', 'livestream', 'poll', 'article', name='media_type')),
        sa.Column('query_text', sa.Text),
        sa.Column('time_range_days', sa.Integer, server_default='180'),
        sa.Column('platforms', JSONB),
        sa.Column('biometric_type', sa.String(50)),
        sa.Column('match_threshold', sa.Float, server_default='0.68'),
        sa.Column('max_results', sa.Integer, server_default='1000'),
        sa.Column('model_version', sa.String(50)),
        sa.Column('status', sa.Enum('pending', 'queued', 'processing', 'completed', 'failed', 'partial', 'cancelled', 'expired', name='search_status'), server_default='pending'),
        sa.Column('results_count', sa.Integer, server_default='0'),
        sa.Column('top_confidence', sa.Float),
        sa.Column('avg_confidence', sa.Float),
        sa.Column('started_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('completed_at', sa.DateTime(timezone=True)),
        sa.Column('duration_ms', sa.Integer),
        sa.Column('ip_address', sa.String(45)),
        sa.Column('user_agent', sa.Text),
        sa.Column('client_type', sa.String(50)),
        sa.Column('api_calls_made', sa.Integer, server_default='0'),
        sa.Column('tokens_used', sa.Integer, server_default='0'),
        sa.Column('estimated_cost', sa.Numeric(10, 6)),
        sa.Column('error_message', sa.Text),
        sa.Column('error_code', sa.String(50)),
        sa.Column('error_stack', sa.Text),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    )
    
    op.create_table(
        'search_results',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('task_id', sa.String(255), nullable=False),
        sa.Column('post_id', UUID(as_uuid=True), nullable=False),
        sa.Column('similarity_score', sa.Float, nullable=False),
        sa.Column('confidence_score', sa.Float, nullable=False),
        sa.Column('confidence_level', sa.Enum('high', 'medium', 'low', 'negative', 'unknown', name='confidence_level'), server_default='unknown'),
        sa.Column('method_used', sa.String(50)),
        sa.Column('face_match_score', sa.Float),
        sa.Column('voice_match_score', sa.Float),
        sa.Column('text_match_score', sa.Float),
        sa.Column('combined_score', sa.Float),
        sa.Column('rank_position', sa.Integer),
        sa.Column('rank_bucket', sa.String(20)),
        sa.Column('metadata_snapshot', JSONB),
        sa.Column('user_clicked', sa.Boolean, server_default='false'),
        sa.Column('user_clicked_at', sa.DateTime(timezone=True)),
        sa.Column('user_flagged', sa.Boolean, server_default='false'),
        sa.Column('user_flagged_at', sa.DateTime(timezone=True)),
        sa.Column('user_feedback_score', sa.Integer, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
        sa.ForeignKeyConstraint(['task_id'], ['search_history.task_id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['post_id'], ['social_posts.id'], ondelete='CASCADE'),
    )
    
    op.create_table(
        'user_feedback',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('user_id', UUID(as_uuid=True), nullable=False),
        sa.Column('result_id', UUID(as_uuid=True), nullable=False),
        sa.Column('is_match', sa.Boolean, nullable=False),
        sa.Column('confidence_correct', sa.Boolean),
        sa.Column('actual_similarity', sa.Float),
        sa.Column('rating', sa.Integer),
        sa.Column('feedback_text', sa.Text),
        sa.Column('feedback_category', sa.String(50)),
        sa.Column('feedback_tags', JSONB),
        sa.Column('used_for_training', sa.Boolean, server_default='false'),
        sa.Column('training_timestamp', sa.DateTime(timezone=True)),
        sa.Column('training_version', sa.String(50)),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
        sa.Column('user_agent', sa.Text),
        sa.Column('ip_address', sa.String(45)),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['result_id'], ['search_results.id'], ondelete='CASCADE'),
    )
    
    op.create_table(
        'notifications',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('user_id', UUID(as_uuid=True), nullable=False),
        sa.Column('type', sa.Enum('search_complete', 'new_match', 'system_alert', 'premium_expiry', 'feedback_request', name='notification_type'), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('message', sa.Text, nullable=False),
        sa.Column('data', JSONB),
        sa.Column('is_read', sa.Boolean, server_default='false'),
        sa.Column('is_sent', sa.Boolean, server_default='false'),
        sa.Column('is_delivered', sa.Boolean, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('read_at', sa.DateTime(timezone=True)),
        sa.Column('sent_at', sa.DateTime(timezone=True)),
        sa.Column('delivered_at', sa.DateTime(timezone=True)),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    )
    
    op.create_index('idx_users_email_active', 'users', ['email', 'is_active'])
    op.create_index('idx_users_username_active', 'users', ['username', 'is_active'])
    op.create_index('idx_users_role_active', 'users', ['role', 'is_active'])
    op.create_index('idx_users_premium_active', 'users', ['is_premium', 'premium_until'])
    
    op.create_index('idx_apikeys_user_active', 'api_keys', ['user_id', 'is_active'])
    op.create_index('idx_apikeys_key_hash', 'api_keys', ['key_hash'])
    op.create_index('idx_apikeys_expires_at', 'api_keys', ['expires_at'])
    
    op.create_index('idx_posts_platform_date', 'social_posts', ['platform', 'posted_at'], postgresql_using='brin')
    op.create_index('idx_posts_active_date', 'social_posts', ['posted_at'], postgresql_where="is_active = true")
    op.create_index('idx_posts_author_date', 'social_posts', ['author_id', 'posted_at'])
    op.create_index('idx_posts_face_embedding', 'social_posts', ['face_embedding'], postgresql_using='ivfflat')
    op.create_index('idx_posts_search_vector', 'social_posts', ['search_vector'], postgresql_using='gin')
    op.create_index('idx_posts_hashtags', 'social_posts', ['hashtags'], postgresql_using='gin')
    op.create_index('idx_posts_location_geo', 'social_posts', ['location_geo'])
    
    op.create_index('idx_search_user_date', 'search_history', ['user_id', 'started_at DESC'])
    op.create_index('idx_search_task_status', 'search_history', ['task_id', 'status'])
    op.create_index('idx_search_status_created', 'search_history', ['status', 'started_at'])
    
    op.create_index('idx_result_task_score', 'search_results', ['task_id', 'similarity_score DESC'])
    op.create_index('idx_result_post_task', 'search_results', ['post_id', 'task_id'])
    op.create_index('idx_result_confidence', 'search_results', ['confidence_score', 'confidence_level'])
    op.create_index('idx_result_created', 'search_results', ['created_at'])
    
    op.create_index('idx_feedback_user_created', 'user_feedback', ['user_id', 'created_at'])
    op.create_index('idx_feedback_result', 'user_feedback', ['result_id'])
    op.create_index('idx_feedback_match', 'user_feedback', ['is_match'])
    op.create_index('idx_feedback_training', 'user_feedback', ['used_for_training', 'training_version'])
    
    op.create_index('idx_notifications_user_read', 'notifications', ['user_id', 'is_read'])
    op.create_index('idx_notifications_created', 'notifications', ['created_at'])

def downgrade() -> None:
    op.drop_index('idx_notifications_created')
    op.drop_index('idx_notifications_user_read')
    op.drop_index('idx_feedback_training')
    op.drop_index('idx_feedback_match')
    op.drop_index('idx_feedback_result')
    op.drop_index('idx_feedback_user_created')
    op.drop_index('idx_result_created')
    op.drop_index('idx_result_confidence')
    op.drop_index('idx_result_post_task')
    op.drop_index('idx_result_task_score')
    op.drop_index('idx_search_status_created')
    op.drop_index('idx_search_task_status')
    op.drop_index('idx_search_user_date')
    op.drop_index('idx_posts_location_geo')
    op.drop_index('idx_posts_hashtags')
    op.drop_index('idx_posts_search_vector')
    op.drop_index('idx_posts_face_embedding')
    op.drop_index('idx_posts_author_date')
    op.drop_index('idx_posts_active_date')
    op.drop_index('idx_posts_platform_date')
    op.drop_index('idx_apikeys_expires_at')
    op.drop_index('idx_apikeys_key_hash')
    op.drop_index('idx_apikeys_user_active')
    op.drop_index('idx_users_premium_active')
    op.drop_index('idx_users_role_active')
    op.drop_index('idx_users_username_active')
    op.drop_index('idx_users_email_active')
    \
    op.drop_table('notifications')
    op.drop_table('user_feedback')
    op.drop_table('search_results')
    op.drop_table('search_history')
    op.drop_table('social_posts')
    op.drop_table('api_keys')
    op.drop_table('users')
    
    op.execute("DROP TYPE notification_type")
    op.execute("DROP TYPE verification_status")
    op.execute("DROP TYPE user_role")
    op.execute("DROP TYPE confidence_level")
    op.execute("DROP TYPE search_status")
    op.execute("DROP TYPE media_type")
    op.execute("DROP TYPE platform")
    
    op.execute("DROP EXTENSION IF EXISTS btree_gin CASCADE")
    op.execute("DROP EXTENSION IF EXISTS vector CASCADE")
    op.execute("DROP EXTENSION IF EXISTS pg_trgm CASCADE")
    op.execute("DROP EXTENSION IF EXISTS uuid-ossp CASCADE")