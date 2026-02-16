-- Migration to add research profile links to usuarios table
ALTER TABLE public.usuarios 
ADD COLUMN IF NOT EXISTS orcid_url TEXT,
ADD COLUMN IF NOT EXISTS google_scholar_url TEXT,
ADD COLUMN IF NOT EXISTS cvlac_url TEXT,
ADD COLUMN IF NOT EXISTS mendeley_url TEXT,
ADD COLUMN IF NOT EXISTS researchgate_url TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

-- Optional: Comment on columns
COMMENT ON COLUMN public.usuarios.orcid_url IS 'Perfil ORCID del estudiante';
COMMENT ON COLUMN public.usuarios.google_scholar_url IS 'Perfil de Google Académico';
COMMENT ON COLUMN public.usuarios.cvlac_url IS 'Enlace al CvLAC en MinCiencias';
