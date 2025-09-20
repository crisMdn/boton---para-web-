CREATE INDEX IF NOT EXISTS idx_images_created_at ON images (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_images_key_prefix ON images (key text_pattern_ops);
