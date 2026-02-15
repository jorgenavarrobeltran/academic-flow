// Datos de prueba para AcademicFlow Pro

import type {
  Docente,
  Estudiante,
  Curso,
  Asistencia,
  Nota,
  Grupo,
  ProyectoInvestigacion,
  EventoCalendario,
  Alerta,
  RecursoEducativo,
  Convocatoria,
} from '@/types';

// Docente de prueba
export const docenteMock: Docente = {
  id: 'doc-001',
  nombre: 'Jorge Armando',
  apellido: 'Navarro Beltran',
  email: 'jnavar-05@hotmail.com',
  rol: 'docente',
  especialidad: 'Ing. Industrial, Magister en Salud Pública',
  facultad: 'Facultad de Ingenierías',
  biografia: 'Docente con amplia experiencia en sector salud e industrial.',
  horarioAtencion: 'Martes y Jueves de 2:00 PM a 5:00 PM',
  fechaRegistro: new Date('2020-01-15'),
  activo: true,
  fotoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
};

// Estudiantes de prueba
export const estudiantesMock: Estudiante[] = [
  {
    id: 'est-001',
    nombre: 'María',
    apellido: 'González Pérez',
    email: 'm.gonzalez@cul.edu.co',
    rol: 'estudiante',
    codigo: '202301234',
    programa: 'Ingeniería Industrial',
    semestre: 7,
    promedioAcumulado: 4.2,
    fechaRegistro: new Date('2023-01-20'),
    activo: true,
    fotoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
  },
  {
    id: 'est-002',
    nombre: 'Juan',
    apellido: 'Pérez López',
    email: 'j.perez@cul.edu.co',
    rol: 'estudiante',
    codigo: '202301567',
    programa: 'Ingeniería de Sistemas',
    semestre: 5,
    promedioAcumulado: 3.8,
    fechaRegistro: new Date('2023-01-22'),
    activo: true,
    fotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  },
  {
    id: 'est-003',
    nombre: 'Ana',
    apellido: 'Martínez Silva',
    email: 'a.martinez@cul.edu.co',
    rol: 'estudiante',
    codigo: '202302891',
    programa: 'Contaduría Pública',
    semestre: 6,
    promedioAcumulado: 4.5,
    fechaRegistro: new Date('2023-02-10'),
    activo: true,
    fotoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
  },
  {
    id: 'est-004',
    nombre: 'Carlos',
    apellido: 'Sánchez Torres',
    email: 'c.sanchez@cul.edu.co',
    rol: 'estudiante',
    codigo: '202203456',
    programa: 'Ingeniería Industrial',
    semestre: 7,
    promedioAcumulado: 3.2,
    fechaRegistro: new Date('2022-01-15'),
    activo: true,
    fotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
  },
  {
    id: 'est-005',
    nombre: 'Laura',
    apellido: 'Díaz Ramírez',
    email: 'l.diaz@cul.edu.co',
    rol: 'estudiante',
    codigo: '202304123',
    programa: 'Ingeniería de Sistemas',
    semestre: 5,
    promedioAcumulado: 4.7,
    fechaRegistro: new Date('2023-04-05'),
    activo: true,
    fotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
  },
  {
    id: 'est-006',
    nombre: 'Pedro',
    apellido: 'Gómez Castro',
    email: 'p.gomez@cul.edu.co',
    rol: 'estudiante',
    codigo: '202205789',
    programa: 'Contaduría Pública',
    semestre: 8,
    promedioAcumulado: 2.9,
    fechaRegistro: new Date('2022-02-20'),
    activo: true,
    fotoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
  },
  {
    id: 'est-007',
    nombre: 'Sofía',
    apellido: 'Hernández Ruiz',
    email: 's.hernandez@cul.edu.co',
    rol: 'estudiante',
    codigo: '202306567',
    programa: 'Ingeniería Industrial',
    semestre: 5,
    promedioAcumulado: 4.0,
    fechaRegistro: new Date('2023-06-15'),
    activo: true,
    fotoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
  },
  {
    id: 'est-008',
    nombre: 'Diego',
    apellido: 'López Mendoza',
    email: 'd.lopez@cul.edu.co',
    rol: 'estudiante',
    codigo: '202107234',
    programa: 'Ingeniería de Sistemas',
    semestre: 9,
    promedioAcumulado: 3.5,
    fechaRegistro: new Date('2021-07-10'),
    activo: true,
    fotoUrl: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face',
  },
];

// Cursos REALES - Periodo 2026-1 - Docente: Jorge Armando Navarro Beltran
// Horario CUL: Reglamento Cortes 30%/30%/40%
export const cursosMock: Curso[] = [
  // ===== LUNES =====
  {
    id: 'cur-aisia',
    codigo: 'AISIA',
    nombre: 'Formación del Espíritu Científico - AISIA',
    asignatura: 'Formación del Espíritu Científico',
    semestre: '2026-1',
    grupo: 'A',
    docenteId: 'doc-001',
    programa: 'Ingeniería de Sistemas',
    aula: 'A313',
    estudiantes: [
      { estudianteId: 'est-001', fechaInscripcion: new Date('2026-01-20'), asistencias: [], notas: [] },
      { estudianteId: 'est-002', fechaInscripcion: new Date('2026-01-20'), asistencias: [], notas: [] },
      { estudianteId: 'est-005', fechaInscripcion: new Date('2026-01-21'), asistencias: [], notas: [] },
    ],
    configuracionNotas: {
      cortes: [
        { numero: 1, porcentaje: 30, fechaInicio: new Date('2026-02-02'), fechaFin: new Date('2026-03-14'), cerrado: false },
        { numero: 2, porcentaje: 30, fechaInicio: new Date('2026-03-16'), fechaFin: new Date('2026-04-25'), cerrado: false },
        { numero: 3, porcentaje: 40, fechaInicio: new Date('2026-04-27'), fechaFin: new Date('2026-05-30'), cerrado: false },
      ],
      componentes: [
        { id: 'comp-001', nombre: 'Quices', porcentaje: 20, tipo: 'quiz' },
        { id: 'comp-002', nombre: 'Talleres', porcentaje: 20, tipo: 'taller' },
        { id: 'comp-003', nombre: 'Participación', porcentaje: 20, tipo: 'participacion' },
        { id: 'comp-004', nombre: 'Parcial', porcentaje: 40, tipo: 'parcial' },
      ],
    },
    fechaInicio: new Date('2026-02-02'),
    fechaFin: new Date('2026-05-30'),
    diasClase: [1], // Lunes
    horaInicio: '08:00',
    horaFin: '09:30',
    activo: true,
    archivado: false,
  },
  {
    id: 'cur-zisia',
    codigo: 'ZISIA',
    nombre: 'Formación del Espíritu Científico - ZISIA',
    asignatura: 'Formación del Espíritu Científico',
    semestre: '2026-1',
    grupo: 'B',
    docenteId: 'doc-001',
    programa: 'Ingeniería de Sistemas',
    aula: 'B107',
    estudiantes: [
      { estudianteId: 'est-003', fechaInscripcion: new Date('2026-01-20'), asistencias: [], notas: [] },
      { estudianteId: 'est-004', fechaInscripcion: new Date('2026-01-21'), asistencias: [], notas: [] },
      { estudianteId: 'est-006', fechaInscripcion: new Date('2026-01-22'), asistencias: [], notas: [] },
    ],
    configuracionNotas: {
      cortes: [
        { numero: 1, porcentaje: 30, fechaInicio: new Date('2026-02-02'), fechaFin: new Date('2026-03-14'), cerrado: false },
        { numero: 2, porcentaje: 30, fechaInicio: new Date('2026-03-16'), fechaFin: new Date('2026-04-25'), cerrado: false },
        { numero: 3, porcentaje: 40, fechaInicio: new Date('2026-04-27'), fechaFin: new Date('2026-05-30'), cerrado: false },
      ],
      componentes: [
        { id: 'comp-001', nombre: 'Quices', porcentaje: 20, tipo: 'quiz' },
        { id: 'comp-002', nombre: 'Talleres', porcentaje: 20, tipo: 'taller' },
        { id: 'comp-003', nombre: 'Participación', porcentaje: 20, tipo: 'participacion' },
        { id: 'comp-004', nombre: 'Parcial', porcentaje: 40, tipo: 'parcial' },
      ],
    },
    fechaInicio: new Date('2026-02-02'),
    fechaFin: new Date('2026-05-30'),
    diasClase: [1], // Lunes
    horaInicio: '19:00',
    horaFin: '20:30',
    activo: true,
    archivado: false,
  },

  // ===== MARTES =====
  {
    id: 'cur-ziindia',
    codigo: 'ZIINDIA',
    nombre: 'Formación del Espíritu Científico - ZIINDIA',
    asignatura: 'Formación del Espíritu Científico',
    semestre: '2026-1',
    grupo: 'C',
    docenteId: 'doc-001',
    programa: 'Ingeniería Industrial',
    aula: 'B408',
    estudiantes: [
      { estudianteId: 'est-004', fechaInscripcion: new Date('2026-01-20'), asistencias: [], notas: [] },
      { estudianteId: 'est-007', fechaInscripcion: new Date('2026-01-21'), asistencias: [], notas: [] },
      { estudianteId: 'est-008', fechaInscripcion: new Date('2026-01-22'), asistencias: [], notas: [] },
    ],
    configuracionNotas: {
      cortes: [
        { numero: 1, porcentaje: 30, fechaInicio: new Date('2026-02-02'), fechaFin: new Date('2026-03-14'), cerrado: false },
        { numero: 2, porcentaje: 30, fechaInicio: new Date('2026-03-16'), fechaFin: new Date('2026-04-25'), cerrado: false },
        { numero: 3, porcentaje: 40, fechaInicio: new Date('2026-04-27'), fechaFin: new Date('2026-05-30'), cerrado: false },
      ],
      componentes: [
        { id: 'comp-001', nombre: 'Quices', porcentaje: 20, tipo: 'quiz' },
        { id: 'comp-002', nombre: 'Talleres', porcentaje: 20, tipo: 'taller' },
        { id: 'comp-003', nombre: 'Participación', porcentaje: 20, tipo: 'participacion' },
        { id: 'comp-004', nombre: 'Parcial', porcentaje: 40, tipo: 'parcial' },
      ],
    },
    fechaInicio: new Date('2026-02-02'),
    fechaFin: new Date('2026-05-30'),
    diasClase: [2], // Martes
    horaInicio: '19:00',
    horaFin: '20:30',
    activo: true,
    archivado: false,
  },

  // ===== MIÉRCOLES =====
  {
    id: 'cur-aisvb',
    codigo: 'AISVB',
    nombre: 'Metodología de la Investigación - AISVB',
    asignatura: 'Metodología de la Investigación',
    semestre: '2026-1',
    grupo: 'A',
    docenteId: 'doc-001',
    aula: 'B403',
    estudiantes: [
      { estudianteId: 'est-001', fechaInscripcion: new Date('2026-01-20'), asistencias: [], notas: [] },
      { estudianteId: 'est-002', fechaInscripcion: new Date('2026-01-21'), asistencias: [], notas: [] },
      { estudianteId: 'est-003', fechaInscripcion: new Date('2026-01-22'), asistencias: [], notas: [] },
      { estudianteId: 'est-005', fechaInscripcion: new Date('2026-01-22'), asistencias: [], notas: [] },
    ],
    configuracionNotas: {
      cortes: [
        { numero: 1, porcentaje: 30, fechaInicio: new Date('2026-02-02'), fechaFin: new Date('2026-03-14'), cerrado: false },
        { numero: 2, porcentaje: 30, fechaInicio: new Date('2026-03-16'), fechaFin: new Date('2026-04-25'), cerrado: false },
        { numero: 3, porcentaje: 40, fechaInicio: new Date('2026-04-27'), fechaFin: new Date('2026-05-30'), cerrado: false },
      ],
      componentes: [
        { id: 'comp-001', nombre: 'Quices', porcentaje: 20, tipo: 'quiz' },
        { id: 'comp-002', nombre: 'Talleres', porcentaje: 20, tipo: 'taller' },
        { id: 'comp-003', nombre: 'Participación', porcentaje: 20, tipo: 'participacion' },
        { id: 'comp-004', nombre: 'Parcial', porcentaje: 40, tipo: 'parcial' },
      ],
    },
    fechaInicio: new Date('2026-02-02'),
    fechaFin: new Date('2026-05-30'),
    diasClase: [3], // Miércoles
    horaInicio: '08:00',
    horaFin: '09:30',
    activo: true,
    archivado: false,
  },
  {
    id: 'cur-zcpixa',
    codigo: 'ZCPIXA',
    nombre: 'Proyecto de Investigación - ZCPIXA',
    asignatura: 'Proyecto de Investigación',
    semestre: '2026-1',
    grupo: 'A',
    docenteId: 'doc-001',
    aula: 'A211',
    estudiantes: [
      { estudianteId: 'est-006', fechaInscripcion: new Date('2026-01-20'), asistencias: [], notas: [] },
      { estudianteId: 'est-007', fechaInscripcion: new Date('2026-01-21'), asistencias: [], notas: [] },
      { estudianteId: 'est-008', fechaInscripcion: new Date('2026-01-22'), asistencias: [], notas: [] },
    ],
    configuracionNotas: {
      cortes: [
        { numero: 1, porcentaje: 30, fechaInicio: new Date('2026-02-02'), fechaFin: new Date('2026-03-14'), cerrado: false },
        { numero: 2, porcentaje: 30, fechaInicio: new Date('2026-03-16'), fechaFin: new Date('2026-04-25'), cerrado: false },
        { numero: 3, porcentaje: 40, fechaInicio: new Date('2026-04-27'), fechaFin: new Date('2026-05-30'), cerrado: false },
      ],
      componentes: [
        { id: 'comp-001', nombre: 'Avances', porcentaje: 30, tipo: 'taller' },
        { id: 'comp-002', nombre: 'Participación', porcentaje: 20, tipo: 'participacion' },
        { id: 'comp-003', nombre: 'Entrega Final', porcentaje: 50, tipo: 'parcial' },
      ],
    },
    fechaInicio: new Date('2026-02-02'),
    fechaFin: new Date('2026-05-30'),
    diasClase: [3], // Miércoles
    horaInicio: '18:15',
    horaFin: '19:45',
    activo: true,
    archivado: false,
  },
  {
    id: 'cur-zcpva',
    codigo: 'ZCPVA',
    nombre: 'Seminario de Investigación - ZCPVA',
    asignatura: 'Seminario de Investigación',
    semestre: '2026-1',
    grupo: 'A',
    docenteId: 'doc-001',
    aula: 'E102',
    estudiantes: [
      { estudianteId: 'est-001', fechaInscripcion: new Date('2026-01-20'), asistencias: [], notas: [] },
      { estudianteId: 'est-004', fechaInscripcion: new Date('2026-01-21'), asistencias: [], notas: [] },
      { estudianteId: 'est-007', fechaInscripcion: new Date('2026-01-22'), asistencias: [], notas: [] },
    ],
    configuracionNotas: {
      cortes: [
        { numero: 1, porcentaje: 30, fechaInicio: new Date('2026-02-02'), fechaFin: new Date('2026-03-14'), cerrado: false },
        { numero: 2, porcentaje: 30, fechaInicio: new Date('2026-03-16'), fechaFin: new Date('2026-04-25'), cerrado: false },
        { numero: 3, porcentaje: 40, fechaInicio: new Date('2026-04-27'), fechaFin: new Date('2026-05-30'), cerrado: false },
      ],
      componentes: [
        { id: 'comp-001', nombre: 'Avances', porcentaje: 30, tipo: 'taller' },
        { id: 'comp-002', nombre: 'Participación', porcentaje: 20, tipo: 'participacion' },
        { id: 'comp-003', nombre: 'Sustentación', porcentaje: 50, tipo: 'parcial' },
      ],
    },
    fechaInicio: new Date('2026-02-02'),
    fechaFin: new Date('2026-05-30'),
    diasClase: [3], // Miércoles
    horaInicio: '19:45',
    horaFin: '21:15',
    activo: true,
    archivado: false,
  },

  // ===== JUEVES =====
  {
    id: 'cur-zcpvtia',
    codigo: 'ZCPVTIA',
    nombre: 'Anteproyecto - ZCPVTIA',
    asignatura: 'Anteproyecto',
    semestre: '2026-1',
    grupo: 'A',
    docenteId: 'doc-001',
    aula: 'B404',
    estudiantes: [
      { estudianteId: 'est-002', fechaInscripcion: new Date('2026-01-20'), asistencias: [], notas: [] },
      { estudianteId: 'est-005', fechaInscripcion: new Date('2026-01-21'), asistencias: [], notas: [] },
      { estudianteId: 'est-006', fechaInscripcion: new Date('2026-01-22'), asistencias: [], notas: [] },
      { estudianteId: 'est-008', fechaInscripcion: new Date('2026-01-22'), asistencias: [], notas: [] },
    ],
    configuracionNotas: {
      cortes: [
        { numero: 1, porcentaje: 30, fechaInicio: new Date('2026-02-02'), fechaFin: new Date('2026-03-14'), cerrado: false },
        { numero: 2, porcentaje: 30, fechaInicio: new Date('2026-03-16'), fechaFin: new Date('2026-04-25'), cerrado: false },
        { numero: 3, porcentaje: 40, fechaInicio: new Date('2026-04-27'), fechaFin: new Date('2026-05-30'), cerrado: false },
      ],
      componentes: [
        { id: 'comp-001', nombre: 'Avances', porcentaje: 30, tipo: 'taller' },
        { id: 'comp-002', nombre: 'Participación', porcentaje: 20, tipo: 'participacion' },
        { id: 'comp-003', nombre: 'Entrega Final', porcentaje: 50, tipo: 'parcial' },
      ],
    },
    fechaInicio: new Date('2026-02-02'),
    fechaFin: new Date('2026-05-30'),
    diasClase: [4], // Jueves
    horaInicio: '19:45',
    horaFin: '21:15',
    activo: true,
    archivado: false,
  },

  // ===== VIERNES =====
  {
    id: 'cur-aiindiia',
    codigo: 'AIINDIIA',
    nombre: 'Metodología de la Investigación - AIINDIIA',
    asignatura: 'Metodología de la Investigación',
    semestre: '2026-1',
    grupo: 'B',
    docenteId: 'doc-001',
    programa: 'Ingeniería Industrial',
    aula: 'A213',
    estudiantes: [
      { estudianteId: 'est-003', fechaInscripcion: new Date('2026-01-20'), asistencias: [], notas: [] },
      { estudianteId: 'est-004', fechaInscripcion: new Date('2026-01-21'), asistencias: [], notas: [] },
      { estudianteId: 'est-007', fechaInscripcion: new Date('2026-01-22'), asistencias: [], notas: [] },
      { estudianteId: 'est-008', fechaInscripcion: new Date('2026-01-22'), asistencias: [], notas: [] },
    ],
    configuracionNotas: {
      cortes: [
        { numero: 1, porcentaje: 30, fechaInicio: new Date('2026-02-02'), fechaFin: new Date('2026-03-14'), cerrado: false },
        { numero: 2, porcentaje: 30, fechaInicio: new Date('2026-03-16'), fechaFin: new Date('2026-04-25'), cerrado: false },
        { numero: 3, porcentaje: 40, fechaInicio: new Date('2026-04-27'), fechaFin: new Date('2026-05-30'), cerrado: false },
      ],
      componentes: [
        { id: 'comp-001', nombre: 'Quices', porcentaje: 20, tipo: 'quiz' },
        { id: 'comp-002', nombre: 'Talleres', porcentaje: 20, tipo: 'taller' },
        { id: 'comp-003', nombre: 'Participación', porcentaje: 20, tipo: 'participacion' },
        { id: 'comp-004', nombre: 'Parcial', porcentaje: 40, tipo: 'parcial' },
      ],
    },
    fechaInicio: new Date('2026-02-02'),
    fechaFin: new Date('2026-05-30'),
    diasClase: [5], // Viernes
    horaInicio: '07:15',
    horaFin: '08:45',
    activo: true,
    archivado: false,
  },
];

// Asistencias de prueba - Periodo 2026-1 (CUL: min 80% asistencia, >20% fallas = pierde con 0.0, tardanza >15min = falla)
export const asistenciasMock: Asistencia[] = [
  // FEC AISIA (Lunes) - Semana 1: 2 Feb 2026
  { id: 'asis-001', estudianteId: 'est-001', cursoId: 'cur-aisia', fecha: new Date('2026-02-02'), estado: 'presente' },
  { id: 'asis-002', estudianteId: 'est-002', cursoId: 'cur-aisia', fecha: new Date('2026-02-02'), estado: 'presente' },
  { id: 'asis-003', estudianteId: 'est-005', cursoId: 'cur-aisia', fecha: new Date('2026-02-02'), estado: 'tarde' },

  // FEC AISIA (Lunes) - Semana 2: 9 Feb 2026
  { id: 'asis-004', estudianteId: 'est-001', cursoId: 'cur-aisia', fecha: new Date('2026-02-09'), estado: 'presente' },
  { id: 'asis-005', estudianteId: 'est-002', cursoId: 'cur-aisia', fecha: new Date('2026-02-09'), estado: 'ausente' },
  { id: 'asis-006', estudianteId: 'est-005', cursoId: 'cur-aisia', fecha: new Date('2026-02-09'), estado: 'presente' },
  // Semana 3: 16 Feb = Receso Carnavales (no hay clase)

  // FEC ZIINDIA (Martes) - Semana 1: 3 Feb 2026
  { id: 'asis-007', estudianteId: 'est-004', cursoId: 'cur-ziindia', fecha: new Date('2026-02-03'), estado: 'presente' },
  { id: 'asis-008', estudianteId: 'est-007', cursoId: 'cur-ziindia', fecha: new Date('2026-02-03'), estado: 'presente' },
  { id: 'asis-009', estudianteId: 'est-008', cursoId: 'cur-ziindia', fecha: new Date('2026-02-03'), estado: 'ausente' },

  // FEC ZIINDIA (Martes) - Semana 2: 10 Feb 2026
  { id: 'asis-010', estudianteId: 'est-004', cursoId: 'cur-ziindia', fecha: new Date('2026-02-10'), estado: 'presente' },
  { id: 'asis-011', estudianteId: 'est-007', cursoId: 'cur-ziindia', fecha: new Date('2026-02-10'), estado: 'tarde' },
  { id: 'asis-012', estudianteId: 'est-008', cursoId: 'cur-ziindia', fecha: new Date('2026-02-10'), estado: 'presente' },

  // Metodología AISVB (Miércoles) - Semana 1: 4 Feb 2026
  { id: 'asis-013', estudianteId: 'est-001', cursoId: 'cur-aisvb', fecha: new Date('2026-02-04'), estado: 'presente' },
  { id: 'asis-014', estudianteId: 'est-002', cursoId: 'cur-aisvb', fecha: new Date('2026-02-04'), estado: 'presente' },
  { id: 'asis-015', estudianteId: 'est-003', cursoId: 'cur-aisvb', fecha: new Date('2026-02-04'), estado: 'presente' },
  { id: 'asis-016', estudianteId: 'est-005', cursoId: 'cur-aisvb', fecha: new Date('2026-02-04'), estado: 'ausente' },

  // Metodología AISVB (Miércoles) - Semana 2: 11 Feb 2026
  { id: 'asis-017', estudianteId: 'est-001', cursoId: 'cur-aisvb', fecha: new Date('2026-02-11'), estado: 'presente' },
  { id: 'asis-018', estudianteId: 'est-002', cursoId: 'cur-aisvb', fecha: new Date('2026-02-11'), estado: 'presente' },
  { id: 'asis-019', estudianteId: 'est-003', cursoId: 'cur-aisvb', fecha: new Date('2026-02-11'), estado: 'tarde' },
  { id: 'asis-020', estudianteId: 'est-005', cursoId: 'cur-aisvb', fecha: new Date('2026-02-11'), estado: 'presente' },

  // Anteproyecto ZCPVTIA (Jueves) - Semana 1: 5 Feb 2026
  { id: 'asis-021', estudianteId: 'est-002', cursoId: 'cur-zcpvtia', fecha: new Date('2026-02-05'), estado: 'presente' },
  { id: 'asis-022', estudianteId: 'est-005', cursoId: 'cur-zcpvtia', fecha: new Date('2026-02-05'), estado: 'presente' },
  { id: 'asis-023', estudianteId: 'est-006', cursoId: 'cur-zcpvtia', fecha: new Date('2026-02-05'), estado: 'presente' },
  { id: 'asis-024', estudianteId: 'est-008', cursoId: 'cur-zcpvtia', fecha: new Date('2026-02-05'), estado: 'ausente' },

  // Anteproyecto ZCPVTIA (Jueves) - Semana 2: 12 Feb 2026
  { id: 'asis-025', estudianteId: 'est-002', cursoId: 'cur-zcpvtia', fecha: new Date('2026-02-12'), estado: 'presente' },
  { id: 'asis-026', estudianteId: 'est-005', cursoId: 'cur-zcpvtia', fecha: new Date('2026-02-12'), estado: 'tarde' },
  { id: 'asis-027', estudianteId: 'est-006', cursoId: 'cur-zcpvtia', fecha: new Date('2026-02-12'), estado: 'presente' },
  { id: 'asis-028', estudianteId: 'est-008', cursoId: 'cur-zcpvtia', fecha: new Date('2026-02-12'), estado: 'presente' },

  // Metodología AIINDIIA (Viernes) - Semana 1: 6 Feb 2026
  { id: 'asis-029', estudianteId: 'est-003', cursoId: 'cur-aiindiia', fecha: new Date('2026-02-06'), estado: 'presente' },
  { id: 'asis-030', estudianteId: 'est-004', cursoId: 'cur-aiindiia', fecha: new Date('2026-02-06'), estado: 'presente' },
  { id: 'asis-031', estudianteId: 'est-007', cursoId: 'cur-aiindiia', fecha: new Date('2026-02-06'), estado: 'ausente' },
  { id: 'asis-032', estudianteId: 'est-008', cursoId: 'cur-aiindiia', fecha: new Date('2026-02-06'), estado: 'presente' },
];

// Notas de prueba - Periodo 2026-1 (CUL: escala 0.0-5.0, aprobatoria 3.0 pregrado, redondeo: >=5 centésimas sube)
export const notasMock: Nota[] = [
  // Metodología III - Corte I (30%)
  { id: 'nota-001', estudianteId: 'est-001', cursoId: 'cur-aisia', corte: 1, componenteId: 'comp-001', valor: 4.5, fechaRegistro: new Date('2026-02-20') },
  { id: 'nota-002', estudianteId: 'est-001', cursoId: 'cur-aisia', corte: 1, componenteId: 'comp-002', valor: 4.2, fechaRegistro: new Date('2026-02-27') },
  { id: 'nota-003', estudianteId: 'est-001', cursoId: 'cur-aisia', corte: 1, componenteId: 'comp-003', valor: 4.8, fechaRegistro: new Date('2026-03-06') },

  { id: 'nota-004', estudianteId: 'est-002', cursoId: 'cur-aisia', corte: 1, componenteId: 'comp-001', valor: 3.8, fechaRegistro: new Date('2026-02-20') },
  { id: 'nota-005', estudianteId: 'est-002', cursoId: 'cur-aisia', corte: 1, componenteId: 'comp-002', valor: 4.0, fechaRegistro: new Date('2026-02-27') },
  { id: 'nota-006', estudianteId: 'est-002', cursoId: 'cur-aisia', corte: 1, componenteId: 'comp-003', valor: 3.5, fechaRegistro: new Date('2026-03-06') },

  { id: 'nota-007', estudianteId: 'est-003', cursoId: 'cur-aisia', corte: 1, componenteId: 'comp-001', valor: 4.8, fechaRegistro: new Date('2026-02-20') },
  { id: 'nota-008', estudianteId: 'est-003', cursoId: 'cur-aisia', corte: 1, componenteId: 'comp-002', valor: 4.5, fechaRegistro: new Date('2026-02-27') },
  { id: 'nota-009', estudianteId: 'est-003', cursoId: 'cur-aisia', corte: 1, componenteId: 'comp-003', valor: 4.9, fechaRegistro: new Date('2026-03-06') },

  { id: 'nota-010', estudianteId: 'est-004', cursoId: 'cur-aisia', corte: 1, componenteId: 'comp-001', valor: 2.8, fechaRegistro: new Date('2026-02-20') },
  { id: 'nota-011', estudianteId: 'est-004', cursoId: 'cur-aisia', corte: 1, componenteId: 'comp-002', valor: 3.0, fechaRegistro: new Date('2026-02-27') },
  { id: 'nota-012', estudianteId: 'est-004', cursoId: 'cur-aisia', corte: 1, componenteId: 'comp-003', valor: 2.5, fechaRegistro: new Date('2026-03-06') },

  { id: 'nota-013', estudianteId: 'est-006', cursoId: 'cur-aisia', corte: 1, componenteId: 'comp-001', valor: 2.5, fechaRegistro: new Date('2026-02-20') },
  { id: 'nota-014', estudianteId: 'est-006', cursoId: 'cur-aisia', corte: 1, componenteId: 'comp-002', valor: 2.8, fechaRegistro: new Date('2026-02-27') },
  { id: 'nota-015', estudianteId: 'est-006', cursoId: 'cur-aisia', corte: 1, componenteId: 'comp-003', valor: 3.0, fechaRegistro: new Date('2026-03-06') },
];

// Grupos de prueba
export const gruposMock: Grupo[] = [
  {
    id: 'grp-001',
    cursoId: 'cur-aisia',
    nombre: 'Los Optimizadores',
    descripcion: 'Grupo enfocado en optimización de procesos industriales',
    integrantes: ['est-001', 'est-003', 'est-007'],
    proyecto: 'Optimización de rutas de última milla en Barranquilla',
    notaGrupal: 4.2,
    fechaCreacion: new Date('2025-02-05'),
  },
  {
    id: 'grp-002',
    cursoId: 'cur-aisia',
    nombre: 'DataScience CUL',
    descripcion: 'Análisis de datos aplicado a ciencias económicas',
    integrantes: ['est-002', 'est-005'],
    proyecto: 'Impacto de la IA en la contabilidad moderna',
    notaGrupal: 4.5,
    fechaCreacion: new Date('2025-02-06'),
  },
  {
    id: 'grp-003',
    cursoId: 'cur-aisvb',
    nombre: 'Innovación 4.0',
    descripcion: 'Industria 4.0 y transformación digital',
    integrantes: ['est-004', 'est-006', 'est-008'],
    proyecto: 'Implementación de IoT en pymes manufactureras',
    notaGrupal: 3.5,
    fechaCreacion: new Date('2025-02-07'),
  },
];

// Proyectos de investigación de prueba
export const proyectosMock: ProyectoInvestigacion[] = [
  {
    id: 'proj-001',
    grupoId: 'grp-001',
    cursoId: 'cur-aisia',
    titulo: 'Optimización de rutas de última milla en Barranquilla',
    etapaActual: 'marco_teorico',
    etapas: [
      { etapa: 'planteamiento', fechaInicio: new Date('2025-02-01'), fechaFin: new Date('2025-02-10'), estado: 'aprobado' },
      { etapa: 'objetivos', fechaInicio: new Date('2025-02-11'), fechaFin: new Date('2025-02-15'), estado: 'aprobado' },
      { etapa: 'marco_teorico', fechaInicio: new Date('2025-02-16'), estado: 'en_progreso' },
    ],
    avances: [
      { id: 'av-001', etapa: 'planteamiento', version: '1.0', descripcion: 'Primera versión del planteamiento', fechaSubida: new Date('2025-02-08'), calificacion: 4.5 },
      { id: 'av-002', etapa: 'marco_teorico', version: '1.0', descripcion: 'Avance inicial del marco teórico', fechaSubida: new Date('2025-02-20') },
    ],
    fechaInicio: new Date('2025-02-01'),
  },
  {
    id: 'proj-002',
    grupoId: 'grp-002',
    cursoId: 'cur-aisia',
    titulo: 'Impacto de la IA en la contabilidad moderna',
    etapaActual: 'metodologia',
    etapas: [
      { etapa: 'planteamiento', fechaInicio: new Date('2025-02-01'), fechaFin: new Date('2025-02-08'), estado: 'aprobado' },
      { etapa: 'objetivos', fechaInicio: new Date('2025-02-09'), fechaFin: new Date('2025-02-12'), estado: 'aprobado' },
      { etapa: 'marco_teorico', fechaInicio: new Date('2025-02-13'), fechaFin: new Date('2025-02-25'), estado: 'aprobado' },
      { etapa: 'metodologia', fechaInicio: new Date('2025-02-26'), estado: 'en_progreso' },
    ],
    avances: [
      { id: 'av-003', etapa: 'marco_teorico', version: '2.0', descripcion: 'Versión final del marco teórico', fechaSubida: new Date('2025-02-24'), calificacion: 4.8 },
    ],
    fechaInicio: new Date('2025-02-01'),
  },
];

// Eventos del calendario - Periodo 2026-1 (basado en estructura CUL: 3 cortes, matrícula ord/ext, habilitaciones)
export const eventosMock: EventoCalendario[] = [
  // Matrículas
  { id: 'evt-001', titulo: 'Matrícula Ordinaria 2026-1', descripcion: 'Periodo de matrícula ordinaria sin recargo', fechaInicio: new Date('2026-01-12'), fechaFin: new Date('2026-01-23'), tipo: 'clase', todoElDia: true, alertaEnviada: true },
  { id: 'evt-002', titulo: 'Matrícula Extraordinaria 2026-1', descripcion: 'Matrícula con recargo económico', fechaInicio: new Date('2026-01-26'), fechaFin: new Date('2026-01-30'), tipo: 'clase', todoElDia: true, alertaEnviada: true },
  // Inicio de clases
  { id: 'evt-003', titulo: 'Inicio de Clases - 2026-1', descripcion: 'Inicio del semestre académico 2026-1', fechaInicio: new Date('2026-02-02'), tipo: 'clase', todoElDia: true, alertaEnviada: true },
  // Retiro sin nota (3 primeras semanas)
  { id: 'evt-004', titulo: 'Último día retiro sin nota', descripcion: 'Retiro de asignaturas sin que figure calificación (Reglamento CUL Art. retiro)', fechaInicio: new Date('2026-02-20'), tipo: 'entrega', todoElDia: true, alertaEnviada: false },
  // Corte I (30%)
  { id: 'evt-005', titulo: 'Parcial Corte I - Metodología III', descripcion: 'Evaluación primer corte (30%)', fechaInicio: new Date('2026-03-10'), tipo: 'parcial', cursoId: 'cur-001', todoElDia: false, alertaEnviada: false },
  { id: 'evt-006', titulo: 'Cierre Corte I', descripcion: 'Último día para registrar notas del primer corte', fechaInicio: new Date('2026-03-14'), tipo: 'entrega', todoElDia: true, alertaEnviada: false },
  // Entrega marco teórico
  { id: 'evt-007', titulo: 'Entrega Marco Teórico', descripcion: 'Fecha límite de entrega - Anteproyecto', fechaInicio: new Date('2026-02-28'), tipo: 'entrega', cursoId: 'cur-003', todoElDia: true, alertaEnviada: false },
  // Reunión de seguimiento
  { id: 'evt-008', titulo: 'Reunión de Seguimiento Proyectos', descripcion: 'Revisión de avances de proyectos de investigación', fechaInicio: new Date('2026-02-19'), fechaFin: new Date('2026-02-19'), tipo: 'reunion', todoElDia: false, alertaEnviada: true },
  // Festivos Colombia 2026 (dentro del semestre)
  { id: 'evt-009', titulo: 'San José', descripcion: 'Festivo nacional (trasladado)', fechaInicio: new Date('2026-03-23'), tipo: 'festivo', todoElDia: true, alertaEnviada: true },
  { id: 'evt-010', titulo: 'Semana Santa', descripcion: 'Receso académico - Jueves y Viernes Santo', fechaInicio: new Date('2026-04-02'), fechaFin: new Date('2026-04-05'), tipo: 'festivo', todoElDia: true, alertaEnviada: true },
  // Corte II (30%)
  { id: 'evt-011', titulo: 'Parcial Corte II - Metodología III', descripcion: 'Evaluación segundo corte (30%)', fechaInicio: new Date('2026-04-28'), tipo: 'parcial', cursoId: 'cur-001', todoElDia: false, alertaEnviada: false },
  { id: 'evt-012', titulo: 'Cierre Corte II', descripcion: 'Último día para registrar notas del segundo corte', fechaInicio: new Date('2026-05-02'), tipo: 'entrega', todoElDia: true, alertaEnviada: false },
  // Festivos mayo-junio
  { id: 'evt-013', titulo: 'Día del Trabajo', descripcion: 'Festivo nacional', fechaInicio: new Date('2026-05-01'), tipo: 'festivo', todoElDia: true, alertaEnviada: true },
  { id: 'evt-014', titulo: 'Ascensión del Señor', descripcion: 'Festivo nacional (trasladado)', fechaInicio: new Date('2026-05-18'), tipo: 'festivo', todoElDia: true, alertaEnviada: true },
  { id: 'evt-015', titulo: 'Corpus Christi', descripcion: 'Festivo nacional (trasladado)', fechaInicio: new Date('2026-06-08'), tipo: 'festivo', todoElDia: true, alertaEnviada: true },
  // Corte III - Examen Final (40%)
  { id: 'evt-016', titulo: 'Examen Final - Metodología III', descripcion: 'Evaluación tercer corte - Examen Final (40%)', fechaInicio: new Date('2026-06-16'), tipo: 'parcial', cursoId: 'cur-001', todoElDia: false, alertaEnviada: false },
  { id: 'evt-017', titulo: 'Cierre Corte III / Fin de Clases', descripcion: 'Último día de clases y cierre de notas definitivas', fechaInicio: new Date('2026-06-20'), tipo: 'entrega', todoElDia: true, alertaEnviada: false },
  // Habilitaciones (CUL: nota ≥ 2.0 y < 3.0, máx. 2 materias)
  { id: 'evt-018', titulo: 'Periodo de Habilitaciones', descripcion: 'Exámenes de habilitación (nota ≥2.0 y <3.0, máx. 2 asignaturas)', fechaInicio: new Date('2026-06-22'), fechaFin: new Date('2026-06-27'), tipo: 'parcial', todoElDia: true, alertaEnviada: false },
];

// Alertas de prueba - Periodo 2026-1 (CUL: 20% fallas = pierde, nota < 3.0 = riesgo)
export const alertasMock: Alerta[] = [
  { id: 'alt-001', tipo: 'inasistencia', titulo: '⚠️ Riesgo de pérdida por fallas', mensaje: 'Carlos Sánchez lleva 19% de inasistencias en Metodología III (máx. permitido: 20% según Reglamento CUL)', fecha: new Date('2026-02-12'), leida: false, cursoId: 'cur-001', estudianteId: 'est-004', prioridad: 'alta' },
  { id: 'alt-002', tipo: 'inasistencia', titulo: '🚨 Pérdida por inasistencia', mensaje: 'Pedro Gómez supera el 20% de inasistencias en Metodología III. Pierde la asignatura con 0.0 según Art. Reglamento Estudiantil CUL', fecha: new Date('2026-02-12'), leida: false, cursoId: 'cur-001', estudianteId: 'est-006', prioridad: 'alta' },
  { id: 'alt-003', tipo: 'riesgo_academico', titulo: 'Bajo rendimiento - Posible habilitación', mensaje: 'Carlos Sánchez tiene promedio 2.8 en Corte I. Si la nota final queda entre 2.0 y 3.0, podrá habilitar (máx. 2 materias).', fecha: new Date('2026-02-10'), leida: true, cursoId: 'cur-001', estudianteId: 'est-004', prioridad: 'alta' },
  { id: 'alt-004', tipo: 'fecha_limite', titulo: 'Cierre de Corte I próximo', mensaje: 'Faltan 3 días para el cierre del Corte I (30%) de Metodología III', fecha: new Date('2026-03-11'), leida: false, cursoId: 'cur-001', prioridad: 'media' },
  { id: 'alt-005', tipo: 'entrega_pendiente', titulo: 'Entregas pendientes', mensaje: '3 estudiantes no han entregado el avance del Marco Teórico - Anteproyecto', fecha: new Date('2026-02-25'), leida: false, cursoId: 'cur-003', prioridad: 'media' },
  { id: 'alt-006', tipo: 'nota_disponible', titulo: 'Nota disponible', mensaje: 'La nota del Quiz 2 de Metodología III ha sido registrada', fecha: new Date('2026-02-18'), leida: true, cursoId: 'cur-001', prioridad: 'baja' },
];

// Recursos educativos de prueba
export const recursosMock: RecursoEducativo[] = [
  {
    id: 'rec-001',
    titulo: 'Cómo redactar un problema de investigación',
    descripcion: 'Guía completa para formular preguntas de investigación claras y precisas',
    tipo: 'video',
    url: 'https://youtube.com/watch?v=example1',
    duracion: 18,
    nivel: 'basico',
    asignatura: 'Metodología I',
    unidadTematica: 'Planteamiento del problema',
    tags: ['problema', 'pregunta', 'planteamiento'],
    obligatorio: true,
    fechaCreacion: new Date('2025-01-15'),
  },
  {
    id: 'rec-002',
    titulo: 'Guía ICONTEX 2024 - Citas y referencias',
    descripcion: 'Manual actualizado de normas ICONTEX para citación académica',
    tipo: 'pdf',
    url: '/docs/guia-icontex-2024.pdf',
    duracion: 25,
    nivel: 'intermedio',
    asignatura: 'Metodología II',
    unidadTematica: 'Marco Teórico',
    tags: ['citas', 'referencias', 'icontex', 'apa'],
    obligatorio: true,
    fechaCreacion: new Date('2025-01-20'),
  },
  {
    id: 'rec-003',
    titulo: 'Diseño metodológico: Cualitativo vs Cuantitativo',
    descripcion: 'Curso completo sobre enfoques de investigación',
    tipo: 'curso',
    url: 'https://coursera.org/learn/metodologia',
    duracion: 120,
    nivel: 'intermedio',
    asignatura: 'Metodología III',
    unidadTematica: 'Diseño Metodológico',
    tags: ['cualitativo', 'cuantitativo', 'diseño', 'metodología'],
    obligatorio: false,
    fechaCreacion: new Date('2025-01-25'),
  },
  {
    id: 'rec-004',
    titulo: 'Zotero para principiantes',
    descripcion: 'Tutorial completo de gestión de referencias bibliográficas',
    tipo: 'video',
    url: 'https://youtube.com/watch?v=example2',
    duracion: 25,
    nivel: 'basico',
    asignatura: 'Metodología II',
    unidadTematica: 'Gestión de referencias',
    tags: ['zotero', 'referencias', 'bibliografía'],
    obligatorio: false,
    fechaCreacion: new Date('2025-02-01'),
  },
];

// Convocatorias de prueba
export const convocatoriasMock: Convocatoria[] = [
  {
    id: 'conv-001',
    codigo: 'CUL-BEC-2025-001',
    titulo: 'Beca de Excelencia Académica CUL 2025-2',
    categoria: 'beca',
    subcategoria: 'Nacional',
    entidadConvocante: 'Corporación Universitaria Latinoamericana',
    descripcion: 'Beca del 100% de matrícula para estudiantes con excelencia académica',
    requisitos: ['Promedio acumulado >= 4.0', '6° semestre o superior', 'Ninguna materia adeudada'],
    beneficios: '100% de cubrimiento de matrícula',
    fechaApertura: new Date('2025-03-01'),
    fechaCierre: new Date('2025-03-30'),
    fechaResultados: new Date('2025-04-15'),
    duracion: '1 semestre',
    competitividad: 'alta',
    enlaceOficial: 'https://cul.edu.co/becas',
    documentosAdjuntos: ['bases.pdf', 'formato-solicitud.docx'],
    programasObjetivo: ['Ingeniería de Sistemas', 'Ingeniería Industrial', 'Contaduría Pública'],
    semestreMinimo: 6,
    promedioMinimo: 4.0,
    estado: 'activa',
  },
  {
    id: 'conv-002',
    codigo: 'COL-SMI-2025-045',
    titulo: 'Convocatoria Semilleros de Investigación',
    categoria: 'investigacion',
    subcategoria: 'COLCIENCIAS',
    entidadConvocante: 'MinCiencias Colombia',
    descripcion: 'Apoyo económico para semilleros de investigación en universidades',
    requisitos: ['Estar cursando Proyecto de Investigación', 'Tutor con doctorado', 'Propuesta de investigación'],
    beneficios: '$2.000.000 + equipamiento',
    fechaApertura: new Date('2025-02-15'),
    fechaCierre: new Date('2025-03-15'),
    fechaResultados: new Date('2025-04-30'),
    duracion: '6 meses',
    competitividad: 'media',
    enlaceOficial: 'https://minciencias.gov.co/semilleros',
    documentosAdjuntos: ['bases.pdf'],
    programasObjetivo: ['Ingeniería de Sistemas', 'Ingeniería Industrial', 'Contaduría Pública'],
    estado: 'activa',
  },
  {
    id: 'conv-003',
    codigo: 'BAN-PRA-2025-012',
    titulo: 'Prácticas Profesionales Bancolombia',
    categoria: 'practica',
    subcategoria: 'Empresarial',
    entidadConvocante: 'Bancolombia',
    descripcion: 'Programa de pasantías para estudiantes de últimos semestres',
    requisitos: ['7° semestre o superior', 'Promedio >= 3.5', 'Disponibilidad tiempo completo'],
    beneficios: 'Salario mínimo + beneficios',
    fechaApertura: new Date('2025-02-01'),
    fechaCierre: new Date('2025-02-28'),
    fechaResultados: new Date('2025-03-20'),
    duracion: '6 meses',
    competitividad: 'alta',
    enlaceOficial: 'https://bancolombia.com/trabaja-con-nosotros',
    documentosAdjuntos: [],
    programasObjetivo: ['Ingeniería de Sistemas', 'Contaduría Pública'],
    semestreMinimo: 7,
    promedioMinimo: 3.5,
    estado: 'activa',
  },
];

// Festivos Colombia 2026 + Recesos Institucionales CUL
export const festivosColombia2026 = [
  // === Festivos Nacionales ===
  new Date('2026-01-01'), // Año Nuevo
  new Date('2026-01-12'), // Reyes Magos (trasladado)
  new Date('2026-03-23'), // San José (trasladado)
  new Date('2026-04-02'), // Jueves Santo
  new Date('2026-04-03'), // Viernes Santo
  new Date('2026-05-01'), // Día del Trabajo
  new Date('2026-05-18'), // Ascensión del Señor (trasladado)
  new Date('2026-06-08'), // Corpus Christi (trasladado)
  new Date('2026-06-15'), // Sagrado Corazón (trasladado)
  new Date('2026-07-20'), // Independencia de Colombia
  new Date('2026-08-07'), // Batalla de Boyacá
  new Date('2026-08-17'), // Asunción de la Virgen (trasladado)
  new Date('2026-10-12'), // Día de la Raza (trasladado)
  new Date('2026-11-02'), // Todos los Santos (trasladado)
  new Date('2026-11-16'), // Independencia de Cartagena (trasladado)
  new Date('2026-12-08'), // Inmaculada Concepción
  new Date('2026-12-25'), // Navidad

  // === Recesos Institucionales CUL 2026-1 ===
  new Date('2026-02-16'), // Receso Carnavales (Lunes)
  new Date('2026-02-17'), // Receso Carnavales (Martes)
  new Date('2026-03-30'), // Semana Santa (Lunes)
  new Date('2026-03-31'), // Semana Santa (Martes)
  new Date('2026-04-01'), // Semana Santa (Miércoles)
  // Jueves y Viernes Santo ya están como festivos nacionales
];

// Named holidays for Calendar display
export const diasFestivos2026 = [
  { fecha: new Date('2026-01-01'), nombre: 'Año Nuevo' },
  { fecha: new Date('2026-01-12'), nombre: 'Reyes Magos' },
  { fecha: new Date('2026-03-23'), nombre: 'San José' },
  { fecha: new Date('2026-04-02'), nombre: 'Jueves Santo' },
  { fecha: new Date('2026-04-03'), nombre: 'Viernes Santo' },
  { fecha: new Date('2026-05-01'), nombre: 'Día del Trabajo' },
  { fecha: new Date('2026-05-18'), nombre: 'Ascensión del Señor' },
  { fecha: new Date('2026-06-08'), nombre: 'Corpus Christi' },
  { fecha: new Date('2026-06-15'), nombre: 'Sagrado Corazón' },
  { fecha: new Date('2026-07-20'), nombre: 'Independencia de Colombia' },
  { fecha: new Date('2026-08-07'), nombre: 'Batalla de Boyacá' },
  { fecha: new Date('2026-08-17'), nombre: 'Asunción de la Virgen' },
  { fecha: new Date('2026-10-12'), nombre: 'Día de la Raza' },
  { fecha: new Date('2026-11-02'), nombre: 'Todos los Santos' },
  { fecha: new Date('2026-11-16'), nombre: 'Independencia de Cartagena' },
  { fecha: new Date('2026-12-08'), nombre: 'Inmaculada Concepción' },
  { fecha: new Date('2026-12-25'), nombre: 'Navidad' },
  // Recesos institucionales CUL
  { fecha: new Date('2026-02-14'), nombre: 'Receso Carnavales' },
  { fecha: new Date('2026-02-16'), nombre: 'Receso Carnavales' },
  { fecha: new Date('2026-02-17'), nombre: 'Receso Carnavales' },
  { fecha: new Date('2026-03-30'), nombre: 'Receso Semana Santa' },
  { fecha: new Date('2026-03-31'), nombre: 'Receso Semana Santa' },
  { fecha: new Date('2026-04-01'), nombre: 'Receso Semana Santa' },
];

// Calendario Académico CUL 2026-1
export const CALENDARIO_ACADEMICO_2026_1 = {
  INICIO_CLASES: new Date('2026-02-02'),
  FIN_CLASES: new Date('2026-05-30'),
  CIERRE_PERIODO: new Date('2026-06-06'),

  // Recesos
  RECESO_CARNAVALES: { desde: new Date('2026-02-14'), hasta: new Date('2026-02-17') },
  RECESO_SEMANA_SANTA: { desde: new Date('2026-03-30'), hasta: new Date('2026-04-05') },

  // Primer Corte (Semanas 1-6)
  CORTE_1: {
    inicio: new Date('2026-02-02'),
    fin: new Date('2026-03-14'),
    examenes: { desde: new Date('2026-03-09'), hasta: new Date('2026-03-14') },
    limiteNotas: new Date('2026-03-21'),
    correccionNotas: { desde: new Date('2026-03-23'), hasta: new Date('2026-03-24') },
  },

  // Segundo Corte (Semanas 7-12)
  CORTE_2: {
    inicio: new Date('2026-03-16'),
    fin: new Date('2026-04-25'),
    examenes: { desde: new Date('2026-04-20'), hasta: new Date('2026-04-25') },
    limiteNotas: new Date('2026-05-02'),
    correccionNotas: { desde: new Date('2026-05-04'), hasta: new Date('2026-05-05') },
  },

  // Tercer Corte (Semanas 13-17)
  CORTE_3: {
    inicio: new Date('2026-04-27'),
    fin: new Date('2026-05-30'),
    examenes: { desde: new Date('2026-05-25'), hasta: new Date('2026-05-30') },
    limiteNotas: new Date('2026-06-04'),
    correccionNotas: { desde: new Date('2026-06-05'), hasta: new Date('2026-06-05') },
  },

  // Otros
  LIMITE_MATRICULA: new Date('2026-02-22'),
  LIMITE_CAMBIO_ASIGNATURA: new Date('2026-02-27'),
  LIMITE_RETIRO_ASIGNATURA: new Date('2026-05-04'),
  EXAMENES_DIFERIDOS_1: { desde: new Date('2026-03-16'), hasta: new Date('2026-03-21') },
  EXAMENES_DIFERIDOS_2: { desde: new Date('2026-04-27'), hasta: new Date('2026-05-02') },
  EXAMENES_DIFERIDOS_3: { desde: new Date('2026-06-01'), hasta: new Date('2026-06-03') },
  HABILITACIONES: { desde: new Date('2026-06-05'), hasta: new Date('2026-06-06') },
  GRADOS_SIN_CEREMONIA_1: new Date('2026-02-21'),
  GRADOS_SIN_CEREMONIA_2: new Date('2026-05-08'),
};

// Helper para obtener estudiantes de un curso
export const getEstudiantesPorCurso = (_cursoId: string) => {
  return estudiantesMock.slice(0, 8); // Simulamos que todos los cursos tienen los mismos estudiantes
};

// Helper para obtener asistencias de un estudiante en un curso
export const getAsistenciasEstudiante = (estudianteId: string, cursoId: string) => {
  return asistenciasMock.filter(a => a.estudianteId === estudianteId && a.cursoId === cursoId);
};

// Helper para calcular porcentaje de asistencia
export const calcularPorcentajeAsistencia = (asistencias: Asistencia[]) => {
  if (asistencias.length === 0) return 100;
  const presentes = asistencias.filter(a => a.estado === 'presente').length;
  const tardes = asistencias.filter(a => a.estado === 'tarde').length;
  return Math.round(((presentes + tardes * 0.5) / asistencias.length) * 100);
};

// Helper para calcular promedio de notas
export const calcularPromedioNotas = (notas: Nota[]) => {
  if (notas.length === 0) return 0;
  const suma = notas.reduce((acc, n) => acc + n.valor, 0);
  return Math.round((suma / notas.length) * 10) / 10;
};

// ======================================================================
// HELPERS DE CALENDARIO Y ASISTENCIA (basados en Reglamento CUL)
// ======================================================================

// Verificar si una fecha es festivo
export const esFestivo = (fecha: Date): boolean => {
  const fechaStr = fecha.toISOString().split('T')[0];
  return festivosColombia2026.some(f => f.toISOString().split('T')[0] === fechaStr);
};

// Calcular TODAS las fechas de clase de un curso en el semestre (excluyendo festivos)
export const calcularFechasDeClase = (curso: { fechaInicio: Date; fechaFin: Date; diasClase: number[] }): Date[] => {
  const fechas: Date[] = [];
  const inicio = new Date(curso.fechaInicio);
  const fin = new Date(curso.fechaFin);

  const current = new Date(inicio);
  while (current <= fin) {
    const diaSemana = current.getDay();
    if (curso.diasClase.includes(diaSemana) && !esFestivo(current)) {
      fechas.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }
  return fechas;
};

// Calcular total de clases que tendrá el curso en el semestre
export const calcularTotalClasesSemestre = (curso: { fechaInicio: Date; fechaFin: Date; diasClase: number[] }): number => {
  return calcularFechasDeClase(curso).length;
};

// Obtener la fecha de clase más cercana (hoy si es día de clase, o la próxima/anterior)
// Útil para pre-cargar la fecha al abrir el módulo de asistencia
export const obtenerFechaClaseMasCercana = (curso: { fechaInicio: Date; fechaFin: Date; diasClase: number[] }): Date => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  // Si hoy es día de clase y no es festivo, devolver hoy
  if (curso.diasClase.includes(hoy.getDay()) && !esFestivo(hoy)) {
    return hoy;
  }

  // Buscar la fecha de clase más cercana (hacia atrás y hacia adelante)
  const fechas = calcularFechasDeClase(curso);
  if (fechas.length === 0) return hoy;

  let masCercana = fechas[0];
  let menorDiff = Math.abs(hoy.getTime() - fechas[0].getTime());

  for (const fecha of fechas) {
    const diff = Math.abs(hoy.getTime() - fecha.getTime());
    if (diff < menorDiff) {
      menorDiff = diff;
      masCercana = fecha;
    }
  }
  return masCercana;
};

// Calcular cuántas clases han pasado hasta una fecha dada
export const calcularClasesPasadas = (curso: { fechaInicio: Date; fechaFin: Date; diasClase: number[] }, hastaFecha: Date): number => {
  const fechas = calcularFechasDeClase(curso);
  return fechas.filter(f => f <= hastaFecha).length;
};

// Constantes del Reglamento CUL
export const REGLAMENTO_CUL = {
  // Sistema de calificaciones
  ESCALA_MIN: 0.0,
  ESCALA_MAX: 5.0,
  NOTA_APROBATORIA_PREGRADO: 3.0,
  NOTA_APROBATORIA_POSGRADO: 3.5,
  NOTA_HABILITACION_MIN: 2.0,
  NOTA_HABILITACION_MAX: 3.0,
  MAX_HABILITACIONES: 2,
  NOTA_APROBATORIA_SUSTENTACION: 3.8,
  NOTA_VALIDACION_MIN: 3.5,

  // Cortes
  CORTE_1_PORCENTAJE: 30,
  CORTE_2_PORCENTAJE: 30,
  CORTE_3_PORCENTAJE: 40,

  // Asistencia
  ASISTENCIA_MINIMA: 80, // porcentaje
  INASISTENCIA_MAXIMA: 20, // porcentaje para pérdida
  INASISTENCIA_JUSTIFICADA_MAXIMA: 25, // porcentaje con justificación médica/EPS
  TARDANZA_MINUTOS: 15, // >15 min = falla
  DIAS_HABILES_JUSTIFICACION: 3, // días para presentar soporte EPS

  // Matrícula
  SEMANAS_RETIRO_SIN_NOTA: 3,
  DEVOLUCION_ANTES_INICIO: 75, // porcentaje
  DEVOLUCION_ANTES_SEMANA_4: 25, // porcentaje
};
