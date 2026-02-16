import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useUI, useCursos } from '@/hooks/useStore';
import {
  Award,
  Search,
  Calendar,
  ExternalLink,
  CheckCircle,
  Users,
  Building,
  Plus,
  GraduationCap,
  Briefcase,
  Plane,
  Trophy,
  BookOpen,
  PiggyBank
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Convocatoria } from '@/types';

const categoriaConfig: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  beca: { icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Beca' },
  investigacion: { icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50', label: 'Investigación' },
  practica: { icon: Briefcase, color: 'text-green-600', bg: 'bg-green-50', label: 'Práctica' },
  movilidad: { icon: Plane, color: 'text-orange-600', bg: 'bg-orange-50', label: 'Movilidad' },
  premio: { icon: Trophy, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Premio' },
  auxiliar: { icon: Users, color: 'text-pink-600', bg: 'bg-pink-50', label: 'Auxiliar' },
  financiacion: { icon: PiggyBank, color: 'text-teal-600', bg: 'bg-teal-50', label: 'Financiación' },
};

export function Convocatorias() {
  const { showToast } = useUI();

  const [searchQuery, setSearchQuery] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');
  const [filtroEstado, setFiltroEstado] = useState<string>('activa');
  const [convocatoriaSeleccionada, setConvocatoriaSeleccionada] = useState<Convocatoria | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false); // Detalle Dialog
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false); // Create Dialog

  // Initial empty state, replace mock data. In future connect to DB.
  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([]);

  const [currentConvocatoria, setCurrentConvocatoria] = useState<Partial<Convocatoria>>({
    titulo: '',
    descripcion: '',
    entidadConvocante: '',
    categoria: 'beca',
    estado: 'activa',
    alcance: 'todos',
    cursosIds: []
  });

  const { cursos } = useCursos();

  const handleCreateConvocatoria = () => {
    setCurrentConvocatoria({
      titulo: '',
      descripcion: '',
      entidadConvocante: '',
      categoria: 'beca',
      estado: 'activa',
      alcance: 'todos',
      cursosIds: []
    });
    setIsCreateDialogOpen(true);
  };

  const handleSaveConvocatoria = () => {
    if (!currentConvocatoria.titulo || !currentConvocatoria.descripcion) {
      showToast('Completa los campos obligatorios', 'error');
      return;
    }

    const newConvocatoria: Convocatoria = {
      id: currentConvocatoria.id || `conv-${Date.now()}`,
      titulo: currentConvocatoria.titulo || '',
      entidadConvocante: currentConvocatoria.entidadConvocante || 'Institucional',
      descripcion: currentConvocatoria.descripcion || '',
      categoria: currentConvocatoria.categoria as any,
      fechaCierre: currentConvocatoria.fechaCierre || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      competitividad: 'media',
      estado: currentConvocatoria.estado as any,
      alcance: currentConvocatoria.alcance as any,
      cursosIds: currentConvocatoria.cursosIds,
      requisitos: currentConvocatoria.requisitos || ['Ser estudiante activo'],
      beneficios: 'Apoyo financiero total',
      duracion: '1 semestre',
      programasObjetivo: [],
      enlaceOficial: '#',
      // Required fields missing
      codigo: `CONV-${Date.now().toString().slice(-4)}`,
      subcategoria: 'General',
      fechaApertura: new Date(),
      documentosAdjuntos: []
    };

    if (currentConvocatoria.id) {
      setConvocatorias(convocatorias.map(c => c.id === newConvocatoria.id ? newConvocatoria : c));
      showToast('Convocatoria actualizada', 'success');
    } else {
      setConvocatorias([...convocatorias, newConvocatoria]);
      showToast('Convocatoria publicada', 'success');
    }
    setIsCreateDialogOpen(false);
  };

  // Filtrar convocatorias
  const convocatoriasFiltradas = useMemo(() => {
    return convocatorias.filter(conv => {
      const matchSearch =
        conv.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.entidadConvocante.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.descripcion.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategoria = filtroCategoria === 'todas' || conv.categoria === filtroCategoria;
      const matchEstado = filtroEstado === 'todas' || conv.estado === filtroEstado;

      return matchSearch && matchCategoria && matchEstado;
    });
  }, [convocatorias, searchQuery, filtroCategoria, filtroEstado]);

  const handleVerDetalle = (convocatoria: Convocatoria) => {
    setConvocatoriaSeleccionada(convocatoria);
    setDialogOpen(true);
  };

  const getMatchElegibilidad = () => {
    return Math.floor(Math.random() * 30) + 70; // 70-100%
  };

  return (
    <div className="space-y-6 container mx-auto p-4 md:p-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Convocatorias y Oportunidades
          </h1>
          <p className="text-muted-foreground mt-1">
            Explora becas, eventos, semilleros y prácticas.
          </p>
        </div>
        <Button onClick={handleCreateConvocatoria}>
          <Plus className="mr-2 h-4 w-4" />
          Publicar Convocatoria
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input
            placeholder="Buscar convocatorias..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs value={filtroCategoria} onValueChange={setFiltroCategoria}>
        <TabsList className="mb-4 flex flex-wrap h-auto">
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="beca">Becas</TabsTrigger>
          <TabsTrigger value="evento">Eventos</TabsTrigger>
          <TabsTrigger value="semillero">Semilleros</TabsTrigger>
          <TabsTrigger value="practica">Prácticas</TabsTrigger>
          <TabsTrigger value="monitoria">Monitorías</TabsTrigger>
        </TabsList>
      </Tabs>

      <Tabs value={filtroEstado} onValueChange={setFiltroEstado}>
        <TabsList>
          <TabsTrigger value="activa">Activas</TabsTrigger>
          <TabsTrigger value="proxima">Próximas</TabsTrigger>
          <TabsTrigger value="cerrada">Cerradas</TabsTrigger>
          <TabsTrigger value="todas">Todas</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {convocatoriasFiltradas.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No se encontraron convocatorias con los filtros actuales.
          </div>
        ) : (
          convocatoriasFiltradas.map((convocatoria) => {
            const config = categoriaConfig[convocatoria.categoria];
            const Icon = config?.icon || Award;
            const matchElegibilidad = getMatchElegibilidad();
            return (
              <Card key={convocatoria.id} className="flex flex-col h-full hover:shadow-lg transition-shadow border-t-4 border-t-blue-500 cursor-pointer" onClick={() => handleVerDetalle(convocatoria)}>
                <div className="relative h-32 bg-slate-50 dark:bg-slate-800 rounded-t-lg overflow-hidden flex items-center justify-center border-b">
                  <Icon className={`h-12 w-12 ${config?.color || 'text-gray-400'}`} />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Badge variant="secondary" className="bg-white/90 text-slate-800 backdrop-blur-sm shadow-sm capitalize">{convocatoria.categoria}</Badge>
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center text-sm text-blue-600 font-medium truncate max-w-[70%]">
                      <Building className="mr-1 h-3 w-3 inline" />
                      <span className="truncate">{convocatoria.entidadConvocante}</span>
                    </div>
                    {convocatoria.estado === 'activa' && <Badge className="bg-green-500 hover:bg-green-600 text-[10px] px-1.5">Activa</Badge>}
                    {convocatoria.estado === 'proxima' && <Badge className="bg-blue-500 hover:bg-blue-600 text-[10px] px-1.5">Próxima</Badge>}
                    {convocatoria.estado === 'cerrada' && <Badge variant="destructive" className="text-[10px] px-1.5">Cerrada</Badge>}
                  </div>
                  <h3 className="font-bold text-lg leading-tight line-clamp-2">{convocatoria.titulo}</h3>
                </CardHeader>
                <CardContent className="flex-grow pb-2">
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-4">
                    {convocatoria.descripcion}
                  </p>

                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-3 w-3" />
                        <span>Cierre: {format(new Date(convocatoria.fechaCierre), 'dd MMM yyyy', { locale: es })}</span>
                      </div>
                    </div>
                    {convocatoria.semestreMinimo && (
                      <div className="flex items-center">
                        <GraduationCap className="mr-2 h-3 w-3" />
                        <span>Desde {convocatoria.semestreMinimo}° Semestre</span>
                      </div>
                    )}
                    <div className="w-full bg-secondary h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className={`h-full ${matchElegibilidad > 80 ? 'bg-green-500' : 'bg-yellow-500'}`}
                        style={{ width: `${matchElegibilidad}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-right mt-0.5">Match: {matchElegibilidad}%</div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  {convocatoria.alcance !== 'todos' && (
                    <Badge variant="outline" className="w-full justify-center text-xs py-1">
                      {convocatoria.alcance === 'cursos' ? 'Cursos Específicos' : 'Programas'}
                    </Badge>
                  )}
                  {convocatoria.alcance === 'todos' && (
                    <div className="w-full text-center text-xs text-muted-foreground py-1">
                      Para toda la comunidad
                    </div>
                  )}
                </CardFooter>
              </Card>
            );
          })
        )}
      </div>

      {/* Dialog Detalle existente */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {convocatoriaSeleccionada && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${categoriaConfig[convocatoriaSeleccionada.categoria]?.bg || 'bg-gray-100'}`}>
                    {(() => {
                      const Icon = categoriaConfig[convocatoriaSeleccionada.categoria]?.icon || Award;
                      return <Icon className={`w-6 h-6 ${categoriaConfig[convocatoriaSeleccionada.categoria]?.color || 'text-gray-600'}`} />;
                    })()}
                  </div>
                  <div className="flex-1">
                    <DialogTitle className="text-xl">{convocatoriaSeleccionada.titulo}</DialogTitle>
                    <DialogDescription className="flex items-center gap-2 mt-1">
                      <Building className="w-4 h-4" />
                      {convocatoriaSeleccionada.entidadConvocante}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-2">
                <div>
                  <h4 className="font-medium text-[#1f1f1f] mb-2">Descripción</h4>
                  <p className="text-[#626a72] text-sm leading-relaxed">{convocatoriaSeleccionada.descripcion}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Cierre</p>
                    <p className="font-medium text-sm">
                      {format(new Date(convocatoriaSeleccionada.fechaCierre), 'dd MMMM yyyy', { locale: es })}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Beneficio</p>
                    <p className="font-medium text-sm text-green-600">{convocatoriaSeleccionada.beneficios}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-[#1f1f1f] mb-2">Requisitos</h4>
                  <ul className="space-y-2">
                    {convocatoriaSeleccionada.requisitos.map((req, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[#626a72]">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {convocatoriaSeleccionada.alcance === 'cursos' && convocatoriaSeleccionada.cursosIds && (
                  <div>
                    <h4 className="font-medium text-[#1f1f1f] mb-2">Cursos Vinculados</h4>
                    <div className="flex flex-wrap gap-2">
                      {cursos.filter(c => convocatoriaSeleccionada.cursosIds?.includes(c.id)).map(c => (
                        <Badge key={c.id} variant="outline">{c.nombre}</Badge>
                      ))}
                      {(!convocatoriaSeleccionada.cursosIds.some(id => cursos.map(c => c.id).includes(id))) && (
                        <span className="text-xs text-muted-foreground">Cursos no encontrados o no asignados a ti.</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => window.open(convocatoriaSeleccionada.enlaceOficial, '_blank')}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Más Info
                </Button>
                <Button onClick={() => showToast('¡Postulación enviada!', 'success')}>
                  Postularme Ahora
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Nueva Convocatoria */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{currentConvocatoria.id ? 'Editar Convocatoria' : 'Publicar Nueva Convocatoria'}</DialogTitle>
            <DialogDescription>
              Comparte oportunidades con la comunidad académica.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  value={currentConvocatoria.titulo}
                  onChange={(e) => setCurrentConvocatoria({ ...currentConvocatoria, titulo: e.target.value })}
                  placeholder="Ej: Beca de Excelencia"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="entidad">Entidad Convocante</Label>
                <Input
                  id="entidad"
                  value={currentConvocatoria.entidadConvocante}
                  onChange={(e) => setCurrentConvocatoria({ ...currentConvocatoria, entidadConvocante: e.target.value })}
                  placeholder="Ej: Vicerrectoría Académica"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={currentConvocatoria.descripcion}
                onChange={(e) => setCurrentConvocatoria({ ...currentConvocatoria, descripcion: e.target.value })}
                placeholder="Detalles completos de la convocatoria..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Select
                  value={currentConvocatoria.categoria}
                  onValueChange={(val: any) => setCurrentConvocatoria({ ...currentConvocatoria, categoria: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beca">Beca</SelectItem>
                    <SelectItem value="evento">Evento</SelectItem>
                    <SelectItem value="semillero">Semillero</SelectItem>
                    <SelectItem value="practica">Práctica</SelectItem>
                    <SelectItem value="monitoria">Monitoría</SelectItem>
                    <SelectItem value="investigacion">Investigación</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Estado Inicial</Label>
                <Select
                  value={currentConvocatoria.estado}
                  onValueChange={(val: any) => setCurrentConvocatoria({ ...currentConvocatoria, estado: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activa">Activa</SelectItem>
                    <SelectItem value="proxima">Próxima</SelectItem>
                    <SelectItem value="cerrada">Cerrada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3 border rounded-lg p-4 bg-slate-50/50 mt-2">
              <Label className="text-base font-medium">Público Objetivo (Alcance)</Label>
              <RadioGroup
                value={currentConvocatoria.alcance || 'todos'}
                onValueChange={(val: 'todos' | 'programas' | 'cursos') => setCurrentConvocatoria({ ...currentConvocatoria, alcance: val })}
                className="flex flex-col sm:flex-row gap-4 mb-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="todos" id="c-todos" />
                  <Label htmlFor="c-todos" className="cursor-pointer">Toda la comunidad</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cursos" id="c-cursos" />
                  <Label htmlFor="c-cursos" className="cursor-pointer">Mis Cursos</Label>
                </div>
              </RadioGroup>

              {currentConvocatoria.alcance === 'cursos' && (
                <div className="mt-2 border rounded-md p-3 max-h-40 overflow-y-auto bg-white space-y-2">
                  {cursos.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No tienes cursos asignados.</p>
                  ) : cursos.map(curso => (
                    <div key={curso.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`conv-c-${curso.id}`}
                        checked={currentConvocatoria.cursosIds?.includes(curso.id)}
                        onCheckedChange={(checked) => {
                          const currentIds = currentConvocatoria.cursosIds || [];
                          const newIds = checked
                            ? [...currentIds, curso.id]
                            : currentIds.filter(id => id !== curso.id);
                          setCurrentConvocatoria({ ...currentConvocatoria, cursosIds: newIds });
                        }}
                      />
                      <Label htmlFor={`conv-c-${curso.id}`} className="cursor-pointer font-normal text-sm">
                        {curso.nombre} <span className="text-muted-foreground text-xs">({curso.codigo})</span>
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveConvocatoria}>Publicar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
