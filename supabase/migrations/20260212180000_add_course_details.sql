-- Add missing columns to cursos table to match frontend types
ALTER TABLE public.cursos 
ADD COLUMN asignatura TEXT,
ADD COLUMN semestre TEXT,
ADD COLUMN grupo TEXT,
ADD COLUMN fecha_inicio DATE,
ADD COLUMN fecha_fin DATE,
ADD COLUMN archivado BOOLEAN DEFAULT false;

-- Update existing rows (if any, though likely empty) to have defaults
UPDATE public.cursos 
SET 
  semestre = '2025-1',
  grupo = 'A',
  fecha_inicio = CURRENT_DATE,
  fecha_fin = CURRENT_DATE + INTERVAL '4 months',
  archivado = false
WHERE semestre IS NULL;
