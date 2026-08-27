from alembic import op
import sqlalchemy as sa

revision = '002_add_timescaledb'
down_revision = '001_initial_migration'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE")
    
    op.execute("""
        SELECT create_hypertable(
            'social_posts',
            'posted_at',
            chunk_time_interval => INTERVAL '7 days',
            if_not_exists => TRUE
        )
    """)
    
    op.execute("""
        ALTER TABLE social_posts SET (
            timescaledb.compress,
            timescaledb.compress_segmentby = 'platform',
            timescaledb.compress_orderby = 'posted_at DESC'
        )
    """)
    
    op.execute("""
        SELECT add_compression_policy(
            'social_posts',
            compress_after => INTERVAL '30 days',
            if_not_exists => TRUE
        )
    """)
    
    op.execute("""
        SELECT add_retention_policy(
            'social_posts',
            drop_after => INTERVAL '180 days',
            if_not_exists => TRUE
        )
    """)
    
    op.execute("""
        CREATE MATERIALIZED VIEW IF NOT EXISTS daily_platform_stats
        WITH (timescaledb.continuous) AS
        SELECT
            time_bucket('1 day', posted_at) AS day,
            platform,
            COUNT(*) AS post_count,
            AVG(likes) AS avg_likes,
            AVG(comments) AS avg_comments,
            AVG(shares) AS avg_shares
        FROM social_posts
        WHERE is_active = true
        GROUP BY day, platform
        WITH NO DATA
    """)
    
    op.execute("""
        SELECT add_continuous_aggregate_policy(
            'daily_platform_stats',
            start_offset => INTERVAL '30 days',
            end_offset => INTERVAL '1 day',
            schedule_interval => INTERVAL '1 day',
            if_not_exists => TRUE
        )
    """)

def downgrade() -> None:
    op.execute("DROP MATERIALIZED VIEW IF EXISTS daily_platform_stats CASCADE")
    
    op.execute("SELECT remove_retention_policy('social_posts', if_exists => TRUE)")
    
    op.execute("SELECT remove_compression_policy('social_posts', if_exists => TRUE)")
    
    op.execute("ALTER TABLE social_posts SET (timescaledb.compress = false)")
    
    op.execute("SELECT create_hypertable('social_posts', 'posted_at', if_not_exists => FALSE)")