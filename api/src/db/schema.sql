-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  karma INTEGER DEFAULT 0,
  github_id TEXT,
  twitter_id TEXT,
  email TEXT UNIQUE,
  email_verified BOOLEAN DEFAULT 0,
  api_key TEXT UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_github_id ON users(github_id);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- Items (agents/skills) table
CREATE TABLE IF NOT EXISTS items (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  short_description TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK(type IN ('agent', 'skill')),
  category TEXT NOT NULL,
  tags TEXT DEFAULT '[]',
  author_id TEXT,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  rating_sum REAL DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  version TEXT DEFAULT '1.0.0',
  install_command TEXT,
  compatibility TEXT DEFAULT '{}',
  featured BOOLEAN DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK(status IN ('published', 'pending', 'draft', 'archived')),
  readme TEXT,
  icon_url TEXT,
  repo_url TEXT,
  demo_url TEXT,
  github_owner TEXT,
  github_repo TEXT,
  github_url TEXT,
  github_stars INTEGER DEFAULT 0,
  github_forks INTEGER DEFAULT 0,
  quality_score INTEGER DEFAULT 0,
  tutorials TEXT,        -- JSON array of {title, url, snippet}
  related_repos TEXT,    -- JSON array of github owner/repo strings
  scraped_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_items_slug ON items(slug);
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
CREATE INDEX IF NOT EXISTS idx_items_type ON items(type);
CREATE INDEX IF NOT EXISTS idx_items_author_id ON items(author_id);
CREATE INDEX IF NOT EXISTS idx_items_status_created ON items(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_items_featured ON items(featured) WHERE featured = 1;
CREATE INDEX IF NOT EXISTS idx_items_downloads ON items(downloads DESC);
CREATE INDEX IF NOT EXISTS idx_items_rating ON items(rating_sum DESC, rating_count DESC);

-- Votes table (up/down voting)
CREATE TABLE IF NOT EXISTS votes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  direction TEXT NOT NULL CHECK(direction IN ('up', 'down')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
  UNIQUE(user_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_item_id ON votes(item_id);

-- Ratings table (0-10 score)
CREATE TABLE IF NOT EXISTS ratings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  score INTEGER NOT NULL CHECK(score >= 0 AND score <= 10),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
  UNIQUE(user_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_item_id ON ratings(item_id);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  content TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reviews_item_id ON reviews(item_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- Comments/discussions table
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  parent_id TEXT,
  content TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_comments_item_id ON comments(item_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
  user_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, item_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);

-- Collections (curated lists) table
CREATE TABLE IF NOT EXISTS collections (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  curator_id TEXT NOT NULL,
  item_slugs TEXT DEFAULT '[]',
  upvotes INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (curator_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_collections_curator_id ON collections(curator_id);
CREATE INDEX IF NOT EXISTS idx_collections_slug ON collections(slug);

-- Usage reports table (for tracking real-world performance)
CREATE TABLE IF NOT EXISTS usage_reports (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  item_id TEXT NOT NULL,
  outcome TEXT NOT NULL CHECK(outcome IN ('success', 'failure')),
  duration_ms INTEGER,
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_usage_reports_item_id ON usage_reports(item_id);
CREATE INDEX IF NOT EXISTS idx_usage_reports_user_id ON usage_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_reports_outcome ON usage_reports(outcome);

-- API Keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  key_hash TEXT UNIQUE NOT NULL,
  prefix TEXT NOT NULL,
  last_used_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  revoked_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON api_keys(prefix);

-- FTS5 virtual table for full-text search
CREATE VIRTUAL TABLE IF NOT EXISTS items_fts USING fts5(
  title,
  short_description,
  description,
  tags,
  content='items',
  content_rowid='id'
);

-- Triggers to keep FTS5 in sync with items table
CREATE TRIGGER IF NOT EXISTS items_fts_insert AFTER INSERT ON items BEGIN
  INSERT INTO items_fts(rowid, title, short_description, description, tags)
  VALUES (new.id, new.title, new.short_description, new.description, new.tags);
END;

CREATE TRIGGER IF NOT EXISTS items_fts_update AFTER UPDATE ON items BEGIN
  UPDATE items_fts SET
    title = new.title,
    short_description = new.short_description,
    description = new.description,
    tags = new.tags
  WHERE rowid = new.id;
END;

CREATE TRIGGER IF NOT EXISTS items_fts_delete AFTER DELETE ON items BEGIN
  INSERT INTO items_fts(items_fts, rowid, title, short_description, description, tags)
  VALUES('delete', old.id, old.title, old.short_description, old.description, old.tags);
END;

-- Trigger to update items.updated_at on any update
CREATE TRIGGER IF NOT EXISTS items_update_timestamp AFTER UPDATE ON items
WHEN old.updated_at = NEW.updated_at
BEGIN
  UPDATE items SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS users_update_timestamp AFTER UPDATE ON users
WHEN old.updated_at = NEW.updated_at
BEGIN
  UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Scraper runs logging table
CREATE TABLE IF NOT EXISTS scraper_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  started_at TEXT NOT NULL,
  finished_at TEXT,
  queries_run INTEGER DEFAULT 0,
  repos_found INTEGER DEFAULT 0,
  validated INTEGER DEFAULT 0,
  rejected INTEGER DEFAULT 0,
  ingested INTEGER DEFAULT 0,
  updated INTEGER DEFAULT 0,
  errors INTEGER DEFAULT 0,
  duration_ms INTEGER
);

CREATE INDEX IF NOT EXISTS idx_scraper_runs_started_at ON scraper_runs(started_at DESC);

-- Discovery sources tracking table
CREATE TABLE IF NOT EXISTS discovery_sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id TEXT NOT NULL,
  source_type TEXT NOT NULL,  -- 'firecrawl_search', 'github_search', 'awesome_list', 'manual'
  source_query TEXT,
  source_url TEXT,
  discovered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_discovery_item ON discovery_sources(item_id);
CREATE INDEX IF NOT EXISTS idx_discovery_source_type ON discovery_sources(source_type);

-- Learning system tables (inspired by claude-mem's observation → summary pattern)

CREATE TABLE IF NOT EXISTS observations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,          -- 'search', 'search_miss', 'vote', 'install', 'usage_report', 'page_view'
  data TEXT NOT NULL,          -- JSON payload
  user_id TEXT,                -- nullable, for anonymous events
  processed INTEGER DEFAULT 0, -- 0 = pending, 1 = compressed into insight
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_obs_type_processed ON observations(type, processed);
CREATE INDEX IF NOT EXISTS idx_obs_created ON observations(created_at);

CREATE TABLE IF NOT EXISTS insights (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,          -- 'trending_queries', 'unmet_demand', 'vote_momentum', 'reliability_scores', 'category_trends'
  data TEXT NOT NULL,          -- JSON compressed insight
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_insights_type ON insights(type, created_at);
