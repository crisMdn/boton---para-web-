--ver las imagenes segun sus atributos 
SELECT id, filename, url, uploaded_at
FROM public.images
ORDER BY uploaded_at DESC;

--para contar cuantas imagenes tengo en la bs
SELECT COUNT(*) FROM public.images;

--para ver las ultimas 5
SELECT id, url, uploaded_at
FROM public.images
ORDER BY uploaded_at DESC
LIMIT 5;

-- Ver si está instalada en botton
SELECT * FROM pg_extension WHERE extname='pgcrypto';

-- Probar la función
SELECT gen_random_uuid();

-- ver tablas de imagenes
SELECT count(*) FROM images;

