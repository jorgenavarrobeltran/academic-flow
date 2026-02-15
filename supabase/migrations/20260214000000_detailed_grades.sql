-- Tabla para definir las actividades evaluativas de cada corte
-- Fixed: curso_id is TEXT in main schema, not UUID.
CREATE TABLE public.evaluaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  curso_id TEXT REFERENCES public.cursos(id) ON DELETE CASCADE,
  corte INTEGER NOT NULL CHECK (corte BETWEEN 1 AND 3),
  nombre TEXT NOT NULL,
  porcentaje NUMERIC(5,2) NOT NULL CHECK (porcentaje >= 0 AND porcentaje <= 100),
  es_grupal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla para almacenar las notas de estas actividades específicas
CREATE TABLE public.notas_actividades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  evaluacion_id UUID REFERENCES public.evaluaciones(id) ON DELETE CASCADE,
  estudiante_id TEXT REFERENCES public.usuarios(id) ON DELETE CASCADE,
  valor NUMERIC(3,1) CHECK (valor >= 0.0 AND valor <= 5.0),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(evaluacion_id, estudiante_id)
);

-- RLS Policies
ALTER TABLE public.evaluaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notas_actividades ENABLE ROW LEVEL SECURITY;

-- Evaluaciones policies
CREATE POLICY "Public evaluations for course members" ON public.evaluaciones
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.inscripciones WHERE curso_id = evaluaciones.curso_id AND estudiante_id = auth.uid()::text) OR
    EXISTS (SELECT 1 FROM public.cursos WHERE id = evaluaciones.curso_id AND docente_id = auth.uid()::text)
  );

CREATE POLICY "Teachers manage evaluations" ON public.evaluaciones
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.cursos WHERE id = curso_id AND docente_id = auth.uid()::text)
  );

-- Notas Actividades policies
CREATE POLICY "Students see own grades" ON public.notas_actividades
  FOR SELECT USING (
    estudiante_id = auth.uid()::text OR
    EXISTS (SELECT 1 FROM public.evaluaciones e 
            JOIN public.cursos c ON c.id = e.curso_id 
            WHERE e.id = notas_actividades.evaluacion_id AND c.docente_id = auth.uid()::text)
  );

CREATE POLICY "Teachers manage grades" ON public.notas_actividades
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.evaluaciones e 
            JOIN public.cursos c ON c.id = e.curso_id 
            WHERE e.id = notas_actividades.evaluacion_id AND c.docente_id = auth.uid()::text)
  );

-- OPEN policies for dev (to match existing permissive state)
CREATE POLICY "Public Access Evaluaciones" ON public.evaluaciones FOR ALL USING (true);
CREATE POLICY "Public Access Notas Actividades" ON public.notas_actividades FOR ALL USING (true);
