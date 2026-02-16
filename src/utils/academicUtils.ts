import type { Asistencia, Nota } from '@/types';

// Días festivos y recesos 2026
const festivosColombia2026: Date[] = [
    new Date('2026-01-01'), // Año Nuevo
    new Date('2026-01-12'), // Reyes Magos
    new Date('2026-03-23'), // San José
    new Date('2026-04-02'), // Jueves Santo
    new Date('2026-04-03'), // Viernes Santo
    new Date('2026-05-01'), // Día del Trabajo
    new Date('2026-05-18'), // Ascensión del Señor
    new Date('2026-06-08'), // Corpus Christi
    new Date('2026-06-15'), // Sagrado Corazón
    new Date('2026-07-20'), // Independencia de Colombia
    new Date('2026-08-07'), // Batalla de Boyacá
    new Date('2026-08-17'), // Asunción de la Virgen
    new Date('2026-10-12'), // Día de la Raza
    new Date('2026-11-02'), // Todos los Santos
    new Date('2026-11-16'), // Independencia de Cartagena
    new Date('2026-12-08'), // Inmaculada Concepción
    new Date('2026-12-25'), // Navidad
    // Recesos institucionales CUL
    new Date('2026-02-14'), // Receso Carnavales
    new Date('2026-02-16'), // Receso Carnavales
    new Date('2026-02-17'), // Receso Carnavales
    new Date('2026-03-30'), // Receso Semana Santa
    new Date('2026-03-31'), // Receso Semana Santa
    new Date('2026-04-01'), // Receso Semana Santa
];

export const diasFestivos2026 = festivosColombia2026.map(d => ({ fecha: d, nombre: 'Festivo/Receso' }));

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
    const suma = notas.reduce((acc, n) => acc + (n.valor || 0), 0);
    return Math.round((suma / notas.length) * 10) / 10;
};

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
        if (curso.diasClase && curso.diasClase.includes(diaSemana) && !esFestivo(current)) {
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
export const obtenerFechaClaseMasCercana = (curso: { fechaInicio: Date; fechaFin: Date; diasClase: number[] }): Date => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Si hoy es día de clase y no es festivo, devolver hoy
    if (curso.diasClase && curso.diasClase.includes(hoy.getDay()) && !esFestivo(hoy)) {
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
