import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Plus,
    Trash2,
    Edit2,
    Save,
    Clock,
    Calendar,
    Eye,
    MoreHorizontal,
    CheckCircle2,
    PlayCircle
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUI, useCursos, useAuth } from '@/hooks/useStore';
import type { Evaluacion, PreguntaEvaluacion } from '@/types/modules';

const mockEvaluaciones: Evaluacion[] = [
    {
        id: 'eval-1',
        titulo: 'Parcial 1: Fundamentos',
        descripcion: 'Evaluación de los primeros 3 capítulos.',
        cursoId: 'curso-1',
        tipo: 'parcial',
        fechaInicio: new Date('2025-03-10T08:00:00'),
        fechaFin: new Date('2025-03-10T10:00:00'),
        duracionMinutos: 90,
        estado: 'publicada',
        preguntas: [
            {
                id: 'q1',
                texto: '¿Cuál es la capital de Colombia?',
                tipo: 'seleccion_multiple',
                puntos: 5,
                opciones: [
                    { id: 'opt1', texto: 'Medellín', esCorrecta: false },
                    { id: 'opt2', texto: 'Bogotá', esCorrecta: true },
                    { id: 'opt3', texto: 'Cali', esCorrecta: false },
                ]
            }
        ]
    },
    {
        id: 'eval-2',
        titulo: 'Quiz 2: Arrays',
        descripcion: 'Preguntas rápidas sobre estructuras de datos.',
        cursoId: 'curso-1',
        tipo: 'quiz',
        fechaInicio: new Date('2025-03-15T10:00:00'),
        fechaFin: new Date('2025-03-15T12:00:00'),
        duracionMinutos: 30,
        estado: 'borrador',
        preguntas: []
    }
];

export default function Evaluaciones() {
    const { usuario } = useAuth();
    if (usuario?.rol === 'estudiante') {
        return <Navigate to="/dashboard" replace />;
    }

    const { showToast } = useUI();
    const { cursos } = useCursos();
    const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>(mockEvaluaciones);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [cursoSeleccionado, setCursoSeleccionado] = useState(cursos[0] || null);
    const [currentEval, setCurrentEval] = useState<Partial<Evaluacion>>({
        titulo: '',
        descripcion: '',
        tipo: 'quiz',
        duracionMinutos: 60,
        preguntas: [],
        estado: 'borrador'
    });

    // Filter evaluaciones by selected course
    const evaluacionesFiltradas = evaluaciones.filter(
        e => !cursoSeleccionado || e.cursoId === cursoSeleccionado.id
    );

    const handleCreateEval = () => {
        setCurrentEval({
            titulo: '',
            descripcion: '',
            tipo: 'quiz',
            duracionMinutos: 60,
            preguntas: [],
            estado: 'borrador',
            cursoId: cursoSeleccionado?.id || cursos[0]?.id || '',
            actividadId: ''
        });
        setIsDialogOpen(true);
    };

    const handleSaveEval = () => {
        if (!currentEval.titulo) {
            showToast('El título es obligatorio', 'error');
            return;
        }

        if (!currentEval.actividadId) {
            showToast('Debes asociar la evaluación a una actividad de calificaciones', 'error');
            return;
        }

        const newEval: Evaluacion = {
            id: currentEval.id || `eval-${Date.now()}`,
            titulo: currentEval.titulo,
            descripcion: currentEval.descripcion,
            cursoId: currentEval.cursoId || cursos[0]?.id || 'unknown',
            tipo: currentEval.tipo || 'quiz',
            fechaInicio: currentEval.fechaInicio || new Date(),
            fechaFin: currentEval.fechaFin || new Date(),
            duracionMinutos: currentEval.duracionMinutos || 60,
            preguntas: currentEval.preguntas || [],
            actividadId: currentEval.actividadId,
            estado: currentEval.estado || 'borrador'
        };

        if (currentEval.id) {
            setEvaluaciones(evaluaciones.map(e => e.id === newEval.id ? newEval : e));
            showToast('Evaluación actualizada', 'success');
        } else {
            setEvaluaciones([...evaluaciones, newEval]);
            showToast('Evaluación creada', 'success');
        }
        setIsDialogOpen(false);
    };

    const handleEditEval = (evaluacion: Evaluacion) => {
        setCurrentEval({ ...evaluacion });
        setIsDialogOpen(true);
    };

    const handleDeleteEval = (id: string) => {
        setEvaluaciones(evaluaciones.filter(e => e.id !== id));
        showToast('Evaluación eliminada', 'success');
    };

    const addPregunta = () => {
        const newPregunta: PreguntaEvaluacion = {
            id: `q-${Date.now()}`,
            texto: '',
            tipo: 'seleccion_multiple',
            puntos: 5,
            opciones: [
                { id: `opt-${Date.now()}-1`, texto: 'Opción 1', esCorrecta: true },
                { id: `opt-${Date.now()}-2`, texto: 'Opción 2', esCorrecta: false },
            ]
        };
        setCurrentEval({
            ...currentEval,
            preguntas: [...(currentEval.preguntas || []), newPregunta]
        });
    };

    const updatePregunta = (id: string, field: keyof PreguntaEvaluacion, value: any) => {
        const updatedPreguntas = currentEval.preguntas?.map(p =>
            p.id === id ? { ...p, [field]: value } : p
        );
        setCurrentEval({ ...currentEval, preguntas: updatedPreguntas });
    };

    const removePregunta = (id: string) => {
        const updatedPreguntas = currentEval.preguntas?.filter(p => p.id !== id);
        setCurrentEval({ ...currentEval, preguntas: updatedPreguntas });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'publicada': return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Publicada</Badge>;
            case 'borrador': return <Badge variant="secondary">Borrador</Badge>;
            case 'finalizada': return <Badge variant="outline" className="text-muted-foreground">Finalizada</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6 container mx-auto p-4 md:p-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                        Evaluaciones Virtuales
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Diseña y administra quices, parciales y talleres online
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Selector de curso persistente */}
                    <Select
                        value={cursoSeleccionado?.id || ''}
                        onValueChange={(v) => {
                            const curso = cursos.find(c => c.id === v);
                            if (curso) setCursoSeleccionado(curso);
                        }}
                    >
                        <SelectTrigger className="w-[280px] border-[#cce5f3] bg-[#e6f7ff] hover:bg-[#cce5f3]">
                            <SelectValue placeholder="Seleccionar curso" />
                        </SelectTrigger>
                        <SelectContent>
                            {cursos.map(curso => (
                                <SelectItem key={curso.id} value={curso.id}>{curso.nombre}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button onClick={handleCreateEval}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nueva Evaluación
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {evaluacionesFiltradas.map((evaluacion) => (
                    <Card key={evaluacion.id} className="hover:shadow-md transition-shadow group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/50 backdrop-blur-sm">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleEditEval(evaluacion)}>
                                        <Edit2 className="mr-2 h-4 w-4" /> Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <PlayCircle className="mr-2 h-4 w-4" /> Vista Previa
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteEval(evaluacion.id)}>
                                        <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div className="flex items-center space-x-2">
                                    <div className={`p-2 rounded-lg ${evaluacion.tipo === 'parcial' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                        <CheckCircle2 className="h-5 w-5" />
                                    </div>
                                    <Badge variant="outline" className="uppercase text-[10px] tracking-wider">{evaluacion.tipo}</Badge>
                                </div>
                                {getStatusBadge(evaluacion.estado)}
                            </div>
                            <CardTitle className="text-lg mt-2">{evaluacion.titulo}</CardTitle>
                            <CardDescription className="line-clamp-2 min-h-[40px]">
                                {evaluacion.descripcion || 'Sin descripción'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>{evaluacion.fechaInicio.toLocaleDateString()} {evaluacion.fechaInicio.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>{evaluacion.duracionMinutos} minutos</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Eye className="h-4 w-4" />
                                    <span>{evaluacion.preguntas.length} Preguntas</span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-slate-50/50 dark:bg-slate-900/50 p-3 flex justify-between">
                            <Button variant="ghost" size="sm" className="text-blue-600" onClick={() => handleEditEval(evaluacion)}>
                                Administrar
                            </Button>
                            <Button variant="ghost" size="sm" className="text-muted-foreground">
                                Ver Resultados
                            </Button>
                        </CardFooter>
                    </Card>
                ))}

                {/* Empty State / Add New Card */}
                <div
                    className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center p-6 cursor-pointer hover:border-blue-400 hover:bg-blue-50/10 transition-colors min-h-[200px]"
                    onClick={handleCreateEval}
                >
                    <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-3">
                        <Plus className="h-6 w-6 text-slate-400" />
                    </div>
                    <p className="font-medium text-slate-500">Crear Nueva Evaluación</p>
                </div>
            </div>

            {/* Dialog for Creating/Editing Evaluation */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{currentEval.id ? 'Editar Evaluación' : 'Crear Nueva Evaluación'}</DialogTitle>
                        <DialogDescription>
                            Configura los detalles de la prueba y las preguntas.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Título</Label>
                                <Input
                                    value={currentEval.titulo}
                                    onChange={(e) => setCurrentEval({ ...currentEval, titulo: e.target.value })}
                                    placeholder="Ej: Parcial Final"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Curso</Label>
                                <Select
                                    value={currentEval.cursoId}
                                    onValueChange={(val) => setCurrentEval({ ...currentEval, cursoId: val, actividadId: '' })}
                                >
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
                            <div className="space-y-2">
                                <Label>Actividad (Calificaciones)</Label>
                                <Select
                                    value={currentEval.actividadId}
                                    onValueChange={(val) => setCurrentEval({ ...currentEval, actividadId: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Asociar a una nota..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {cursos.find(c => c.id === currentEval.cursoId)?.configuracionNotas?.componentes?.map(comp => (
                                            <SelectItem key={comp.id} value={comp.id}>
                                                {comp.nombre} ({comp.porcentaje}%)
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Tipo</Label>
                                <Select
                                    value={currentEval.tipo}
                                    onValueChange={(val: any) => setCurrentEval({ ...currentEval, tipo: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="quiz">Quiz</SelectItem>
                                        <SelectItem value="parcial">Parcial</SelectItem>
                                        <SelectItem value="taller">Taller</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Descripción</Label>
                                <Input
                                    value={currentEval.descripcion}
                                    onChange={(e) => setCurrentEval({ ...currentEval, descripcion: e.target.value })}
                                    placeholder="Instrucciones para el estudiante..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Duración (minutos)</Label>
                                <Input
                                    type="number"
                                    value={currentEval.duracionMinutos}
                                    onChange={(e) => setCurrentEval({ ...currentEval, duracionMinutos: Number(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium">Preguntas ({currentEval.preguntas?.length})</h3>
                                <Button size="sm" variant="outline" onClick={addPregunta}>
                                    <Plus className="mr-2 h-4 w-4" /> Agregar Pregunta
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {currentEval.preguntas?.length === 0 && (
                                    <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                                        No hay preguntas. Agrega una para comenzar.
                                    </div>
                                )}
                                {currentEval.preguntas?.map((pregunta, index) => (
                                    <div key={pregunta.id} className="p-4 border rounded-lg bg-slate-50/50 relative group">
                                        <div className="absolute right-2 top-2">
                                            <Button variant="ghost" size="sm" className="text-red-500 h-6 w-6 p-0" onClick={() => removePregunta(pregunta.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="space-y-3 pr-8">
                                            <div className="flex gap-4">
                                                <div className="flex-1">
                                                    <Label className="text-xs mb-1 block">Pregunta {index + 1}</Label>
                                                    <Input
                                                        value={pregunta.texto}
                                                        onChange={(e) => updatePregunta(pregunta.id, 'texto', e.target.value)}
                                                        placeholder="Escribe la pregunta aquí..."
                                                    />
                                                </div>
                                                <div className="w-[150px]">
                                                    <Label className="text-xs mb-1 block">Tipo</Label>
                                                    <Select
                                                        value={pregunta.tipo}
                                                        onValueChange={(val: any) => updatePregunta(pregunta.id, 'tipo', val)}
                                                    >
                                                        <SelectTrigger className="h-10">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="seleccion_multiple">Selección Múltiple</SelectItem>
                                                            <SelectItem value="verdadero_falso">Verdadero/Falso</SelectItem>
                                                            <SelectItem value="abierta">Abierta</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="w-[80px]">
                                                    <Label className="text-xs mb-1 block">Puntos</Label>
                                                    <Input
                                                        type="number"
                                                        value={pregunta.puntos}
                                                        onChange={(e) => updatePregunta(pregunta.id, 'puntos', Number(e.target.value))}
                                                    />
                                                </div>
                                            </div>

                                            {pregunta.tipo === 'seleccion_multiple' && (
                                                <div className="pl-4 border-l-2 border-slate-200 space-y-2">
                                                    <Label className="text-xs text-muted-foreground">Opciones de Respuesta</Label>
                                                    {pregunta.opciones?.map((opcion, i) => (
                                                        <div key={opcion.id} className="flex items-center gap-2">
                                                            <input
                                                                type="radio"
                                                                name={`correct-${pregunta.id}`}
                                                                checked={opcion.esCorrecta}
                                                                onChange={() => {
                                                                    const newOps = pregunta.opciones?.map(o => ({ ...o, esCorrecta: o.id === opcion.id }));
                                                                    updatePregunta(pregunta.id, 'opciones', newOps);
                                                                }}
                                                                className="w-4 h-4 text-primary"
                                                            />
                                                            <Input
                                                                value={opcion.texto}
                                                                onChange={(e) => {
                                                                    const newOps = pregunta.opciones?.map(o => o.id === opcion.id ? { ...o, texto: e.target.value } : o);
                                                                    updatePregunta(pregunta.id, 'opciones', newOps);
                                                                }}
                                                                className="h-8 text-sm"
                                                                placeholder={`Opción ${i + 1}`}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSaveEval} disabled={!currentEval.titulo}>
                            <Save className="mr-2 h-4 w-4" /> Guardar Evaluación
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
}
