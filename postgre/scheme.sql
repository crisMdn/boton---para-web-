CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);