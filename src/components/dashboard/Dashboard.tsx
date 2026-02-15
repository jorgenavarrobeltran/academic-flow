import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useStore, useCursos, useAlertas, useUI } from '@/hooks/useStore';
import {
  BookOpen,
  Users,
  AlertTriangle,
  TrendingUp,
  Calendar,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { estudiantesMock, calcularPorcentajeAsistencia, calcularPromedioNotas } from '@/data/mockData';

export function Dashboard() {
  const { state } = useStore();
  const { cursos, setCursoSeleccionado } = useCursos();
  const { alertasRiesgo } = useAlertas();
  const { showToast } = useUI();

  // Calcular estadísticas
  const totalEstudiantes = estudiantesMock.length;
  const totalCursos = cursos.length;
  const estudiantesRiesgo = alertasRiesgo.length;

  // Calcular asistencia promedio
  const asistenciasPorEstudiante = estudiantesMock.map(est => {
    const asistencias = state.asistencias.filter(a => a.estudianteId === est.id);
    return calcularPorcentajeAsistencia(asistencias);
  });
  const promedioAsistencia = Math.round(
    asistenciasPorEstudiante.reduce((a, b) => a + b, 0) / asistenciasPorEstudiante.length
  );

  // Datos para gráfico de distribución de notas
  const notasData = [
    { name: 'Excelente (5.0)', value: 2, color: '#4CAF50' },
    { name: 'Sobresaliente (4.6-4.9)', value: 3, color: '#2196F3' },
    { name: 'Bueno (4.0-4.5)', value: 2, color: '#FF9800' },
    { name: 'Aceptable (3.0-3.9)', value: 1, color: '#9E9E9E' },
  ];

  // Datos para gráfico de asistencia por curso
  const asistenciaData = cursos.map(curso => ({
    name: curso.codigo,
    asistencia: Math.round(Math.random() * 20 + 80), // Simulado
  }));

  // Próximos eventos
  const proximosEventos = state.eventos
    .filter(e => new Date(e.fechaInicio) >= new Date())
    .slice(0, 3);

  // Estudiantes en riesgo
  const estudiantesEnRiesgo = estudiantesMock.filter(est => {
    const asistencias = state.asistencias.filter(a => a.estudianteId === est.id);
    const porcentaje = calcularPorcentajeAsistencia(asistencias);
    return porcentaje < 80;
  }).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            ¡Hola, {state.usuario?.nombre}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Semestre 2025-1 | {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
          </p>
        </div>
        <Button
          onClick={() => showToast('Función en desarrollo', 'info')}
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 rounded-xl"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Ver Calendario
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cursos Activos</p>
                <p className="text-4xl font-bold text-foreground mt-2">{totalCursos}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100/50 rounded-2xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +2
              </span>
              <span className="text-muted-foreground ml-2">vs semestre anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Estudiantes</p>
                <p className="text-4xl font-bold text-foreground mt-2">{totalEstudiantes}</p>
              </div>
              <div className="w-12 h-12 bg-green-100/50 rounded-2xl flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-muted-foreground">En</span>
              <span className="text-primary font-medium ml-1">{totalCursos} cursos</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-none ring-1 ring-red-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Alertas de Riesgo</p>
                <p className="text-4xl font-bold text-red-500 mt-2">{estudiantesRiesgo}</p>
              </div>
              <div className="w-12 h-12 bg-red-100/50 rounded-2xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-red-600 font-medium">Requieren atención</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Asistencia Promedio</p>
                <p className="text-4xl font-bold text-foreground mt-2">{promedioAsistencia}%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100/50 rounded-2xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <Progress value={promedioAsistencia} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Distribución de Notas */}
        <Card className="glass-card border-none">
          <CardHeader>
            <CardTitle className="text-lg">Distribución de Notas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={notasData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {notasData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {notasData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-[#626a72]">{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Asistencia por Curso */}
        <Card className="glass-card border-none">
          <CardHeader>
            <CardTitle className="text-lg">Asistencia por Curso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={asistenciaData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="asistencia" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Próximos Eventos */}
        <Card className="glass-card border-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Próximos Eventos</CardTitle>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 hover:bg-primary/5">
              Ver todos
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {proximosEventos.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No hay eventos próximos</p>
              ) : (
                proximosEventos.map((evento) => (
                  <div
                    key={evento.id}
                    className="flex items-start gap-4 p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{evento.titulo}</p>
                      <p className="text-sm text-muted-foreground">{evento.descripcion}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(evento.fechaInicio), 'dd/MM/yyyy')}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {differenceInDays(new Date(evento.fechaInicio), new Date())} días
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estudiantes en Riesgo */}
      <Card className="glass-card border-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Estudiantes en Riesgo
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 hover:bg-primary/5">
            Ver todos
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estudiante</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Programa</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Asistencia</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Promedio</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estado</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {estudiantesEnRiesgo.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground">
                      No hay estudiantes en riesgo
                    </td>
                  </tr>
                ) : (
                  estudiantesEnRiesgo.map((est) => {
                    const asistencias = state.asistencias.filter(a => a.estudianteId === est.id);
                    const porcentajeAsistencia = calcularPorcentajeAsistencia(asistencias);
                    const notas = state.notas.filter(n => n.estudianteId === est.id);
                    const promedio = calcularPromedioNotas(notas);

                    return (
                      <tr key={est.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={est.fotoUrl} />
                              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                {est.nombre[0]}{est.apellido[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground">{est.nombre} {est.apellido}</p>
                              <p className="text-xs text-muted-foreground">{est.codigo}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-center md:text-left text-muted-foreground">{est.programa}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Progress value={porcentajeAsistencia} className="w-20 h-2" />
                            <span className={`text-sm font-medium ${porcentajeAsistencia < 80 ? 'text-red-600' : 'text-green-600'
                              }`}>
                              {porcentajeAsistencia}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-sm font-medium ${promedio < 3.0 ? 'text-red-600' : 'text-green-600'
                            }`}>
                            {promedio.toFixed(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {porcentajeAsistencia < 80 ? (
                            <Badge variant="destructive" className="text-xs">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Inasistencia
                            </Badge>
                          ) : promedio < 3.0 ? (
                            <Badge variant="destructive" className="text-xs bg-orange-500">
                              <XCircle className="w-3 h-3 mr-1" />
                              Bajo rendimiento
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              En riesgo
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-primary/80 hover:bg-primary/5"
                            onClick={() => showToast('Función en desarrollo', 'info')}
                          >
                            Ver detalle
                          </Button>
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

      {/* Resumen de Cursos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cursos.map((curso) => (
          <Card
            key={curso.id}
            className="glass-card border-none hover:shadow-xl transition-all cursor-pointer group hover:-translate-y-1"
            onClick={() => {
              setCursoSeleccionado(curso);
              showToast(`Curso ${curso.nombre} seleccionado`, 'info');
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">{curso.codigo}</p>
                  <h3 className="font-semibold text-lg text-foreground mt-1 group-hover:text-primary transition-colors">
                    {curso.nombre}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">{curso.semestre}</p>
                </div>
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary transition-colors duration-300">
                  <BookOpen className="w-5 h-5 text-primary group-hover:text-white transition-colors duration-300" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>8 estudiantes</span>
                </div>
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>89% asist.</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
