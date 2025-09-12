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

