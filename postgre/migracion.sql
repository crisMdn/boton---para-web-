--migracion por si se tenia el esquema anterior 
-- agrega columnas nuevas si hiciera falta
ALTER TABLE images ADD COLUMN IF NOT EXISTS key TEXT;
ALTER TABLE images ADD COLUMN IF NOT EXISTS mime TEXT;
ALTER TABLE images ADD COLUMN IF NOT EXISTS size_bytes INT;
ALTER TABLE images ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ;

-- migra filename -> key y uploaded_at -> created_at
UPDATE images
SET key = COALESCE(key, filename),
    created_at = COALESCE(created_at, uploaded_at, now());

-- (opcional) elimina columnas antiguas tras verificar
ALTER TABLE images DROP COLUMN IF EXISTS filename;
ALTER TABLE images DROP COLUMN IF EXISTS url;
ALTER TABLE images DROP COLUMN IF EXISTS uploaded_at;
