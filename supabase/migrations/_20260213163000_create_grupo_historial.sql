-- Create table for tracking group membership changes
CREATE TABLE IF NOT EXISTS grupo_historial (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grupo_id TEXT REFERENCES grupos(id) ON DELETE SET NULL, -- If group is deleted, keep history but nullify reference? Or CASCADE? Usually history should be kept. Let's say SET NULL or just keep the ID as text if we want to preserve it strictly. But SET NULL is fine if we reference the table.
    curso_id TEXT REFERENCES cursos(id) ON DELETE CASCADE,
    estudiante_id TEXT REFERENCES usuarios(id) ON DELETE CASCADE,
    accion TEXT CHECK (accion IN ('creacion', 'unirse', 'salir', 'eliminacion', 'modificacion')),
    detalles JSONB DEFAULT '{}'::jsonb, -- Store previous values or specific notes
    responsable_id TEXT REFERENCES usuarios(id), -- User who performed the action
    fecha_registro TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE grupo_historial ENABLE ROW LEVEL SECURITY;

-- Add policies (Permissive for dev as per established pattern)
CREATE POLICY "Public Access Grupo Historial" ON grupo_historial FOR ALL USING (true);

-- Index for faster queries by course or student
CREATE INDEX idx_grupo_historial_curso_id ON grupo_historial(curso_id);
CREATE INDEX idx_grupo_historial_estudiante_id ON grupo_historial(estudiante_id);
