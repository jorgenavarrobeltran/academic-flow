
-- Tabla de Calificaciones (simplificada para sistema de cortes)
-- Un registro por estudiante-curso con columnas para cada corte

CREATE TYPE corte_academico AS ENUM ('primer', 'segundo', 'tercer');

CREATE TABLE public.calificaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  curso_id UUID REFERENCES public.cursos(id) ON DELETE CASCADE,
  estudiante_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
  
  -- Corte 1 (30%)
  corte1_nota NUMERIC(3,1), -- 0.0 to 5.0
  corte1_observacion TEXT,
  
  -- Corte 2 (30%)
  corte2_nota NUMERIC(3,1),
  corte2_observacion TEXT,
  
  -- Corte 3 (40%)
  corte3_nota NUMERIC(3,1),
  corte3_observacion TEXT,
  
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(curso_id, estudiante_id)
);

-- RLS
ALTER TABLE public.calificaciones ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Grades viewable by student and teacher" ON public.calificaciones
  FOR SELECT USING (
    auth.uid() = estudiante_id OR 
    EXISTS (SELECT 1 FROM public.cursos WHERE id = curso_id AND docente_id = auth.uid())
  );

CREATE POLICY "Only teachers can manage grades" ON public.calificaciones
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.cursos WHERE id = curso_id AND docente_id = auth.uid())
  );
