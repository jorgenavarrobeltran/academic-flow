import { useState, useMemo } from 'react';
import { useEventos, useCursos, useAuth } from '@/hooks/useStore';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  BookOpen,
  GraduationCap,
  PartyPopper,
  Users,
  FileText,
  Circle,
  AlertTriangle,
  Coffee,
  ClipboardCheck,
  MapPin,
} from 'lucide-react';
import { CALENDARIO_ACADEMICO_2026_1, diasFestivos2026 } from '@/utils/academicUtils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { EventoCalendario } from '@/types';

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const DIAS_NOMBRE_COMPLETO = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const tipoConfig: Record<string, { color: string; bgColor: string; icon: typeof CalendarIcon; label: string }> = {
  clase: { color: 'text-blue-700', bgColor: 'bg-blue-50 border-blue-200', icon: BookOpen, label: 'Clase' },
  parcial: { color: 'text-red-700', bgColor: 'bg-red-100 border-red-200', icon: GraduationCap, label: 'Parcial' },
  entrega: { color: 'text-amber-700', bgColor: 'bg-amber-100 border-amber-200', icon: FileText, label: 'Entrega' },
  festivo: { color: 'text-green-700', bgColor: 'bg-green-100 border-green-200', icon: PartyPopper, label: 'Festivo' },
  receso: { color: 'text-emerald-700', bgColor: 'bg-emerald-50 border-emerald-200', icon: Coffee, label: 'Receso' },
  corte: { color: 'text-indigo-700', bgColor: 'bg-indigo-50 border-indigo-200', icon: AlertTriangle, label: 'Corte' },
  limite_notas: { color: 'text-orange-700', bgColor: 'bg-orange-50 border-orange-200', icon: ClipboardCheck, label: 'Límite Notas' },
  reunion: { color: 'text-purple-700', bgColor: 'bg-purple-100 border-purple-200', icon: Users, label: 'Reunión' },
  otro: { color: 'text-gray-700', bgColor: 'bg-gray-100 border-gray-200', icon: Circle, label: 'Otro' },
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function isSameDay(d1: Date, d2: Date) {
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}

function isDateInRange(date: Date, start: Date, end: Date) {
  const d = date.getTime();
  return d >= start.getTime() && d <= end.getTime();
}

/** Generate class events from course schedules */
function generateClassEvents(cursos: any[], year: number, month: number): EventoCalendario[] {
  const events: EventoCalendario[] = [];
  const cal = CALENDARIO_ACADEMICO_2026_1;
  const daysInMonth = getDaysInMonth(year, month);

  cursos.filter(c => c.activo && !c.archivado).forEach(curso => {
    for (let day = 1; day <= daysInMonth; day++) {
      const fecha = new Date(year, month, day);
      const diaSemana = fecha.getDay();

      // Only generate if within semester dates
      if (fecha < cal.INICIO_CLASES || fecha > cal.FIN_CLASES) continue;

      // Skip if not a class day for this course
      if (!curso.diasClase?.includes(diaSemana)) continue;

      // Skip holidays
      const esFestivo = diasFestivos2026?.some((f: any) => isSameDay(new Date(f.fecha), fecha));
      if (esFestivo) continue;

      // Skip recesos
      const enRecesoCarnavales = isDateInRange(fecha, cal.RECESO_CARNAVALES.desde, cal.RECESO_CARNAVALES.hasta);
      const enRecesoSS = isDateInRange(fecha, cal.RECESO_SEMANA_SANTA.desde, cal.RECESO_SEMANA_SANTA.hasta);
      if (enRecesoCarnavales || enRecesoSS) continue;

      events.push({
        id: `cls-${curso.id}-${format(fecha, 'yyyy-MM-dd')}`,
        titulo: curso.nombre,
        descripcion: `${curso.horaInicio} - ${curso.horaFin}${curso.aula ? ` · ${curso.aula}` : ''}`,
        fechaInicio: fecha,
        tipo: 'clase',
        cursoId: curso.id,
        todoElDia: false,
        alertaEnviada: true,
      });
    }
  });

  return events;
}

/** Generate academic calendar institutional events for a month */
function generateAcademicEvents(year: number, month: number): EventoCalendario[] {
  const events: EventoCalendario[] = [];
  const cal = CALENDARIO_ACADEMICO_2026_1;

  const addIfInMonth = (id: string, titulo: string, desc: string, fecha: Date, tipo: EventoCalendario['tipo']) => {
    if (fecha.getFullYear() === year && fecha.getMonth() === month) {
      events.push({ id, titulo, descripcion: desc, fechaInicio: fecha, tipo, todoElDia: true, alertaEnviada: false });
    }
  };

  const addRangeIfInMonth = (id: string, titulo: string, desc: string, desde: Date, hasta: Date, tipo: EventoCalendario['tipo']) => {
    if ((desde.getFullYear() === year && desde.getMonth() === month) ||
      (hasta.getFullYear() === year && hasta.getMonth() === month)) {
      events.push({ id, titulo, descripcion: desc, fechaInicio: desde, fechaFin: hasta, tipo, todoElDia: true, alertaEnviada: false });
    }
  };

  // Inicio y fin de clases
  addIfInMonth('ac-inicio', '🏫 Inicio de Clases', 'Inicio del semestre 2026-1', cal.INICIO_CLASES, 'corte');
  addIfInMonth('ac-fin', '🏁 Fin de Clases', 'Último día de clases del semestre', cal.FIN_CLASES, 'corte');
  addIfInMonth('ac-cierre', '📋 Cierre del Periodo', 'Cierre oficial del periodo académico', cal.CIERRE_PERIODO, 'corte');

  // Recesos
  addRangeIfInMonth('ac-carnavales', '🎭 Receso de Carnavales', 'Receso institucional por carnavales', cal.RECESO_CARNAVALES.desde, cal.RECESO_CARNAVALES.hasta, 'receso');
  addRangeIfInMonth('ac-ss', '✝️ Receso Semana Santa', 'Receso académico por Semana Santa', cal.RECESO_SEMANA_SANTA.desde, cal.RECESO_SEMANA_SANTA.hasta, 'receso');

  // Corte 1
  addIfInMonth('ac-c1-fin', '📊 Cierre Corte I (30%)', 'Último día del primer corte', cal.CORTE_1.fin, 'corte');
  addRangeIfInMonth('ac-c1-exam', '📝 Exámenes Corte I', 'Periodo de evaluaciones primer corte', cal.CORTE_1.examenes.desde, cal.CORTE_1.examenes.hasta, 'parcial');
  addIfInMonth('ac-c1-notas', '⏰ Límite Notas Corte I', 'Fecha límite para carga de notas del Corte I', cal.CORTE_1.limiteNotas, 'limite_notas');
  addRangeIfInMonth('ac-c1-corr', '✏️ Corrección Notas Corte I', 'Periodo de corrección de notas', cal.CORTE_1.correccionNotas.desde, cal.CORTE_1.correccionNotas.hasta, 'limite_notas');

  // Corte 2
  addIfInMonth('ac-c2-fin', '📊 Cierre Corte II (30%)', 'Último día del segundo corte', cal.CORTE_2.fin, 'corte');
  addRangeIfInMonth('ac-c2-exam', '📝 Exámenes Corte II', 'Periodo de evaluaciones segundo corte', cal.CORTE_2.examenes.desde, cal.CORTE_2.examenes.hasta, 'parcial');
  addIfInMonth('ac-c2-notas', '⏰ Límite Notas Corte II', 'Fecha límite para carga de notas del Corte II', cal.CORTE_2.limiteNotas, 'limite_notas');
  addRangeIfInMonth('ac-c2-corr', '✏️ Corrección Notas Corte II', 'Periodo de corrección de notas', cal.CORTE_2.correccionNotas.desde, cal.CORTE_2.correccionNotas.hasta, 'limite_notas');

  // Corte 3
  addIfInMonth('ac-c3-fin', '📊 Cierre Corte III (40%)', 'Último día del tercer corte', cal.CORTE_3.fin, 'corte');
  addRangeIfInMonth('ac-c3-exam', '📝 Exámenes Corte III', 'Periodo de evaluaciones tercer corte / Finales', cal.CORTE_3.examenes.desde, cal.CORTE_3.examenes.hasta, 'parcial');
  addIfInMonth('ac-c3-notas', '⏰ Límite Notas Corte III', 'Fecha límite para carga de notas del Corte III', cal.CORTE_3.limiteNotas, 'limite_notas');

  // Other deadlines
  addIfInMonth('ac-matri', '📝 Límite Matrícula', 'Último día de matrícula extraordinaria', cal.LIMITE_MATRICULA, 'entrega');
  addIfInMonth('ac-cambio', '🔄 Límite Cambio Asignatura', 'Último día para cambio de asignatura', cal.LIMITE_CAMBIO_ASIGNATURA, 'entrega');
  addIfInMonth('ac-retiro', '🚪 Límite Retiro Asignatura', 'Último día para retiro de asignatura', cal.LIMITE_RETIRO_ASIGNATURA, 'entrega');

  // Diferidos
  addRangeIfInMonth('ac-dif1', '🔄 Exámenes Diferidos I', 'Diferidos del primer corte', cal.EXAMENES_DIFERIDOS_1.desde, cal.EXAMENES_DIFERIDOS_1.hasta, 'parcial');
  addRangeIfInMonth('ac-dif2', '🔄 Exámenes Diferidos II', 'Diferidos del segundo corte', cal.EXAMENES_DIFERIDOS_2.desde, cal.EXAMENES_DIFERIDOS_2.hasta, 'parcial');
  addRangeIfInMonth('ac-dif3', '🔄 Exámenes Diferidos III', 'Diferidos del tercer corte', cal.EXAMENES_DIFERIDOS_3.desde, cal.EXAMENES_DIFERIDOS_3.hasta, 'parcial');

  // Habilitaciones
  addRangeIfInMonth('ac-hab', '🎓 Habilitaciones', 'Exámenes de habilitación (nota ≥2.0 y <3.0, máx. 2 materias)', cal.HABILITACIONES.desde, cal.HABILITACIONES.hasta, 'parcial');

  // Festivos
  if (diasFestivos2026) {
    diasFestivos2026.forEach((f: any, i: number) => {
      const fecha = new Date(f.fecha);
      if (fecha.getFullYear() === year && fecha.getMonth() === month) {
        events.push({
          id: `fest-${i}`,
          titulo: `🇨🇴 ${f.nombre}`,
          descripcion: 'Festivo nacional - No hay clases',
          fechaInicio: fecha,
          tipo: 'festivo',
          todoElDia: true,
          alertaEnviada: true,
        });
      }
    });
  }

  return events;
}

export default function Calendario() {
  const { eventos: eventosBase } = useEventos();
  const { cursos } = useCursos();
  const { usuario } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroCurso, setFiltroCurso] = useState<string>('todos');
  const [showClasses, setShowClasses] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => { setCurrentDate(new Date(year, month - 1, 1)); setSelectedDate(null); };
  const nextMonth = () => { setCurrentDate(new Date(year, month + 1, 1)); setSelectedDate(null); };
  const goToToday = () => { setCurrentDate(new Date()); setSelectedDate(new Date()); };

  // Determine current corte
  const corteActual = useMemo(() => {
    const hoy = new Date();
    const cal = CALENDARIO_ACADEMICO_2026_1;
    if (hoy >= cal.CORTE_1.inicio && hoy <= cal.CORTE_1.fin) return { num: 1, corte: cal.CORTE_1, peso: '30%' };
    if (hoy >= cal.CORTE_2.inicio && hoy <= cal.CORTE_2.fin) return { num: 2, corte: cal.CORTE_2, peso: '30%' };
    if (hoy >= cal.CORTE_3.inicio && hoy <= cal.CORTE_3.fin) return { num: 3, corte: cal.CORTE_3, peso: '40%' };
    return null;
  }, []);

  // Filter courses based on user role
  const cursosRelevantes = useMemo(() => {
    if (!usuario) return [];
    if (usuario.rol === 'estudiante') {
      // Filter courses where the student is enrolled
      return cursos.filter(c => c.estudiantes?.some(e => e.estudianteId === usuario.id));
    }
    // For teachers, return all their courses (assuming 'cursos' already contains courses for the logged-in teacher)
    return cursos;
  }, [cursos, usuario]);


  // Build combined events
  const todosLosEventos = useMemo(() => {
    const claseEvents = showClasses ? generateClassEvents(cursosRelevantes, year, month) : [];
    const academicEvents = generateAcademicEvents(year, month);

    // Filter out eventosMock 'clase' to avoid duplication with auto-generated ones
    // Also filter base events to only show those relevant to the user's courses if student
    const baseFiltered = eventosBase.filter(e => {
      const fecha = new Date(e.fechaInicio);
      if (fecha.getFullYear() !== year || fecha.getMonth() !== month) return false;

      // Skip base 'clase' events since we auto-generate them
      if (e.tipo === 'clase' && e.id.startsWith('evt-')) return false;

      // Filter by course relevance if student
      if (usuario?.rol === 'estudiante' && e.cursoId) {
        const isEnrolled = cursosRelevantes.some(c => c.id === e.cursoId);
        if (!isEnrolled) return false;
      }

      return true;
    });

    return [...academicEvents, ...baseFiltered, ...claseEvents];
  }, [eventosBase, cursosRelevantes, year, month, showClasses, usuario]);

  // Apply filters
  const eventosFiltrados = useMemo(() => {
    let filtered = todosLosEventos;
    if (filtroTipo !== 'todos') {
      filtered = filtered.filter(e => e.tipo === filtroTipo);
    }
    if (filtroCurso !== 'todos') {
      filtered = filtered.filter(e => e.cursoId === filtroCurso || !e.cursoId);
    }
    return filtered;
  }, [todosLosEventos, filtroTipo, filtroCurso]);

  // Get events for a specific day
  const getEventosDelDia = (day: number) => {
    return eventosFiltrados.filter(e => {
      const fecha = new Date(e.fechaInicio);
      if (fecha.getDate() === day) return true;
      // Also check date ranges
      if (e.fechaFin) {
        const checkDate = new Date(year, month, day);
        return isDateInRange(checkDate, new Date(e.fechaInicio), new Date(e.fechaFin));
      }
      return false;
    });
  };

  // Selected date events
  const eventosSeleccionados = selectedDate
    ? getEventosDelDia(selectedDate.getDate())
    : [];

  // All events sorted
  const eventosOrdenados = [...eventosFiltrados].sort(
    (a, b) => new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime()
  );

  const isToday = (day: number) => {
    const today = new Date();
    return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
  };

  const isSelected = (day: number) => {
    return selectedDate && selectedDate.getDate() === day &&
      selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
  };

  // Check if day is in receso
  const isReceso = (day: number) => {
    const fecha = new Date(year, month, day);
    const cal = CALENDARIO_ACADEMICO_2026_1;
    return isDateInRange(fecha, cal.RECESO_CARNAVALES.desde, cal.RECESO_CARNAVALES.hasta)
      || isDateInRange(fecha, cal.RECESO_SEMANA_SANTA.desde, cal.RECESO_SEMANA_SANTA.hasta);
  };

  // Check if day is festivo
  const isFestivo = (day: number) => {
    const fecha = new Date(year, month, day);
    return diasFestivos2026?.some((f: any) => isSameDay(new Date(f.fecha), fecha)) || false;
  };

  // Check if day is weekend
  const isWeekend = (day: number) => {
    const fecha = new Date(year, month, day);
    return fecha.getDay() === 0 || fecha.getDay() === 6;
  };

  // Build calendar grid
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let day = 1; day <= daysInMonth; day++) calendarDays.push(day);

  // Cursos activos para filtro
  const cursosActivos = cursos.filter(c => c.activo && !c.archivado);

  // Days remaining in current corte
  const diasRestantesCorte = useMemo(() => {
    if (!corteActual) return 0;
    const hoy = new Date();
    return Math.max(0, Math.ceil((corteActual.corte.fin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)));
  }, [corteActual]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Calendario Académico</h2>
          <p className="text-muted-foreground">
            Semestre 2026-1 · CUL — Gestiona eventos, clases y evaluaciones
          </p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          {/* Selector de curso persistente */}
          <Select
            value={filtroCurso}
            onValueChange={setFiltroCurso}
          >
            <SelectTrigger className="w-[280px] border-[#cce5f3] bg-[#e6f7ff] hover:bg-[#cce5f3]">
              <SelectValue placeholder="Todos los cursos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los cursos</SelectItem>
              {cursosActivos.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => setShowClasses(!showClasses)}>
            <BookOpen className="mr-1 h-4 w-4" />
            {showClasses ? 'Ocultar Clases' : 'Mostrar Clases'}
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            <CalendarIcon className="mr-1 h-4 w-4" /> Hoy
          </Button>
        </div>
      </div>

      {/* Corte Actual Banner */}
      {corteActual && (
        <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
          <CardContent className="py-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-bold text-lg">
                  {corteActual.num}
                </div>
                <div>
                  <p className="font-semibold text-indigo-900">
                    Corte {corteActual.num} ({corteActual.peso})
                  </p>
                  <p className="text-sm text-indigo-700">
                    {format(corteActual.corte.inicio, "d MMM", { locale: es })} — {format(corteActual.corte.fin, "d MMM yyyy", { locale: es })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-indigo-700">{diasRestantesCorte}</p>
                  <p className="text-xs text-indigo-600">días restantes</p>
                </div>
                <div className="text-center border-l border-indigo-200 pl-4">
                  <p className="text-sm font-medium text-indigo-700">Exámenes</p>
                  <p className="text-xs text-indigo-600">
                    {format(corteActual.corte.examenes.desde, "d MMM", { locale: es })} - {format(corteActual.corte.examenes.hasta, "d MMM", { locale: es })}
                  </p>
                </div>
                <div className="text-center border-l border-indigo-200 pl-4">
                  <p className="text-sm font-medium text-indigo-700">Límite Notas</p>
                  <p className="text-xs text-indigo-600">
                    {format(corteActual.corte.limiteNotas, "d MMM", { locale: es })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex flex-wrap gap-2 flex-1">
          <Badge
            variant={filtroTipo === 'todos' ? 'default' : 'outline'}
            className="cursor-pointer px-3 py-1 transition-all hover:scale-105"
            onClick={() => setFiltroTipo('todos')}
          >
            Todos
          </Badge>
          {Object.entries(tipoConfig).map(([tipo, config]) => (
            <Badge
              key={tipo}
              variant={filtroTipo === tipo ? 'default' : 'outline'}
              className="cursor-pointer px-3 py-1 transition-all hover:scale-105"
              onClick={() => setFiltroTipo(tipo)}
            >
              <config.icon className="mr-1 h-3 w-3" />
              {config.label}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={prevMonth}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <CardTitle className="text-xl">
                {MESES[month]} {year}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Days header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DIAS_SEMANA.map(dia => (
                <div key={dia} className="text-center text-xs font-semibold text-muted-foreground py-2">
                  {dia}
                </div>
              ))}
            </div>

            {/* Calendar cells */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                if (day === null) {
                  return <div key={`empty-${index}`} className="h-24" />;
                }

                const dayEvents = getEventosDelDia(day);
                const today = isToday(day);
                const selected = isSelected(day);
                const receso = isReceso(day);
                const festivo = isFestivo(day);
                const weekend = isWeekend(day);

                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDate(new Date(year, month, day))}
                    className={`h-24 p-1 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${today
                      ? 'bg-primary/10 border-primary/40 ring-2 ring-primary/30'
                      : selected
                        ? 'bg-blue-50 border-blue-300 shadow-sm'
                        : receso || festivo
                          ? 'bg-green-50/60 border-green-200/50'
                          : weekend
                            ? 'bg-muted/30 border-transparent'
                            : 'border-transparent hover:border-muted-foreground/20 hover:bg-muted/30'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-medium ${today ? 'bg-primary text-white px-1.5 py-0.5 rounded-full' :
                        festivo || receso ? 'text-green-600 font-bold' :
                          weekend ? 'text-muted-foreground' : 'text-foreground'
                        }`}>
                        {day}
                      </span>
                      {dayEvents.length > 0 && (
                        <span className="text-[9px] bg-muted text-muted-foreground px-1 rounded">
                          {dayEvents.length}
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 space-y-0.5 overflow-hidden">
                      {dayEvents.slice(0, 2).map(evt => {
                        const config = tipoConfig[evt.tipo] || tipoConfig.otro;
                        return (
                          <div
                            key={evt.id}
                            className={`text-[9px] px-1 py-0.5 rounded truncate border ${config.bgColor} ${config.color}`}
                          >
                            {evt.titulo.length > 18 ? evt.titulo.slice(0, 18) + '…' : evt.titulo}
                          </div>
                        );
                      })}
                      {dayEvents.length > 2 && (
                        <span className="text-[9px] text-muted-foreground pl-1">
                          +{dayEvents.length - 2} más
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-primary/10 border border-primary/40" /> Hoy</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-green-50 border border-green-200" /> Festivo/Receso</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-blue-50 border border-blue-200" /> Clase</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-100 border border-red-200" /> Parcial</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-indigo-50 border border-indigo-200" /> Corte</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-orange-50 border border-orange-200" /> Lím. Notas</span>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar: Events for selected day or all month */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              {selectedDate
                ? `${selectedDate.getDate()} de ${MESES[month]} — ${DIAS_NOMBRE_COMPLETO[selectedDate.getDay()]}`
                : `Eventos de ${MESES[month]}`}
            </CardTitle>
            {selectedDate && (
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => setSelectedDate(null)}>
                Ver todo el mes
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {(selectedDate ? eventosSeleccionados : eventosOrdenados).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No hay eventos{selectedDate ? ' este día' : ' este mes'}</p>
                </div>
              ) : (
                (selectedDate ? eventosSeleccionados : eventosOrdenados).map(evento => {
                  const config = tipoConfig[evento.tipo] || tipoConfig.otro;
                  const IconComponent = config.icon;
                  const fecha = new Date(evento.fechaInicio);
                  const curso = evento.cursoId ? cursosActivos.find(c => c.id === evento.cursoId) : null;

                  return (
                    <div
                      key={evento.id}
                      className={`p-3 rounded-lg border transition-all hover:shadow-sm ${config.bgColor}`}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`mt-0.5 p-1.5 rounded-md bg-white/60 ${config.color}`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold text-sm ${config.color}`}>{evento.titulo}</p>
                          {evento.descripcion && (
                            <p className="text-xs text-muted-foreground mt-0.5">{evento.descripcion}</p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(fecha, "d MMM", { locale: es })}
                              {evento.fechaFin && ` - ${format(new Date(evento.fechaFin), "d MMM", { locale: es })}`}
                            </span>
                            {curso && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {curso.aula || curso.grupo}
                              </span>
                            )}
                            {evento.todoElDia && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                Todo el día
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50/50">
          <CardContent className="pt-4 pb-3 text-center">
            <BookOpen className="h-5 w-5 mx-auto text-blue-600 mb-1" />
            <p className="text-2xl font-bold text-blue-700">
              {todosLosEventos.filter(e => e.tipo === 'clase').length}
            </p>
            <p className="text-xs text-blue-600">Clases este mes</p>
          </CardContent>
        </Card>
        <Card className="bg-red-50/50">
          <CardContent className="pt-4 pb-3 text-center">
            <GraduationCap className="h-5 w-5 mx-auto text-red-600 mb-1" />
            <p className="text-2xl font-bold text-red-700">
              {todosLosEventos.filter(e => e.tipo === 'parcial').length}
            </p>
            <p className="text-xs text-red-600">Evaluaciones</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50/50">
          <CardContent className="pt-4 pb-3 text-center">
            <PartyPopper className="h-5 w-5 mx-auto text-green-600 mb-1" />
            <p className="text-2xl font-bold text-green-700">
              {todosLosEventos.filter(e => e.tipo === 'festivo' || e.tipo === 'receso').length}
            </p>
            <p className="text-xs text-green-600">Festivos/Recesos</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-50/50">
          <CardContent className="pt-4 pb-3 text-center">
            <FileText className="h-5 w-5 mx-auto text-amber-600 mb-1" />
            <p className="text-2xl font-bold text-amber-700">
              {todosLosEventos.filter(e => e.tipo === 'entrega' || e.tipo === 'limite_notas').length}
            </p>
            <p className="text-xs text-amber-600">Entregas/Límites</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
