DELETE FROM public.images;         --borra filas, fila por fila 
-- o
TRUNCATE TABLE public.images RESTART IDENTITY; --requiere permisos TRUNCATE, no dispara triggers, borra las filas rapido

