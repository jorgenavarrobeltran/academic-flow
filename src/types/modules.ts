
export interface Rubrica {
    id: string;
    titulo: string;
    descripcion?: string;
    criterios: CriterioRubrica[];
    fechaCreacion: Date;
    autorId: string;
    alcance: 'todos' | 'seleccion';
    cursosIds?: string[]; // IDs de los cursos si alcance es 'seleccion'
}

export interface CriterioRubrica {
    id: string;
    nombre: string;
    descripcion?: string;
    peso: number; // Porcentaje del total (0-100)
    niveles: NivelRubrica[];
}

export interface NivelRubrica {
    id: string;
    nombre: string; // Ej: "Excelente", "Bueno"
    descripcion: string;
    puntaje: number; // Puntos o valor máximo para este nivel
}

export interface Evaluacion {
    id: string;
    titulo: string;
    descripcion?: string;
    cursoId: string;
    tipo: 'quiz' | 'parcial' | 'taller';
    fechaInicio: Date;
    fechaFin: Date;
    duracionMinutos: number;
    preguntas: PreguntaEvaluacion[];
    estado: 'borrador' | 'publicada' | 'finalizada';
    actividadId?: string; // ID de la actividad en Calificaciones a la que pertenece
}

export type TipoPregunta = 'seleccion_multiple' | 'verdadero_falso' | 'abierta';

export interface PreguntaEvaluacion {
    id: string;
    texto: string;
    tipo: TipoPregunta;
    puntos: number;
    opciones?: OpcionPregunta[]; // Para selección múltiple
    respuestaCorrecta?: string | boolean; // ID de opción, o boolean, o texto esperado
}

export interface OpcionPregunta {
    id: string;
    texto: string;
    esCorrecta: boolean;
}
