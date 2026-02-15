import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, AlertCircle, Clock, Calendar, TrendingUp, MapPin, ArrowRight, GraduationCap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useCursos, useAsistencias, useAuth } from '../hooks/useStore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CALENDARIO_ACADEMICO_2026_1 } from '../data/mockData';
import StudentDashboard from '../components/dashboard/StudentDashboard';

const DIAS_NOMBRE = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

export default function Dashboard() {
    const { cursos } = useCursos();
    const { asistencias } = useAsistencias();
    const { usuario } = useAuth();
    const navigate = useNavigate();

    // Render Student Dashboard if user is student
    if (usuario?.rol === 'estudiante') {
        return <StudentDashboard />;
    }

    const hoy = new Date();

    // Calculate real stats
    const stats = useMemo(() => {
        const cursosActivos = cursos.filter(c => c.activo && !c.archivado);
        const totalEstudiantes = cursosActivos.reduce((acc, c) => acc + (c.estudiantes?.length || 0), 0);

        // Determine students at risk (>15% absence)
        let alertasRiesgo = 0;
        const seen = new Set<string>();
        cursosActivos.forEach(curso => {
            curso.estudiantes?.forEach(est => {
                const asistenciasCurso = asistencias.filter(
                    a => a.cursoId === curso.id && a.estudianteId === est.estudianteId
                );
                const totalClases = asistenciasCurso.length;
                const inasistencias = asistenciasCurso.filter(a => a.estado === 'ausente').length;
                if (totalClases > 0 && (inasistencias / totalClases) > 0.15 && !seen.has(est.estudianteId)) {
                    alertasRiesgo++;
                    seen.add(est.estudianteId);
                }
            });
        });

        return {
            cursosActivos: cursosActivos.length,
            totalEstudiantes,
            alertasRiesgo,
        };
    }, [cursos, asistencias]);

    // Classes for today
    const clasesHoy = useMemo(() => {
        const diaSemana = hoy.getDay();
        return cursos
            .filter(c => c.activo && !c.archivado && c.diasClase?.includes(diaSemana))
            .sort((a, b) => (a.horaInicio || '').localeCompare(b.horaInicio || ''));
    }, [cursos, hoy]);

    // Next upcoming classes (next 7 days)
    const proximasClases = useMemo(() => {
        const clases: { curso: typeof cursos[0]; fecha: Date; dia: string }[] = [];
        for (let i = 1; i <= 7; i++) {
            const fecha = addDays(hoy, i);
            const diaSemana = fecha.getDay();
            cursos
                .filter(c => c.activo && !c.archivado && c.diasClase?.includes(diaSemana))
                .forEach(curso => {
                    clases.push({
                        curso,
                        fecha,
                        dia: DIAS_NOMBRE[diaSemana],
                    });
                });
        }
        return clases.slice(0, 5);
    }, [cursos, hoy]);

    // Upcoming academic calendar events
    const eventosCalendario = useMemo(() => {
        const eventos: { titulo: string; fecha: string; tipo: string }[] = [];
        const cal = CALENDARIO_ACADEMICO_2026_1;

        // Check Corte 1 dates
        if (hoy < cal.CORTE_1.fin) {
            eventos.push({
                titulo: 'Cierre Corte I',
                fecha: format(cal.CORTE_1.fin, "d 'de' MMMM", { locale: es }),
                tipo: 'corte',
            });
        }

        // Check exam period
        if (hoy < cal.CORTE_1.examenes.hasta) {
            eventos.push({
                titulo: 'Exámenes Corte I',
                fecha: `${format(cal.CORTE_1.examenes.desde, 'd', { locale: es })} - ${format(cal.CORTE_1.examenes.hasta, "d 'de' MMMM", { locale: es })}`,
                tipo: 'examen',
            });
        } else if (hoy < cal.CORTE_2.examenes.hasta) {
            eventos.push({
                titulo: 'Exámenes Corte II',
                fecha: `${format(cal.CORTE_2.examenes.desde, 'd', { locale: es })} - ${format(cal.CORTE_2.examenes.hasta, "d 'de' MMMM", { locale: es })}`,
                tipo: 'examen',
            });
        }

        // Check note deadlines
        if (hoy < cal.CORTE_1.limiteNotas) {
            eventos.push({
                titulo: 'Límite carga notas Corte I',
                fecha: format(cal.CORTE_1.limiteNotas, "d 'de' MMMM", { locale: es }),
                tipo: 'notas',
            });
        } else if (hoy < cal.CORTE_2.limiteNotas) {
            eventos.push({
                titulo: 'Límite carga notas Corte II',
                fecha: format(cal.CORTE_2.limiteNotas, "d 'de' MMMM", { locale: es }),
                tipo: 'notas',
            });
        }

        // Receso Semana Santa
        if (hoy < cal.RECESO_SEMANA_SANTA.desde) {
            eventos.push({
                titulo: 'Receso Semana Santa',
                fecha: `${format(cal.RECESO_SEMANA_SANTA.desde, "d 'de' MMM", { locale: es })} - ${format(cal.RECESO_SEMANA_SANTA.hasta, "d 'de' MMM", { locale: es })}`,
                tipo: 'receso',
            });
        }

        return eventos.slice(0, 5);
    }, [hoy]);

    // Week number in the semester
    const semanaActual = useMemo(() => {
        const inicioSemestre = CALENDARIO_ACADEMICO_2026_1.INICIO_CLASES;
        const diffMs = hoy.getTime() - inicioSemestre.getTime();
        const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        return Math.max(1, Math.ceil(diffDias / 7));
    }, [hoy]);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Panel de Control</h1>
                    <p className="text-muted-foreground">
                        {format(hoy, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })} — Semestre 2026-1 · Semana {semanaActual}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => navigate('/calendar')}>
                        <Calendar className="w-4 h-4 mr-2" />Calendario
                    </Button>
                    <Button onClick={() => navigate('/courses')} className="bg-[#0070a0] hover:bg-[#00577c]">
                        + Nuevo Curso
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="card-hover cursor-pointer" onClick={() => navigate('/courses')}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cursos Activos</CardTitle>
                        <BookOpen className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.cursosActivos}</div>
                        <p className="text-xs text-muted-foreground">Semestre 2026-1</p>
                    </CardContent>
                </Card>
                <Card className="card-hover cursor-pointer" onClick={() => navigate('/students')}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Estudiantes Totales</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalEstudiantes}</div>
                        <p className="text-xs text-muted-foreground">En {stats.cursosActivos} asignaturas</p>
                    </CardContent>
                </Card>
                <Card className="card-hover cursor-pointer" onClick={() => navigate('/alerts')}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Alertas de Riesgo</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${stats.alertasRiesgo > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {stats.alertasRiesgo}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {stats.alertasRiesgo > 0 ? 'Estudiantes con >15% inasistencias' : '¡Sin alertas!'}
                        </p>
                    </CardContent>
                </Card>
                <Card className="card-hover">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Semana del Semestre</CardTitle>
                        <TrendingUp className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{semanaActual}/16</div>
                        <div className="mt-1 w-full bg-muted rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full transition-all"
                                style={{ width: `${Math.min(100, (semanaActual / 16) * 100)}%` }}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Area */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                {/* Today's Classes + Active Courses */}
                <div className="col-span-4 space-y-6">
                    {/* Today's Classes */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-primary" />
                                Clases de Hoy — {format(hoy, 'EEEE', { locale: es })}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {clasesHoy.length > 0 ? (
                                <div className="space-y-3">
                                    {clasesHoy.map(curso => (
                                        <div
                                            key={curso.id}
                                            className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/50 transition-all cursor-pointer group"
                                            onClick={() => navigate('/attendance')}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                                    <GraduationCap className="h-6 w-6 text-primary" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold">{curso.nombre}</h3>
                                                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3.5 w-3.5" />
                                                            {curso.horaInicio} - {curso.horaFin}
                                                        </span>
                                                        {curso.aula && (
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="h-3.5 w-3.5" />
                                                                {curso.aula}
                                                            </span>
                                                        )}
                                                        <span className="flex items-center gap-1">
                                                            <Users className="h-3.5 w-3.5" />
                                                            {curso.estudiantes?.length || 0}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Calendar className="h-10 w-10 mx-auto mb-3 opacity-50" />
                                    <p className="font-medium">No hay clases hoy</p>
                                    <p className="text-sm">Disfruta tu día libre 🎉</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* All Active Courses */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle>Todos los Cursos</CardTitle>
                                <Button variant="ghost" size="sm" onClick={() => navigate('/courses')}>
                                    Ver todos <ArrowRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {cursos.filter(c => c.activo).slice(0, 8).map(curso => (
                                    <div
                                        key={curso.id}
                                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                {(curso.codigo || 'CUR').substring(0, 3)}
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-sm">{curso.nombre}</h3>
                                                <p className="text-xs text-muted-foreground">
                                                    {DIAS_NOMBRE[curso.diasClase?.[0] || 1]} · {curso.horaInicio} - {curso.horaFin}
                                                    {curso.aula ? ` · ${curso.aula}` : ''}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant="secondary" className="text-xs">
                                            {curso.estudiantes?.length || 0} est.
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Calendar Events + Upcoming Classes */}
                <div className="col-span-3 space-y-6">
                    {/* Academic Calendar Events */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-orange-500" />
                                Calendario Académico
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {eventosCalendario.length > 0 ? eventosCalendario.map((evento, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full shrink-0 ${evento.tipo === 'corte' ? 'bg-blue-500' :
                                            evento.tipo === 'examen' ? 'bg-red-500' :
                                                evento.tipo === 'notas' ? 'bg-orange-500' :
                                                    evento.tipo === 'receso' ? 'bg-green-500' : 'bg-gray-500'
                                            }`} />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{evento.titulo}</p>
                                            <p className="text-xs text-muted-foreground capitalize">{evento.fecha}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">Sin eventos próximos</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Upcoming Classes */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-blue-500" />
                                Próximas Clases
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {proximasClases.map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                                        <div className="text-center min-w-[50px]">
                                            <p className="text-xs text-muted-foreground">{item.dia.substring(0, 3)}</p>
                                            <p className="text-lg font-bold">{format(item.fecha, 'd')}</p>
                                        </div>
                                        <div className="flex-1 border-l pl-3">
                                            <p className="text-sm font-medium leading-tight">{item.curso.nombre}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {item.curso.horaInicio} - {item.curso.horaFin}
                                                {item.curso.aula ? ` · ${item.curso.aula}` : ''}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
