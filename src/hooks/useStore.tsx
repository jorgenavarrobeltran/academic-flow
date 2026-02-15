// Store global de la aplicación - AcademicFlow Pro

import React, { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import type {
  Usuario,
  Curso,
  Alerta,
  Asistencia,
  Calificacion,
  Evaluacion,
  NotaActividad,
  EventoCalendario,
  RecursoEducativo,
  Convocatoria
} from '@/types';
import {
  alertasMock,
  asistenciasMock,
  eventosMock,
  recursosMock,
  convocatoriasMock,
  cursosMock,
  estudiantesMock
} from '@/data/mockData';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

// Estado inicial
interface AppState {
  // Autenticación
  usuario: Usuario | null;
  isAuthenticated: boolean;

  // Datos principales
  cursos: Curso[];
  cursoSeleccionado: Curso | null;
  alertas: Alerta[];
  asistencias: Asistencia[];
  notas: Calificacion[];
  eventos: EventoCalendario[];
  recursos: RecursoEducativo[];
  convocatorias: Convocatoria[];

  // Evaluaciones detalladas
  evaluaciones: Evaluacion[];
  notasActividades: NotaActividad[];

  // UI State
  sidebarOpen: boolean;
  activeTab: string;
  modalOpen: string | null;
  toast: { message: string; type: 'success' | 'error' | 'warning' | 'info' } | null;

  // Filtros
  filtroSemestre: string;
  filtroAsignatura: string;
  filtroBusqueda: string;
}

const initialState: AppState = {
  usuario: null,
  isAuthenticated: false,
  cursos: [],
  cursoSeleccionado: null,
  alertas: alertasMock,
  asistencias: asistenciasMock,
  notas: [], // Empty initially to avoid type mismatch with old mocks
  eventos: eventosMock,
  recursos: recursosMock,
  convocatorias: convocatoriasMock,
  evaluaciones: [],
  notasActividades: [],
  sidebarOpen: true,
  activeTab: 'dashboard',
  modalOpen: null,
  toast: null,
  filtroSemestre: 'todos',
  filtroAsignatura: 'todas',
  filtroBusqueda: '',
};

// Tipos de acciones
type Action =
  | { type: 'LOGIN'; payload: Usuario }
  | { type: 'LOGOUT' }
  | { type: 'SET_CURSO_SELECCIONADO'; payload: Curso | null }
  | { type: 'SET_CURSOS'; payload: Curso[] }
  | { type: 'ADD_CURSO'; payload: Curso }
  | { type: 'UPDATE_CURSO'; payload: Curso }
  | { type: 'DELETE_CURSO'; payload: string }
  | { type: 'MOVER_ESTUDIANTE_CURSO'; payload: { estudianteId: string; cursoOrigenId: string; cursoDestinoId: string } }
  | { type: 'SET_ALERTAS'; payload: Alerta[] }
  | { type: 'MARCAR_ALERTA_LEIDA'; payload: string }
  | { type: 'SET_ASISTENCIAS'; payload: Asistencia[] }
  | { type: 'ADD_ASISTENCIA'; payload: Asistencia }
  | { type: 'UPDATE_ASISTENCIA'; payload: Asistencia }
  | { type: 'SET_NOTAS'; payload: Calificacion[] }
  | { type: 'ADD_NOTA'; payload: Calificacion }
  | { type: 'UPDATE_NOTA'; payload: Calificacion }
  | { type: 'SET_EVALUACIONES'; payload: Evaluacion[] }
  | { type: 'ADD_EVALUACION'; payload: Evaluacion }
  | { type: 'DELETE_EVALUACION'; payload: string }
  | { type: 'SET_NOTAS_ACTIVIDADES'; payload: NotaActividad[] }
  | { type: 'UPDATE_NOTA_ACTIVIDAD'; payload: NotaActividad }
  | { type: 'SET_EVENTOS'; payload: EventoCalendario[] }
  | { type: 'ADD_EVENTO'; payload: EventoCalendario }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'SET_MODAL_OPEN'; payload: string | null }
  | { type: 'SET_TOAST'; payload: { message: string; type: 'success' | 'error' | 'warning' | 'info' } | null }
  | { type: 'SET_FILTRO_SEMESTRE'; payload: string }
  | { type: 'SET_FILTRO_ASIGNATURA'; payload: string }
  | { type: 'SET_ESTUDIANTES_CURSO'; payload: { cursoId: string; estudiantes: any[] } }
  | { type: 'SET_FILTRO_BUSQUEDA'; payload: string };

// Reducer
function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, usuario: action.payload, isAuthenticated: true };
    case 'LOGOUT':
      return { ...state, usuario: null, isAuthenticated: false };
    case 'SET_CURSO_SELECCIONADO':
      return { ...state, cursoSeleccionado: action.payload };
    case 'SET_CURSOS':
      return { ...state, cursos: action.payload };
    case 'ADD_CURSO':
      return { ...state, cursos: [...state.cursos, action.payload] };
    case 'UPDATE_CURSO':
      return {
        ...state,
        cursos: state.cursos.map(c => c.id === action.payload.id ? action.payload : c),
      };
    case 'DELETE_CURSO':
      return {
        ...state,
        cursos: state.cursos.filter(c => c.id !== action.payload),
      };
    case 'SET_ESTUDIANTES_CURSO':
      const updatedCursos = state.cursos.map(c =>
        c.id === action.payload.cursoId
          ? { ...c, estudiantes: action.payload.estudiantes }
          : c
      );
      return {
        ...state,
        cursos: updatedCursos,
        cursoSeleccionado: state.cursoSeleccionado?.id === action.payload.cursoId
          ? { ...state.cursoSeleccionado, estudiantes: action.payload.estudiantes }
          : state.cursoSeleccionado
      };
    case 'MOVER_ESTUDIANTE_CURSO':
      const { estudianteId, cursoOrigenId, cursoDestinoId } = action.payload;
      return {
        ...state,
        cursos: state.cursos.map(curso => {
          if (curso.id === cursoOrigenId) {
            return {
              ...curso,
              estudiantes: curso.estudiantes.filter(e => e.estudianteId !== estudianteId)
            };
          }
          if (curso.id === cursoDestinoId) {
            const estudianteExiste = curso.estudiantes.some(e => e.estudianteId === estudianteId);
            if (estudianteExiste) return curso;
            return {
              ...curso,
              estudiantes: [
                ...curso.estudiantes,
                { estudianteId, fechaInscripcion: new Date(), asistencias: [], notas: [] }
              ]
            };
          }
          return curso;
        }),
      };
    case 'SET_ALERTAS':
      return { ...state, alertas: action.payload };
    case 'MARCAR_ALERTA_LEIDA':
      return {
        ...state,
        alertas: state.alertas.map(a =>
          a.id === action.payload ? { ...a, leida: true } : a
        ),
      };
    case 'SET_ASISTENCIAS':
      return { ...state, asistencias: action.payload };
    case 'ADD_ASISTENCIA':
      return { ...state, asistencias: [...state.asistencias, action.payload] };
    case 'UPDATE_ASISTENCIA':
      return {
        ...state,
        asistencias: state.asistencias.map(a =>
          a.id === action.payload.id ? action.payload : a
        ),
      };
    case 'SET_NOTAS':
      return { ...state, notas: action.payload };
    case 'ADD_NOTA':
      return { ...state, notas: [...state.notas, action.payload] };
    case 'UPDATE_NOTA':
      return {
        ...state,
        notas: state.notas.map(n =>
          n.id === action.payload.id ? action.payload : n
        ),
      };
    case 'SET_EVALUACIONES':
      return { ...state, evaluaciones: action.payload };
    case 'ADD_EVALUACION':
      return { ...state, evaluaciones: [...state.evaluaciones, action.payload] };
    case 'DELETE_EVALUACION':
      return {
        ...state,
        evaluaciones: state.evaluaciones.filter(e => e.id !== action.payload),
        notasActividades: state.notasActividades.filter(n => n.evaluacionId !== action.payload)
      };
    case 'SET_NOTAS_ACTIVIDADES':
      return { ...state, notasActividades: action.payload };
    case 'UPDATE_NOTA_ACTIVIDAD':
      return {
        ...state,
        notasActividades: state.notasActividades.map(n =>
          n.id === action.payload.id ? action.payload : n
        ).some(n => n.id === action.payload.id)
          ? state.notasActividades.map(n => n.id === action.payload.id ? action.payload : n)
          : [...state.notasActividades, action.payload]
      };
    case 'SET_EVENTOS':
      return { ...state, eventos: action.payload };
    case 'ADD_EVENTO':
      return { ...state, eventos: [...state.eventos, action.payload] };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'SET_MODAL_OPEN':
      return { ...state, modalOpen: action.payload };
    case 'SET_TOAST':
      return { ...state, toast: action.payload };
    case 'SET_FILTRO_SEMESTRE':
      return { ...state, filtroSemestre: action.payload };
    case 'SET_FILTRO_ASIGNATURA':
      return { ...state, filtroAsignatura: action.payload };
    case 'SET_FILTRO_BUSQUEDA':
      return { ...state, filtroBusqueda: action.payload };
    default:
      return state;
  }
}

// Context
interface StoreContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Provider
export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Cargar cursos desde Supabase o Mocks al iniciar o cambiar usuario
  React.useEffect(() => {
    const fetchCursos = async () => {
      /*
      // Modo Demo (Legacy: Priorizar Supabase, si falla, usar mocks)
      if (state.usuario?.id === 'docente-demo') {
        dispatch({ type: 'SET_CURSOS', payload: cursosMock });
        return;
      }
      */

      try {
        const { data, error } = await supabase
          .from('cursos')
          .select(`
            *,
            inscripciones (
              estudiante_id,
              created_at
            )
          `)
          .eq('activo', true);

        if (error) {
          console.error('Error fetching cursos:', error);
          // Fallback a mocks si falla Supabase - FILTRAR SEGUN ROL
          console.warn('Usando datos mock como fallback');
          let cursosFallback = cursosMock;
          if (state.usuario?.rol === 'estudiante') {
            cursosFallback = cursosMock.filter(c =>
              c.estudiantes?.some(e => e.estudianteId === state.usuario?.id)
            );
          }
          dispatch({ type: 'SET_CURSOS', payload: cursosFallback });
          return;
        }

        if (data && data.length > 0) {
          // Filtrar datos reales también si es estudiante (aunque RLS debería hacerlo, mejor asegurar en cliente también)
          let cursosData = data;
          if (state.usuario?.rol === 'estudiante') {
            // Si el inscrito no está en la lista de inscripciones, excluir curso
            // NOTA: Con la query actual traemos todos los cursos y TODAS sus inscripciones.
            // Para estudiante, deberíamos filtrar los cursos donde SU id esté en inscripciones.
            cursosData = data.filter((c: any) =>
              c.inscripciones.some((i: any) => i.estudiante_id === state.usuario?.id)
            );
          }

          const cursosFormateados = cursosData.map((c: any) => ({
            ...c,
            fechaInicio: new Date(c.fecha_inicio || c.created_at),
            fechaFin: new Date(c.fecha_fin || c.created_at),
            asignatura: c.asignatura || 'Sin Asignatura',
            semestre: c.semestre || '2026-1',
            grupo: c.grupo || 'A',
            diasClase: c.dias_clase || [1, 3], // Default: Lun y Mié
            horaInicio: c.hora_inicio || '08:00',
            horaFin: c.hora_fin || '10:00',
            estudiantes: c.inscripciones ? c.inscripciones.map((i: any) => ({
              estudianteId: i.estudiante_id,
              fechaInscripcion: new Date(i.created_at),
              asistencias: [],
              notas: []
            })) : [],
            configuracionNotas: c.configuracion_notas || {
              cortes: [
                { numero: 1, porcentaje: 30, fechaInicio: new Date(), fechaFin: new Date(), cerrado: false },
                { numero: 2, porcentaje: 30, fechaInicio: new Date(), fechaFin: new Date(), cerrado: false },
                { numero: 3, porcentaje: 40, fechaInicio: new Date(), fechaFin: new Date(), cerrado: false },
              ],
              componentes: []
            }
          }));
          dispatch({ type: 'SET_CURSOS', payload: cursosFormateados });
        } else {
          // Sin cursos en la DB, usar mocks filtrados
          console.warn('No hay cursos en la base de datos, usando datos mock');
          let cursosFallback = cursosMock;
          if (state.usuario?.rol === 'estudiante') {
            cursosFallback = cursosMock.filter(c =>
              c.estudiantes?.some(e => e.estudianteId === state.usuario?.id)
            );
          }
          dispatch({ type: 'SET_CURSOS', payload: cursosFallback });
        }
      } catch (err) {
        console.error('System error fetching cursos:', err);
        // Fallback a mocks en caso de error de sistema
        let cursosFallback = cursosMock;
        if (state.usuario?.rol === 'estudiante') {
          cursosFallback = cursosMock.filter(c =>
            c.estudiantes?.some(e => e.estudianteId === state.usuario?.id)
          );
        }
        dispatch({ type: 'SET_CURSOS', payload: cursosFallback });
      }
    };

    fetchCursos();
  }, [state.usuario?.id]);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

// Hook personalizado
export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore debe usarse dentro de un StoreProvider');
  }
  return context;
}

// Hooks especializados para acciones comunes
export function useAuth() {
  const { state, dispatch } = useStore();

  const login = useCallback((usuario: Usuario) => {
    dispatch({ type: 'LOGIN', payload: usuario });
  }, [dispatch]);

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
  }, [dispatch]);

  return {
    usuario: state.usuario,
    isAuthenticated: state.isAuthenticated,
    login,
    logout,
  };
}

export function useCursos() {
  const { state, dispatch } = useStore();

  const setCursoSeleccionado = useCallback((curso: Curso | null) => {
    dispatch({ type: 'SET_CURSO_SELECCIONADO', payload: curso });
  }, [dispatch]);

  const addCurso = useCallback(async (curso: Curso) => {
    try {
      // Omitir campos que se generan en DB o no coinciden snake_case si no usamos mapping
      // Mapear CamelCase a snake_case
      const cursoDB = {
        codigo: curso.codigo,
        nombre: curso.nombre,
        asignatura: curso.asignatura,
        semestre: curso.semestre,
        grupo: curso.grupo,
        fecha_inicio: curso.fechaInicio,
        fecha_fin: curso.fechaFin,
        docente_id: (await supabase.auth.getUser()).data.user?.id, // Asignar al usuario actual
        activo: true,
        archivado: false
      };

      const { data, error } = await supabase
        .from('cursos')
        .insert(cursoDB)
        .select()
        .single();

      if (error) throw error;

      // Actualizar estado local con los datos reales de la DB
      const nuevoCurso = {
        ...curso,
        id: data.id,
        created_at: data.created_at
      };

      dispatch({ type: 'ADD_CURSO', payload: nuevoCurso });
      dispatch({ type: 'SET_TOAST', payload: { message: 'Curso creado correctamente', type: 'success' } });
    } catch (error: any) {
      console.error('Error adding curso:', error);
      dispatch({
        type: 'SET_TOAST',
        payload: { message: `Error al crear curso: ${error.message}`, type: 'error' }
      });
    }
  }, [dispatch]);

  const updateCurso = useCallback(async (curso: Curso) => {
    try {
      const cursoDB = {
        nombre: curso.nombre,
        asignatura: curso.asignatura,
        semestre: curso.semestre,
        grupo: curso.grupo,
        fecha_inicio: curso.fechaInicio,
        fecha_fin: curso.fechaFin,
      };

      const { error } = await supabase
        .from('cursos')
        .update(cursoDB)
        .eq('id', curso.id);

      if (error) throw error;

      dispatch({ type: 'UPDATE_CURSO', payload: curso });
      dispatch({ type: 'SET_TOAST', payload: { message: 'Curso actualizado', type: 'success' } });
    } catch (error: any) {
      console.error('Error updating curso:', error);
      dispatch({ type: 'SET_TOAST', payload: { message: 'Error al actualizar', type: 'error' } });
    }
  }, [dispatch]);

  const deleteCurso = useCallback(async (cursoId: string) => {
    try {
      const { error } = await supabase
        .from('cursos')
        .delete()
        .eq('id', cursoId);

      if (error) throw error;

      dispatch({ type: 'DELETE_CURSO', payload: cursoId });
      dispatch({ type: 'SET_TOAST', payload: { message: 'Curso eliminado', type: 'success' } });
    } catch (error: any) {
      console.error('Error deleting curso:', error);
      dispatch({ type: 'SET_TOAST', payload: { message: 'Error al eliminar', type: 'error' } });
    }
  }, [dispatch]);

  const moverEstudianteEntreCursos = useCallback((estudianteId: string, cursoOrigenId: string, cursoDestinoId: string) => {
    dispatch({
      type: 'MOVER_ESTUDIANTE_CURSO',
      payload: { estudianteId, cursoOrigenId, cursoDestinoId }
    });
  }, [dispatch]);

  const fetchEstudiantesPorCurso = useCallback(async (cursoId: string) => {
    /*
    if (state.usuario?.id === 'docente-demo') {
      // En modo demo, simulamos carga (Fallback handles this now)
      dispatch({
        type: 'SET_ESTUDIANTES_CURSO',
        payload: { cursoId, estudiantes: estudiantesMock }
      });
      return;
    }
    */

    try {
      const { data, error } = await supabase
        .from('inscripciones')
        .select(`
          estudiante_id,
          created_at,
          usuarios (
            id,
            nombre,
            apellido,
            email,
            codigo,
            foto_url,
            programa,
            semestre
          )
        `)
        .eq('curso_id', cursoId);

      if (error) throw error;

      if (data) {
        // Mapear a formato local Estudiante
        const estudiantes = data.map((d: any) => ({
          estudianteId: d.estudiante_id,
          nombre: d.usuarios?.nombre || 'Desconocido',
          apellido: d.usuarios?.apellido || '',
          email: d.usuarios?.email,
          codigo: d.usuarios?.codigo,
          fotoUrl: d.usuarios?.foto_url,
          programa: d.usuarios?.programa,
          semestre: d.usuarios?.semestre,
          fechaInscripcion: new Date(d.created_at),
          asistencias: [],
          notas: []
        }));

        dispatch({
          type: 'SET_ESTUDIANTES_CURSO',
          payload: { cursoId, estudiantes }
        });
      }
    } catch (error: any) {
      console.error('Error fetching estudiantes:', error);
      // Fallback a mocks
      dispatch({
        type: 'SET_ESTUDIANTES_CURSO',
        payload: { cursoId, estudiantes: estudiantesMock }
      });
    }
  }, [dispatch]);

  const updateEstudiante = useCallback(async (estudiante: any) => {
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({
          es_homologante: estudiante.esHomologante,
          ha_visto_clase_antes: estudiante.haVistoClaseAntes,
          // Map other fields if needed
        })
        .eq('id', estudiante.id); // Assuming estudiante.id maps to usuarios.id (which it should for students)

      if (error) throw error;

      dispatch({
        type: 'SET_TOAST',
        payload: { message: 'Estudiante actualizado correctamente', type: 'success' }
      });

      // Optionally refresh local state for that student...
      // For now, let's assume the caller handles local state update via re-fetch or manual update
    } catch (error: any) {
      console.error('Error updating estudiante:', error);
      dispatch({
        type: 'SET_TOAST',
        payload: { message: `Error al actualizar: ${error.message}`, type: 'error' }
      });
    }
  }, [dispatch]);


  return {
    cursos: state.cursos,
    cursoSeleccionado: state.cursoSeleccionado,
    setCursoSeleccionado,
    addCurso,
    updateCurso,
    deleteCurso,
    moverEstudianteEntreCursos,
    fetchEstudiantesPorCurso,
    updateEstudiante
  };
}

export function useAlertas() {
  const { state, dispatch } = useStore();

  const marcarLeida = useCallback((alertaId: string) => {
    dispatch({ type: 'MARCAR_ALERTA_LEIDA', payload: alertaId });
  }, [dispatch]);

  const marcarTodasLeidas = useCallback(() => {
    state.alertas.forEach(a => {
      if (!a.leida) dispatch({ type: 'MARCAR_ALERTA_LEIDA', payload: a.id });
    });
  }, [state.alertas, dispatch]);

  const alertasNoLeidas = state.alertas.filter(a => !a.leida);
  const alertasRiesgo = state.alertas.filter(a => a.prioridad === 'alta' && !a.leida);

  return {
    alertas: state.alertas,
    alertasNoLeidas,
    alertasRiesgo,
    contadorNoLeidas: alertasNoLeidas.length,
    contadorRiesgo: alertasRiesgo.length,
    marcarLeida,
    marcarTodasLeidas,
  };
}

export function useAsistencias() {
  const { state, dispatch } = useStore();

  const fetchAsistenciasPorCurso = useCallback(async (cursoId: string) => {
    /*
    if (state.usuario?.id === 'docente-demo') {
      dispatch({ type: 'SET_ASISTENCIAS', payload: asistenciasMock });
      return;
    }
    */

    try {
      const { data, error } = await supabase
        .from('asistencia')
        .select('*')
        .eq('curso_id', cursoId);

      if (error) throw error;

      if (data) {
        const asistencias: Asistencia[] = data.map((a: any) => ({
          id: a.id,
          estudianteId: a.estudiante_id,
          cursoId: a.curso_id,
          fecha: new Date(a.fecha), // Ensure date parsing
          estado: a.estado,
          observacion: a.observacion
        }));
        dispatch({ type: 'SET_ASISTENCIAS', payload: asistencias });
      }
    } catch (error: any) {

      console.error('Error fetching asistencias:', error);
      // Fallback
      dispatch({ type: 'SET_ASISTENCIAS', payload: asistenciasMock });
    }
  }, [dispatch]);

  const saveAsistencias = useCallback(async (nuevasAsistencias: Asistencia[]) => {
    /*
    if (state.usuario?.id === 'docente-demo') {
       // ... Logic moved to catch block or removed to force DB try
       // Keeping fallback logic logic below would be better but for now let's try DB
    }
    */

    try {
      // Prepare data for upsert
      // We need to handle 'id' carefully. If it's a temp ID (starts with asis-), remove it to let DB generate UUID,
      // OR better, checking if it exists. 
      // Actually, Supabase upsert works with primary key or unique constraints. 
      // We don't have a unique constraint on (curso_id, estudiante_id, fecha) yet? 
      // Let's check init_schema.sql... No unique constraint on (curso_id, estudiante, fecha).
      // We should probably rely on the ID if updating, or insert if new. 
      // But for bulk saving from UI where we might not have IDs for new records...
      // Ideally we should add a unique constraint like UNIQUE(curso_id, estudiante_id, fecha) to prevent duplicates.
      // For now, let's assume we are updating existing ones by ID if valid UUID, else insert.

      const records = nuevasAsistencias.map(a => {
        const isNew = a.id.startsWith('asis-');
        return {
          id: isNew ? undefined : a.id, // Let Supabase gen ID if new
          curso_id: a.cursoId,
          estudiante_id: a.estudianteId,
          fecha: format(a.fecha, 'yyyy-MM-dd'), // Send as string for DATE type
          estado: a.estado,
          observacion: a.observacion
        };
      });

      const { data, error } = await supabase
        .from('asistencia')
        .upsert(records) // Upsert requires ID match
        .select();

      if (error) throw error;

      if (data) {
        // Update local state
        const saved: Asistencia[] = data.map((a: any) => ({
          id: a.id,
          estudianteId: a.estudiante_id,
          cursoId: a.curso_id,
          fecha: new Date(a.fecha + 'T12:00:00'), // append time to avoid timezone shift on plain dates
          estado: a.estado,
          observacion: a.observacion
        }));

        // Merge with existing state is tricky with array replacement, easier to re-fetch or manual merge
        // For simplicity, let's just refetch or assume strict replacement per day?
        // Let's manually merge into state
        const currentAsistencias = [...state.asistencias];
        saved.forEach(s => {
          const idx = currentAsistencias.findIndex(ca => ca.id === s.id || (ca.estudianteId === s.estudianteId && format(ca.fecha, 'yyyy-MM-dd') === format(s.fecha, 'yyyy-MM-dd')));
          if (idx >= 0) {
            currentAsistencias[idx] = s;
          } else {
            currentAsistencias.push(s);
          }
        });

        dispatch({ type: 'SET_ASISTENCIAS', payload: currentAsistencias });
        dispatch({ type: 'SET_TOAST', payload: { message: 'Asistencia guardada', type: 'success' } });
      }
    } catch (error: any) {
      console.error('Error saving asistencia:', error);
      dispatch({ type: 'SET_TOAST', payload: { message: `Error al guardar: ${error.message}`, type: 'error' } });

      // Fallback for Demo if DB fails
      if (state.usuario?.id === 'docente-demo') {
        const currentAsistencias = [...state.asistencias];
        nuevasAsistencias.forEach(s => {
          const idx = currentAsistencias.findIndex(ca => ca.id === s.id || (ca.estudianteId === s.estudianteId && format(new Date(ca.fecha), 'yyyy-MM-dd') === format(new Date(s.fecha), 'yyyy-MM-dd')));
          if (idx >= 0) {
            currentAsistencias[idx] = s;
          } else {
            currentAsistencias.push({ ...s, id: s.id.startsWith('asis-') ? `mock-${Date.now()}` : s.id });
          }
        });
        dispatch({ type: 'SET_ASISTENCIAS', payload: currentAsistencias });
        dispatch({ type: 'SET_TOAST', payload: { message: 'Asistencia guardada (Local)', type: 'info' } });
      }

    }
  }, [dispatch, state.asistencias]);

  return {
    asistencias: state.asistencias,
    fetchAsistenciasPorCurso,
    saveAsistencias
  };
}

// Hook para calificaciones y evaluaciones
export function useCalificaciones() {
  const { state, dispatch } = useStore();

  const fetchCalificaciones = useCallback(async (cursoId: string) => {
    try {
      const { data, error } = await supabase
        .from('calificaciones')
        .select('*')
        .eq('curso_id', cursoId);

      if (error) throw error;

      if (data) {
        const calificaciones: Calificacion[] = data.map((c: any) => ({
          id: c.id,
          estudianteId: c.estudiante_id,
          cursoId: c.curso_id,
          corte1: { nota: c.corte1_nota, observacion: c.corte1_observacion },
          corte2: { nota: c.corte2_nota, observacion: c.corte2_observacion },
          corte3: { nota: c.corte3_nota, observacion: c.corte3_observacion },
          updatedAt: new Date(c.updated_at)
        }));
        dispatch({ type: 'SET_NOTAS', payload: calificaciones });
      }
    } catch (error: any) {
      console.error('Error fetching calificaciones:', error);
      // dispatch({ type: 'SET_TOAST', payload: { message: 'Error cargando notas', type: 'error' } });
    }
  }, [dispatch]);

  const saveCalificacion = useCallback(async (cal: Calificacion) => {
    try {
      const dbPayload = {
        curso_id: cal.cursoId,
        estudiante_id: cal.estudianteId,
        corte1_nota: cal.corte1.nota,
        corte1_observacion: cal.corte1.observacion,
        corte2_nota: cal.corte2.nota,
        corte2_observacion: cal.corte2.observacion,
        corte3_nota: cal.corte3.nota,
        corte3_observacion: cal.corte3.observacion,
        updated_at: new Date()
      };

      const { data, error } = await supabase
        .from('calificaciones')
        .upsert(
          { ...dbPayload, id: cal.id.startsWith('temp-') ? undefined : cal.id },
          { onConflict: 'curso_id,estudiante_id' }
        )
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const saved: Calificacion = {
          id: data.id,
          estudianteId: data.estudiante_id,
          cursoId: data.curso_id,
          corte1: { nota: data.corte1_nota, observacion: data.corte1_observacion },
          corte2: { nota: data.corte2_nota, observacion: data.corte2_observacion },
          corte3: { nota: data.corte3_nota, observacion: data.corte3_observacion },
          updatedAt: new Date(data.updated_at)
        };
        dispatch({ type: 'UPDATE_NOTA', payload: saved });
        // dispatch({ type: 'SET_TOAST', payload: { message: 'Nota guardada', type: 'success' } });
      }
    } catch (error: any) {
      console.error('Error saving calificacion:', error);
      dispatch({ type: 'SET_TOAST', payload: { message: 'Error al guardar nota', type: 'error' } });
    }
  }, [dispatch]);

  // --- Logic for Granular Evaluations ---

  const isDemoUser = state.usuario?.id === 'docente-demo' || state.usuario?.id === 'estudiante-demo';

  const fetchEvaluaciones = useCallback(async (cursoId: string) => {
    if (isDemoUser) {
      // In demo mode, evaluaciones are managed in-memory only
      // Don't clear existing evaluaciones on fetch - they live in state
      return;
    }
    try {
      // Fetch definitions
      const { data: evas, error: errEva } = await supabase
        .from('evaluaciones')
        .select('*')
        .eq('curso_id', cursoId)
        .order('corte', { ascending: true });

      if (errEva) throw errEva;

      if (evas) {
        const evaluaciones: Evaluacion[] = evas.map((e: any) => ({
          id: e.id,
          cursoId: e.curso_id,
          corte: e.corte,
          nombre: e.nombre,
          porcentaje: e.porcentaje,
          esGrupal: e.es_grupal,
          fecha: e.fecha ? new Date(e.fecha) : undefined,
          createdAt: new Date(e.created_at)
        }));
        dispatch({ type: 'SET_EVALUACIONES', payload: evaluaciones });

        // Fetch grades for these evaluations
        if (evaluaciones.length > 0) {
          const { data: notas, error: errNotes } = await supabase
            .from('notas_actividades')
            .select('*')
            .in('evaluacion_id', evaluaciones.map(e => e.id));

          if (errNotes) throw errNotes;

          if (notas) {
            const notasActividades: NotaActividad[] = notas.map((n: any) => ({
              id: n.id,
              evaluacionId: n.evaluacion_id,
              estudianteId: n.estudiante_id,
              valor: n.valor,
              updatedAt: new Date(n.updated_at)
            }));
            dispatch({ type: 'SET_NOTAS_ACTIVIDADES', payload: notasActividades });
          }
        } else {
          dispatch({ type: 'SET_NOTAS_ACTIVIDADES', payload: [] });
        }
      }
    } catch (error: any) {
      console.error('Error fetching evaluaciones:', error);
      // Fallback or silent fail if table doesn't exist yet
    }
  }, [dispatch, isDemoUser]);

  const addEvaluacion = useCallback(async (eva: Evaluacion) => {
    // Demo mode: create evaluation locally without Supabase
    if (isDemoUser) {
      const newEva: Evaluacion = {
        ...eva,
        id: crypto.randomUUID(),
        createdAt: new Date()
      };
      dispatch({ type: 'ADD_EVALUACION', payload: newEva });
      dispatch({ type: 'SET_TOAST', payload: { message: 'Actividad creada (demo)', type: 'success' } });
      return newEva;
    }

    try {
      const dbPayload = {
        curso_id: eva.cursoId,
        corte: eva.corte,
        nombre: eva.nombre,
        porcentaje: eva.porcentaje,
        es_grupal: eva.esGrupal,
        fecha: eva.fecha ? format(eva.fecha, 'yyyy-MM-dd') : null
      };

      const { data, error } = await supabase
        .from('evaluaciones')
        .insert(dbPayload)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newEva: Evaluacion = {
          id: data.id,
          cursoId: data.curso_id,
          corte: data.corte,
          nombre: data.nombre,
          porcentaje: data.porcentaje,
          esGrupal: data.es_grupal,
          fecha: data.fecha ? new Date(data.fecha) : undefined,
          createdAt: new Date(data.created_at)
        };
        dispatch({ type: 'ADD_EVALUACION', payload: newEva });
        dispatch({ type: 'SET_TOAST', payload: { message: 'Actividad creada', type: 'success' } });
        return newEva;
      }
    } catch (error: any) {
      console.error('Error creating evaluacion:', error);
      dispatch({ type: 'SET_TOAST', payload: { message: 'Error al crear actividad: ' + error.message, type: 'error' } });
      throw error;
    }
  }, [dispatch, isDemoUser]);

  const deleteEvaluacion = useCallback(async (id: string) => {
    // Demo mode: delete locally
    if (isDemoUser) {
      dispatch({ type: 'DELETE_EVALUACION', payload: id });
      dispatch({ type: 'SET_TOAST', payload: { message: 'Actividad eliminada (demo)', type: 'success' } });
      return;
    }

    try {
      const { error } = await supabase.from('evaluaciones').delete().eq('id', id);
      if (error) throw error;
      dispatch({ type: 'DELETE_EVALUACION', payload: id });
      dispatch({ type: 'SET_TOAST', payload: { message: 'Actividad eliminada', type: 'success' } });
    } catch (error: any) {
      console.error('Error deleting evaluacion', error);
      dispatch({ type: 'SET_TOAST', payload: { message: 'Error eliminar', type: 'error' } });
    }
  }, [dispatch, isDemoUser]);

  const saveNotaActividad = useCallback(async (nota: NotaActividad) => {
    // Demo mode: save grade locally
    if (isDemoUser) {
      const saved: NotaActividad = {
        ...nota,
        id: nota.id.startsWith('temp-') ? crypto.randomUUID() : nota.id,
        updatedAt: new Date()
      };
      dispatch({ type: 'UPDATE_NOTA_ACTIVIDAD', payload: saved });
      return;
    }

    try {
      const dbPayload = {
        evaluacion_id: nota.evaluacionId,
        estudiante_id: nota.estudianteId,
        valor: nota.valor,
        updated_at: new Date()
      };

      const { data, error } = await supabase
        .from('notas_actividades')
        .upsert(
          { ...dbPayload, id: nota.id.startsWith('temp-') ? undefined : nota.id },
          { onConflict: 'evaluacion_id,estudiante_id' }
        )
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const saved: NotaActividad = {
          id: data.id,
          evaluacionId: data.evaluacion_id,
          estudianteId: data.estudiante_id,
          valor: data.valor,
          updatedAt: new Date(data.updated_at)
        };
        dispatch({ type: 'UPDATE_NOTA_ACTIVIDAD', payload: saved });
      }
    } catch (error: any) {
      console.error('Error saving nota actividad', error);
    }
  }, [dispatch, isDemoUser]);

  return {
    calificaciones: state.notas,
    evaluaciones: state.evaluaciones,
    notasActividades: state.notasActividades,
    fetchCalificaciones,
    saveCalificacion,
    fetchEvaluaciones,
    addEvaluacion,
    deleteEvaluacion,
    saveNotaActividad
  };
}

export function useEventos() {
  const { state, dispatch } = useStore();

  const addEvento = useCallback((evento: EventoCalendario) => {
    dispatch({ type: 'ADD_EVENTO', payload: evento });
  }, [dispatch]);

  const getEventosPorMes = useCallback((year: number, month: number) => {
    return state.eventos.filter(e => {
      const fecha = new Date(e.fechaInicio);
      return fecha.getFullYear() === year && fecha.getMonth() === month;
    });
  }, [state.eventos]);

  const getEventosPorTipo = useCallback((tipo: string) => {
    if (tipo === 'todos') return state.eventos;
    return state.eventos.filter(e => e.tipo === tipo);
  }, [state.eventos]);

  return {
    eventos: state.eventos,
    addEvento,
    getEventosPorMes,
    getEventosPorTipo,
  };
}

export function useRecursos() {
  const { state } = useStore();

  const getRecursosPorNivel = useCallback((nivel: string) => {
    if (nivel === 'todos') return state.recursos;
    return state.recursos.filter(r => r.nivel === nivel);
  }, [state.recursos]);

  const getRecursosPorTipo = useCallback((tipo: string) => {
    if (tipo === 'todos') return state.recursos;
    return state.recursos.filter(r => r.tipo === tipo);
  }, [state.recursos]);

  const getRecursosPorAsignatura = useCallback((asignatura: string) => {
    if (asignatura === 'todas') return state.recursos;
    return state.recursos.filter(r => r.asignatura === asignatura);
  }, [state.recursos]);

  return {
    recursos: state.recursos,
    getRecursosPorNivel,
    getRecursosPorTipo,
    getRecursosPorAsignatura,
  };
}

export function useUI() {
  const { state, dispatch } = useStore();

  const toggleSidebar = useCallback(() => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  }, [dispatch]);

  const setActiveTab = useCallback((tab: string) => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
  }, [dispatch]);

  const setModalOpen = useCallback((modal: string | null) => {
    dispatch({ type: 'SET_MODAL_OPEN', payload: modal });
  }, [dispatch]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    dispatch({ type: 'SET_TOAST', payload: { message, type } });
    setTimeout(() => {
      dispatch({ type: 'SET_TOAST', payload: null });
    }, 3000);
  }, [dispatch]);

  return {
    sidebarOpen: state.sidebarOpen,
    activeTab: state.activeTab,
    modalOpen: state.modalOpen,
    toast: state.toast,
    toggleSidebar,
    setActiveTab,
    setModalOpen,
    showToast,
  };
}

export function useFiltros() {
  const { state, dispatch } = useStore();

  const setFiltroSemestre = useCallback((semestre: string) => {
    dispatch({ type: 'SET_FILTRO_SEMESTRE', payload: semestre });
  }, [dispatch]);

  const setFiltroAsignatura = useCallback((asignatura: string) => {
    dispatch({ type: 'SET_FILTRO_ASIGNATURA', payload: asignatura });
  }, [dispatch]);

  const setFiltroBusqueda = useCallback((busqueda: string) => {
    dispatch({ type: 'SET_FILTRO_BUSQUEDA', payload: busqueda });
  }, [dispatch]);

  return {
    filtroSemestre: state.filtroSemestre,
    filtroAsignatura: state.filtroAsignatura,
    filtroBusqueda: state.filtroBusqueda,
    setFiltroSemestre,
    setFiltroAsignatura,
    setFiltroBusqueda,
  };
}
