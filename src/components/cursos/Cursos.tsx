import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCursos, useUI } from '@/hooks/useStore';
import { ImportarEstudiantes } from './ImportarEstudiantes';
import {
  BookOpen,
  Users,
  Calendar,
  MoreVertical,
  Plus,
  Search,
  TrendingUp,
  Edit,
  Trash2,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Curso, Asignatura } from '@/types';

const asignaturas: Asignatura[] = [
  'Formación del Espíritu Científico',
  'Metodología de la Investigación',
  'Metodología I',
  'Metodología II',
  'Metodología III',
  'Metodología IV',
  'Anteproyecto',
  'Proyecto de Investigación',
  'Seminario de Investigación',
];

export function Cursos() {
  const { cursos, addCurso, updateCurso, deleteCurso, setCursoSeleccionado } = useCursos();
  const { showToast } = useUI();
  const [searchQuery, setSearchQuery] = useState('');
  const [filtroSemestre, setFiltroSemestre] = useState('todos');
  const [filtroAsignatura, setFiltroAsignatura] = useState('todas');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cursoEditando, setCursoEditando] = useState<Curso | null>(null);

  // Formulario
  const [formData, setFormData] = useState({
    nombre: '',
    asignatura: '' as Asignatura | '',
    grupo: '',
    semestre: '2026-1',
    fechaInicio: '',
    fechaFin: '',
    diasClase: [1] as number[],
    horaInicio: '08:00',
    horaFin: '09:30',
  });

  const cursosFiltrados = cursos.filter(curso => {
    const matchSearch = curso.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      curso.codigo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchSemestre = filtroSemestre === 'todos' || curso.semestre === filtroSemestre;
    const matchAsignatura = filtroAsignatura === 'todas' || curso.asignatura === filtroAsignatura;
    return matchSearch && matchSemestre && matchAsignatura;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre || !formData.asignatura || !formData.grupo) {
      showToast('Por favor complete todos los campos', 'error');
      return;
    }

    const nuevoCurso: Curso = {
      id: cursoEditando ? cursoEditando.id : `cur-${Date.now()}`,
      codigo: cursoEditando ? cursoEditando.codigo : `${formData.asignatura.substring(0, 3).toUpperCase()}${Math.floor(Math.random() * 900) + 100}-${formData.grupo}`,
      nombre: `${formData.asignatura} - Grupo ${formData.grupo}`,
      asignatura: formData.asignatura as Asignatura,
      semestre: formData.semestre,
      grupo: formData.grupo,
      docenteId: 'doc-001',
      estudiantes: cursoEditando ? cursoEditando.estudiantes : [],
      configuracionNotas: cursoEditando ? cursoEditando.configuracionNotas : {
        cortes: [
          { numero: 1, porcentaje: 30, fechaInicio: new Date(formData.fechaInicio), fechaFin: new Date(formData.fechaInicio), cerrado: false },
          { numero: 2, porcentaje: 30, fechaInicio: new Date(formData.fechaInicio), fechaFin: new Date(formData.fechaInicio), cerrado: false },
          { numero: 3, porcentaje: 40, fechaInicio: new Date(formData.fechaInicio), fechaFin: new Date(formData.fechaFin), cerrado: false },
        ],
        componentes: [
          { id: 'comp-001', nombre: 'Quices', porcentaje: 20, tipo: 'quiz' },
          { id: 'comp-002', nombre: 'Talleres', porcentaje: 20, tipo: 'taller' },
          { id: 'comp-003', nombre: 'Participación', porcentaje: 20, tipo: 'participacion' },
          { id: 'comp-004', nombre: 'Parcial', porcentaje: 40, tipo: 'parcial' },
        ],
      },
      fechaInicio: new Date(formData.fechaInicio),
      fechaFin: new Date(formData.fechaFin),
      diasClase: cursoEditando ? cursoEditando.diasClase : formData.diasClase,
      horaInicio: cursoEditando ? cursoEditando.horaInicio : formData.horaInicio,
      horaFin: cursoEditando ? cursoEditando.horaFin : formData.horaFin,
      activo: true,
      archivado: false,
    };

    if (cursoEditando) {
      updateCurso(nuevoCurso);
      showToast('Curso actualizado exitosamente', 'success');
    } else {
      addCurso(nuevoCurso);
      showToast('Curso creado exitosamente', 'success');
    }

    setDialogOpen(false);
    setCursoEditando(null);
    setFormData({
      nombre: '',
      asignatura: '',
      grupo: '',
      semestre: '2026-1',
      fechaInicio: '',
      fechaFin: '',
      diasClase: [1],
      horaInicio: '08:00',
      horaFin: '09:30',
    });
  };

  const handleEdit = (curso: Curso) => {
    setCursoEditando(curso);
    setFormData({
      nombre: curso.nombre,
      asignatura: curso.asignatura,
      grupo: curso.grupo,
      semestre: curso.semestre,
      fechaInicio: format(curso.fechaInicio, 'yyyy-MM-dd'),
      fechaFin: format(curso.fechaFin, 'yyyy-MM-dd'),
      diasClase: curso.diasClase,
      horaInicio: curso.horaInicio,
      horaFin: curso.horaFin,
    });
    setDialogOpen(true);
  };

  const handleDelete = (cursoId: string) => {
    if (confirm('¿Está seguro de eliminar este curso?')) {
      deleteCurso(cursoId);
      showToast('Curso eliminado exitosamente', 'success');
    }
  };

  const getEstadoColor = (curso: Curso) => {
    if (curso.archivado) return 'bg-gray-100 text-gray-600';
    if (!curso.activo) return 'bg-red-100 text-red-600';
    return 'bg-green-100 text-green-600';
  };

  const getEstadoTexto = (curso: Curso) => {
    if (curso.archivado) return 'Archivado';
    if (!curso.activo) return 'Inactivo';
    return 'Activo';
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1f1f1f]">Mis Cursos</h1>
          <p className="text-[#626a72]">Gestiona tus asignaturas y estudiantes</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <ImportarEstudiantes />
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-[#0070a0] hover:bg-[#00577c]"
                onClick={() => {
                  setCursoEditando(null);
                  setFormData({
                    nombre: '',
                    asignatura: '',
                    grupo: '',
                    semestre: '2026-1',
                    fechaInicio: '',
                    fechaFin: '',
                    diasClase: [1],
                    horaInicio: '08:00',
                    horaFin: '09:30',
                  });
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Curso
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{cursoEditando ? 'Editar Curso' : 'Crear Nuevo Curso'}</DialogTitle>
                <DialogDescription>
                  Complete la información del curso. Los campos marcados con * son obligatorios.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="asignatura">Asignatura *</Label>
                  <Select
                    value={formData.asignatura}
                    onValueChange={(value) => setFormData({ ...formData, asignatura: value as Asignatura })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione una asignatura" />
                    </SelectTrigger>
                    <SelectContent>
                      {asignaturas.map((asig) => (
                        <SelectItem key={asig} value={asig}>{asig}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="grupo">Grupo *</Label>
                  <Input
                    id="grupo"
                    value={formData.grupo}
                    onChange={(e) => setFormData({ ...formData, grupo: e.target.value.toUpperCase() })}
                    placeholder="Ej: A, B, C"
                    maxLength={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="semestre">Semestre *</Label>
                  <Select
                    value={formData.semestre}
                    onValueChange={(value) => setFormData({ ...formData, semestre: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un semestre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2025-1">2025-1</SelectItem>
                      <SelectItem value="2025-2">2025-2</SelectItem>
                      <SelectItem value="2026-1">2026-1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fechaInicio">Fecha de inicio *</Label>
                    <Input
                      id="fechaInicio"
                      type="date"
                      value={formData.fechaInicio}
                      onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fechaFin">Fecha de fin *</Label>
                    <Input
                      id="fechaFin"
                      type="date"
                      value={formData.fechaFin}
                      onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-[#0070a0] hover:bg-[#00577c]">
                    {cursoEditando ? 'Guardar Cambios' : 'Crear Curso'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#99a4af]" />
          <Input
            type="text"
            placeholder="Buscar cursos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <Tabs value={filtroSemestre} onValueChange={setFiltroSemestre} className="w-full md:w-auto">
          <TabsList className="w-full md:w-auto grid grid-cols-4 md:flex">
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="2025-1" className="hidden md:block">2025-1</TabsTrigger>
            <TabsTrigger value="2025-2" className="hidden md:block">2025-2</TabsTrigger>
            <TabsTrigger value="archivados">Arch</TabsTrigger>
            {/* Simplified for mobile */}
          </TabsList>
        </Tabs>
        <Select value={filtroAsignatura} onValueChange={setFiltroAsignatura}>
          <SelectTrigger className="w-full md:w-64">
            <SelectValue placeholder="Todas las asignaturas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas las asignaturas</SelectItem>
            {asignaturas.map((asig) => (
              <SelectItem key={asig} value={asig}>{asig}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Grid de Cursos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cursosFiltrados.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <BookOpen className="w-16 h-16 text-[#c2cdd8] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#1f1f1f]">No se encontraron cursos</h3>
            <p className="text-[#626a72]">Crea un nuevo curso o ajusta los filtros</p>
          </div>
        ) : (
          cursosFiltrados.map((curso) => (
            <Card
              key={curso.id}
              className="border-0 shadow-md hover:shadow-xl transition-all duration-300 group overflow-hidden"
            >
              {/* Header con color */}
              <div className="h-2 bg-gradient-to-r from-[#0070a0] to-[#2c90c9]" />

              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getEstadoColor(curso)}>
                        {getEstadoTexto(curso)}
                      </Badge>
                      <span className="text-xs text-[#99a4af]">{curso.codigo}</span>
                    </div>
                    <h3 className="font-semibold text-lg text-[#1f1f1f] group-hover:text-[#0070a0] transition-colors">
                      {curso.nombre}
                    </h3>
                    <p className="text-sm text-[#626a72]">{curso.semestre}</p>
                  </div>
                  <div className="relative">
                    <button
                      className="p-2 hover:bg-[#f7f9fa] rounded-lg transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Mostrar menú de acciones
                      }}
                    >
                      <MoreVertical className="w-4 h-4 text-[#99a4af]" />
                    </button>
                    {/* Menú desplegable simplificado */}
                    <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-[#dee5eb] hidden group-hover:block z-10">
                      <button
                        className="w-full px-4 py-2 text-left text-sm hover:bg-[#f7f9fa] flex items-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(curso);
                        }}
                      >
                        <Edit className="w-4 h-4" /> Editar
                      </button>
                      <button
                        className="w-full px-4 py-2 text-left text-sm hover:bg-[#f7f9fa] flex items-center gap-2 text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(curso.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" /> Eliminar
                      </button>
                    </div>
                  </div>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-[#99a4af]">Estudiantes</p>
                      <p className="font-semibold text-[#1f1f1f]">8</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-[#99a4af]">Asistencia</p>
                      <p className="font-semibold text-[#1f1f1f]">89%</p>
                    </div>
                  </div>
                </div>

                {/* Fechas */}
                <div className="flex items-center gap-2 text-sm text-[#626a72] mb-4">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {format(curso.fechaInicio, 'dd MMM', { locale: es })} - {format(curso.fechaFin, 'dd MMM yyyy', { locale: es })}
                  </span>
                </div>

                {/* Alertas */}
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="destructive" className="text-xs">
                    2 en riesgo
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Parcial en 5 días
                  </Badge>
                </div>

                {/* Acción */}
                <Button
                  variant="outline"
                  className="w-full group/btn"
                  onClick={() => {
                    setCursoSeleccionado(curso);
                    showToast(`Curso ${curso.nombre} seleccionado`, 'info');
                  }}
                >
                  Ver detalle
                  <ChevronRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div >
  );
}
