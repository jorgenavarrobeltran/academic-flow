
import { useState, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useStore, useUI, useAuth } from '../../hooks/useStore';
import { estudiantesMock, notasMock } from '../../data/mockData';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../ui/table';
import {
    TrendingDown,
    UserX,
    FileWarning,
    Filter,
    Download,
    Send,
    MoreHorizontal
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';

// Risk weights based on PRD
const RISK_WEIGHTS = {
    ATTENDANCE: 0.25,
    GRADES: 0.20,
    RESOURCES: 0.15,
    ASSIGNMENTS: 0.20,
    PARTICIPATION: 0.10,
    HISTORY: 0.10,
};

// Thresholds
const THRESHOLDS = {
    HIGH: 60,
    MEDIUM: 30,
};

export default function EarlyWarning() {
    const { usuario } = useAuth();
    if (usuario?.rol === 'estudiante') {
        return <Navigate to="/dashboard" replace />;
    }

    const { state } = useStore();
    const { showToast } = useUI();
    const [filterLevel, setFilterLevel] = useState<'all' | 'high' | 'medium' | 'low'>('all');
    const [selectedCourse, setSelectedCourse] = useState<string>('all');

    // Helper to calculate student risk
    const studentRisks = useMemo(() => {
        const risks: any[] = [];

        // Iterate through all courses and students
        state.cursos.forEach(curso => {
            if (selectedCourse !== 'all' && curso.id !== selectedCourse) return;

            curso.estudiantes.forEach(estCurso => {
                // Find student details from mock or store
                const student = estudiantesMock.find(e => e.id === estCurso.estudianteId);
                if (!student) return;

                // 1. Attendance Calculation
                const courseAttendance = state.asistencias.filter(
                    a => a.cursoId === curso.id && a.estudianteId === student.id
                );
                const totalClasses = 16; // Assumed for mock calculation, should be dynamic
                const absences = courseAttendance.filter(a => a.estado === 'ausente').length;
                const attendancePercentage = (absences / totalClasses) * 100;
                const attendanceRiskScore = Math.min(attendancePercentage * 5, 100); // 20% absence = 100 score

                // 2. Grades Calculation
                // Try to find grades in state.notas (Calificacion[]) or notasMock (Nota[])
                let averageGrade = 0;

                // Strategy: Check if we have Calificacion style (store) or Nota style (mock)
                const studentCalificacion = state.notas.find(
                    n => n.cursoId === curso.id && n.estudianteId === student.id
                );

                if (studentCalificacion) {
                    // Calculate from corte1, corte2, corte3
                    const c1 = studentCalificacion.corte1.nota || 0;
                    const c2 = studentCalificacion.corte2.nota || 0;
                    const c3 = studentCalificacion.corte3.nota || 0;
                    // Simple average for now, ignoring weights for quick risk calc
                    // Or use max possible? Let's use avg of non-zero
                    const grades = [c1, c2, c3].filter(g => g > 0);
                    if (grades.length > 0) {
                        averageGrade = grades.reduce((a, b) => a + b, 0) / grades.length;
                    }
                } else {
                    // Fallback to notasMock (Nota[])
                    const studentNotas = notasMock.filter(
                        n => n.cursoId === curso.id && n.estudianteId === student.id
                    );
                    if (studentNotas.length > 0) {
                        averageGrade = studentNotas.reduce((acc, curr) => acc + curr.valor, 0) / studentNotas.length;
                    }
                }

                // Grade < 3.0 is high risk. 
                // Formula: if < 3.0, score increases. 3.0 = 60, 1.0 = 100, 5.0 = 0
                let gradeRiskScore = 0;
                if (averageGrade > 0) {
                    if (averageGrade < 3.0) gradeRiskScore = 80 + ((3.0 - averageGrade) * 10);
                    else if (averageGrade < 3.5) gradeRiskScore = 40;
                    else gradeRiskScore = 0;
                } else {
                    // No grades yet, treat as low risk or neutral?
                    // Let's assume 0 risk if no data
                    gradeRiskScore = 0;
                }


                // 3. Mocked Factors (Resources, Assignments, etc - since we don't have full data yet)
                const resourcesRiskScore = Math.random() * 40; // Random mock
                const assignmentsRiskScore = Math.random() * 30; // Random mock

                // Total Score Calculation
                const totalScore = (
                    (attendanceRiskScore * RISK_WEIGHTS.ATTENDANCE) +
                    (gradeRiskScore * RISK_WEIGHTS.GRADES) +
                    (resourcesRiskScore * RISK_WEIGHTS.RESOURCES) +
                    (assignmentsRiskScore * RISK_WEIGHTS.ASSIGNMENTS)
                );

                let riskLevel = 'low';
                if (totalScore >= THRESHOLDS.HIGH) riskLevel = 'high';
                else if (totalScore >= THRESHOLDS.MEDIUM) riskLevel = 'medium';

                risks.push({
                    studentId: student.id,
                    name: `${student.nombre} ${student.apellido}`,
                    program: student.programa,
                    courseName: curso.nombre,
                    absences,
                    attendancePercentage,
                    averageGrade,
                    riskScore: Math.round(totalScore),
                    riskLevel,
                    factors: {
                        attendance: attendanceRiskScore,
                        grades: gradeRiskScore,
                    }
                });
            });
        });

        return risks.sort((a, b) => b.riskScore - a.riskScore);
    }, [state, selectedCourse]);

    const filteredRisks = useMemo(() => {
        return studentRisks.filter(r => filterLevel === 'all' || r.riskLevel === filterLevel);
    }, [studentRisks, filterLevel]);

    const stats = useMemo(() => {
        return {
            high: studentRisks.filter(r => r.riskLevel === 'high').length,
            medium: studentRisks.filter(r => r.riskLevel === 'medium').length,
            low: studentRisks.filter(r => r.riskLevel === 'low').length,
            total: studentRisks.length
        };
    }, [studentRisks]);

    const handleSendAlert = (studentName: string) => {
        showToast(`Alerta enviada a ${studentName} y coordinación académica`, 'success');
    };

    const getRiskBadge = (level: string) => {
        switch (level) {
            case 'high': return <Badge variant="destructive" className="uppercase">Alto</Badge>;
            case 'medium': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 uppercase">Medio</Badge>;
            default: return <Badge variant="outline" className="text-green-600 border-green-200 uppercase">Bajo</Badge>;
        }
    };

    return (
        <div className="space-y-6 container mx-auto p-4 md:p-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                        Detección Temprana de Riesgos
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Monitoreo predictivo de estudiantes en riesgo académico
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Selector de curso persistente */}
                    <Select
                        value={selectedCourse}
                        onValueChange={setSelectedCourse}
                    >
                        <SelectTrigger className="w-[280px] border-[#cce5f3] bg-[#e6f7ff] hover:bg-[#cce5f3]">
                            <SelectValue placeholder="Todos los cursos" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los cursos</SelectItem>
                            {state.cursos.map(curso => (
                                <SelectItem key={curso.id} value={curso.id}>{curso.nombre}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={() => { }}>
                        <Download className="mr-2 h-4 w-4" />
                        Exportar Reporte
                    </Button>
                </div>
            </div>

            {/* Summary Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-blue-500 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Estudiantes Monitoreados
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            En {state.cursos.length} cursos activos
                        </p>
                    </CardContent>
                </Card>

                <Card className={`border-l-4 border-l-red-500 shadow-sm ${stats.high > 0 ? 'bg-red-50/50' : ''}`}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-red-600">
                            Riesgo Alto (Crítico)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-red-700">{stats.high}</div>
                        <p className="text-xs text-red-600/80 mt-1">
                            Requieren intervención inmediata
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-yellow-500 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-yellow-600">
                            Riesgo Medio (Alerta)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-yellow-700">{stats.medium}</div>
                        <p className="text-xs text-yellow-600/80 mt-1">
                            Seguimiento preventivo sugerido
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-600">
                            Riesgo Bajo (Normal)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-700">{stats.low}</div>
                        <p className="text-xs text-green-600/80 mt-1">
                            Trayectoria académica normal
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and List */}
            <Card className="shadow-md">
                <CardHeader className="pb-3 border-b">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <CardTitle>Listado de Estudiantes</CardTitle>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center space-x-2">
                                <Filter className="h-4 w-4 text-muted-foreground" />
                                <select
                                    className="h-9 w-[150px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    value={filterLevel}
                                    onChange={(e) => setFilterLevel(e.target.value as any)}
                                >
                                    <option value="all">Todos los niveles</option>
                                    <option value="high">Riesgo Alto</option>
                                    <option value="medium">Riesgo Medio</option>
                                    <option value="low">Riesgo Bajo</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="rounded-md border-0">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="w-[250px]">Estudiante</TableHead>
                                    <TableHead>Curso</TableHead>
                                    <TableHead className="text-center">Score de Riesgo</TableHead>
                                    <TableHead className="text-center">Factores Clave</TableHead>
                                    <TableHead className="text-center">Estado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRisks.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            No se encontraron estudiantes con los filtros seleccionados.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredRisks.map((item) => (
                                        <TableRow key={`${item.studentId}-${item.courseName}`} className="hover:bg-muted/50 transition-colors">
                                            <TableCell className="font-medium">
                                                <div className="flex flex-col">
                                                    <span className="text-base text-primary">{item.name}</span>
                                                    <span className="text-xs text-muted-foreground">{item.program}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm">{item.courseName}</TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className={`text-lg font-bold ${item.riskScore >= 60 ? 'text-red-600' :
                                                        item.riskScore >= 30 ? 'text-yellow-600' : 'text-green-600'
                                                        }`}>
                                                        {item.riskScore}%
                                                    </span>
                                                    <Progress
                                                        value={item.riskScore}
                                                        className={`h-2 w-20 ${item.riskScore >= 60 ? '[&>div]:bg-red-500' :
                                                            item.riskScore >= 30 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-green-500'
                                                            }`}
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-center gap-2">
                                                    {item.factors.attendance > 30 && (
                                                        <div className="flex items-center text-xs text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100" title="Alta Inasistencia">
                                                            <UserX className="h-3 w-3 mr-1" />
                                                            Fallas
                                                        </div>
                                                    )}
                                                    {item.factors.grades > 40 && (
                                                        <div className="flex items-center text-xs text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100" title="Bajo Rendimiento">
                                                            <TrendingDown className="h-3 w-3 mr-1" />
                                                            Notas
                                                        </div>
                                                    )}
                                                    {item.riskScore < 30 && (
                                                        <span className="text-xs text-muted-foreground italic">Sin factores críticos</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {getRiskBadge(item.riskLevel)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => handleSendAlert(item.name)}>
                                                            <Send className="mr-2 h-4 w-4" />
                                                            Enviar Alerta y Correo
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <FileWarning className="mr-2 h-4 w-4" />
                                                            Reportar a Coordinación
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem>Ver Detalle Académico</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
