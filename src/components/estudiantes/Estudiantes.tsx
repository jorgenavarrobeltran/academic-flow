import { useState, useMemo, useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useStore, useCursos, useUI, useAuth } from '@/hooks/useStore';
import {
  Users,
  Search,
  GraduationCap,
  Mail,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Eye,
  FileText,
  ArrowRightLeft,
  BookOpen,
  ChevronDown,
  Edit2,
  Link
} from 'lucide-react';
import { calcularPorcentajeAsistencia } from '@/utils/academicUtils';
import type { Estudiante, Programa, Calificacion } from '@/types';
import { ImportarEstudiantes } from '@/components/cursos/ImportarEstudiantes';

const calcularPromedioGeneral = (calificaciones: Calificacion[]) => {
  if (!calificaciones.length) return 0;
  // Promedio de las definitivas de cada registro de calificación (usualmente 1 por curso)
  const sum = calificaciones.reduce((acc, curr) => {
    const def = (curr.corte1.nota * 0.3) + (curr.corte2.nota * 0.3) + (curr.corte3.nota * 0.4);
    return acc + def;
  }, 0);
  return sum / calificaciones.length;
};

const programas: Programa[] = [
  'Ingeniería de Sistemas',
  'Ingeniería Industrial',
  'Contaduría Pública',
  'Administración de Empresas',
];

export function Estudiantes() {
  const { state } = useStore();
  const { cursos, cursoSeleccionado, setCursoSeleccionado, moverEstudianteEntreCursos, fetchEstudiantesPorCurso, updateEstudiante } = useCursos();
  const { showToast } = useUI();
  const { usuario } = useAuth();

  // Redirect students if they try to access this page
  if (usuario?.rol === 'estudiante') {
    return <Navigate to="/dashboard" replace />;
  }

  const [searchQuery, setSearchQuery] = useState('');
  const [filtroPrograma, setFiltroPrograma] = useState<string>('todos');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState<Estudiante | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogCambioCursoOpen, setDialogCambioCursoOpen] = useState(false);
  const [estudianteACambiar, setEstudianteACambiar] = useState<Estudiante | null>(null);
  const [cursoDestinoSeleccionado, setCursoDestinoSeleccionado] = useState<string>('');
  const [selectorCursoOpen, setSelectorCursoOpen] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);


  // Cerrar selector al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setSelectorCursoOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Obtener cursos activos del semestre actual
  const cursosActivos = useMemo(() => {
    const semestreActual = '2025-1'; // Podría venir de configuración
    return cursos.filter(c => c.activo && !c.archivado && c.semestre === semestreActual);
  }, [cursos]);

  // Cargar estudiantes al cambiar curso
  useEffect(() => {
    if (cursoSeleccionado?.id) {
      // Invalida caché o fuerza recarga
      fetchEstudiantesPorCurso(cursoSeleccionado.id);
    }
  }, [cursoSeleccionado?.id, fetchEstudiantesPorCurso]);

  // Estudiantes del curso seleccionado (desde store/DB)
  const estudiantesDelCurso = useMemo(() => {
    if (!cursoSeleccionado) return [];

    // Mapear EstudianteCurso a Estudiante (con campos extendidos que añadimos en useStore)
    return cursoSeleccionado.estudiantes.map((ec: any) => ({
      id: ec.estudianteId, // Mapear estudianteId a id
      nombre: ec.nombre || '',
      apellido: ec.apellido || '',
      email: ec.email || '',
      codigo: ec.codigo || '',
      rol: 'estudiante' as const,
      programa: ec.programa,
      semestre: ec.semestre || 1,
      fotoUrl: ec.fotoUrl,
      fechaRegistro: ec.fechaInscripcion, // Usar fecha inscripcion como registro aprox
      activo: true,
      promedioAcumulado: 0 // No viene en inscripcion, podría venir de estadisticas
    }));
  }, [cursoSeleccionado]);

  // Filtrar estudiantes
  const estudiantesFiltrados = useMemo(() => {
    return estudiantesDelCurso.filter(est => {
      const matchSearch =
        est.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        est.apellido.toLowerCase().includes(searchQuery.toLowerCase()) ||
        est.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        est.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchPrograma = filtroPrograma === 'todos' || est.programa === filtroPrograma;

      const asistencias = state.asistencias.filter(a => a.estudianteId === est.id);
      const porcentajeAsistencia = calcularPorcentajeAsistencia(asistencias);
      const notas = state.notas.filter(n => n.estudianteId === est.id && n.cursoId === cursoSeleccionado?.id);
      const promedio = calcularPromedioGeneral(notas);

      const enRiesgo = porcentajeAsistencia < 80 || promedio < 3.0;
      const matchEstado =
        filtroEstado === 'todos' ||
        (filtroEstado === 'riesgo' && enRiesgo) ||
        (filtroEstado === 'normal' && !enRiesgo);

      return matchSearch && matchPrograma && matchEstado;
    });
  }, [estudiantesDelCurso, searchQuery, filtroPrograma, filtroEstado, state.asistencias, state.notas]);

  const handleVerDetalle = (estudiante: Estudiante) => {
    setEstudianteSeleccionado(estudiante);
    setDialogOpen(true);
  };

  const handleAbrirCambioCurso = (estudiante: Estudiante) => {
    setEstudianteACambiar(estudiante);
    setCursoDestinoSeleccionado('');
    setDialogCambioCursoOpen(true);
  };

  const handleCambiarCurso = () => {
    if (!estudianteACambiar || !cursoDestinoSeleccionado || !cursoSeleccionado) return;

    moverEstudianteEntreCursos(
      estudianteACambiar.id,
      cursoSeleccionado.id,
      cursoDestinoSeleccionado
    );

    const cursoDestino = cursos.find(c => c.id === cursoDestinoSeleccionado);
    showToast(
      `${estudianteACambiar.nombre} ${estudianteACambiar.apellido} movido a ${cursoDestino?.nombre}`,
      'success'
    );

    setDialogCambioCursoOpen(false);
    setEstudianteACambiar(null);
    setCursoDestinoSeleccionado('');
  };

  const getEstadisticasEstudiante = (estudiante: Estudiante) => {
    const asistencias = state.asistencias.filter(a => a.estudianteId === estudiante.id);
    const porcentajeAsistencia = calcularPorcentajeAsistencia(asistencias);
    const notas = state.notas.filter(n => n.estudianteId === estudiante.id && n.cursoId === cursoSeleccionado?.id);
    const promedio = calcularPromedioGeneral(notas);
    const enRiesgo = porcentajeAsistencia < 80 || promedio < 3.0;

    return { porcentajeAsistencia, promedio, enRiesgo };
  };

  if (!cursoSeleccionado) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center py-16">
          <Users className="w-16 h-16 text-[#c2cdd8] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[#1f1f1f] mb-2">Selecciona un curso</h2>
          <p className="text-[#626a72] mb-6">Elige un curso para ver los estudiantes</p>
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

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header con selector de cursos */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1f1f1f]">Estudiantes</h1>
          <p className="text-[#626a72]">Gestión de estudiantes por curso</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Selector de curso activo */}
          <div className="relative" ref={selectorRef}>
            <Button
              variant="outline"
              className="flex items-center gap-2 min-w-[250px] justify-between border-[#cce5f3] bg-[#e6f7ff] hover:bg-[#cce5f3]"
              onClick={() => setSelectorCursoOpen(!selectorCursoOpen)}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#0070a0]" />
                <span className="truncate">{cursoSeleccionado.nombre}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-[#0070a0]" />
            </Button>

            {selectorCursoOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#dee5eb] rounded-lg shadow-lg z-50 max-h-64 overflow-auto">
                <div className="p-2">
                  <p className="text-xs font-medium text-[#99a4af] px-3 py-2 uppercase tracking-wider">
                    Cursos Activos - Semestre 2025-1
                  </p>
                  {cursosActivos.map(curso => (
                    <button
                      key={curso.id}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${curso.id === cursoSeleccionado.id
                        ? 'bg-[#e6f7ff] text-[#0070a0] font-medium'
                        : 'hover:bg-[#f7f9fa] text-[#1f1f1f]'
                        }`}
                      onClick={() => {
                        setCursoSeleccionado(curso);
                        setSelectorCursoOpen(false);
                        showToast(`Cambiado a: ${curso.nombre}`, 'info');
                      }}
                    >
                      <BookOpen className="w-4 h-4" />
                      <div className="flex-1">
                        <p className="font-medium">{curso.nombre}</p>
                        <p className="text-xs text-[#99a4af]">{curso.codigo} • Grupo {curso.grupo}</p>
                      </div>
                      {curso.id === cursoSeleccionado.id && (
                        <CheckCircle className="w-4 h-4 text-[#0070a0]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>


          <ImportarEstudiantes
            preselectedCursoId={cursoSeleccionado?.id}
            onImportSuccess={() => fetchEstudiantesPorCurso(cursoSeleccionado.id)}
          />
          {cursoSeleccionado && (
            <Button
              variant="outline"
              className="ml-2 border-dashed border-[#0070a0] text-[#0070a0] hover:bg-blue-50"
              onClick={() => {
                const url = `${window.location.origin}/register/${cursoSeleccionado.id}`;
                navigator.clipboard.writeText(url);
                showToast('Enlace copiado al portapapeles', 'success');
              }}
            >
              <Link className="w-4 h-4 mr-2" />
              Copiar Enlace de Registro
            </Button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#99a4af]" />
              <Input
                type="text"
                placeholder="Buscar por nombre, código o email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filtroPrograma} onValueChange={setFiltroPrograma}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Programa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los programas</SelectItem>
                {programas.map(p => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="riesgo">En riesgo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-[#626a72]">Total</p>
              <p className="text-2xl font-bold">{estudiantesFiltrados.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-[#626a72]">Normal</p>
              <p className="text-2xl font-bold">
                {estudiantesFiltrados.filter(e => !getEstadisticasEstudiante(e).enRiesgo).length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-[#626a72]">En riesgo</p>
              <p className="text-2xl font-bold">
                {estudiantesFiltrados.filter(e => getEstadisticasEstudiante(e).enRiesgo).length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-[#626a72]">Promedio</p>
              <p className="text-2xl font-bold">
                {(estudiantesFiltrados.reduce((acc, e) => acc + getEstadisticasEstudiante(e).promedio, 0) / estudiantesFiltrados.length || 0).toFixed(1)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de estudiantes */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#f7f9fa] border-b border-[#dee5eb]">
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#626a72]">Estudiante</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#626a72]">Código</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#626a72]">Programa</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-[#626a72]">Semestre</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-[#626a72]">Asistencia</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-[#626a72]">Promedio</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-[#626a72]">Estado</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-[#626a72]">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {estudiantesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[#99a4af]">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No se encontraron estudiantes</p>
                    </td>
                  </tr>
                ) : (
                  estudiantesFiltrados.map((estudiante) => {
                    const stats = getEstadisticasEstudiante(estudiante);

                    return (
                      <tr
                        key={estudiante.id}
                        className="border-b border-[#f7f9fa] hover:bg-[#f7f9fa] transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={estudiante.fotoUrl} />
                              <AvatarFallback className="bg-[#0070a0] text-white text-sm">
                                {estudiante.nombre[0]}{estudiante.apellido[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-[#1f1f1f]">
                                {estudiante.nombre} {estudiante.apellido}
                              </p>
                              <p className="text-xs text-[#99a4af]">{estudiante.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-[#626a72]">{estudiante.codigo || '-'}</td>
                        <td className="py-3 px-4 text-sm text-[#626a72]">{estudiante.programa}</td>
                        <td className="py-3 px-4 text-center text-sm">{estudiante.semestre}°</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`font-medium ${stats.porcentajeAsistencia < 80 ? 'text-red-600' : 'text-green-600'
                            }`}>
                            {stats.porcentajeAsistencia}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`font-medium ${stats.promedio < 3.0 ? 'text-red-600' : 'text-green-600'
                            }`}>
                            {stats.promedio.toFixed(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {stats.enRiesgo ? (
                            <Badge variant="destructive" className="text-xs">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              En riesgo
                            </Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Normal
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-[#0070a0]"
                              onClick={() => handleVerDetalle(estudiante)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Ver
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-[#626a72] hover:text-[#0070a0]"
                              onClick={() => handleAbrirCambioCurso(estudiante)}
                              title="Cambiar de curso"
                            >
                              <ArrowRightLeft className="w-4 h-4 mr-1" />
                              Cambiar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de detalle */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          {estudianteSeleccionado && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={estudianteSeleccionado.fotoUrl} />
                    <AvatarFallback className="bg-[#0070a0] text-white">
                      {estudianteSeleccionado.nombre[0]}{estudianteSeleccionado.apellido[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p>{estudianteSeleccionado.nombre} {estudianteSeleccionado.apellido}</p>
                    <p className="text-sm text-[#626a72] font-normal">{estudianteSeleccionado.codigo || '-'}</p>
                  </div>
                </DialogTitle>
                <DialogDescription>
                  Información detallada del estudiante
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-[#99a4af]">Programa</p>
                    <p className="font-medium">{estudianteSeleccionado.programa}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#99a4af]">Semestre</p>
                    <p className="font-medium">{estudianteSeleccionado.semestre}° semestre</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#99a4af]">Email</p>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#0070a0]" />
                      <p className="font-medium">{estudianteSeleccionado.email}</p>
                    </div>
                  </div>
                  {/* Nuevos datos de perfil */}
                  <div>
                    <p className="text-sm text-[#99a4af]">Tipo de Estudiante</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {estudianteSeleccionado.esHomologante && (
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-200">
                          Homologante
                        </Badge>
                      )}
                      {estudianteSeleccionado.haVistoClaseAntes && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                          Antiguo Alumno
                        </Badge>
                      )}
                      {!estudianteSeleccionado.esHomologante && !estudianteSeleccionado.haVistoClaseAntes && (
                        <span className="text-sm text-gray-500">Regular</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {(() => {
                    const stats = getEstadisticasEstudiante(estudianteSeleccionado);
                    return (
                      <>
                        <div>
                          <p className="text-sm text-[#99a4af]">Promedio Acumulado</p>
                          <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-[#0070a0]" />
                            <p className={`font-medium text-lg ${stats.promedio < 3.0 ? 'text-red-600' : 'text-green-600'}`}>
                              {stats.promedio.toFixed(1)}
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-[#99a4af]">Porcentaje de Asistencia</p>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-[#0070a0]" />
                            <p className={`font-medium text-lg ${stats.porcentajeAsistencia < 80 ? 'text-red-600' : 'text-green-600'}`}>
                              {stats.porcentajeAsistencia}%
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-[#99a4af]">Estado</p>
                          {stats.enRiesgo ? (
                            <Badge variant="destructive">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              En riesgo académico
                            </Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Desempeño normal
                            </Badge>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Sección de Edición Rápida (Simulada para Demo) */}
              <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-100">
                <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <Edit2 className="w-4 h-4" />
                  Editar Perfil Académico
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="esHomologante"
                      checked={estudianteSeleccionado.esHomologante || false}
                      onCheckedChange={(checked) => {
                        const updated = { ...estudianteSeleccionado, esHomologante: !!checked };
                        setEstudianteSeleccionado(updated);
                        updateEstudiante(updated);
                      }}
                    />
                    <label htmlFor="esHomologante" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Es Homologante
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="haVistoClase"
                      checked={estudianteSeleccionado.haVistoClaseAntes || false}
                      onCheckedChange={(checked) => {
                        const updated = { ...estudianteSeleccionado, haVistoClaseAntes: !!checked };
                        setEstudianteSeleccionado(updated);
                        updateEstudiante(updated);
                      }}
                    />
                    <label htmlFor="haVistoClase" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Ya vio clase conmigo
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-200">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Programa</label>
                    <Select
                      value={estudianteSeleccionado.programa}
                      onValueChange={(val: any) => {
                        const updated = { ...estudianteSeleccionado, programa: val };
                        setEstudianteSeleccionado(updated);
                        updateEstudiante(updated);
                      }}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        {programas.map(prog => (
                          <SelectItem key={prog} value={prog}>{prog}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Semestre</label>
                    <Select
                      value={String(estudianteSeleccionado.semestre || 1)}
                      onValueChange={(val) => {
                        const updated = { ...estudianteSeleccionado, semestre: parseInt(val) };
                        setEstudianteSeleccionado(updated);
                        updateEstudiante(updated);
                      }}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="#" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => (
                          <SelectItem key={s} value={String(s)}>{s}° Semestre</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cerrar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    handleAbrirCambioCurso(estudianteSeleccionado);
                  }}
                >
                  <ArrowRightLeft className="w-4 h-4 mr-2" />
                  Cambiar de Curso
                </Button>
                <Button className="bg-[#0070a0] hover:bg-[#00577c]">
                  <FileText className="w-4 h-4 mr-2" />
                  Ver Historial Completo
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de cambio de curso */}
      <Dialog open={dialogCambioCursoOpen} onOpenChange={setDialogCambioCursoOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-[#0070a0]" />
              Cambiar Estudiante de Curso
            </DialogTitle>
            <DialogDescription>
              Selecciona el curso destino para mover al estudiante
            </DialogDescription>
          </DialogHeader>

          {estudianteACambiar && cursoSeleccionado && (
            <div className="space-y-4">
              {/* Información del estudiante */}
              <div className="bg-[#f7f9fa] rounded-lg p-4">
                <p className="text-sm text-[#99a4af] mb-1">Estudiante</p>
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={estudianteACambiar.fotoUrl} />
                    <AvatarFallback className="bg-[#0070a0] text-white text-sm">
                      {estudianteACambiar.nombre[0]}{estudianteACambiar.apellido[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-[#1f1f1f]">
                      {estudianteACambiar.nombre} {estudianteACambiar.apellido}
                    </p>
                    <p className="text-sm text-[#626a72]">{estudianteACambiar.codigo}</p>
                  </div>
                </div>
              </div>

              {/* Curso origen */}
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-[#e6f7ff] rounded-lg p-3 border border-[#cce5f3]">
                  <p className="text-xs text-[#0070a0] font-medium uppercase tracking-wider mb-1">Curso Origen</p>
                  <p className="font-medium text-[#1f1f1f] text-sm">{cursoSeleccionado.nombre}</p>
                  <p className="text-xs text-[#626a72]">Grupo {cursoSeleccionado.grupo}</p>
                </div>
                <ArrowRightLeft className="w-5 h-5 text-[#99a4af]" />
                <div className="flex-1 bg-green-50 rounded-lg p-3 border border-green-200">
                  <p className="text-xs text-green-700 font-medium uppercase tracking-wider mb-1">Curso Destino</p>
                  {cursoDestinoSeleccionado ? (
                    (() => {
                      const curso = cursosActivos.find(c => c.id === cursoDestinoSeleccionado);
                      return curso ? (
                        <>
                          <p className="font-medium text-[#1f1f1f] text-sm">{curso.nombre}</p>
                          <p className="text-xs text-[#626a72]">Grupo {curso.grupo}</p>
                        </>
                      ) : null;
                    })()
                  ) : (
                    <p className="text-sm text-[#99a4af]">Selecciona un curso</p>
                  )}
                </div>
              </div>

              {/* Selector de curso destino */}
              <div>
                <p className="text-sm font-medium text-[#1f1f1f] mb-2">Cursos Disponibles</p>
                <div className="max-h-48 overflow-auto border border-[#dee5eb] rounded-lg">
                  {cursosActivos
                    .filter(c => c.id !== cursoSeleccionado.id)
                    .map(curso => (
                      <button
                        key={curso.id}
                        className={`w-full text-left p-3 border-b border-[#f7f9fa] last:border-b-0 transition-colors flex items-center gap-3 ${cursoDestinoSeleccionado === curso.id
                          ? 'bg-[#e6f7ff] border-[#cce5f3]'
                          : 'hover:bg-[#f7f9fa]'
                          }`}
                        onClick={() => setCursoDestinoSeleccionado(curso.id)}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${cursoDestinoSeleccionado === curso.id
                          ? 'border-[#0070a0] bg-[#0070a0]'
                          : 'border-[#c2cdd8]'
                          }`}>
                          {cursoDestinoSeleccionado === curso.id && (
                            <CheckCircle className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm text-[#1f1f1f]">{curso.nombre}</p>
                          <p className="text-xs text-[#99a4af]">{curso.codigo} • Grupo {curso.grupo} • {curso.estudiantes.length} estudiantes</p>
                        </div>
                      </button>
                    ))}
                  {cursosActivos.filter(c => c.id !== cursoSeleccionado.id).length === 0 && (
                    <div className="p-4 text-center text-[#99a4af]">
                      <p className="text-sm">No hay otros cursos disponibles</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setDialogCambioCursoOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  className="bg-[#0070a0] hover:bg-[#00577c]"
                  disabled={!cursoDestinoSeleccionado}
                  onClick={handleCambiarCurso}
                >
                  <ArrowRightLeft className="w-4 h-4 mr-2" />
                  Confirmar Cambio
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
