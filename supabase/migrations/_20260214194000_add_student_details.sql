-- Migration to add student profile details to usuarios table
ALTER TABLE public.usuarios 
ADD COLUMN IF NOT EXISTS es_homologante BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ha_visto_clase_antes BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE,
ADD COLUMN IF NOT EXISTS genero TEXT,
ADD COLUMN IF NOT EXISTS documento_identidad TEXT,
ADD COLUMN IF NOT EXISTS celular TEXT;

-- Optional: Comment on columns
COMMENT ON COLUMN public.usuarios.es_homologante IS 'Indica si el estudiante tiene homologación de materias';
COMMENT ON COLUMN public.usuarios.ha_visto_clase_antes IS 'Indica si el estudiante ha sido alumno del profesor anteriormente';
