import { useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCursos, useAsistencias, useAuth } from '@/hooks/useStore';
import {
    CheckCircle,
    XCircle,
    Clock,
    AlertTriangle,
    TrendingUp,
    Info
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { EstadoAsistencia } from '@/types';
import {
    calcularTotalClasesSemestre,
    calcularClasesPasadas,
    REGLAMENTO_ACADEMICO
} from '@/utils/academicUtils';

export function StudentAsistencia() {
    const { cursos, cursoSeleccionado, setCursoSeleccionado } = useCursos();
    const { asistencias, fetchAsistenciasPorCurso } = useAsistencias();
    const { usuario } = useAuth();

    useEffect(() => {
        if (cursoSeleccionado) {
            fetchAsistenciasPorCurso(cursoSeleccionado.id);
        } else if (cursos.length > 0) {
            // Auto-select first course if none selected
            setCursoSeleccionado(cursos[0]);
        }
    }, [cursoSeleccionado, cursos]);

    // Info del semestre
    const infoSemestre = useMemo(() => {
        if (!cursoSeleccionado) return null;
        const total = calcularTotalClasesSemestre(cursoSeleccionado);
        const pasadas = calcularClasesPasadas(cursoSeleccionado, new Date());
        return { total, pasadas, restantes: total - pasadas };
    }, [cursoSeleccionado]);

    // Filter attendance for THIS student in the selected course
    const misAsistencias = useMemo(() => {
        if (!cursoSeleccionado || !usuario) return [];
        return asistencias.filter(a =>
            a.cursoId === cursoSeleccionado.id &&
            a.estudianteId === usuario.id
        ).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    }, [asistencias, cursoSeleccionado, usuario]);

    // Calculate stats
    const stats = useMemo(() => {
        if (!misAsistencias.length) return { presentes: 0, ausentes: 0, tardes: 0, porcentaje: 100 };

        // Note: This calculation is based on RECORDED attendance. 
        // Ideally should be based on Total Past Classes vs Absences.
        // For simplicity, we use the stored records.

        // To match Teacher view logic:
        // Porcentaje = Presentes + (Tardes * 0.5) / Total Clases Registradas

        const presentes = misAsistencias.filter(a => a.estado === 'presente').length;
        const ausentes = misAsistencias.filter(a => a.estado === 'ausente').length;
        const tardes = misAsistencias.filter(a => a.estado === 'tarde').length;
        const justificados = misAsistencias.filter(a => a.estado === 'justificado').length; // Often counts as present or separate

        const totalRegistradas = misAsistencias.length;
        const porcentaje = totalRegistradas > 0
            ? Math.round(((presentes + justificados + (tardes * 0.5)) / totalRegistradas) * 100)
            : 100;

        return { presentes, ausentes, tardes, porcentaje };
    }, [misAsistencias]);

    const getEstadoColor = (estado: EstadoAsistencia) => {
        switch (estado) {
            case 'presente': return 'text-green-600 bg-green-100';
            case 'ausente': return 'text-red-600 bg-red-100';
            case 'tarde': return 'text-orange-600 bg-orange-100';
            case 'justificado': return 'text-blue-600 bg-blue-100';
        }
    };

    const getEstadoIcon = (estado: EstadoAsistencia) => {
        switch (estado) {
            case 'presente': return <CheckCircle className="w-4 h-4 mr-2" />;
            case 'ausente': return <XCircle className="w-4 h-4 mr-2" />;
            case 'tarde': return <Clock className="w-4 h-4 mr-2" />;
            case 'justificado': return <Info className="w-4 h-4 mr-2" />;
        }
    };

    if (cursos.length === 0) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold">No estás inscrito en ningún curso.</h2>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#1f1f1f]">Mi Asistencia</h1>
                    <p className="text-[#626a72]">Consulta tu historial de asistencia por curso</p>
                </div>
                <div className="w-full md:w-64">
                    <Select onValueChange={(value) => {
                        const curso = cursos.find(c => c.id === value);
                        if (curso) setCursoSeleccionado(curso);
                    }} value={cursoSeleccionado?.id}>
                        <SelectTrigger>
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

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-0 shadow-md">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-[#626a72]">Porcentaje Global</p>
                            <div className="flex items-center gap-2">
                                <p className={`text-2xl font-bold ${stats.porcentaje < REGLAMENTO_ACADEMICO.ASISTENCIA_MINIMA ? 'text-red-600' : 'text-green-600'}`}>
                                    {stats.porcentaje}%
                                </p>
                                {stats.porcentaje < REGLAMENTO_ACADEMICO.ASISTENCIA_MINIMA && (
                                    <Badge variant="destructive" className="text-xs">
                                        <AlertTriangle className="w-3 h-3 mr-1" /> Riesgo
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-md">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-[#626a72]">Clases Asistidas</p>
                            <p className="text-2xl font-bold text-green-600">{stats.presentes}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-md">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                            <XCircle className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm text-[#626a72]">Fallas</p>
                            <p className="text-2xl font-bold text-red-600">{stats.ausentes}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-md">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                            <Clock className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm text-[#626a72]">Llegadas Tarde</p>
                            <p className="text-2xl font-bold text-orange-600">{stats.tardes}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {infoSemestre && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 bg-muted/30 rounded-lg">
                    <Info className="w-4 h-4" />
                    <span>
                        Se han realizado <strong>{infoSemestre.pasadas}</strong> clases de un total estimado de <strong>{infoSemestre.total}</strong> este semestre.
                    </span>
                </div>
            )}

            {/* History List */}
            <Card className="border-0 shadow-md">
                <CardHeader>
                    <CardTitle className="text-lg">Historial de Clases</CardTitle>
                </CardHeader>
                <CardContent>
                    {misAsistencias.length > 0 ? (
                        <div className="space-y-3">
                            {misAsistencias.map((asistencia) => (
                                <div
                                    key={asistencia.id}
                                    className="flex items-center justify-between p-4 bg-white border rounded-lg hover:bg-[#f7f9fa] transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col items-center justify-center w-14 h-14 bg-muted/20 rounded-lg border border-muted">
                                            <span className="text-xs font-bold text-muted-foreground uppercase">
                                                {format(new Date(asistencia.fecha), 'MMM', { locale: es })}
                                            </span>
                                            <span className="text-xl font-bold">
                                                {format(new Date(asistencia.fecha), 'd')}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-medium capitalize">
                                                {format(new Date(asistencia.fecha), 'EEEE', { locale: es })}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Clase programada
                                            </p>
                                        </div>
                                    </div>

                                    <Badge variant="outline" className={`px-3 py-1 border-0 ${getEstadoColor(asistencia.estado)}`}>
                                        {getEstadoIcon(asistencia.estado)}
                                        <span className="capitalize">{asistencia.estado}</span>
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>No hay registros de asistencia para este curso aún.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
