-- Add configuration column for groups
ALTER TABLE cursos ADD COLUMN IF NOT EXISTS configuracion_grupos JSONB DEFAULT '{"min": 2, "max": 4}';
