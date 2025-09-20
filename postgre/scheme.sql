CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL,
  mime TEXT,
  size_bytes INT,
  created_at TIMESTAMPTZ DEFAULT now()
);