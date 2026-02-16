import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Calendar, TrendingUp, MapPin, ArrowRight, GraduationCap, Trophy, Ban, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCursos, useAuth } from '@/hooks/useStore';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { CALENDARIO_ACADEMICO_2026_1 } from '@/utils/academicUtils';
import { supabase } from '@/lib/supabase';

const DIAS_NOMBRE = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];



export default function StudentDashboard() {
    const { cursos } = useCursos();
    const { usuario } = useAuth();
    const navigate = useNavigate();

    const hoy = new Date();

    const [globalStats, setGlobalStats] = useState({ promedio: '0.0', asistencia: 100 });

    // En teoria, 'cursos' ya viene filtrado desde el store para el estudiante
    const cursosInscritos = cursos.filter(c => c.activo && !c.archivado);

    useEffect(() => {
        if (!usuario?.id) return;

        const fetchData = async () => {
            try {
                // Fetch notas
                const { data: notas } = await supabase
                    .from('notas_actividades')
                    .select('valor')
                    .eq('estudiante_id', usuario.id);

                let prom = 0;
                if (notas && notas.length > 0) {
                    const sum = notas.reduce((acc, curr) => acc + curr.valor, 0);
                    prom = sum / notas.length;
                }

                // Fetch asistencias
                const { data: asis } = await supabase
                    .from('asistencia')
                    .select('estado')
                    .eq('estudiante_id', usuario.id);

                let porcAsistencia = 100;
                if (asis && asis.length > 0) {
                    const total = asis.length;
                    const presentes = asis.filter((a: any) => a.estado === 'presente' || a.estado === 'tarde').length;
                    porcAsistencia = Math.round((presentes / total) * 100);
                }

                setGlobalStats({
                    promedio: prom.toFixed(1),
                    asistencia: porcAsistencia
                });

            } catch (error) {
                console.error("Error loading student stats", error);
            }
        };

        fetchData();
    }, [usuario?.id]);

    const stats = {
        cursosInscritos: cursosInscritos.length,
        promedio: globalStats.promedio,
        asistencia: globalStats.asistencia
    };

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
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Hola, {usuario?.nombre} 👋</h1>
                    <p className="text-muted-foreground">
                        {format(hoy, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })} — Semestre 2026-1 · Semana {semanaActual}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => navigate('/calendar')}>
                        <Calendar className="w-4 h-4 mr-2" />Calendario
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="card-hover cursor-pointer" onClick={() => navigate('/courses')}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cursos Inscritos</CardTitle>
                        <BookOpen className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.cursosInscritos}</div>
                        <p className="text-xs text-muted-foreground">Semestre 2026-1</p>
                    </CardContent>
                </Card>
                <Card className="card-hover cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Promedio Semestral</CardTitle>
                        <Trophy className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.promedio}</div>
                        <p className="text-xs text-muted-foreground">Acumulado actual</p>
                    </CardContent>
                </Card>
                <Card className="card-hover cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Asistencia Global</CardTitle>
                        {stats.asistencia < 80 ? (
                            <Ban className="h-4 w-4 text-red-500" />
                        ) : (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${stats.asistencia < 80 ? 'text-red-600' : 'text-green-600'}`}>
                            {stats.asistencia}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {stats.asistencia < 80 ? '¡Cuidado! Riesgo de pérdida' : '¡Excelente asistencia!'}
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
                {/* Today's Classes + Enrolled Courses */}
                <div className="col-span-4 space-y-6">
                    {/* Today's Classes */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-primary" />
                                Mis Clases de Hoy — {format(hoy, 'EEEE', { locale: es })}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {clasesHoy.length > 0 ? (
                                <div className="space-y-3">
                                    {clasesHoy.map(curso => (
                                        <div
                                            key={curso.id}
                                            className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/50 transition-all cursor-pointer group"
                                        // onClick={() => navigate(`/courses/${curso.id}/attendance`)} // TODO: Link to specific course or attendance?
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                                    <GraduationCap className="h-6 w-6 text-primary" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold">{curso.nombre}</h3>
                                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
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
                                    <p className="font-medium">No tienes clases hoy</p>
                                    <p className="text-sm">¡Aprovecha para estudiar o descansar! 🎉</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* All Enrolled Courses */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle>Mis Cursos</CardTitle>
                                <Button variant="ghost" size="sm" onClick={() => navigate('/courses')}>
                                    Ver todos <ArrowRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {cursos.slice(0, 8).map(curso => (
                                    <div
                                        key={curso.id}
                                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                                        onClick={() => navigate(`/courses`)}
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
