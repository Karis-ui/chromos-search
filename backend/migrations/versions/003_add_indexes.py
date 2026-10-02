from alembic import op
import sqlalchemy as sa

revision = '003_add_indexes'
down_revision = '002_add_timescaledb'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.execute("""
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_platform_date_active
        ON social_posts (platform, posted_at DESC)
        WHERE is_active = true
    """)
    
    op.execute("""
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_author_username
        ON social_posts (author_username)
        WHERE is_active = true
    """)
    
    op.execute("""
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_hashtags_gin
        ON social_posts USING gin (hashtags jsonb_path_ops)
    """)
    
    op.execute("""
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_location_geo_btree
        ON social_posts (location_geo)
        WHERE location_geo IS NOT NULL
    """)
    
    op.execute("""
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_engagement
        ON social_posts (likes DESC, comments DESC, shares DESC)
        WHERE is_active = true
    """)
    
    op.execute("""
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_result_confidence_score
        ON search_results (confidence_score DESC, created_at DESC)
    """)
    
    op.execute("""
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_result_task_rank
        ON search_results (task_id, rank_position)
    """)
    
    op.execute("""
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_search_user_status
        ON search_history (user_id, status)
    """)
    
    op.execute("""
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_active_premium
        ON users (is_premium, premium_until)
        WHERE is_active = true
    """)
    
    
    op.execute("""
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_fts
        ON social_posts USING gin (to_tsvector('english', coalesce(caption, '') || ' ' || coalesce(content, '')))
    """)

def downgrade() -> None:
    op.execute("DROP INDEX CONCURRENTLY IF EXISTS idx_posts_fts")
    op.execute("DROP INDEX CONCURRENTLY IF EXISTS idx_users_active_premium")
    op.execute("DROP INDEX CONCURRENTLY IF EXISTS idx_search_user_status")
    op.execute("DROP INDEX CONCURRENTLY IF EXISTS idx_result_task_rank")
    op.execute("DROP INDEX CONCURRENTLY IF EXISTS idx_result_confidence_score")
    op.execute("DROP INDEX CONCURRENTLY IF EXISTS idx_posts_engagement")
    op.execute("DROP INDEX CONCURRENTLY IF EXISTS idx_posts_location_geo_btree")
    op.execute("DROP INDEX CONCURRENTLY IF EXISTS idx_posts_hashtags_gin")
    op.execute("DROP INDEX CONCURRENTLY IF EXISTS idx_posts_author_username")
    op.execute("DROP INDEX CONCURRENTLY IF EXISTS idx_posts_platform_date_active")