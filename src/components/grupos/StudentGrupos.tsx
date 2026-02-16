import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useCursos, useUI, useAuth, useCalificaciones } from '@/hooks/useStore';
import {
    Users,
    FolderOpen,
    UserPlus,
    CheckCircle2,
    PlayCircle
} from 'lucide-react';
import type { Estudiante } from '@/types';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export function StudentGrupos() {
    const { usuario } = useAuth();
    const { cursos, cursoSeleccionado, setCursoSeleccionado } = useCursos();
    const { grupos, fetchGrupos } = useCalificaciones();
    const { showToast } = useUI();

    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        proyecto: '',
        integrantesSeleccionados: [] as string[]
    });

    useEffect(() => {
        if (cursoSeleccionado?.id) {
            fetchGrupos(cursoSeleccionado.id);
        }
    }, [cursoSeleccionado?.id, fetchGrupos]);

    const miGrupo = useMemo(() => {
        if (!cursoSeleccionado || !usuario) return null;
        return grupos.find(g =>
            g.cursoId === cursoSeleccionado.id && g.integrantes.includes(usuario.id)
        );
    }, [cursoSeleccionado, usuario, grupos]);

    const gruposDelCurso = useMemo(() => {
        if (!cursoSeleccionado) return [];
        return grupos.filter(g => g.cursoId === cursoSeleccionado.id);
    }, [cursoSeleccionado, grupos]);

    const estudiantesDisponibles = useMemo(() => {
        if (!cursoSeleccionado || !usuario) return [];

        const todosEstudiantesEnGrupos = new Set(gruposDelCurso.flatMap(g => g.integrantes));
        const classmates = cursoSeleccionado.estudiantes || [];

        return classmates
            .filter(c => c.estudianteId !== usuario.id)
            .filter(c => !todosEstudiantesEnGrupos.has(c.estudianteId))
            .map(c => ({
                id: c.estudianteId,
                nombre: c.nombre || 'Estudiante',
                apellido: c.apellido || 'Desconocido',
                fotoUrl: c.fotoUrl,
                email: c.email
            } as Estudiante));
    }, [cursoSeleccionado, gruposDelCurso, usuario]);

    const handleCreateGrupo = () => {
        if (!formData.nombre) {
            showToast('El nombre del grupo es obligatorio', 'error');
            return;
        }

        showToast(`Grupo "${formData.nombre}" creado con ${formData.integrantesSeleccionados.length + 1} integrantes`, 'success');
        setCreateDialogOpen(false);
        setFormData({ nombre: '', descripcion: '', proyecto: '', integrantesSeleccionados: [] });
    };

    const toggleSeleccionEstudiante = (id: string) => {
        setFormData(prev => {
            const isSelected = prev.integrantesSeleccionados.includes(id);
            if (isSelected) {
                return { ...prev, integrantesSeleccionados: prev.integrantesSeleccionados.filter(i => i !== id) };
            } else {
                return { ...prev, integrantesSeleccionados: [...prev.integrantesSeleccionados, id] };
            }
        });
    };

    if (!cursoSeleccionado) {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center py-16">
                    <FolderOpen className="w-16 h-16 text-[#c2cdd8] mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-[#1f1f1f] mb-2">Selecciona un curso</h2>
                    <p className="text-[#626a72] mb-6">Elige un curso para gestionar tu grupo</p>
                    <Select onValueChange={(value) => {
                        const curso = cursos.find(c => c.id === value);
                        if (curso) setCursoSeleccionado(curso);
                    }}>
                        <SelectTrigger className="w-80 mx-auto">
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
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#1f1f1f]">Mi Grupo de Trabajo</h1>
                    <p className="text-[#626a72]">{cursoSeleccionado.nombre}</p>
                </div>
            </div>

            {miGrupo ? (
                <Card className="border-0 shadow-md bg-white">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-6 border-b">
                        <div className="flex justify-between items-start">
                            <div>
                                <Badge variant="outline" className="mb-2 bg-white text-blue-700 border-blue-200">
                                    {miGrupo.proyecto || 'Proyecto no definido'}
                                </Badge>
                                <CardTitle className="text-2xl text-blue-900">{miGrupo.nombre}</CardTitle>
                                {miGrupo.descripcion && <p className="text-muted-foreground mt-1">{miGrupo.descripcion}</p>}
                            </div>
                            <div className="text-right">
                                <span className="text-sm font-medium text-muted-foreground">Nota Actual</span>
                                <div className="text-3xl font-bold text-blue-600">{miGrupo.notaGrupal || '-'}</div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Integrantes</h3>
                                <div className="space-y-3">
                                    {miGrupo.integrantes.map(integranteId => {
                                        const estCurso = cursoSeleccionado?.estudiantes?.find(e => e.estudianteId === integranteId);
                                        const est = estCurso ? {
                                            id: estCurso.estudianteId,
                                            nombre: estCurso.nombre || 'Estudiante',
                                            apellido: estCurso.apellido || '',
                                            fotoUrl: estCurso.fotoUrl
                                        } : { nombre: 'Estudiante', apellido: '', fotoUrl: '', id: integranteId } as any;
                                        return (
                                            <div key={integranteId} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                                                <Avatar>
                                                    <AvatarImage src={est.fotoUrl} />
                                                    <AvatarFallback>{est.nombre[0]}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-slate-900">{est.nombre} {est.apellido}</p>
                                                    <p className="text-xs text-slate-500">{integranteId === usuario?.id ? '(Yo)' : 'Compañero'}</p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Estado del Proyecto</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 border border-green-100 text-green-800">
                                        <CheckCircle2 className="w-5 h-5" />
                                        <span className="font-medium">Grupo conformado correctamente</span>
                                    </div>
                                    <div className="p-4 rounded-lg border border-slate-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <PlayCircle className="w-4 h-4 text-slate-400" />
                                            <span className="font-medium text-slate-700">Próximas Entregas</span>
                                        </div>
                                        <p className="text-sm text-slate-500">No hay entregas pendientes por el momento.</p>
                                    </div>
                                </div>
                            </div>
                        </div>


                    </CardContent>
                </Card>
            ) : (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-slate-200">
                    <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-slate-900 mb-2">No tienes grupo asignado</h2>
                    <p className="text-slate-500 mb-6 max-w-md mx-auto">
                        Para participar en el proyecto de investigación, debes conformar un grupo con tus compañeros de clase.
                    </p>
                    <Button onClick={() => setCreateDialogOpen(true)} className="bg-[#0070a0] hover:bg-[#00577c]">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Conformar Nuevo Grupo
                    </Button>
                </div>
            )}

            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Conformar Grupo de Trabajo</DialogTitle>
                        <DialogDescription>
                            Selecciona a tus compañeros y asigna un nombre a tu grupo.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="nombre">Nombre del Grupo</Label>
                            <Input
                                id="nombre"
                                placeholder="Ej: Innovadores Tech"
                                value={formData.nombre}
                                onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tema">Tema / Proyecto (Tentativo)</Label>
                            <Input
                                id="tema"
                                placeholder="Ej: Implementación de IA en..."
                                value={formData.proyecto}
                                onChange={e => setFormData({ ...formData, proyecto: e.target.value })}
                            />
                        </div>

                        <div className="space-y-3">
                            <Label>Seleccionar Compañeros ({formData.integrantesSeleccionados.length})</Label>
                            <div className="border rounded-lg p-2 max-h-[250px] overflow-y-auto bg-slate-50 space-y-2">
                                {estudiantesDisponibles.length === 0 ? (
                                    <p className="text-sm text-center text-muted-foreground py-4">
                                        No hay compañeros disponibles sin grupo.
                                    </p>
                                ) : (
                                    estudiantesDisponibles.map(est => (
                                        <div key={est.id} className="flex items-center space-x-3 p-2 hover:bg-white rounded-md transition-colors border border-transparent hover:border-slate-200">
                                            <Checkbox
                                                id={`est-${est.id}`}
                                                checked={formData.integrantesSeleccionados.includes(est.id)}
                                                onCheckedChange={() => toggleSeleccionEstudiante(est.id)}
                                            />
                                            <label
                                                htmlFor={`est-${est.id}`}
                                                className="flex flex-1 items-center gap-3 cursor-pointer select-none"
                                            >
                                                <Avatar className="w-8 h-8">
                                                    <AvatarImage src={est.fotoUrl} />
                                                    <AvatarFallback>{est.nombre[0]}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium leading-none">{est.nombre} {est.apellido}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">{est.email}</p>
                                                </div>
                                            </label>
                                        </div>
                                    ))
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                * Tú serás agregado automáticamente como líder del grupo.
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleCreateGrupo} disabled={!formData.nombre}>Crear Grupo</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
