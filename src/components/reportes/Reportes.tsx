import { useState, useMemo, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useCursos, useUI, useAuth, useCalificaciones, useAsistencias } from '@/hooks/useStore';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line
} from 'recharts';
import {
    FileText,
    FileSpreadsheet,
    TrendingUp,
    Users,
    AlertTriangle,
    Calendar,
} from 'lucide-react';
import { utils, writeFile } from 'xlsx';
import { format } from 'date-fns';




export function Reportes() {
    const { usuario } = useAuth();
    const { cursos, cursoSeleccionado, setCursoSeleccionado } = useCursos();
    const { calificaciones, fetchCalificaciones } = useCalificaciones();
    const { asistencias, fetchAsistenciasPorCurso } = useAsistencias();
    const { showToast } = useUI();
    const [reportType, setReportType] = useState('rendimiento');
    const [periodo, setPeriodo] = useState('2026-1');

    // Redirect students
    if (usuario?.rol === 'estudiante') {
        return <Navigate to="/dashboard" replace />;
    }

    // Si no hay curso seleccionado, seleccionar el primero
    const activeCourseId = cursoSeleccionado?.id || cursos[0]?.id;
    const activeCourse = cursos.find(c => c.id === activeCourseId) || cursos[0];

    // Cargar datos reales al cambiar curso
    useEffect(() => {
        if (activeCourseId) {
            fetchCalificaciones(activeCourseId);
            fetchAsistenciasPorCurso(activeCourseId);
        }
    }, [activeCourseId, fetchCalificaciones, fetchAsistenciasPorCurso]);

    // Calcular datos reales
    const performanceData = useMemo(() => {
        if (!calificaciones || calificaciones.length === 0) return [];

        // Calcular promedio por corte
        const corte1 = calificaciones.reduce((acc, c) => acc + (c.corte1?.nota || 0), 0) / calificaciones.length;
        const corte2 = calificaciones.reduce((acc, c) => acc + (c.corte2?.nota || 0), 0) / calificaciones.length;
        const corte3 = calificaciones.reduce((acc, c) => acc + (c.corte3?.nota || 0), 0) / calificaciones.length;

        return [
            { name: 'Corte 1', promedio: parseFloat(corte1.toFixed(1)), aprobados: 0, reprobados: 0 },
            { name: 'Corte 2', promedio: parseFloat(corte2.toFixed(1)), aprobados: 0, reprobados: 0 },
            { name: 'Corte 3', promedio: parseFloat(corte3.toFixed(1)), aprobados: 0, reprobados: 0 },
        ];
    }, [calificaciones]);

    const approvalData = useMemo(() => {
        if (!calificaciones || calificaciones.length === 0) return [];

        let aprobados = 0;
        let riesgo = 0;
        let reprobados = 0;

        calificaciones.forEach(cal => {
            const def = (cal.corte1.nota * 0.3) + (cal.corte2.nota * 0.3) + (cal.corte3.nota * 0.4);
            if (def >= 3.0) aprobados++;
            else if (def >= 2.0) riesgo++;
            else reprobados++;
        });

        return [
            { name: 'Aprobados', value: aprobados, color: '#22c55e' },
            { name: 'En Riesgo', value: riesgo, color: '#f59e0b' },
            { name: 'Reprobados', value: reprobados, color: '#ef4444' },
        ];
    }, [calificaciones]);

    const attendanceData = useMemo(() => {
        // Datos simulados o basados en asistencias si tuvieramos fechas
        // Por ahora retornamos vacio o mock si no hay fechas claras en asistencias
        return Array.from({ length: 10 }, (_, i) => ({
            semana: `Sem ${i + 1}`,
            asistencia: 100, // Placeholder
            faltas: 0,
        }));
    }, [asistencias]);

    const handleExportExcel = () => {
        // Generate simple excel data
        const ws = utils.json_to_sheet([
            { Estudiante: 'Juan Pérez', Corte1: 3.5, Corte2: 4.0, Corte3: 3.8, Definitiva: 3.8 },
            { Estudiante: 'Maria Garcia', Corte1: 4.5, Corte2: 4.2, Corte3: 4.8, Definitiva: 4.5 },
            { Estudiante: 'Carlos Sanchez', Corte1: 2.8, Corte2: 3.0, Corte3: 2.5, Definitiva: 2.8 },
        ]);
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, "Notas");
        writeFile(wb, `Reporte_${activeCourse?.nombre || 'General'}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
        showToast('Reporte Excel descargado exitosamente', 'success');
    };

    const handleExportPDF = () => {
        showToast('Generando PDF... (Simulado)', 'success');
        // In real app, generate PDF here
    };

    if (!activeCourse) return <div className="p-8 text-center">Cargando cursos...</div>;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#1f1f1f]">Reportes y Estadísticas</h1>
                    <p className="text-[#626a72]">Analiza el rendimiento académico y genera informes oficiales</p>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={activeCourseId} onValueChange={(val) => setCursoSeleccionado(cursos.find(c => c.id === val) || null)}>
                        <SelectTrigger className="w-[280px] border-[#cce5f3] bg-[#e6f7ff] hover:bg-[#cce5f3]">
                            <SelectValue placeholder="Seleccionar curso" />
                        </SelectTrigger>
                        <SelectContent>
                            {cursos.map(curso => (
                                <SelectItem key={curso.id} value={curso.id}>
                                    {curso.nombre} - Grupo {curso.grupo}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={periodo} onValueChange={setPeriodo}>
                        <SelectTrigger className="w-[120px] border-[#cce5f3] bg-[#e6f7ff] hover:bg-[#cce5f3]">
                            <SelectValue placeholder="Periodo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="2026-1">2026-1</SelectItem>
                            <SelectItem value="2025-2">2025-2</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Main Content Tabs */}
            <Tabs value={reportType} onValueChange={setReportType} className="space-y-6">
                <div className="flex items-center justify-between border-b pb-2">
                    <TabsList className="bg-transparent p-0 gap-6">
                        <TabsTrigger
                            value="rendimiento"
                            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#0070a0] data-[state=active]:text-[#0070a0] rounded-none px-0 pb-2"
                        >
                            Rendimiento Académico
                        </TabsTrigger>
                        <TabsTrigger
                            value="asistencia"
                            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#0070a0] data-[state=active]:text-[#0070a0] rounded-none px-0 pb-2"
                        >
                            Control de Asistencia
                        </TabsTrigger>
                        <TabsTrigger
                            value="alertas"
                            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#0070a0] data-[state=active]:text-[#0070a0] rounded-none px-0 pb-2"
                        >
                            Alertas y Riesgos
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handleExportPDF}>
                            <FileText className="w-4 h-4 mr-2 text-red-600" />
                            PDF
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleExportExcel}>
                            <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
                            Excel
                        </Button>
                    </div>
                </div>

                <TabsContent value="rendimiento" className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-4 flex flex-col gap-1">
                                <span className="text-sm text-muted-foreground">Promedio General</span>
                                <span className="text-2xl font-bold">3.8</span>
                                <span className="text-xs text-green-600 flex items-center">
                                    <TrendingUp className="w-3 h-3 mr-1" /> +0.2 vs Corte anterior
                                </span>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 flex flex-col gap-1">
                                <span className="text-sm text-muted-foreground">Aprobados</span>
                                <span className="text-2xl font-bold text-green-600">85%</span>
                                <span className="text-xs text-muted-foreground">25 estudiantes</span>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 flex flex-col gap-1">
                                <span className="text-sm text-muted-foreground">Reprobados</span>
                                <span className="text-2xl font-bold text-red-600">8%</span>
                                <span className="text-xs text-muted-foreground">3 estudiantes</span>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 flex flex-col gap-1">
                                <span className="text-sm text-muted-foreground">Deserción</span>
                                <span className="text-2xl font-bold text-orange-600">2%</span>
                                <span className="text-xs text-muted-foreground">1 estudiante</span>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Chart 1: Promedios por Corte */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Promedio por Corte</CardTitle>
                                <CardDescription>Evolución de las notas promedio del grupo</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={performanceData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" />
                                        <YAxis domain={[0, 5]} />
                                        <Tooltip />
                                        <Bar dataKey="promedio" fill="#0070a0" radius={[4, 4, 0, 0]} name="Promedio" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Chart 2: Distribución de Aprobados */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Distribución de Rendimiento</CardTitle>
                                <CardDescription>Estado actual de los estudiantes</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={approvalData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {approvalData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="asistencia" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="p-2 bg-blue-100 rounded-full">
                                    <Users className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground">Asistencia Promedio</span>
                                    <p className="text-2xl font-bold">92%</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="p-2 bg-orange-100 rounded-full">
                                    <AlertTriangle className="w-6 h-6 text-orange-600" />
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground">Ausentismo Crítico</span>
                                    <p className="text-2xl font-bold text-orange-600">3</p>
                                    <span className="text-xs text-muted-foreground">Estudiantes &gt;20% fallas</span>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="p-2 bg-green-100 rounded-full">
                                    <Calendar className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground">Clases Realizadas</span>
                                    <p className="text-2xl font-bold">12</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Tendencia de Asistencia</CardTitle>
                            <CardDescription>Porcentaje de asistencia por semana</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={attendanceData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="semana" />
                                    <YAxis domain={[0, 100]} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="asistencia" stroke="#0070a0" strokeWidth={2} name="Asistencia %" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="alertas">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Alertas Tempranas Generadas</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                                        <div className="flex items-center gap-3">
                                            <AlertTriangle className="w-5 h-5 text-red-500" />
                                            <div>
                                                <p className="font-medium text-red-900">Riesgo de Deserción</p>
                                                <p className="text-xs text-red-700">Por inasistencia &gt; 20%</p>
                                            </div>
                                        </div>
                                        <span className="text-xl font-bold text-red-600">2</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                                        <div className="flex items-center gap-3">
                                            <TrendingUp className="w-5 h-5 text-orange-500" />
                                            <div>
                                                <p className="font-medium text-orange-900">Bajo Rendimiento</p>
                                                <p className="text-xs text-orange-700">Promedio semestral - 3.0</p>
                                            </div>
                                        </div>
                                        <span className="text-xl font-bold text-orange-600">5</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Estudiantes en Seguimiento</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {(activeCourse?.estudiantes || []).slice(0, 3).map((est: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden">
                                                    {est.fotoUrl ? <img src={est.fotoUrl} alt={est.nombre} /> : <span className="flex items-center justify-center h-full text-xs font-bold">{est.nombre ? est.nombre[0] : '?'}</span>}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{est.nombre || 'Estudiante'} {est.apellido}</p>
                                                    <p className="text-xs text-muted-foreground">{est.codigo}</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" className="text-[#0070a0]">Ver detalle</Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
