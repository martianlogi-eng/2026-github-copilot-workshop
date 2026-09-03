-- Bookmark feature for Procurement MVP workshop
-- Stores one row per user + bookmarked item (PR, PO, or GR).
-- The workshop baseline has no users table, so the current user is stored as a
-- plain identifier sent by the client through the `x-user-id` request header.

CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY,
  user_id VARCHAR(120) NOT NULL,
  item_type VARCHAR(3) NOT NULL CHECK (item_type IN ('PR', 'PO', 'GR')),
  item_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, item_type, item_id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_item ON bookmarks(item_type, item_id);
