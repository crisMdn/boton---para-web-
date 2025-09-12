-- (como superusuario: postgres)
GRANT USAGE ON SCHEMA public TO canelito;              -- permitir usar el schema
REVOKE ALL ON TABLE public.images FROM PUBLIC;         -- limpiar permisos abiertos
GRANT SELECT, INSERT ON TABLE public.images TO canelito;  -- solo lo necesario
GRANT UPDATE, DELETE ON TABLE public.images TO canelito; --editar y borrar desde la app



