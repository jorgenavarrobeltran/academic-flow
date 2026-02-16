import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useCursos, useUI, useAuth, useCalificaciones, useAsistencias } from '@/hooks/useStore';
import {
  Users,
  FolderOpen,
  Plus,
  Search,
  TrendingUp,
  Clock,
  Edit,
  ChevronRight,
  UserPlus
} from 'lucide-react';
import type { Grupo, Estudiante, EstudianteCurso, ProyectoInvestigacion } from '@/types';


import { StudentGrupos } from './StudentGrupos';

export function Grupos() {
  const { usuario } = useAuth();

  if (usuario?.rol === 'estudiante') {
    return <StudentGrupos />;
  }

  const { cursos, cursoSeleccionado, setCursoSeleccionado, fetchEstudiantesPorCurso } = useCursos();
  const { grupos, fetchGrupos, calificaciones } = useCalificaciones(); // Usar grupos reales y notas (calificaciones)
  const { asistencias } = useAsistencias();
  const { showToast } = useUI();

  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<Grupo | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    proyecto: '',
  });

  // Cargar grupos y estudiantes al cambiar curso
  useEffect(() => {
    if (cursoSeleccionado?.id) {
      fetchGrupos(cursoSeleccionado.id);
      // Asegurar que tenemos la lista actualizada de estudiantes para el filtrado de "sin grupo"
      if (!cursoSeleccionado.estudiantes || cursoSeleccionado.estudiantes.length === 0) {
        fetchEstudiantesPorCurso(cursoSeleccionado.id);
      }
    }
  }, [cursoSeleccionado?.id, fetchGrupos, fetchEstudiantesPorCurso]);

  // Estudiantes reales del curso
  const estudiantesDelCurso = useMemo(() => {
    if (!cursoSeleccionado) return [];
    return cursoSeleccionado.estudiantes.map((ec: EstudianteCurso) => ({
      id: ec.estudianteId,
      nombre: ec.nombre || 'Sin Nombre',
      apellido: ec.apellido || '',
      email: ec.email,
      fotoUrl: ec.fotoUrl,
      codigo: ec.codigo,
      rol: 'estudiante' as const,
      programa: ec.programa,
      semestre: 1, // Fallback if not available
      activo: true,
      fechaRegistro: ec.fechaInscripcion || new Date()
    } as Estudiante));
  }, [cursoSeleccionado]);

  // Grupos del curso (filtrados del store por ID de curso, aunque fetchGrupos ya debería filtrar en DB, el store podría tener de otros si no limpiamos)
  const gruposDelCurso = useMemo(() => {
    if (!cursoSeleccionado) return [];
    // Asumiendo que state.grupos ya son los del curso actual tras el fetch
    return grupos.filter(g => g.cursoId === cursoSeleccionado.id);
  }, [cursoSeleccionado, grupos]);

  // Filtrar grupos
  const gruposFiltrados = useMemo(() => {
    return gruposDelCurso.filter(grupo =>
      grupo.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (grupo.proyecto?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
    );
  }, [gruposDelCurso, searchQuery]);

  // Estudiantes sin grupo
  const estudiantesSinGrupo = useMemo(() => {
    const estudiantesEnGrupos = new Set(gruposDelCurso.flatMap(g => g.integrantes));
    return estudiantesDelCurso.filter(e => !estudiantesEnGrupos.has(e.id));
  }, [gruposDelCurso, estudiantesDelCurso]);

  // --- Metrics Calculations ---

  const calculateGroupAvgGrade = (grupo: Grupo) => {
    const memberIds = grupo.integrantes;
    // Usar 'calificaciones' del store en lugar de notasMock
    // Nota: 'calificaciones' tiene estructura diferente a 'NotaActividad'.
    // Si queremos promedio general, usamos cortes.
    const groupGrades = calificaciones.filter(n =>
      memberIds.includes(n.estudianteId) && n.cursoId === cursoSeleccionado?.id
    );

    if (groupGrades.length === 0) return 0;

    // Promedio de definitivas
    const sum = groupGrades.reduce((acc, curr) => {
      const def = (curr.corte1.nota * 0.3) + (curr.corte2.nota * 0.3) + (curr.corte3.nota * 0.4);
      return acc + def;
    }, 0);
    return sum / groupGrades.length;
  };

  const calculateGroupAttendance = (grupo: Grupo) => {
    const memberIds = grupo.integrantes;
    const groupAttendance = asistencias.filter(a =>
      memberIds.includes(a.estudianteId) && a.cursoId === cursoSeleccionado?.id
    );
    if (groupAttendance.length === 0) return 0;
    // Count 'presente' and 'tarde' as present
    const presentCount = groupAttendance.filter(a => a.estado === 'presente' || a.estado === 'tarde').length;
    return (presentCount / groupAttendance.length) * 100;
  };

  const avgGroupSize = useMemo(() => {
    if (gruposDelCurso.length === 0) return 0;
    const totalMembers = gruposDelCurso.reduce((acc, g) => acc + g.integrantes.length, 0);
    return totalMembers / gruposDelCurso.length;
  }, [gruposDelCurso]);

  const avgCourseAttendance = useMemo(() => {
    if (gruposDelCurso.length === 0) return 0;
    const totalAttendance = gruposDelCurso.reduce((acc, g) => acc + calculateGroupAttendance(g), 0);
    return totalAttendance / gruposDelCurso.length;
  }, [gruposDelCurso]);


  const getEstudiantesGrupo = (integrantes: string[]): Estudiante[] => {
    return estudiantesDelCurso.filter(e => integrantes.includes(e.id));
  };

  const getProyectoGrupo = (_grupoId: string): ProyectoInvestigacion | undefined => {
    // TODO: Implement projects backend
    return undefined;
  };

  const handleCrearGrupo = () => {
    if (!formData.nombre) {
      showToast('El nombre del grupo es obligatorio', 'error');
      return;
    }

    showToast('Grupo creado exitosamente', 'success');
    setDialogOpen(false);
    setFormData({ nombre: '', descripcion: '', proyecto: '' });
  };

  const handleVerDetalle = (grupo: Grupo) => {
    setGrupoSeleccionado(grupo);
    setDialogOpen(true);
  };

  const getEtapaColor = (etapa?: string) => {
    switch (etapa) {
      case 'planteamiento': return 'bg-gray-100 text-gray-700';
      case 'marco_teorico': return 'bg-blue-100 text-blue-700';
      case 'metodologia': return 'bg-purple-100 text-purple-700';
      case 'recoleccion': return 'bg-orange-100 text-orange-700';
      case 'analisis': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (!cursoSeleccionado) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center py-16">
          <FolderOpen className="w-16 h-16 text-[#c2cdd8] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[#1f1f1f] mb-2">Selecciona un curso</h2>
          <p className="text-[#626a72] mb-6">Elige un curso para ver los grupos</p>
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1f1f1f]">Gestión de Grupos y Métricas</h1>
          <p className="text-[#626a72]">{cursoSeleccionado.nombre}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            className="bg-[#0070a0] hover:bg-[#00577c]"
            onClick={() => {
              setGrupoSeleccionado(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Grupo
          </Button>
        </div>
      </div>

      {/* Resumen de Métricas Globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FolderOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-[#626a72]">Total Grupos</p>
              <p className="text-2xl font-bold">{gruposDelCurso.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-[#626a72]">Promedio Integrantes</p>
              <p className="text-2xl font-bold">{avgGroupSize.toFixed(1)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-[#626a72]">Asistencia Promedio</p>
              <p className="text-2xl font-bold">{avgCourseAttendance.toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-[#626a72]">Promedio Notas</p>
              <p className="text-2xl font-bold">
                {(gruposDelCurso.reduce((acc, g) => acc + calculateGroupAvgGrade(g), 0) / (gruposDelCurso.length || 1)).toFixed(1)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#99a4af]" />
            <Input
              type="text"
              placeholder="Buscar grupos o proyectos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Grid de grupos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gruposFiltrados.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FolderOpen className="w-16 h-16 text-[#c2cdd8] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#1f1f1f]">No se encontraron grupos</h3>
            <p className="text-[#626a72]">Crea un nuevo grupo para comenzar</p>
          </div>
        ) : (
          gruposFiltrados.map((grupo) => {
            const estudiantes = getEstudiantesGrupo(grupo.integrantes);
            const proyecto = getProyectoGrupo(grupo.id);
            const avgGrade = calculateGroupAvgGrade(grupo);
            const avgAttendance = calculateGroupAttendance(grupo);

            return (
              <Card
                key={grupo.id}
                className="border-0 shadow-md hover:shadow-lg transition-all cursor-pointer group overflow-hidden"
                onClick={() => handleVerDetalle(grupo)}
              >
                <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500" />
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg text-[#1f1f1f] group-hover:text-[#0070a0] transition-colors">
                        {grupo.nombre}
                      </h3>
                      {grupo.descripcion && (
                        <p className="text-sm text-[#626a72]">{grupo.descripcion}</p>
                      )}
                    </div>
                  </div>

                  {/* Proyecto */}
                  <div className="mb-4">
                    <p className="text-xs text-[#99a4af] uppercase tracking-wide mb-1">Proyecto</p>
                    <p className="text-sm font-medium text-[#1f1f1f]">{grupo.proyecto || 'Sin proyecto asignado'}</p>
                    {proyecto && (
                      <Badge className={`mt-2 ${getEtapaColor(proyecto.etapaActual)}`}>
                        <Clock className="w-3 h-3 mr-1" />
                        {proyecto.etapaActual.replace('_', ' ')}
                      </Badge>
                    )}
                  </div>

                  {/* Integrantes */}
                  <div className="mb-4">
                    <p className="text-xs text-[#99a4af] uppercase tracking-wide mb-2">Integrantes ({estudiantes.length})</p>
                    <div className="flex -space-x-2">
                      {estudiantes.slice(0, 5).map((est) => (
                        <Avatar key={est.id} className="w-8 h-8 border-2 border-white">
                          <AvatarImage src={est.fotoUrl} />
                          <AvatarFallback className="bg-[#0070a0] text-white text-xs">
                            {est.nombre[0]}{est.apellido[0]}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {estudiantes.length > 5 && (
                        <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs text-gray-600">
                          +{estudiantes.length - 5}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-slate-100">
                    <div>
                      <p className="text-xs text-[#99a4af]">Nota Promedio</p>
                      <p className="text-lg font-bold text-[#0070a0]">
                        {avgGrade ? avgGrade.toFixed(1) : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#99a4af]">Asistencia Promedio</p>
                      <p className="text-lg font-bold text-green-600">
                        {avgAttendance ? `${avgAttendance.toFixed(0)}%` : '-'}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      {estudiantes.length} Integrantes
                    </div>
                    <Button variant="outline" size="sm" className="group/btn">
                      Ver detalle
                      <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Estudiantes sin grupo */}
      {estudiantesSinGrupo.length > 0 && (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-orange-500" />
              Estudiantes sin Grupo ({estudiantesSinGrupo.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {estudiantesSinGrupo.map((est) => (
                <div
                  key={est.id}
                  className="flex items-center gap-2 px-3 py-2 bg-[#f7f9fa] rounded-lg"
                >
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={est.fotoUrl} />
                    <AvatarFallback className="bg-[#0070a0] text-white text-xs">
                      {est.nombre[0]}{est.apellido[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{est.nombre} {est.apellido}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog de crear/editar grupo */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {grupoSeleccionado ? 'Detalle del Grupo' : 'Crear Nuevo Grupo'}
            </DialogTitle>
            <DialogDescription>
              {grupoSeleccionado
                ? 'Información del grupo y sus integrantes'
                : 'Complete la información para crear un nuevo grupo'}
            </DialogDescription>
          </DialogHeader>

          {grupoSeleccionado ? (
            // Vista de detalle
            <div className="space-y-4">
              <div>
                <p className="text-sm text-[#99a4af]">Nombre del Grupo</p>
                <p className="font-medium text-lg">{grupoSeleccionado.nombre}</p>
              </div>

              {grupoSeleccionado.descripcion && (
                <div>
                  <p className="text-sm text-[#99a4af]">Descripción</p>
                  <p>{grupoSeleccionado.descripcion}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-[#99a4af]">Proyecto</p>
                <p className="font-medium">{grupoSeleccionado.proyecto || 'Sin proyecto'}</p>
              </div>

              <div>
                <p className="text-sm text-[#99a4af] mb-2">Integrantes</p>
                <div className="space-y-2">
                  {getEstudiantesGrupo(grupoSeleccionado.integrantes).map((est) => (
                    <div key={est.id} className="flex items-center gap-3 p-2 bg-[#f7f9fa] rounded-lg">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={est.fotoUrl} />
                        <AvatarFallback className="bg-[#0070a0] text-white text-xs">
                          {est.nombre[0]}{est.apellido[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{est.nombre} {est.apellido}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div>
                  <p className="text-sm text-[#99a4af]">Nota Promedio</p>
                  <p className="text-2xl font-bold text-[#0070a0]">
                    {calculateGroupAvgGrade(grupoSeleccionado).toFixed(1)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#99a4af]">Asistencia Promedio</p>
                  <p className="text-2xl font-bold text-green-600">
                    {calculateGroupAttendance(grupoSeleccionado).toFixed(0)}%
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cerrar
                </Button>
                <Button className="bg-[#0070a0] hover:bg-[#00577c]">
                  <Edit className="w-4 h-4 mr-2" />
                  Editar Grupo
                </Button>
              </DialogFooter>
            </div>
          ) : (
            // Formulario de creación
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del Grupo *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Los Optimizadores"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Input
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Breve descripción del grupo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="proyecto">Proyecto</Label>
                <Input
                  id="proyecto"
                  value={formData.proyecto}
                  onChange={(e) => setFormData({ ...formData, proyecto: e.target.value })}
                  placeholder="Título del proyecto de investigación"
                />
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  className="bg-[#0070a0] hover:bg-[#00577c]"
                  onClick={handleCrearGrupo}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Grupo
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
