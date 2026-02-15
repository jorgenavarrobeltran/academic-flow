-- Create custom types
CREATE TYPE usuario_rol AS ENUM ('admin', 'docente', 'estudiante');
CREATE TYPE estado_asistencia AS ENUM ('presente', 'ausente', 'tarde', 'justificado');

-- Create profiles table (extends auth.users)
CREATE TABLE public.usuarios (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  rol usuario_rol DEFAULT 'estudiante',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" ON public.usuarios
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.usuarios
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.usuarios
  FOR UPDATE USING (auth.uid() = id);

-- Create courses table
CREATE TABLE public.cursos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  creditos INTEGER DEFAULT 3,
  docente_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  horario JSONB, -- stores schedule structure
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY;

-- Policies for courses
CREATE POLICY "Courses are viewable by everyone" ON public.cursos
  FOR SELECT USING (true);

CREATE POLICY "Teachers can insert courses" ON public.cursos
  FOR INSERT WITH CHECK (auth.uid() = docente_id);

CREATE POLICY "Teachers can update own courses" ON public.cursos
  FOR UPDATE USING (auth.uid() = docente_id);

-- Create enrollments table (many-to-many relationship)
CREATE TABLE public.inscripciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  curso_id UUID REFERENCES public.cursos(id) ON DELETE CASCADE,
  estudiante_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
  fecha_inscripcion TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(curso_id, estudiante_id)
);

-- Enable RLS
ALTER TABLE public.inscripciones ENABLE ROW LEVEL SECURITY;

-- Policies for enrollments
CREATE POLICY "Enrollments viewable by course members" ON public.inscripciones
  FOR SELECT USING (
    auth.uid() = estudiante_id OR 
    EXISTS (SELECT 1 FROM public.cursos WHERE id = curso_id AND docente_id = auth.uid())
  );

-- Create attendance table
CREATE TABLE public.asistencia (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  curso_id UUID REFERENCES public.cursos(id) ON DELETE CASCADE,
  estudiante_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  estado estado_asistencia DEFAULT 'presente',
  observacion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.asistencia ENABLE ROW LEVEL SECURITY;

-- Policies for attendance
CREATE POLICY "Attendance viewable by student and teacher" ON public.asistencia
  FOR SELECT USING (
    auth.uid() = estudiante_id OR 
    EXISTS (SELECT 1 FROM public.cursos WHERE id = curso_id AND docente_id = auth.uid())
  );

CREATE POLICY "Only teachers can manage attendance" ON public.asistencia
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.cursos WHERE id = curso_id AND docente_id = auth.uid())
  );

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, email, nombre, rol)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'nombre', (new.raw_user_meta_data->>'rol')::usuario_rol);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
