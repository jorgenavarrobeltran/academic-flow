import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Label } from '@/components/ui/label';
import { useCursos, useUI } from '@/hooks/useStore';
import { Upload, FileSpreadsheet, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabase';

interface EstudianteImportado {
    nombre: string;
    apellido: string;
    email: string;
    codigo: string;
    programa?: string;
    semestre?: number;
    existe: boolean;
}

interface ImportarEstudiantesProps {
    preselectedCursoId?: string;
    onImportSuccess?: () => void;
}

export function ImportarEstudiantes({ preselectedCursoId, onImportSuccess }: ImportarEstudiantesProps) {
    const { cursos, fetchEstudiantesPorCurso, fetchCursos } = useCursos();
    const { showToast } = useUI();
    const [open, setOpen] = useState(false);
    const [cursoId, setCursoId] = useState(preselectedCursoId || '');
    const [file, setFile] = useState<File | null>(null);
    const [estudiantes, setEstudiantes] = useState<EstudianteImportado[]>([]);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'upload' | 'preview'>('upload');
    const [reemplazarLista, setReemplazarLista] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync preselectedCursoId when it changes
    useEffect(() => {
        if (preselectedCursoId) {
            setCursoId(preselectedCursoId);
        }
    }, [preselectedCursoId]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls') && !selectedFile.name.endsWith('.csv')) {
            showToast('Por favor suba un archivo Excel (.xlsx, .xls) o CSV', 'error');
            return;
        }

        setFile(selectedFile);
        setLoading(true);

        try {
            const data = await selectedFile.arrayBuffer();
            const workbook = XLSX.read(data);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

            // Asumimos estructura: Nombre | Email | Codigo (headers en fila 0)
            // Ajustar según necesidad real, por ahora simple heurística
            // Heurística de columnas
            const headers = jsonData[0].map((h: any) => String(h).trim().toLowerCase());

            const nombreIdx = headers.findIndex(h => h === 'nombre' || h === 'nombres');
            const apellidoIdx = headers.findIndex(h => h === 'apellido' || h === 'apellidos');
            const nombreCompletoIdx = headers.findIndex(h => h.includes('nombre') && !h.includes('apellido')); // Fallback si dice 'Nombre Completo'

            const emailIdx = headers.findIndex(h => h.includes('correo') || h.includes('email'));
            const codigoIdx = headers.findIndex(h => h.includes('codigo') || h.includes('identificacion') || h.includes('documento'));
            const programaIdx = headers.findIndex(h => h.includes('programa') || h.includes('carrera'));
            const semestreIdx = headers.findIndex(h => h.includes('semestre'));

            // Validar que tengamos al menos nombre o nombre completo
            const nIndex = nombreIdx !== -1 ? nombreIdx : nombreCompletoIdx;

            if (nIndex === -1 && apellidoIdx === -1) {
                showToast('El archivo debe tener al menos una columna "Nombre" o "Nombres"', 'error');
                setFile(null);
                setLoading(false);
                return;
            }

            const parsed: EstudianteImportado[] = [];

            for (let i = 1; i < jsonData.length; i++) {
                const row = jsonData[i];
                if (!row || row.length === 0) continue;

                let nombre = '';
                let apellido = '';

                // Lógica para nombres
                if (nombreIdx !== -1 && apellidoIdx !== -1) {
                    nombre = String(row[nombreIdx] || '').trim();
                    apellido = String(row[apellidoIdx] || '').trim();
                } else if (nIndex !== -1) {
                    // Tratar de separar nombre completo
                    const full = String(row[nIndex] || '').trim();
                    const parts = full.split(' ');
                    if (parts.length > 2) {
                        nombre = parts.slice(0, 2).join(' ');
                        apellido = parts.slice(2).join(' ');
                    } else if (parts.length === 2) {
                        nombre = parts[0];
                        apellido = parts[1];
                    } else {
                        nombre = parts[0];
                        apellido = '.'; // Lastname required logic fallback
                    }
                }

                if (!nombre) continue;

                parsed.push({
                    nombre,
                    apellido,
                    email: emailIdx !== -1 && row[emailIdx] ? String(row[emailIdx]).trim() : `estudiante${Date.now() + i}@cul.edu.co`,
                    codigo: codigoIdx !== -1 && row[codigoIdx] ? String(row[codigoIdx]).trim() : `COD-${Math.floor(Math.random() * 10000)}`,
                    programa: programaIdx !== -1 ? String(row[programaIdx]).trim() : undefined,
                    semestre: semestreIdx !== -1 ? parseInt(row[semestreIdx]) : undefined,
                    existe: false
                });
            }

            setEstudiantes(parsed);
            setStep('preview');
        } catch (error: any) {
            console.error('Error parsing excel:', error);
            showToast(`Error al leer el archivo: ${error.message}`, 'error');
            setFile(null);
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async () => {
        console.log('--- Iniciando Importación ---');
        console.log('Curso ID:', cursoId);
        console.log('Estudiantes a importar:', estudiantes.length);

        if (!cursoId) {
            showToast('Seleccione un curso para inscribir a los estudiantes', 'error');
            return;
        }

        if (estudiantes.length === 0) {
            showToast('No hay estudiantes para importar', 'error');
            return;
        }

        setLoading(true);
        let successCount = 0;
        let errorCount = 0;

        try {
            if (reemplazarLista) {
                console.log(`Eliminando inscripciones anteriores del curso ${cursoId}...`);
                const { error: deleteError } = await supabase
                    .from('inscripciones')
                    .delete()
                    .eq('curso_id', cursoId);

                if (deleteError) {
                    console.error('Error deleting existing enrollments:', deleteError);
                    throw new Error(`Error al limpiar lista: ${deleteError.message}`);
                }
            }

            for (const [index, est] of estudiantes.entries()) {
                console.log(`Procesando estudiante ${index + 1}/${estudiantes.length}: ${est.email}`);

                // 1. Verificar si el usuario ya existe
                const { data: existingUser, error: checkError } = await supabase
                    .from('usuarios')
                    .select('id')
                    .eq('email', est.email.trim())
                    .maybeSingle();

                if (checkError) {
                    console.error(`Error verificando usuario ${est.email}:`, checkError);
                    errorCount++;
                    continue;
                }

                let usuarioId = existingUser?.id;

                if (usuarioId) {
                    console.log(`Usuario existente encontrado: ${usuarioId}. Actualizando...`);
                    // Actualizar datos del estudiante existente
                    const { error: updateError } = await supabase
                        .from('usuarios')
                        .update({
                            nombre: est.nombre,
                            apellido: est.apellido,
                            codigo: est.codigo,
                            programa: est.programa || 'Ingeniería de Sistemas',
                            semestre: est.semestre || 1,
                        })
                        .eq('id', usuarioId);

                    if (updateError) {
                        console.error(`Error updating user ${est.email}:`, updateError);
                        // No contamos como error fatal, intentamos inscribir
                    }
                } else {
                    console.log(`Creando nuevo usuario: ${est.email}`);
                    // Fallback para randomUUID
                    usuarioId = typeof crypto !== 'undefined' && crypto.randomUUID
                        ? crypto.randomUUID()
                        : `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

                    const { error: insertError } = await supabase
                        .from('usuarios')
                        .insert({
                            id: usuarioId,
                            email: est.email.trim(),
                            nombre: est.nombre,
                            apellido: est.apellido,
                            codigo: est.codigo,
                            rol: 'estudiante',
                            programa: est.programa || 'Ingeniería de Sistemas',
                            semestre: est.semestre || 1,
                            activo: true
                        });

                    if (insertError) {
                        console.error(`Error creating user ${est.email}:`, insertError);
                        errorCount++;
                        continue;
                    }
                }

                if (!usuarioId) {
                    console.error(`No se pudo obtener ID para ${est.email}`);
                    errorCount++;
                    continue;
                }

                // 2. Crear inscripción
                console.log(`Inscribiendo usuario ${usuarioId} en curso ${cursoId}`);
                const { error: inscripcionError } = await supabase
                    .from('inscripciones')
                    .upsert({
                        curso_id: cursoId,
                        estudiante_id: usuarioId
                    }, { onConflict: 'curso_id,estudiante_id' });

                if (inscripcionError) {
                    console.error(`Error enrolling user ${usuarioId}:`, inscripcionError);
                    errorCount++;
                } else {
                    successCount++;
                }
            }

            console.log(`Resumen: ${successCount} éxitos, ${errorCount} errores`);
            showToast(`Importación completada: ${successCount} inscritos, ${errorCount} errores.`, successCount > 0 ? 'success' : 'error');

            if (successCount > 0) {
                console.log('Actualizando lista de estudiantes...');
                await fetchEstudiantesPorCurso(cursoId);
                console.log('Actualizando contadores globales de cursos...');
                await fetchCursos();

                // Pequeño delay para asegurar propagación
                setTimeout(() => {
                    if (onImportSuccess) onImportSuccess();
                }, 500);
            }

            setOpen(false);
            setStep('upload');
            setFile(null);
            setEstudiantes([]);
            setReemplazarLista(false);
        } catch (error: any) {
            console.error('CRITICAL ERROR handleImport:', error);
            showToast(`Error crítico en importación: ${error.message || error}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Upload className="w-4 h-4" />
                    Importar Estudiantes
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Importar Estudiantes desde Excel</DialogTitle>
                    <DialogDescription>
                        Cargue un archivo Excel con la lista de estudiantes para matricularlos masivamente.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Debug info (temporary, hidden in prod) */}
                    {/* <div className="text-xs text-muted-foreground p-3 bg-slate-100 rounded mb-2 font-mono">
                        DEBUG: CursoId: {cursoId ? `OK ('${cursoId}')` : 'Faltante'} |
                        Estudiantes: {estudiantes.length} |
                        Loading: {loading ? 'YES' : 'NO'}
                    </div> */}

                    <div className="space-y-2">
                        <Label>Curso Destino</Label>
                        <Select value={cursoId} onValueChange={setCursoId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccione el curso..." />
                            </SelectTrigger>
                            <SelectContent>
                                {cursos.map(c => (
                                    <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {step === 'upload' ? (
                        <div
                            className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/10 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".xlsx,.xls,.csv"
                                onClick={(e) => { (e.target as HTMLInputElement).value = '' }}
                                onChange={handleFileChange}
                            />
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <FileSpreadsheet className="w-8 h-8 text-green-600" />
                            </div>
                            <p className="text-sm font-medium text-foreground">
                                {loading ? 'Procesando...' : 'Click para subir archivo'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Formatos soportados: .xlsx, .csv. Columnas esperadas: Nombre, Apellido, Email, Código.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium">Vista Previa ({estudiantes.length} estudiantes)</p>
                                <Button variant="ghost" size="sm" onClick={() => { setStep('upload'); setFile(null); }}>
                                    Cambiar archivo
                                </Button>
                            </div>

                            <div className="flex items-center space-x-2 bg-yellow-50 p-3 rounded-md border border-yellow-100">
                                <Checkbox
                                    id="reemplazar"
                                    checked={reemplazarLista}
                                    onCheckedChange={(c) => setReemplazarLista(c === true)}
                                />
                                <Label htmlFor="reemplazar" className="text-sm font-medium cursor-pointer text-yellow-800">
                                    Reemplazar lista completa (Eliminar estudiantes actuales del curso)
                                </Label>
                            </div>

                            <div className="border rounded-md max-h-[300px] overflow-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50 sticky top-0">
                                        <tr>
                                            <th className="p-2 text-left font-medium">Nombre Completo</th>
                                            <th className="p-2 text-left font-medium">Email</th>
                                            <th className="p-2 text-left font-medium">Código</th>
                                            <th className="p-2 text-left font-medium">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {estudiantes.map((est, i) => (
                                            <tr key={i} className="border-t">
                                                <td className="p-2">{est.nombre} {est.apellido}</td>
                                                <td className="p-2 text-muted-foreground">{est.email}</td>
                                                <td className="p-2 text-muted-foreground">{est.codigo}</td>
                                                <td className="p-2">
                                                    <span className="flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full w-fit">
                                                        <AlertCircle className="w-3 h-3 mr-1" />
                                                        Nuevo
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                    {step === 'upload' ? (
                        <Button disabled className="opacity-50 cursor-not-allowed">
                            Suba un archivo primero
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            onClick={handleImport}
                            disabled={!cursoId || estudiantes.length === 0 || loading}
                            className={`text-white ${reemplazarLista ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'}`}
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                            {reemplazarLista ? 'Reemplazar e Importar' : 'Confirmar Importación'}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
