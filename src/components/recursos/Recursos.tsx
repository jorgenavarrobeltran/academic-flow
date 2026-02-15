import { useState, useMemo } from 'react';
import { useRecursos, useCursos } from '@/hooks/useStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search,
  ExternalLink,
  Video,
  FileText,
  BookOpen,
  Headphones,
  Wrench,
  Clock,
  Star,
  Filter,
  GraduationCap,
} from 'lucide-react';

const tipoConfig: Record<string, { icon: typeof Video; label: string; color: string; bgColor: string }> = {
  video: { icon: Video, label: 'Video', color: 'text-red-600', bgColor: 'bg-red-50 border-red-200' },
  pdf: { icon: FileText, label: 'PDF', color: 'text-blue-600', bgColor: 'bg-blue-50 border-blue-200' },
  curso: { icon: BookOpen, label: 'Curso', color: 'text-purple-600', bgColor: 'bg-purple-50 border-purple-200' },
  podcast: { icon: Headphones, label: 'Podcast', color: 'text-green-600', bgColor: 'bg-green-50 border-green-200' },
  herramienta: { icon: Wrench, label: 'Herramienta', color: 'text-amber-600', bgColor: 'bg-amber-50 border-amber-200' },
};

const nivelConfig: Record<string, { label: string; color: string }> = {
  basico: { label: 'Básico', color: 'bg-green-100 text-green-800' },
  intermedio: { label: 'Intermedio', color: 'bg-yellow-100 text-yellow-800' },
  avanzado: { label: 'Avanzado', color: 'bg-red-100 text-red-800' },
};

export default function Recursos() {
  const { recursos } = useRecursos();
  const { cursos } = useCursos();
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroNivel, setFiltroNivel] = useState<string>('todos');
  const [filtroObligatorio, setFiltroObligatorio] = useState<boolean | null>(null);
  const [cursoFiltro, setCursoFiltro] = useState<string>('todos');

  const recursosFiltrados = useMemo(() => {
    let filtered = [...recursos];

    // Búsqueda por texto
    if (busqueda.trim()) {
      const query = busqueda.toLowerCase();
      filtered = filtered.filter(r =>
        r.titulo.toLowerCase().includes(query) ||
        r.descripcion.toLowerCase().includes(query) ||
        r.tags.some(t => t.toLowerCase().includes(query)) ||
        r.asignatura.toLowerCase().includes(query)
      );
    }

    // Filtro por tipo
    if (filtroTipo !== 'todos') {
      filtered = filtered.filter(r => r.tipo === filtroTipo);
    }

    // Filtro por nivel
    if (filtroNivel !== 'todos') {
      filtered = filtered.filter(r => r.nivel === filtroNivel);
    }

    // Filtro por obligatorio
    if (filtroObligatorio !== null) {
      filtered = filtered.filter(r => r.obligatorio === filtroObligatorio);
    }

    // Filtro por curso (asignatura)
    if (cursoFiltro !== 'todos') {
      const cursoSeleccionado = cursos.find(c => c.id === cursoFiltro);
      if (cursoSeleccionado) {
        filtered = filtered.filter(r =>
          r.asignatura.toLowerCase().includes(cursoSeleccionado.nombre.toLowerCase())
        );
      }
    }

    return filtered;
  }, [recursos, busqueda, filtroTipo, filtroNivel, filtroObligatorio, cursoFiltro, cursos]);

  const formatDuracion = (minutos?: number) => {
    if (!minutos) return null;
    if (minutos < 60) return `${minutos} min`;
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return mins > 0 ? `${horas}h ${mins}min` : `${horas}h`;
  };

  // Stats
  const totalRecursos = recursos.length;
  const obligatorios = recursos.filter(r => r.obligatorio).length;
  const tiposUnicos = new Set(recursos.map(r => r.tipo)).size;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Recursos Educativos</h2>
          <p className="text-muted-foreground">Biblioteca de materiales de apoyo para tus asignaturas</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Selector de curso persistente */}
          <Select
            value={cursoFiltro}
            onValueChange={setCursoFiltro}
          >
            <SelectTrigger className="w-[280px] border-[#cce5f3] bg-[#e6f7ff] hover:bg-[#cce5f3]">
              <SelectValue placeholder="Todos los cursos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los cursos</SelectItem>
              {cursos.map(curso => (
                <SelectItem key={curso.id} value={curso.id}>{curso.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalRecursos}</p>
              <p className="text-xs text-muted-foreground">Total Recursos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-50">
              <Star className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{obligatorios}</p>
              <p className="text-xs text-muted-foreground">Obligatorios</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-50">
              <Filter className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{tiposUnicos}</p>
              <p className="text-xs text-muted-foreground">Tipos de Recurso</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar recursos por título, tag o asignatura..."
                className="pl-10"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            {/* Type filter */}
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={filtroTipo === 'todos' ? 'default' : 'outline'}
                className="cursor-pointer transition-all hover:scale-105"
                onClick={() => setFiltroTipo('todos')}
              >
                Todos
              </Badge>
              {Object.entries(tipoConfig).map(([tipo, config]) => (
                <Badge
                  key={tipo}
                  variant={filtroTipo === tipo ? 'default' : 'outline'}
                  className="cursor-pointer transition-all hover:scale-105"
                  onClick={() => setFiltroTipo(tipo)}
                >
                  <config.icon className="mr-1 h-3 w-3" />
                  {config.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Level filter */}
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="text-xs text-muted-foreground self-center mr-1">Nivel:</span>
            <Badge
              variant={filtroNivel === 'todos' ? 'default' : 'outline'}
              className="cursor-pointer text-xs"
              onClick={() => setFiltroNivel('todos')}
            >
              Todos
            </Badge>
            {Object.entries(nivelConfig).map(([nivel, config]) => (
              <Badge
                key={nivel}
                variant={filtroNivel === nivel ? 'default' : 'outline'}
                className="cursor-pointer text-xs"
                onClick={() => setFiltroNivel(nivel)}
              >
                {config.label}
              </Badge>
            ))}
            <span className="text-xs text-muted-foreground self-center mx-2">|</span>
            <Badge
              variant={filtroObligatorio === true ? 'default' : 'outline'}
              className="cursor-pointer text-xs"
              onClick={() => setFiltroObligatorio(filtroObligatorio === true ? null : true)}
            >
              <Star className="mr-1 h-3 w-3" /> Obligatorios
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Resources Grid */}
      {recursosFiltrados.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="p-4 rounded-full bg-muted/50 mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg">No se encontraron recursos</h3>
            <p className="text-sm text-muted-foreground">Intenta con otros filtros o términos de búsqueda</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recursosFiltrados.map(recurso => {
            const tipo = tipoConfig[recurso.tipo] || tipoConfig.video;
            const nivel = nivelConfig[recurso.nivel] || nivelConfig.basico;
            const IconComponent = tipo.icon;

            return (
              <Card
                key={recurso.id}
                className={`group transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 border ${tipo.bgColor}`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`p-3 rounded-xl bg-white/80 shadow-sm ${tipo.color} shrink-0 group-hover:scale-110 transition-transform`}>
                      <IconComponent className="h-6 w-6" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors">
                          {recurso.titulo}
                        </h3>
                        {recurso.obligatorio && (
                          <Badge className="bg-amber-500 text-white text-[10px] shrink-0">
                            <Star className="mr-0.5 h-2.5 w-2.5" /> Obligatorio
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {recurso.descripcion}
                      </p>

                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <Badge variant="secondary" className={`text-[10px] px-2 py-0 ${nivel.color}`}>
                          {nivel.label}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <GraduationCap className="h-3 w-3" />
                          {recurso.asignatura}
                        </span>
                        {recurso.duracion && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDuracion(recurso.duracion)}
                          </span>
                        )}
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {recurso.tags.map(tag => (
                          <span
                            key={tag}
                            className="text-[10px] px-1.5 py-0.5 bg-white/60 rounded-full text-muted-foreground border"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Action */}
                      <div className="mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-7 group-hover:bg-primary group-hover:text-white transition-all"
                          onClick={() => window.open(recurso.url, '_blank')}
                        >
                          <ExternalLink className="mr-1 h-3 w-3" />
                          Abrir Recurso
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
