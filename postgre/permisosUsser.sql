GRANT USAGE ON SCHEMA public TO canelito;
REVOKE ALL ON TABLE public.images FROM PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.images TO canelito;

-- dueño (opcional, recomendado)
ALTER TABLE public.images OWNER TO canelito;

-- futuros objetos en public con permisos por defecto
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO canelito;
