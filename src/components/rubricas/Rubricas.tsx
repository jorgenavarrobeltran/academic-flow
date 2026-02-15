
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    Plus,
    Trash2,
    Edit2,
    Save,
    Copy,
    LayoutList,
    MoreHorizontal,
    Users,
    ArrowRightLeft,
    CheckCircle2
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useUI, useAuth, useCursos } from '@/hooks/useStore';
import type { Rubrica, CriterioRubrica } from '@/types/modules';

// Mock data
const mockRubricas: Rubrica[] = [
    {
        id: 'rub-001',
        titulo: 'Ensayo Argumentativo',
        descripcion: 'Rúbrica para evaluar ensayos finales de corte.',
        fechaCreacion: new Date('2025-02-10'),
        autorId: 'user-1',
        alcance: 'todos',
        criterios: [
            {
                id: 'crit-1',
                nombre: 'Estructura',
                descripcion: 'Organización lógica de las ideas.',
                peso: 30,
                niveles: [
                    { id: 'n1', nombre: 'Excelente', descripcion: 'Estructura clara y lógica.', puntaje: 5.0 },
                    { id: 'n2', nombre: 'Bueno', descripcion: 'Estructura adecuada pero con fallos menores.', puntaje: 4.0 },
                    { id: 'n3', nombre: 'Regular', descripcion: 'Desorganizado en partes.', puntaje: 3.0 },
                ]
            },
            {
                id: 'crit-2',
                nombre: 'Contenido',
                descripcion: 'Calidad y profundidad de los argumentos.',
                peso: 40,
                niveles: [
                    { id: 'n4', nombre: 'Excelente', descripcion: 'Argumentos sólidos y bien fundamentados.', puntaje: 5.0 },
                    { id: 'n5', nombre: 'Bueno', descripcion: 'Buenos argumentos, faltan algunas referencias.', puntaje: 4.0 },
                ]
            },
            {
                id: 'crit-3',
                nombre: 'Ortografía y Gramática',
                descripcion: 'Uso correcto del lenguaje.',
                peso: 30,
                niveles: []
            }
        ]
    },
    {
        id: 'rub-002',
        titulo: 'Presentación Oral',
        descripcion: 'Evaluación de exposiciones grupales.',
        fechaCreacion: new Date('2025-02-12'),
        autorId: 'user-1',
        alcance: 'todos',
        criterios: []
    }
];

export default function Rubricas() {
    const { usuario } = useAuth();
    if (usuario?.rol === 'estudiante') {
        return <Navigate to="/dashboard" replace />;
    }

    const { showToast } = useUI();
    const { cursos } = useCursos();
    const [rubricas, setRubricas] = useState<Rubrica[]>(mockRubricas);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [cursoFiltro, setCursoFiltro] = useState<string>('todos');
    const [selectedCourse360, setSelectedCourse360] = useState<string>('');
    const [currentRubrica, setCurrentRubrica] = useState<Partial<Rubrica>>({
        titulo: '',
        descripcion: '',
        alcance: 'todos',
        cursosIds: [],
        criterios: []
    });

    const handleCreateRubrica = () => {
        setCurrentRubrica({ titulo: '', descripcion: '', criterios: [], alcance: 'todos', cursosIds: [] });
        setIsDialogOpen(true);
    };

    const handleSaveRubrica = () => {
        if (!currentRubrica.titulo) {
            showToast('El título es obligatorio', 'error');
            return;
        }

        const newRubrica: Rubrica = {
            id: currentRubrica.id || `rub-${Date.now()}`,
            titulo: currentRubrica.titulo,
            descripcion: currentRubrica.descripcion,
            criterios: currentRubrica.criterios || [],
            fechaCreacion: new Date(),
            autorId: 'current-user',
            alcance: currentRubrica.alcance || 'todos',
            cursosIds: currentRubrica.cursosIds
        };

        if (currentRubrica.id) {
            setRubricas(rubricas.map(r => r.id === newRubrica.id ? newRubrica : r));
            showToast('Rúbrica actualizada correctamente', 'success');
        } else {
            setRubricas([...rubricas, newRubrica]);
            showToast('Rúbrica creada correctamente', 'success');
        }
        setIsDialogOpen(false);
    };

    const handleEditRubrica = (rubrica: Rubrica) => {
        setCurrentRubrica({ ...rubrica });
        setIsDialogOpen(true);
    };

    const handleDeleteRubrica = (id: string) => {
        setRubricas(rubricas.filter(r => r.id !== id));
        showToast('Rúbrica eliminada', 'success');
    };

    const handleDuplicateRubrica = (rubrica: Rubrica) => {
        const newRubrica = {
            ...rubrica,
            id: `rub-${Date.now()}`,
            titulo: `${rubrica.titulo} (Copia)`,
            fechaCreacion: new Date()
        };
        setRubricas([...rubricas, newRubrica]);
        showToast('Rúbrica duplicada', 'success');
    };

    // Helper to add criteria to current rubric being edited
    const addCriterio = () => {
        const newCriterio: CriterioRubrica = {
            id: `crit-${Date.now()}`,
            nombre: 'Nuevo Criterio',
            descripcion: '',
            peso: 0,
            niveles: [
                { id: `niv-${Date.now()}-1`, nombre: 'Excelente', descripcion: '', puntaje: 5.0 },
                { id: `niv-${Date.now()}-2`, nombre: 'Regular', descripcion: '', puntaje: 3.0 },
                { id: `niv-${Date.now()}-3`, nombre: 'Insuficiente', descripcion: '', puntaje: 1.0 },
            ]
        };
        setCurrentRubrica({
            ...currentRubrica,
            criterios: [...(currentRubrica.criterios || []), newCriterio]
        });
    };

    const updateCriterio = (id: string, field: keyof CriterioRubrica, value: any) => {
        const updatedCriterios = currentRubrica.criterios?.map(c =>
            c.id === id ? { ...c, [field]: value } : c
        );
        setCurrentRubrica({ ...currentRubrica, criterios: updatedCriterios });
    };

    const removeCriterio = (id: string) => {
        const updatedCriterios = currentRubrica.criterios?.filter(c => c.id !== id);
        setCurrentRubrica({ ...currentRubrica, criterios: updatedCriterios });
    };

    return (
        <div className="space-y-6 container mx-auto p-4 md:p-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                        Gestión de Rúbricas
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Crea y administra matrices de evaluación para tus cursos
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
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
                    <Button onClick={handleCreateRubrica}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nueva Rúbrica
                    </Button>
                </div>
            </div>


            <Tabs defaultValue="rubricas" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                    <TabsTrigger value="rubricas">
                        <LayoutList className="mr-2 h-4 w-4" />
                        Mis Rúbricas
                    </TabsTrigger>
                    <TabsTrigger value="360">
                        <ArrowRightLeft className="mr-2 h-4 w-4" />
                        Evaluación 360°
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="rubricas" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {rubricas
                            .filter(r =>
                                cursoFiltro === 'todos' ||
                                r.alcance === 'todos' ||
                                (r.alcance === 'seleccion' && r.cursosIds?.includes(cursoFiltro))
                            )
                            .map((rubrica) => (
                                <Card key={rubrica.id} className="hover:shadow-md transition-shadow group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEditRubrica(rubrica)}>
                                                    <Edit2 className="mr-2 h-4 w-4" /> Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDuplicateRubrica(rubrica)}>
                                                    <Copy className="mr-2 h-4 w-4" /> Duplicar
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteRubrica(rubrica.id)}>
                                                    <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <CardHeader>
                                        <div className="flex items-center space-x-2">
                                            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                                                <LayoutList className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <CardTitle className="text-lg">{rubrica.titulo}</CardTitle>
                                        </div>
                                        <CardDescription className="line-clamp-2 min-h-[40px]">
                                            {rubrica.descripcion || 'Sin descripción'}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex justify-between text-sm text-muted-foreground">
                                            <span>{rubrica.criterios?.length || 0} Criterios</span>
                                            <span>{rubrica.fechaCreacion.toLocaleDateString()}</span>
                                        </div>
                                        <div className="mt-2 flex flex-wrap gap-1">
                                            {rubrica.alcance === 'todos' ? (
                                                <Badge variant="outline" className="text-xs">Todos los cursos</Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-xs">{rubrica.cursosIds?.length} Cursos</Badge>
                                            )}
                                        </div>
                                    </CardContent>
                                    <CardFooter className="bg-slate-50/50 dark:bg-slate-900/50 p-3">
                                        <Button variant="ghost" className="w-full text-blue-600 hover:text-blue-800" onClick={() => handleEditRubrica(rubrica)}>
                                            Ver Detalle
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}

                        {/* Empty State / Add New Card */}
                        <div
                            className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center p-6 cursor-pointer hover:border-blue-400 hover:bg-blue-50/10 transition-colors min-h-[200px]"
                            onClick={handleCreateRubrica}
                        >
                            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-3">
                                <Plus className="h-6 w-6 text-slate-400" />
                            </div>
                            <p className="font-medium text-slate-500">Crear Nueva Rúbrica</p>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="360">
                    <Card>
                        <CardHeader>
                            <CardTitle>Evaluación Integral 360°</CardTitle>
                            <CardDescription>
                                Gestiona procesos de autoevaluación, coevaluación y heteroevaluación.
                            </CardDescription>
                            <div className="mt-4">
                                <Select value={selectedCourse360} onValueChange={setSelectedCourse360}>
                                    <SelectTrigger className="w-[300px]">
                                        <SelectValue placeholder="Seleccionar Curso..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {cursos.map(curso => (
                                            <SelectItem key={curso.id} value={curso.id}>{curso.nombre}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {!selectedCourse360 ? (
                                <div className="text-center py-10 text-muted-foreground">
                                    <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                    <p>Selecciona un curso para ver el estado de las evaluaciones.</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Estudiante</TableHead>
                                            <TableHead className="text-center">Autoevaluación</TableHead>
                                            <TableHead className="text-center">Coevaluación</TableHead>
                                            <TableHead className="text-center">Heteroevaluación</TableHead>
                                            <TableHead className="text-center">Estado Global</TableHead>
                                            <TableHead className="text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {[1, 2, 3].map((i) => (
                                            <TableRow key={i}>
                                                <TableCell className="font-medium">Estudiante {i}</TableCell>
                                                <TableCell className="text-center">
                                                    {i === 1 ? (
                                                        <Badge className="bg-green-500">Completado</Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-yellow-600">Pendiente</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {i === 2 ? (
                                                        <Badge className="bg-green-500">Completado</Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-slate-500">No Iniciado</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="secondary">4.5 / 5.0</Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="w-full bg-slate-100 rounded-full h-2.5 dark:bg-slate-700">
                                                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${i * 30}%` }}></div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm">Detalles</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                        {selectedCourse360 && (
                            <CardFooter className="bg-slate-50/50 justify-between">
                                <Button variant="outline">
                                    <ArrowRightLeft className="mr-2 h-4 w-4" />
                                    Asignar Pares Aleatorios
                                </Button>
                                <Button>
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Publicar Resultados
                                </Button>
                            </CardFooter>
                        )}
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Dialog for Creating/Editing Rubric */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{currentRubrica.id ? 'Editar Rúbrica' : 'Crear Nueva Rúbrica'}</DialogTitle>
                        <DialogDescription>
                            Define los criterios de evaluación, niveles y el alcance de la rúbrica.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="titulo">Título de la Rúbrica</Label>
                                    <Input
                                        id="titulo"
                                        value={currentRubrica.titulo}
                                        onChange={(e) => setCurrentRubrica({ ...currentRubrica, titulo: e.target.value })}
                                        placeholder="Ej: Ensayo Final"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="descripcion">Descripción</Label>
                                    <Input
                                        id="descripcion"
                                        value={currentRubrica.descripcion}
                                        onChange={(e) => setCurrentRubrica({ ...currentRubrica, descripcion: e.target.value })}
                                        placeholder="Breve descripción del propósito..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 border rounded-lg p-4 bg-slate-50/50">
                                <Label className="text-base font-medium">Asignación de Cursos</Label>
                                <RadioGroup
                                    value={currentRubrica.alcance || 'todos'}
                                    onValueChange={(val: 'todos' | 'seleccion') => setCurrentRubrica({ ...currentRubrica, alcance: val })}
                                    className="flex flex-col sm:flex-row gap-4 mb-2"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="todos" id="r-todos" />
                                        <Label htmlFor="r-todos" className="cursor-pointer">Todos los cursos</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="seleccion" id="r-seleccion" />
                                        <Label htmlFor="r-seleccion" className="cursor-pointer">Cursos específicos</Label>
                                    </div>
                                </RadioGroup>

                                {currentRubrica.alcance === 'seleccion' && (
                                    <div className="mt-2 border rounded-md p-3 max-h-40 overflow-y-auto bg-white space-y-2">
                                        {cursos.length === 0 ? (
                                            <p className="text-sm text-muted-foreground">No tienes cursos asignados.</p>
                                        ) : cursos.map(curso => (
                                            <div key={curso.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`c-${curso.id}`}
                                                    checked={currentRubrica.cursosIds?.includes(curso.id)}
                                                    onCheckedChange={(checked) => {
                                                        const currentIds = currentRubrica.cursosIds || [];
                                                        const newIds = checked
                                                            ? [...currentIds, curso.id]
                                                            : currentIds.filter(id => id !== curso.id);
                                                        setCurrentRubrica({ ...currentRubrica, cursosIds: newIds });
                                                    }}
                                                />
                                                <Label htmlFor={`c-${curso.id}`} className="cursor-pointer font-normal text-sm">
                                                    {curso.nombre} <span className="text-muted-foreground text-xs">({curso.codigo})</span>
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium">Criterios de Evaluación</h3>
                                <Button size="sm" variant="outline" onClick={addCriterio}>
                                    <Plus className="mr-2 h-4 w-4" /> Agregar Criterio
                                </Button>
                            </div>

                            <div className="border rounded-md divide-y">
                                {currentRubrica.criterios?.length === 0 && (
                                    <div className="p-8 text-center text-muted-foreground">
                                        No hay criterios definidos. Agrega uno para comenzar.
                                    </div>
                                )}
                                {currentRubrica.criterios?.map((criterio, index) => (
                                    <div key={criterio.id} className="p-4 space-y-4 bg-slate-50/30">
                                        <div className="flex items-start gap-4">
                                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-xs font-bold shrink-0 mt-2">
                                                {index + 1}
                                            </span>
                                            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                                                <div className="md:col-span-2 space-y-2">
                                                    <Label className="text-xs text-muted-foreground">Nombre del Criterio</Label>
                                                    <Input
                                                        value={criterio.nombre}
                                                        onChange={(e) => updateCriterio(criterio.id, 'nombre', e.target.value)}
                                                        placeholder="Ej: Estructura"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs text-muted-foreground">Peso (%)</Label>
                                                    <div className="relative">
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            value={criterio.peso}
                                                            onChange={(e) => updateCriterio(criterio.id, 'peso', Number(e.target.value))}
                                                            className="pr-6"
                                                        />
                                                        <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">%</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-end justify-end">
                                                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => removeCriterio(criterio.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <div className="md:col-span-4 space-y-2">
                                                    <Label className="text-xs text-muted-foreground">Descripción (Opcional)</Label>
                                                    <Textarea
                                                        value={criterio.descripcion}
                                                        onChange={(e) => updateCriterio(criterio.id, 'descripcion', e.target.value)}
                                                        placeholder="Detalles sobre qué se evalúa en este criterio..."
                                                        className="h-20"
                                                    />
                                                </div>

                                                {/* Niveles Preview (Simplified for this view) */}
                                                <div className="md:col-span-4 mt-2">
                                                    <Label className="text-xs font-semibold mb-2 block">Niveles de Desempeño ({criterio.niveles.length})</Label>
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                                        {criterio.niveles.map((nivel) => (
                                                            <div key={nivel.id} className="border rounded p-2 text-xs bg-white">
                                                                <div className="font-bold flex justify-between">{nivel.nombre} <span>{nivel.puntaje} pts</span></div>
                                                                <p className="text-muted-foreground truncate">{nivel.descripcion || 'Sin descripción'}</p>
                                                            </div>
                                                        ))}
                                                        <Button variant="outline" size="sm" className="text-xs h-full min-h-[50px] border-dashed">
                                                            <Edit2 className="h-3 w-3 mr-1" /> Editar Niveles
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSaveRubrica} disabled={!currentRubrica.titulo}>
                            <Save className="mr-2 h-4 w-4" /> Guardar Rúbrica
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
