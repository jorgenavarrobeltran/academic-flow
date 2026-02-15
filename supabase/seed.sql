-- Semillas de datos (Seed Data) para AcademicFlow Pro

-- 1. Usuarios (Docentes)
INSERT INTO usuarios (id, nombre, apellido, email, rol, especialidad, facultad, biografia, horario_atencion, foto_url)
VALUES 
('doc-001', 'Jorge Armando', 'Navarro Beltran', 'jnavar-05@hotmail.com', 'docente', 'Ing. Industrial, Magister en Salud Pública', 'Facultad de Ingenierías', 'Docente con amplia experiencia en sector salud e industrial.', 'Martes y Jueves de 2:00 PM a 5:00 PM', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'),
('docente-demo', 'Jorge Armando', 'Navarro Beltran', 'demo@cul.edu.co', 'docente', 'Ing. Industrial, Magister en Salud Pública', 'Facultad de Ingenierías', 'Usuario de demostración', 'N/A', NULL);

-- 1. Usuarios (Estudiantes)
INSERT INTO usuarios (id, nombre, apellido, email, rol, codigo, programa, semestre, promedio_acumulado, foto_url)
VALUES
('est-001', 'María', 'González Pérez', 'm.gonzalez@cul.edu.co', 'estudiante', '202301234', 'Ingeniería Industrial', 7, 4.2, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face'),
('est-002', 'Juan', 'Pérez López', 'j.perez@cul.edu.co', 'estudiante', '202301567', 'Ingeniería de Sistemas', 5, 3.8, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'),
('est-003', 'Ana', 'Martínez Silva', 'a.martinez@cul.edu.co', 'estudiante', '202302891', 'Contaduría Pública', 6, 4.5, 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'),
('est-004', 'Carlos', 'Sánchez Torres', 'c.sanchez@cul.edu.co', 'estudiante', '202203456', 'Ingeniería Industrial', 7, 3.2, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'),
('est-005', 'Laura', 'Díaz Ramírez', 'l.diaz@cul.edu.co', 'estudiante', '202304123', 'Ingeniería de Sistemas', 5, 4.7, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face'),
('est-006', 'Pedro', 'Gómez Castro', 'p.gomez@cul.edu.co', 'estudiante', '202205789', 'Contaduría Pública', 8, 2.9, 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face'),
('est-007', 'Sofía', 'Hernández Ruiz', 's.hernandez@cul.edu.co', 'estudiante', '202306567', 'Ingeniería Industrial', 5, 4.0, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'),
('est-008', 'Diego', 'López Mendoza', 'd.lopez@cul.edu.co', 'estudiante', '202107234', 'Ingeniería de Sistemas', 9, 3.5, 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face');

-- 2. Cursos
INSERT INTO cursos (id, codigo, nombre, asignatura, semestre, grupo, docente_id, aula, programa, dias_clase, hora_inicio, hora_fin, fecha_inicio, fecha_fin, configuracion_notas)
VALUES
('cur-aisia', 'AISIA', 'Formación del Espíritu Científico - AISIA', 'Formación del Espíritu Científico', '2026-1', 'A', 'doc-001', 'A313', 'Ingeniería de Sistemas', '{1}', '08:00', '09:30', '2026-02-02', '2026-05-30', '{"cortes": [{"numero": 1, "porcentaje": 30}, {"numero": 2, "porcentaje": 30}, {"numero": 3, "porcentaje": 40}]}'),
('cur-zisia', 'ZISIA', 'Formación del Espíritu Científico - ZISIA', 'Formación del Espíritu Científico', '2026-1', 'B', 'doc-001', 'B107', 'Ingeniería de Sistemas', '{1}', '19:00', '20:30', '2026-02-02', '2026-05-30', '{"cortes": [{"numero": 1, "porcentaje": 30}, {"numero": 2, "porcentaje": 30}, {"numero": 3, "porcentaje": 40}]}'),
('cur-ziindia', 'ZIINDIA', 'Formación del Espíritu Científico - ZIINDIA', 'Formación del Espíritu Científico', '2026-1', 'C', 'doc-001', 'B408', 'Ingeniería Industrial', '{2}', '19:00', '20:30', '2026-02-02', '2026-05-30', '{"cortes": [{"numero": 1, "porcentaje": 30}, {"numero": 2, "porcentaje": 30}, {"numero": 3, "porcentaje": 40}]}'),
('cur-aisvb', 'AISVB', 'Metodología de la Investigación - AISVB', 'Metodología de la Investigación', '2026-1', 'A', 'doc-001', 'B403', NULL, '{3}', '08:00', '09:30', '2026-02-02', '2026-05-30', '{"cortes": [{"numero": 1, "porcentaje": 30}, {"numero": 2, "porcentaje": 30}, {"numero": 3, "porcentaje": 40}]}'),
('cur-zcpixa', 'ZCPIXA', 'Proyecto de Investigación - ZCPIXA', 'Proyecto de Investigación', '2026-1', 'A', 'doc-001', 'A211', NULL, '{3}', '18:15', '19:45', '2026-02-02', '2026-05-30', '{"cortes": [{"numero": 1, "porcentaje": 30}, {"numero": 2, "porcentaje": 30}, {"numero": 3, "porcentaje": 40}]}'),
('cur-zcpva', 'ZCPVA', 'Seminario de Investigación - ZCPVA', 'Seminario de Investigación', '2026-1', 'A', 'doc-001', 'E102', NULL, '{3}', '19:45', '21:15', '2026-02-02', '2026-05-30', '{"cortes": [{"numero": 1, "porcentaje": 30}, {"numero": 2, "porcentaje": 30}, {"numero": 3, "porcentaje": 40}]}'),
('cur-zcpvtia', 'ZCPVTIA', 'Anteproyecto - ZCPVTIA', 'Anteproyecto', '2026-1', 'A', 'doc-001', 'B404', NULL, '{4}', '19:45', '21:15', '2026-02-02', '2026-05-30', '{"cortes": [{"numero": 1, "porcentaje": 30}, {"numero": 2, "porcentaje": 30}, {"numero": 3, "porcentaje": 40}]}'),
('cur-aiindiia', 'AIINDIIA', 'Metodología de la Investigación - AIINDIIA', 'Metodología de la Investigación', '2026-1', 'B', 'doc-001', 'A213', 'Ingeniería Industrial', '{5}', '07:15', '08:45', '2026-02-02', '2026-05-30', '{"cortes": [{"numero": 1, "porcentaje": 30}, {"numero": 2, "porcentaje": 30}, {"numero": 3, "porcentaje": 40}]}');

-- 3. Inscripciones
INSERT INTO inscripciones (curso_id, estudiante_id) VALUES
('cur-aisia', 'est-001'), ('cur-aisia', 'est-002'), ('cur-aisia', 'est-005'),
('cur-zisia', 'est-003'), ('cur-zisia', 'est-004'), ('cur-zisia', 'est-006'),
('cur-ziindia', 'est-004'), ('cur-ziindia', 'est-007'), ('cur-ziindia', 'est-008'),
('cur-aisvb', 'est-001'), ('cur-aisvb', 'est-002'), ('cur-aisvb', 'est-003'), ('cur-aisvb', 'est-005'),
('cur-zcpixa', 'est-006'), ('cur-zcpixa', 'est-007'), ('cur-zcpixa', 'est-008'),
('cur-zcpva', 'est-001'), ('cur-zcpva', 'est-004'), ('cur-zcpva', 'est-007'),
('cur-zcpvtia', 'est-002'), ('cur-zcpvtia', 'est-005'), ('cur-zcpvtia', 'est-006'), ('cur-zcpvtia', 'est-008'),
('cur-aiindiia', 'est-003'), ('cur-aiindiia', 'est-004'), ('cur-aiindiia', 'est-007'), ('cur-aiindiia', 'est-008');

-- 4. Asistencia
INSERT INTO asistencia (id, estudiante_id, curso_id, fecha, estado) VALUES
('asis-001', 'est-001', 'cur-aisia', '2026-02-02', 'presente'),
('asis-002', 'est-002', 'cur-aisia', '2026-02-02', 'presente'),
('asis-003', 'est-005', 'cur-aisia', '2026-02-02', 'tarde'),
('asis-004', 'est-001', 'cur-aisia', '2026-02-09', 'presente'),
('asis-005', 'est-002', 'cur-aisia', '2026-02-09', 'ausente'),
('asis-006', 'est-005', 'cur-aisia', '2026-02-09', 'presente'),
('asis-007', 'est-004', 'cur-ziindia', '2026-02-03', 'presente'),
('asis-008', 'est-007', 'cur-ziindia', '2026-02-03', 'presente'),
('asis-009', 'est-008', 'cur-ziindia', '2026-02-03', 'ausente');

-- 5. Calificaciones (Aggregated per Mock Data averages/estimates)
INSERT INTO calificaciones (id, estudiante_id, curso_id, corte1_nota, corte1_observacion) VALUES
('cal-001', 'est-001', 'cur-aisia', 4.5, 'Buen desempeño'),
('cal-002', 'est-002', 'cur-aisia', 3.8, 'Puede mejorar'),
('cal-003', 'est-003', 'cur-aisia', 4.7, 'Excelente'),
('cal-004', 'est-004', 'cur-aisia', 2.8, 'Riesgo académico'),
('cal-005', 'est-006', 'cur-aisia', 2.7, 'Necesita refuerzo');

-- 6. Grupos
INSERT INTO grupos (id, curso_id, nombre, descripcion, proyecto, nota_grupal, integrantes, fecha_creacion) VALUES
('grp-001', 'cur-aisia', 'Los Optimizadores', 'Grupo enfocado en optimización', 'Optimización de rutas', 4.2, '{est-001, est-003, est-007}', '2025-02-05'),
('grp-002', 'cur-aisia', 'DataScience CUL', 'Análisis de datos', 'Impacto de la IA', 4.5, '{est-002, est-005}', '2025-02-06');

-- 7. Proyectos (Simple Mock)
INSERT INTO proyectos (id, grupo_id, curso_id, titulo, etapa_actual, fecha_inicio) VALUES
('proj-001', 'grp-001', 'cur-aisia', 'Optimización de rutas de última milla', 'marco_teorico', '2025-02-01'),
('proj-002', 'grp-002', 'cur-aisia', 'Impacto de la IA en la contabilidad', 'metodologia', '2025-02-01');

-- 8. Eventos
INSERT INTO eventos (id, titulo, descripcion, fecha_inicio, fecha_fin, tipo, todo_el_dia, alerta_enviada) VALUES
('evt-001', 'Inicio de Clases - 2026-1', 'Inicio del semestre', '2026-02-02 00:00:00-05', NULL, 'clase', TRUE, TRUE),
('evt-002', 'Semana Santa', 'Receso académico', '2026-04-02 00:00:00-05', '2026-04-05 23:59:59-05', 'festivo', TRUE, TRUE);

-- 9. Recursos
INSERT INTO recursos (id, titulo, descripcion, tipo, url, duracion, nivel, asignatura, obligatorio) VALUES
('rec-001', 'Cómo redactar un problema', 'Guía para formular preguntas', 'video', 'https://youtube.com/watch?v=example1', 18, 'basico', 'Metodología I', TRUE),
('rec-002', 'Guía ICONTEX 2024', 'Manual de normas', 'pdf', '/docs/guia-icontex-2024.pdf', 25, 'intermedio', 'Metodología II', TRUE);

-- 10. Convocatorias (Simple Mock)
INSERT INTO convocatorias (id, codigo, titulo, categoria, entidad_convocante, descripcion, estado) VALUES
('conv-001', 'CUL-BEC-2025', 'Beca Excelencia', 'beca', 'CUL', 'Beca 100% matrícula', 'activa');
