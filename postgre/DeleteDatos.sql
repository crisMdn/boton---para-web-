DELETE FROM public.images;         -- borra filas
-- o
TRUNCATE TABLE public.images RESTART IDENTITY; --requiere permisos TRUNCATE, no dispara triggers 