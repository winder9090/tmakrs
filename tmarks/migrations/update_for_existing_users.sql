ALTER TABLE user_preferences ADD COLUMN tag_layout TEXT NOT NULL DEFAULT 'grid';
ALTER TABLE user_preferences ADD COLUMN sort_by TEXT NOT NULL DEFAULT 'popular';
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_archived_created ON bookmarks(user_id, is_archived, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_archived_updated ON bookmarks(user_id, is_archived, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_archived_pinned_created ON bookmarks(user_id, is_archived, is_pinned DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_archived_pinned_updated ON bookmarks(user_id, is_archived, is_pinned DESC, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_archived_pinned_clicks ON bookmarks(user_id, is_archived, is_pinned DESC, click_count DESC, last_clicked_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_deleted_created ON bookmarks(user_id, deleted_at, created_at DESC) WHERE deleted_at IS NULL;

