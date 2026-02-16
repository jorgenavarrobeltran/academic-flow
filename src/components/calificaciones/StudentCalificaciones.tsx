import { useEffect, useMemo, useState } from 'react';
import { useCursos, useCalificaciones, useAuth } from '@/hooks/useStore';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, FileText, AlertCircle, Play, Brain, Users, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function StudentCalificaciones() {
    const { cursos, cursoSeleccionado, setCursoSeleccionado } = useCursos();
    const { evaluaciones, notasActividades, fetchEvaluaciones, saveNotaActividad, fetchGrupos, addGroup, grupos } = useCalificaciones();
    const { usuario } = useAuth();

    // Quiz State
    const [quizOpen, setQuizOpen] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState<any>(null);
    const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
    const [quizSubmitted, setQuizSubmitted] = useState(false);
    const [quizScore, setQuizScore] = useState(0);

    // Group State
    const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupMembers, setNewGroupMembers] = useState<string[]>([]);
    const [existingMembers, setExistingMembers] = useState<string[]>([]); // List of student IDs already in groups
    const [groupConfig, setGroupConfig] = useState<{ min: number, max: number }>({ min: 2, max: 4 });

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
            fetchGrupos(cursoSeleccionado.id);
            // Fetch group config - In a real app this would be in cursoSeleccionado detail or a separate call
            // Since we edited fetchEvaluaciones in previous steps, we assume we might need to fetch course details FRESH
            // Or just check if cursoSeleccionado has 'configuracion_grupos' property. 
            // Based on our mock/interface, we might need to cast or fetch.
            // Let's assume for now default 2-4 if not found, or try to read from cursoSeleccionado if we added it to interface.
            if ((cursoSeleccionado as any).configuracion_grupos) {
                setGroupConfig((cursoSeleccionado as any).configuracion_grupos);
            }
        }
    }, [cursoSeleccionado, fetchEvaluaciones, fetchGrupos]);

    // Update existing members list when groups change
    useEffect(() => {
        if (grupos) {
            const occupied = grupos.flatMap(g => g.integrantes);
            setExistingMembers(occupied);
        }
    }, [grupos]);

    // Check if current user is already in a group
    const myGroup = useMemo(() => {
        if (!usuario || !grupos) return null;
        return grupos.find(g => g.integrantes.includes(usuario.id));
    }, [grupos, usuario]);

    const handleCreateGroup = async () => {
        if (!cursoSeleccionado || !usuario) return;

        if (!newGroupName.trim()) {
            toast.error("El nombre del grupo es obligatorio.");
            return;
        }

        const members = [...newGroupMembers, usuario.id]; // Include self
        if (members.length < groupConfig.min) {
            toast.error(`El grupo debe tener al menos ${groupConfig.min} integrantes.`);
            return;
        }
        if (members.length > groupConfig.max) {
            toast.error(`El grupo no puede tener más de ${groupConfig.max} integrantes.`);
            return;
        }

        // Final exclusivity check (though UI should prevent selection)
        const conflict = members.some(m => existingMembers.includes(m));
        if (conflict) {
            toast.error("Uno o más estudiantes seleccionados ya pertenecen a otro grupo.");
            return;
        }

        const newGroup = {
            id: `group-${Date.now()}`,
            cursoId: cursoSeleccionado.id,
            nombre: newGroupName,
            integrantes: members,
            fechaCreacion: new Date()
        };

        await addGroup(newGroup);
        setIsGroupDialogOpen(false);
        setNewGroupName('');
        setNewGroupMembers([]);
        toast.success("Grupo creado exitosamente.");
    };

    const toggleGroupMember = (studentId: string) => {
        setNewGroupMembers(prev =>
            prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

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

    const handleStartQuiz = (evaluation: any) => {
        if (!evaluation.contenido || !evaluation.contenido.preguntas) {
            toast.error("Error al cargar el contenido del quiz");
            return;
        }
        setCurrentQuiz(evaluation);
        setUserAnswers({});
        setQuizSubmitted(false);
        setQuizScore(0);
        setQuizOpen(true);
    };

    const handleSubmitQuiz = async () => {
        if (!currentQuiz) return;

        let correctCount = 0;
        const totalQuestions = currentQuiz.contenido.preguntas.length;

        currentQuiz.contenido.preguntas.forEach((q: any) => {
            const userAnswer = userAnswers[q.id];
            // Handle both index (0-3) and text based correct answers from AI
            // For this implementation, we assume the RadioGroup values are indices "0", "1", "2", "3".
            if (userAnswer === q.respuestaCorrecta.toString()) {
                correctCount++;
            } else if (q.opciones[userAnswer] === q.respuestaCorrecta) { // Fallback if AI stored text content
                correctCount++;
            }
        });

        const finalScore = (correctCount / totalQuestions) * 5.0;
        setQuizScore(finalScore);
        setQuizSubmitted(true);

        if (usuario && cursoSeleccionado) {
            await saveNotaActividad({
                id: `temp-${Date.now()}`,
                evaluacionId: currentQuiz.id,
                estudianteId: usuario.id,
                valor: finalScore,
                updatedAt: new Date()
            });
            toast.success(`Quiz finalizado. Nota: ${finalScore.toFixed(1)}`);
            // Refresh to update the UI with the new grade
            // fetchEvaluaciones(cursoSeleccionado.id); // Triggered automatically by store update hopefully
        }
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
                <div className="w-full md:w-72 flex flex-col gap-2">
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

                    {cursoSeleccionado && !myGroup && (
                        <Button variant="outline" className="w-full border-dashed text-blue-600 hover:bg-blue-50" onClick={() => setIsGroupDialogOpen(true)}>
                            <Users className="w-4 h-4 mr-2" /> Crear mi Grupo
                        </Button>
                    )}
                    {myGroup && (
                        <div className="bg-blue-50 border border-blue-100 rounded-md p-2 flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-blue-800 font-medium">
                                <Users className="w-4 h-4" />
                                <span>{myGroup.nombre}</span>
                            </div>
                            <Badge variant="secondary" className="bg-white text-xs">{myGroup.integrantes.length}/4</Badge>
                        </div>
                    )}
                </div>
            </div>

            {cursoSeleccionado ? (
                <>
                    {/* Summary Card - Redesigned */}
                    <Card className="border-0 shadow-md bg-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <CardContent className="p-8 relative z-10">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                                <div className="space-y-4 text-center md:text-left">
                                    <div>
                                        <h3 className="text-xl font-semibold text-slate-800">{cursoSeleccionado.nombre}</h3>
                                        <p className="text-slate-500 text-sm">Resumen de Rendimiento General</p>
                                    </div>

                                    <div className="flex items-center gap-4 justify-center md:justify-start">
                                        <div className="flex flex-col">
                                            <span className={`text-5xl font-bold tracking-tight ${getNotaColor(definitiva)}`}>
                                                {definitiva.toFixed(1)}
                                            </span>
                                            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider text-center">Definitiva</span>
                                        </div>

                                        <div className="h-12 w-px bg-slate-200 mx-2"></div>

                                        <div className="flex flex-col gap-1">
                                            <Badge variant={definitiva >= 3.0 ? "default" : "destructive"} className={`px-3 py-1 text-sm ${definitiva >= 3.0 ? 'bg-green-600 hover:bg-green-700' : ''}`}>
                                                {definitiva >= 3.0 ? "Aprobando" : "En Riesgo"}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                {/* Cortes Circles */}
                                <div className="flex gap-6 md:gap-10">
                                    {[1, 2, 3].map((corte) => {
                                        const stat = stats[corte as 1 | 2 | 3];
                                        const percentage = corte === 3 ? 40 : 30;

                                        return (
                                            <div key={corte} className="flex flex-col items-center gap-3 group">
                                                <div className="relative flex items-center justify-center w-20 h-20 md:w-24 md:h-24">
                                                    {/* Background Circle */}
                                                    <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                                                        <circle cx="50" cy="50" r="45" fill="none" strokeWidth="8" className="stroke-slate-100" />
                                                        <circle
                                                            cx="50" cy="50" r="45" fill="none" strokeWidth="8"
                                                            strokeLinecap="round"
                                                            strokeDasharray="283"
                                                            strokeDashoffset={283 - (283 * (stat.total / 5))}
                                                            className={`transition-all duration-1000 ease-out ${stat.total >= 4.0 ? 'stroke-green-500' :
                                                                stat.total >= 3.0 ? 'stroke-blue-500' :
                                                                    stat.total >= 2.0 ? 'stroke-orange-400' : 'stroke-red-500'
                                                                }`}
                                                        />
                                                    </svg>
                                                    <div className="flex flex-col items-center">
                                                        <span className={`text-2xl font-bold text-slate-700`}>
                                                            {stat.total.toFixed(1)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-center">
                                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                                                        Corte {corte}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-medium bg-slate-100 px-2 py-0.5 rounded-full">
                                                        Vale {percentage}%
                                                    </span>
                                                </div>
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
                                                                <>
                                                                    {item.contenido && item.contenido.preguntas ? (
                                                                        <Button
                                                                            size="sm"
                                                                            className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                                                                            onClick={() => handleStartQuiz(item)}
                                                                        >
                                                                            <Play className="w-3 h-3 mr-1" /> Iniciar
                                                                        </Button>
                                                                    ) : (
                                                                        <span className="text-xs text-slate-400 italic">--</span>
                                                                    )}
                                                                </>
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


            {/* Quiz Dialog */}
            <Dialog open={quizOpen} onOpenChange={(open) => {
                if (!quizSubmitted) {
                    // Prevent accidental closing? Or allow and just lose progress.
                    // For now, allow close.
                }
                setQuizOpen(open);
            }}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Brain className="w-5 h-5 text-purple-600" />
                            {currentQuiz?.nombre}
                        </DialogTitle>
                        <DialogDescription>
                            {currentQuiz?.contenido?.descripcion || "Responde las siguientes preguntas."}
                        </DialogDescription>
                    </DialogHeader>

                    {!quizSubmitted ? (
                        <div className="space-y-6 py-4">
                            {currentQuiz?.contenido?.preguntas?.map((q: any, idx: number) => (
                                <div key={idx} className="space-y-3 p-4 bg-slate-50 rounded-lg border">
                                    <h4 className="font-medium text-slate-800">{idx + 1}. {q.texto}</h4>
                                    <RadioGroup
                                        value={userAnswers[q.id]}
                                        onValueChange={(val) => setUserAnswers(prev => ({ ...prev, [q.id]: val }))}
                                    >
                                        {q.opciones.map((opt: string, optIdx: number) => (
                                            <div key={optIdx} className="flex items-center space-x-2">
                                                <RadioGroupItem value={optIdx.toString()} id={`q${q.id}-opt${optIdx}`} />
                                                <Label htmlFor={`q${q.id}-opt${optIdx}`} className="cursor-pointer font-normal text-slate-700">
                                                    {opt}
                                                </Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-8 text-center space-y-4">
                            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                                <Trophy className="w-10 h-10 text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-slate-800">¡Quiz Completado!</h3>
                                <p className="text-muted-foreground">Tu calificación final es:</p>
                            </div>
                            <div className="text-5xl font-bold text-blue-600">
                                {quizScore.toFixed(1)} <span className="text-lg text-slate-400">/ 5.0</span>
                            </div>
                            <p className="text-sm text-slate-500">
                                La nota ha sido registrada automáticamente.
                            </p>
                        </div>
                    )}

                    <DialogFooter className="sm:justify-between">
                        {!quizSubmitted ? (
                            <>
                                <Button variant="ghost" onClick={() => setQuizOpen(false)}>Cancelar</Button>
                                <Button onClick={handleSubmitQuiz} disabled={Object.keys(userAnswers).length < (currentQuiz?.contenido?.preguntas?.length || 0)}>
                                    Enviar Respuestas
                                </Button>
                            </>
                        ) : (
                            <Button className="w-full" onClick={() => setQuizOpen(false)}>Cerrar</Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create Group Dialog */}
            <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Crear Grupo de Estudio</DialogTitle>
                        <DialogDescription>
                            Tú serás el líder. Selecciona hasta 3 compañeros para unirse a tu grupo (máximo 4 integrantes).
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="gname">Nombre del Grupo</Label>
                            <Input
                                id="gname"
                                placeholder="Ej: Los Innovadores"
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Seleccionar Integrantes ({newGroupMembers.length + 1}/4)</Label>
                            <div className="border rounded-md max-h-60 overflow-y-auto p-2 space-y-1">
                                {cursoSeleccionado?.estudiantes?.filter(est => est.estudianteId !== usuario?.id).map((student: any) => {
                                    const isTaken = existingMembers.includes(student.estudianteId);
                                    return (
                                        <div key={student.estudianteId} className={`flex items-center justify-between p-2 rounded ${isTaken ? 'opacity-50' : 'hover:bg-slate-50'}`}>
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    id={`st-${student.estudianteId}`}
                                                    checked={newGroupMembers.includes(student.estudianteId)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked === true) toggleGroupMember(student.estudianteId);
                                                        else if (checked === false) toggleGroupMember(student.estudianteId);
                                                    }}
                                                    disabled={isTaken || (newGroupMembers.length >= 3 && !newGroupMembers.includes(student.estudianteId))}
                                                />
                                                <Label htmlFor={`st-${student.estudianteId}`} className="cursor-pointer font-normal">
                                                    {student.nombre} {student.apellido}
                                                </Label>
                                            </div>
                                            {isTaken && <Badge variant="secondary" className="text-[10px]">En otro grupo</Badge>}
                                        </div>
                                    );
                                })}
                                {(!cursoSeleccionado?.estudiantes || cursoSeleccionado.estudiantes.length <= 1) && (
                                    <p className="text-sm text-muted-foreground p-2 text-center">No hay otros estudiantes disponibles.</p>
                                )}
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Solo se muestran compañeros que no tienen grupo. Límite: {groupConfig.min} - {groupConfig.max} integrantes.
                        </p>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsGroupDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleCreateGroup} disabled={!newGroupName.trim() || newGroupMembers.length === 0}>
                            Crear Grupo
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

