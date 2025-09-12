-- Ver si está instalada en botton
SELECT * FROM pg_extension WHERE extname='pgcrypto';

-- Probar la función
SELECT gen_random_uuid();

-- ver tablas de imagenes
SELECT count(*) FROM images;
