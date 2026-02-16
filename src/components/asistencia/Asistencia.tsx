import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCursos, useAsistencias, useUI, useAuth } from '@/hooks/useStore';
import { StudentAsistencia } from './StudentAsistencia';
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  TrendingUp,
  AlertTriangle,
  Save,
  ChevronLeft,
  ChevronRight,
  Download,
  Info
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { EstadoAsistencia } from '@/types';
import {
  calcularFechasDeClase,
  calcularTotalClasesSemestre,
  calcularClasesPasadas,
  obtenerFechaClaseMasCercana,
  esFestivo,
  REGLAMENTO_ACADEMICO
} from '@/utils/academicUtils';

export function Asistencia() {
  const { cursos, cursoSeleccionado, setCursoSeleccionado, fetchEstudiantesPorCurso } = useCursos();
  const { asistencias, fetchAsistenciasPorCurso, saveAsistencias } = useAsistencias();
  const { showToast } = useUI();
  const { usuario } = useAuth();

  if (usuario?.rol === 'estudiante') {
    return <StudentAsistencia />;
  }

  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [asistenciasTemp, setAsistenciasTemp] = useState<Record<string, EstadoAsistencia>>({});
  const [guardando, setGuardando] = useState(false);

  // Calcular fechas de clase del curso seleccionado
  const fechasDeClase = useMemo(() => {
    if (!cursoSeleccionado) return [];
    return calcularFechasDeClase(cursoSeleccionado);
  }, [cursoSeleccionado]);

  // Info del semestre
  const infoSemestre = useMemo(() => {
    if (!cursoSeleccionado) return null;
    const total = calcularTotalClasesSemestre(cursoSeleccionado);
    const pasadas = calcularClasesPasadas(cursoSeleccionado, new Date());
    const diasNombres = cursoSeleccionado.diasClase.map(d =>
      ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][d]
    ).join(' y ');
    return { total, pasadas, restantes: total - pasadas, diasNombres };
  }, [cursoSeleccionado]);

  // Pre-cargar la fecha de clase más cercana al seleccionar un curso
  useEffect(() => {
    if (cursoSeleccionado) {
      const fechaCercana = obtenerFechaClaseMasCercana(cursoSeleccionado);
      setFechaSeleccionada(fechaCercana);

      fetchEstudiantesPorCurso(cursoSeleccionado.id);
      fetchAsistenciasPorCurso(cursoSeleccionado.id);
    }
  }, [cursoSeleccionado?.id, fetchEstudiantesPorCurso, fetchAsistenciasPorCurso]);

  // Verificar si la fecha actual es día de clase
  const esDiaDeClase = useMemo(() => {
    if (!cursoSeleccionado) return false;
    return fechasDeClase.some(f =>
      format(f, 'yyyy-MM-dd') === format(fechaSeleccionada, 'yyyy-MM-dd')
    );
  }, [fechaSeleccionada, fechasDeClase, cursoSeleccionado]);

  // Navegar a la clase anterior/siguiente
  const irAClaseAnterior = () => {
    const idx = fechasDeClase.findIndex(f =>
      format(f, 'yyyy-MM-dd') === format(fechaSeleccionada, 'yyyy-MM-dd')
    );
    if (idx > 0) {
      setFechaSeleccionada(fechasDeClase[idx - 1]);
    } else if (idx === -1) {
      // Buscar la clase más cercana anterior
      const anterior = fechasDeClase.filter(f => f < fechaSeleccionada).pop();
      if (anterior) setFechaSeleccionada(anterior);
    }
  };

  const irAClaseSiguiente = () => {
    const idx = fechasDeClase.findIndex(f =>
      format(f, 'yyyy-MM-dd') === format(fechaSeleccionada, 'yyyy-MM-dd')
    );
    if (idx >= 0 && idx < fechasDeClase.length - 1) {
      setFechaSeleccionada(fechasDeClase[idx + 1]);
    } else if (idx === -1) {
      // Buscar la próxima clase
      const siguiente = fechasDeClase.find(f => f > fechaSeleccionada);
      if (siguiente) setFechaSeleccionada(siguiente);
    }
  };

  // Número de clase actual
  const numeroClaseActual = useMemo(() => {
    const idx = fechasDeClase.findIndex(f =>
      format(f, 'yyyy-MM-dd') === format(fechaSeleccionada, 'yyyy-MM-dd')
    );
    return idx >= 0 ? idx + 1 : null;
  }, [fechaSeleccionada, fechasDeClase]);

  // Estudiantes del curso seleccionado
  const estudiantesDelCurso = useMemo(() => {
    if (!cursoSeleccionado?.estudiantes) return [];
    return cursoSeleccionado.estudiantes;
  }, [cursoSeleccionado]);

  // Asistencias del día seleccionado
  const asistenciasDelDia = useMemo(() => {
    return asistencias.filter(a =>
      a.cursoId === cursoSeleccionado?.id &&
      format(new Date(a.fecha), 'yyyy-MM-dd') === format(fechaSeleccionada, 'yyyy-MM-dd')
    );
  }, [asistencias, cursoSeleccionado, fechaSeleccionada]);

  // Inicializar asistencias temporales
  useMemo(() => {
    const temp: Record<string, EstadoAsistencia> = {};
    estudiantesDelCurso.forEach(est => {
      const asistencia = asistenciasDelDia.find(a => a.estudianteId === est.estudianteId);
      temp[est.estudianteId] = asistencia?.estado || 'presente';
    });
    setAsistenciasTemp(temp);
  }, [estudiantesDelCurso, asistenciasDelDia]);

  const handleCambiarEstado = (estudianteId: string, estado: EstadoAsistencia) => {
    setAsistenciasTemp(prev => ({
      ...prev,
      [estudianteId]: estado
    }));
  };

  const handleGuardar = async () => {
    if (!cursoSeleccionado) return;
    setGuardando(true);

    const nuevasAsistencias = Object.entries(asistenciasTemp).map(([estudianteId, estado]) => {
      const asistenciaExistente = asistenciasDelDia.find(a => a.estudianteId === estudianteId);
      return {
        id: asistenciaExistente?.id || `asis-${Date.now()}-${estudianteId}`,
        estudianteId,
        cursoId: cursoSeleccionado.id,
        fecha: fechaSeleccionada,
        estado
      };
    });

    await saveAsistencias(nuevasAsistencias as any); // Cast to suit store types if strict
    setGuardando(false);
  };

  const calcularEstadisticasDia = () => {
    const valores = Object.values(asistenciasTemp);
    const total = valores.length;
    if (total === 0) return { presentes: 0, ausentes: 0, tardes: 0, porcentaje: 0 };

    const presentes = valores.filter(v => v === 'presente').length;
    const ausentes = valores.filter(v => v === 'ausente').length;
    const tardes = valores.filter(v => v === 'tarde').length;
    const porcentaje = Math.round(((presentes + tardes * 0.5) / total) * 100);

    return { presentes, ausentes, tardes, porcentaje };
  };

  const stats = calcularEstadisticasDia();

  // Helper local para porcentaje individual
  const calcularPorcentajeIndividual = (estudianteId: string) => {
    const todasAsistencias = asistencias.filter(a => a.estudianteId === estudianteId && a.cursoId === cursoSeleccionado?.id);
    if (todasAsistencias.length === 0) return 100;
    const presentes = todasAsistencias.filter(a => a.estado === 'presente').length;
    const tardes = todasAsistencias.filter(a => a.estado === 'tarde').length;
    return Math.round(((presentes + tardes * 0.5) / todasAsistencias.length) * 100);
  };

  if (!cursoSeleccionado) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center py-16">
          <Calendar className="w-16 h-16 text-[#c2cdd8] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[#1f1f1f] mb-2">Selecciona un curso</h2>
          <p className="text-[#626a72] mb-6">Elige un curso para registrar la asistencia</p>
          <Select onValueChange={(value) => {
            const curso = cursos.find(c => c.id === value);
            if (curso) setCursoSeleccionado(curso);
          }}>
            <SelectTrigger className="w-80 mx-auto">
              <SelectValue placeholder="Seleccionar curso" />
            </SelectTrigger>
            <SelectContent>
              {cursos.map(curso => (
                <SelectItem key={curso.id} value={curso.id}>{curso.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }

  const getEstadoColor = (estado: EstadoAsistencia) => {
    switch (estado) {
      case 'presente': return 'bg-green-500 hover:bg-green-600';
      case 'ausente': return 'bg-red-500 hover:bg-red-600';
      case 'tarde': return 'bg-orange-500 hover:bg-orange-600';
      case 'justificado': return 'bg-blue-500 hover:bg-blue-600';
    }
  };

  const getEstadoIcon = (estado: EstadoAsistencia) => {
    switch (estado) {
      case 'presente': return <CheckCircle className="w-4 h-4" />;
      case 'ausente': return <XCircle className="w-4 h-4" />;
      case 'tarde': return <Clock className="w-4 h-4" />;
      case 'justificado': return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getEstadoLabel = (estado: EstadoAsistencia) => {
    switch (estado) {
      case 'presente': return 'Presente';
      case 'ausente': return 'Ausente';
      case 'tarde': return 'Tarde';
      case 'justificado': return 'Justificado';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1f1f1f]">Control de Asistencia</h1>
          <p className="text-[#626a72]">Registro y seguimiento de asistencia por curso.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Selector de curso persistente */}
          <Select
            value={cursoSeleccionado.id}
            onValueChange={(v) => {
              const curso = cursos.find(c => c.id === v);
              if (curso) setCursoSeleccionado(curso);
            }}
          >
            <SelectTrigger className="w-[280px] border-[#cce5f3] bg-[#e6f7ff] hover:bg-[#cce5f3]">
              <SelectValue placeholder={cursoSeleccionado.nombre} />
            </SelectTrigger>
            <SelectContent>
              {cursos.map(curso => (
                <SelectItem key={curso.id} value={curso.id}>{curso.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => showToast('Exportando...', 'info')}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button
            className="bg-[#0070a0] hover:bg-[#00577c]"
            onClick={handleGuardar}
            disabled={guardando}
          >
            {guardando ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Guardar
          </Button>
        </div>
      </div>

      {/* Selector de fecha y estadísticas */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <button
                onClick={irAClaseAnterior}
                className="p-2 hover:bg-[#f7f9fa] rounded-lg transition-colors"
                title="Clase anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="text-center">
                <p className="text-sm text-[#626a72]">
                  {numeroClaseActual
                    ? `Clase ${numeroClaseActual} de ${infoSemestre?.total ?? '?'}`
                    : 'Fecha seleccionada'
                  }
                </p>
                <p className="font-semibold text-lg">
                  {format(fechaSeleccionada, 'EEEE, d MMMM', { locale: es })}
                </p>
                {cursoSeleccionado && (
                  <p className="text-xs text-[#8b949a]">
                    {cursoSeleccionado.horaInicio} - {cursoSeleccionado.horaFin} | {infoSemestre?.diasNombres}
                  </p>
                )}
                {!esDiaDeClase && (
                  <Badge className="mt-1 bg-amber-100 text-amber-700 text-xs">
                    {esFestivo(fechaSeleccionada) ? '🏠 Festivo' : '⚠️ No es día de clase'}
                  </Badge>
                )}
              </div>
              <button
                onClick={irAClaseSiguiente}
                className="p-2 hover:bg-[#f7f9fa] rounded-lg transition-colors"
                title="Siguiente clase"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-[#626a72]">Presentes</p>
              <p className="text-2xl font-bold text-green-600">{stats.presentes}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-[#626a72]">Tardes</p>
              <p className="text-2xl font-bold text-orange-600">{stats.tardes}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-[#626a72]">Ausentes</p>
              <p className="text-2xl font-bold text-red-600">{stats.ausentes}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumen con info del semestre */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Users className="w-5 h-5 text-[#0070a0]" />
              <span className="text-[#626a72]">
                Total estudiantes: <strong>{estudiantesDelCurso.length}</strong>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <TrendingUp className="w-5 h-5 text-[#0070a0]" />
              <span className="text-[#626a72]">
                Asistencia promedio: <strong className={stats.porcentaje < REGLAMENTO_ACADEMICO.ASISTENCIA_MINIMA ? 'text-red-600' : 'text-green-600'}>{stats.porcentaje}%</strong>
                <span className="text-xs ml-1">(mín. {REGLAMENTO_ACADEMICO.ASISTENCIA_MINIMA}%)</span>
              </span>
            </div>
            {infoSemestre && (
              <div className="flex items-center gap-4">
                <Info className="w-5 h-5 text-[#0070a0]" />
                <span className="text-[#626a72] text-sm">
                  Clases: <strong>{infoSemestre.pasadas}</strong>/{infoSemestre.total}
                  <span className="text-xs ml-1">({infoSemestre.restantes} restantes)</span>
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de estudiantes */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Lista de Estudiantes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {estudiantesDelCurso.map((estudiante) => {
              const estadoActual = asistenciasTemp[estudiante.estudianteId] || 'presente';
              const porcentajeAsistencia = calcularPorcentajeIndividual(estudiante.estudianteId);
              const enRiesgo = porcentajeAsistencia < 80;

              return (
                <div
                  key={estudiante.estudianteId}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-[#f7f9fa] rounded-lg hover:bg-[#e6f7ff] transition-colors"
                >
                  <div className="flex items-center gap-4 mb-4 md:mb-0">
                    <Avatar className="w-12 h-12 flex-shrink-0">
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${estudiante.nombre}`} />
                      <AvatarFallback className="bg-[#0070a0] text-white">
                        {estudiante.nombre?.[0]}{estudiante.apellido?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-[#1f1f1f]">
                        {estudiante.nombre} {(estudiante.apellido || '')}
                      </p>
                      <p className="text-sm text-[#626a72]">{estudiante.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs ${enRiesgo ? 'text-red-600' : 'text-green-600'}`}>
                          Asistencia: {porcentajeAsistencia}%
                        </span>
                        {enRiesgo && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Riesgo
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 justify-end">
                    {(['presente', 'tarde', 'ausente', 'justificado'] as EstadoAsistencia[]).map((estado) => (
                      <button
                        key={estado}
                        onClick={() => handleCambiarEstado(estudiante.estudianteId, estado)}
                        className={`
                            px-3 py-2 text-sm rounded-lg flex items-center justify-center gap-2 transition-all flex-1 md:flex-none
                            ${estadoActual === estado
                            ? getEstadoColor(estado) + ' text-white shadow-md'
                            : 'bg-white text-[#626a72] hover:bg-[#e6f7ff] border border-[#dee5eb]'
                          }
                          `}
                        title={getEstadoLabel(estado)}
                      >
                        {getEstadoIcon(estado)}
                        <span className="hidden md:inline">{getEstadoLabel(estado)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
