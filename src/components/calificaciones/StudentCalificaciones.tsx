import { useEffect, useMemo } from 'react';
import { useCursos, useCalificaciones, useAuth } from '@/hooks/useStore';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, FileText, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export function StudentCalificaciones() {
    const { cursos, cursoSeleccionado, setCursoSeleccionado } = useCursos();
    const { evaluaciones, notasActividades, fetchEvaluaciones } = useCalificaciones();
    const { usuario } = useAuth();

    const cursosActivos = useMemo(() => cursos.filter(c => c.activo), [cursos]);

    useEffect(() => {
        if (cursosActivos.length > 0) {
            if (!cursoSeleccionado || !cursosActivos.some(c => c.id === cursoSeleccionado.id)) {
                setCursoSeleccionado(cursosActivos[0]);
            }
        }
    }, [cursoSeleccionado, cursosActivos, setCursoSeleccionado]);

    useEffect(() => {
        if (cursoSeleccionado) {
            fetchEvaluaciones(cursoSeleccionado.id);
        }
    }, [cursoSeleccionado, fetchEvaluaciones]);

    // Calculate Grades per Corte
    const stats = useMemo(() => {
        const cortes = [1, 2, 3] as const;
        const result = {
            1: { total: 0, maxPossible: 0, items: [] as any[] },
            2: { total: 0, maxPossible: 0, items: [] as any[] },
            3: { total: 0, maxPossible: 0, items: [] as any[] }
        };

        cortes.forEach(corte => {
            const evas = evaluaciones.filter(e => e.corte === corte);
            let corteTotal = 0;
            let corteMax = 0;

            const items = evas.map(eva => {
                const nota = notasActividades.find(n => n.evaluacionId === eva.id && n.estudianteId === usuario?.id);
                const valor = nota ? nota.valor : 0;
                const weighted = (valor * eva.porcentaje) / 100;

                if (nota) {
                    corteTotal += weighted;
                }
                corteMax += eva.porcentaje;

                return {
                    ...eva,
                    nota: nota?.valor,
                    weighted
                };
            });

            // Normalize to 5.0 scale if corteMax > 0 (e.g. if 50% defined, and got 2.5 weighted, that is 5.0)
            // But usually we just sum the weighted values. 
            // If total percentage for corte is 100%, then simple sum is correct.
            // Let's assume the sum of weighted values IS the corte grade (0-5 scale implied if percentages sum to 100)
            // If percentages only sum to 50%, then the max grade is 2.5.

            result[corte] = {
                total: corteTotal,
                maxPossible: corteMax,
                items
            };
        });

        return result;
    }, [evaluaciones, notasActividades, usuario?.id]);

    const definitiva = (stats[1].total * 0.3) + (stats[2].total * 0.3) + (stats[3].total * 0.4);

    const getNotaColor = (nota: number, max: number = 5) => {
        const percentage = nota / max;
        if (percentage >= 0.6) return 'text-green-600';
        if (percentage >= 0.4) return 'text-orange-500';
        return 'text-red-500';
    };

    if (cursosActivos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="bg-muted p-4 rounded-full mb-4">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-semibold">No estás inscrito en ningún curso.</h2>
                <p className="text-muted-foreground mt-2">Contacta a tu coordinador si crees que es un error.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-800">Mis Calificaciones</h2>
                    <p className="text-muted-foreground text-sm">Consulta detallada de notas y rendimiento académico</p>
                </div>
                <div className="w-full md:w-72">
                    <Select onValueChange={(value) => {
                        const curso = cursosActivos.find(c => c.id === value);
                        if (curso) setCursoSeleccionado(curso);
                    }} value={cursoSeleccionado?.id}>
                        <SelectTrigger className="h-10">
                            <SelectValue placeholder="Seleccionar asignatura" />
                        </SelectTrigger>
                        <SelectContent>
                            {cursosActivos.map(curso => (
                                <SelectItem key={curso.id} value={curso.id}>{curso.nombre}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {cursoSeleccionado ? (
                <>
                    {/* Summary Card */}
                    <Card className="bg-slate-900 text-white border-0 shadow-lg overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                        <CardContent className="p-6 relative z-10">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                <div className="space-y-2 text-center md:text-left">
                                    <h3 className="text-lg font-medium text-slate-300">{cursoSeleccionado.nombre}</h3>
                                    <div className="flex items-baseline gap-2 justify-center md:justify-start">
                                        <span className="text-4xl font-bold">{definitiva.toFixed(1)}</span>
                                        <span className="text-sm text-slate-400">/ 5.0</span>
                                    </div>
                                    <Badge variant={(definitiva >= 3.0) ? "default" : "destructive"} className="px-3 py-1">
                                        {(definitiva >= 3.0) ? "Aprobando" : "En Riesgo"}
                                    </Badge>
                                </div>

                                {/* Progress Circular or Bars for Cortes */}
                                <div className="flex gap-4 md:gap-8 w-full md:w-auto">
                                    {[1, 2, 3].map((corte) => {
                                        const stat = stats[corte as 1 | 2 | 3];
                                        return (
                                            <div key={corte} className="flex flex-col items-center gap-2">
                                                <div className="relative flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/5 border border-white/10">
                                                    <span className={`text-xl font-bold ${getNotaColor(stat.total, 5)}`}>
                                                        {stat.total.toFixed(1)}
                                                    </span>
                                                    <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none stroke-current text-blue-500/20" viewBox="0 0 100 100">
                                                        <circle cx="50" cy="50" r="45" fill="none" strokeWidth="6" />
                                                        <circle
                                                            cx="50" cy="50" r="45" fill="none" strokeWidth="6"
                                                            strokeDasharray="283"
                                                            strokeDashoffset={283 - (283 * (stat.total / 5))}
                                                            className="text-white transition-all duration-1000 ease-out"
                                                        />
                                                    </svg>
                                                </div>
                                                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                                                    Corte {corte}
                                                </span>
                                                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-slate-300">
                                                    {corte === 3 ? '40%' : '30%'}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Detailed Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((corte) => {
                            const stat = stats[corte as 1 | 2 | 3];
                            return (
                                <Card key={corte} className="border-t-4 border-t-blue-500 shadow-sm">
                                    <CardHeader className="bg-slate-50/50 pb-2">
                                        <CardTitle className="text-base font-semibold flex justify-between items-center text-slate-700">
                                            Corte {corte}
                                            <span className="text-xs font-normal text-muted-foreground bg-white border px-2 py-1 rounded-full shadow-sm">
                                                Avance: {stat.maxPossible}%
                                            </span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-4 space-y-4">
                                        {stat.items.length > 0 ? (
                                            <div className="space-y-3">
                                                {stat.items.map((item: any) => (
                                                    <div key={item.id} className="group flex flex-col gap-1 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                                                        <div className="flex justify-between items-center">
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-medium text-slate-700">{item.nombre}</span>
                                                                {item.fecha && (
                                                                    <span className="text-[10px] text-muted-foreground">
                                                                        {new Date(item.fecha).toLocaleDateString()}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {item.nota !== undefined ? (
                                                                <span className={`font-bold ${getNotaColor(item.nota)}`}>
                                                                    {item.nota.toFixed(1)}
                                                                </span>
                                                            ) : (
                                                                <span className="text-xs text-slate-400 italic">--</span>
                                                            )}
                                                        </div>
                                                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant="outline" className="text-[10px] h-5 font-normal">
                                                                    {item.porcentaje}% Puntos
                                                                </Badge>
                                                                {item.esGrupal && (
                                                                    <Badge variant="secondary" className="text-[10px] h-5 bg-blue-50 text-blue-700 hover:bg-blue-100">
                                                                        Grupal
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <span>Aporta: {item.weighted ? item.weighted.toFixed(2) : '0.00'}</span>
                                                        </div>
                                                        {/* Progress bar visual for the grade */}
                                                        {item.nota !== undefined && (
                                                            <Progress value={(item.nota / 5) * 100} className="h-1.5 mt-1 bg-slate-100" />
                                                        )}
                                                    </div>
                                                ))}

                                                <div className="pt-3 border-t mt-2 flex justify-between items-center">
                                                    <span className="text-sm font-bold text-slate-600">Acumulado Corte</span>
                                                    <span className={`text-lg font-bold ${getNotaColor(stat.total)}`}>
                                                        {stat.total.toFixed(1)}
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground space-y-2 opacity-60">
                                                <AlertCircle className="h-8 w-8" />
                                                <p className="text-sm">Sin actividades asignadas</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </>
            ) : (
                <Card className="border-dashed h-64 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                        <Trophy className="h-10 w-10 mx-auto mb-3 opacity-20" />
                        <p>Selecciona un curso arriba para ver tu rendimiento detallado.</p>
                    </div>
                </Card>
            )}
        </div>
    );
}

