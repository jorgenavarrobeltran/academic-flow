-- Add content and AI instructions columns to evaluaciones table
ALTER TABLE public.evaluaciones
ADD COLUMN IF NOT EXISTS contenido JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS instrucciones_ai TEXT,
ADD COLUMN IF NOT EXISTS tipo_generacion TEXT CHECK (tipo_generacion IN ('manual', 'ia')) DEFAULT 'manual';

-- Comment on columns
COMMENT ON COLUMN public.evaluaciones.contenido IS 'Stores the generated quiz content (questions, options, answers) as JSON';
COMMENT ON COLUMN public.evaluaciones.instrucciones_ai IS 'Stores the prompt/instructions used to generate the content via AI';
