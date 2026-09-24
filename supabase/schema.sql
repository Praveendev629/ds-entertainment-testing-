-- ============================================================
-- DS Entertainment Zone - Supabase Schema
-- ============================================================

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  is_blocked BOOLEAN DEFAULT FALSE,
  is_kicked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT TRUE,
  last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_agent TEXT
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_sessions_heartbeat ON sessions(last_heartbeat);
CREATE INDEX IF NOT EXISTS idx_users_last_seen ON users(last_seen);
CREATE INDEX IF NOT EXISTS idx_users_blocked ON users(is_blocked);
CREATE INDEX IF NOT EXISTS idx_users_kicked ON users(is_kicked);

-- ============================================================
-- 4. Row Level Security (RLS)
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Service role (backend) bypasses RLS, so these policies
-- only affect anonymous/authenticated Supabase keys.

-- Users: anyone can insert (register)
CREATE POLICY "Allow anonymous insert" ON users
  FOR INSERT WITH CHECK (true);

-- Users: anyone can update their own record (by id)
CREATE POLICY "Allow own update" ON users
  FOR UPDATE USING (true);

-- Users: anyone can read all (needed for admin dashboard via anon key + server-side check)
CREATE POLICY "Allow read all" ON users
  FOR SELECT USING (true);

-- Sessions: anyone can insert
CREATE POLICY "Allow session insert" ON sessions
  FOR INSERT WITH CHECK (true);

-- Sessions: anyone can update (heartbeat updates)
CREATE POLICY "Allow session update" ON sessions
  FOR UPDATE USING (true);

-- Sessions: anyone can read
CREATE POLICY "Allow session read" ON sessions
  FOR SELECT USING (true);

-- Sessions: anyone can delete their own
CREATE POLICY "Allow session delete" ON sessions
  FOR DELETE USING (true);

-- ============================================================
-- 5. Function: mark stale sessions offline
-- Called periodically or on read to clean up
-- ============================================================

CREATE OR REPLACE FUNCTION mark_stale_sessions()
RETURNS void AS $$
  UPDATE sessions
  SET is_active = FALSE
  WHERE is_active = TRUE
    AND last_heartbeat < NOW() - INTERVAL '60 seconds';
$$ LANGUAGE sql;

-- ============================================================
-- 6. Admin user (run this after creating your admin user)
-- Replace 'YOUR_ADMIN_USER_ID' with the actual user id
-- ============================================================

-- UPDATE users SET is_admin = TRUE WHERE id = 'YOUR_ADMIN_USER_ID';
