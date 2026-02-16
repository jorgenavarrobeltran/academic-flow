-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (clean slate)
DROP TABLE IF EXISTS postulaciones CASCADE;
DROP TABLE IF EXISTS convocatorias CASCADE;
DROP TABLE IF EXISTS recursos CASCADE;
DROP TABLE IF EXISTS eventos CASCADE;
DROP TABLE IF EXISTS proyectos CASCADE;
DROP TABLE IF EXISTS grupos CASCADE;
DROP TABLE IF EXISTS calificaciones CASCADE;
DROP TABLE IF EXISTS asistencia CASCADE;
DROP TABLE IF EXISTS inscripciones CASCADE;
DROP TABLE IF EXISTS cursos CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- 1. Usuarios (Docentes y Estudiantes)
CREATE TABLE usuarios (
    id TEXT PRIMARY KEY, -- Using TEXT to match mock IDs (e.g., 'doc-001', 'est-001')
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    rol TEXT CHECK (rol IN ('docente', 'estudiante', 'admin')),
    codigo TEXT, -- Only for students
    programa TEXT,
    semestre INTEGER,
    promedio_acumulado FLOAT,
    especialidad TEXT, -- Only for teachers
    facultad TEXT,
    biografia TEXT,
    horario_atencion TEXT,
    foto_url TEXT,
    telefono TEXT,
    fecha_registro TIMESTAMPTZ DEFAULT NOW(),
    activo BOOLEAN DEFAULT TRUE
);

-- 2. Cursos
CREATE TABLE cursos (
    id TEXT PRIMARY KEY, -- e.g., 'cur-aisia'
    codigo TEXT NOT NULL,
    nombre TEXT NOT NULL,
    asignatura TEXT NOT NULL,
    semestre TEXT NOT NULL, -- '2026-1'
    grupo TEXT NOT NULL, -- 'A', 'B'
    docente_id TEXT REFERENCES usuarios(id),
    fecha_inicio DATE,
    fecha_fin DATE,
    dias_clase INTEGER[], -- Array of integers [1, 3]
    hora_inicio TEXT,
    hora_fin TEXT,
    aula TEXT,
    programa TEXT,
    configuracion_notas JSONB DEFAULT '{}'::jsonb, -- Store cortes and components usage
    activo BOOLEAN DEFAULT TRUE,
    archivado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Inscripciones (Join Table)
CREATE TABLE inscripciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    curso_id TEXT REFERENCES cursos(id) ON DELETE CASCADE,
    estudiante_id TEXT REFERENCES usuarios(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(curso_id, estudiante_id)
);

-- 4. Asistencia
CREATE TABLE asistencia (
    id TEXT PRIMARY KEY, -- e.g., 'asis-001'
    curso_id TEXT REFERENCES cursos(id) ON DELETE CASCADE,
    estudiante_id TEXT REFERENCES usuarios(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    estado TEXT CHECK (estado IN ('presente', 'ausente', 'tarde', 'justificado')),
    observacion TEXT,
    justificacion TEXT,
    soporte_url TEXT,
    aprobada BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Calificaciones (Sistema por Cortes)
CREATE TABLE calificaciones (
    id TEXT PRIMARY KEY, -- e.g., 'nota-001'
    curso_id TEXT REFERENCES cursos(id) ON DELETE CASCADE,
    estudiante_id TEXT REFERENCES usuarios(id) ON DELETE CASCADE,
    -- Corte 1
    corte1_nota FLOAT DEFAULT 0,
    corte1_observacion TEXT,
    -- Corte 2
    corte2_nota FLOAT DEFAULT 0,
    corte2_observacion TEXT,
    -- Corte 3
    corte3_nota FLOAT DEFAULT 0,
    corte3_observacion TEXT,
    
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(curso_id, estudiante_id)
);

-- 6. Grupos
CREATE TABLE grupos (
    id TEXT PRIMARY KEY,
    curso_id TEXT REFERENCES cursos(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    proyecto TEXT,
    nota_grupal FLOAT,
    integrantes TEXT[], -- Array of student IDs
    fecha_creacion DATE DEFAULT CURRENT_DATE
);

-- 7. Proyectos de Investigación
CREATE TABLE proyectos (
    id TEXT PRIMARY KEY,
    grupo_id TEXT REFERENCES grupos(id) ON DELETE CASCADE,
    curso_id TEXT REFERENCES cursos(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    etapa_actual TEXT,
    etapas JSONB DEFAULT '[]'::jsonb,
    avances JSONB DEFAULT '[]'::jsonb,
    fecha_inicio DATE,
    fecha_fin DATE
);

-- 8. Eventos (Calendario)
CREATE TABLE eventos (
    id TEXT PRIMARY KEY,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    fecha_inicio TIMESTAMPTZ NOT NULL,
    fecha_fin TIMESTAMPTZ,
    tipo TEXT,
    curso_id TEXT REFERENCES cursos(id) ON DELETE CASCADE,
    todo_el_dia BOOLEAN DEFAULT FALSE,
    alerta_enviada BOOLEAN DEFAULT FALSE
);

-- 9. Recursos Educativos
CREATE TABLE recursos (
    id TEXT PRIMARY KEY,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    tipo TEXT,
    url TEXT,
    duracion INTEGER,
    nivel TEXT,
    asignatura TEXT,
    unidad_tematica TEXT,
    tags TEXT[],
    obligatorio BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Convocatorias
CREATE TABLE convocatorias (
    id TEXT PRIMARY KEY,
    codigo TEXT,
    titulo TEXT NOT NULL,
    categoria TEXT,
    subcategoria TEXT,
    entidad_convocante TEXT,
    descripcion TEXT,
    requisitos TEXT[],
    beneficios TEXT,
    fecha_apertura DATE,
    fecha_cierre DATE,
    fecha_resultados DATE,
    duracion TEXT,
    competitividad TEXT,
    enlace_oficial TEXT,
    documentos_adjuntos TEXT[],
    programas_objetivo TEXT[],
    estado TEXT CHECK (estado IN ('activa', 'cerrada', 'proxima'))
);

-- Row Level Security (RLS) - Basic Setup
-- Enable RLS on all tables
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE asistencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE calificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE grupos ENABLE ROW LEVEL SECURITY;
ALTER TABLE proyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE recursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE convocatorias ENABLE ROW LEVEL SECURITY;

-- Policies (Permissive for development/demo, tighten for prod)
-- Allow public access for now to match current dev state without auth token complexity
CREATE POLICY "Public Access Usuarios" ON usuarios FOR ALL USING (true);
CREATE POLICY "Public Access Cursos" ON cursos FOR ALL USING (true);
CREATE POLICY "Public Access Inscripciones" ON inscripciones FOR ALL USING (true);
CREATE POLICY "Public Access Asistencia" ON asistencia FOR ALL USING (true);
CREATE POLICY "Public Access Calificaciones" ON calificaciones FOR ALL USING (true);
CREATE POLICY "Public Access Grupos" ON grupos FOR ALL USING (true);
CREATE POLICY "Public Access Proyectos" ON proyectos FOR ALL USING (true);
CREATE POLICY "Public Access Eventos" ON eventos FOR ALL USING (true);
CREATE POLICY "Public Access Recursos" ON recursos FOR ALL USING (true);
CREATE POLICY "Public Access Convocatorias" ON convocatorias FOR ALL USING (true);
