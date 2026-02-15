import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Label } from '@/components/ui/label';
import { useCursos, useUI } from '@/hooks/useStore';
import { Upload, FileSpreadsheet, Check, AlertCircle, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabase';

interface EstudianteImportado {
    nombre: string;
    email: string;
    codigo: string;
    existe: boolean;
}

export function ImportarEstudiantes() {
    const { cursos } = useCursos();
    const { showToast } = useUI();
    const [open, setOpen] = useState(false);
    const [cursoId, setCursoId] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [estudiantes, setEstudiantes] = useState<EstudianteImportado[]>([]);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'upload' | 'preview'>('upload');
    const fileInputRef = useRef<HTMLInputElement>(null);

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
            const headers = jsonData[0].map((h: any) => String(h).toLowerCase());
            const nombreIdx = headers.findIndex(h => h.includes('nombre'));
            const emailIdx = headers.findIndex(h => h.includes('correo') || h.includes('email'));
            const codigoIdx = headers.findIndex(h => h.includes('codigo') || h.includes('identificacion'));

            if (nombreIdx === -1) {
                throw new Error('No se encontró columna de Nombre');
            }

            const parsed: EstudianteImportado[] = [];

            for (let i = 1; i < jsonData.length; i++) {
                const row = jsonData[i];
                if (!row || row.length === 0) continue;

                const nombre = row[nombreIdx];
                if (!nombre) continue;

                parsed.push({
                    nombre: String(nombre).trim(),
                    email: emailIdx !== -1 ? String(row[emailIdx]).trim() : `estudiante${Date.now() + i}@cul.edu.co`, // Fallback si no hay email
                    codigo: codigoIdx !== -1 ? String(row[codigoIdx]).trim() : `COD-${Math.floor(Math.random() * 10000)}`,
                    existe: false // Se verificará al importar
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
        if (!cursoId) {
            showToast('Seleccione un curso para inscribir a los estudiantes', 'error');
            return;
        }

        setLoading(true);
        let successCount = 0;
        let errorCount = 0;

        try {
            for (const est of estudiantes) {
                // 1. Insertar o recuperar el usuario (Upsert basado en email)
                // Usamos la tabla decoupled 'usuarios'
                const { data: usuarioData, error: usuarioError } = await supabase
                    .from('usuarios')
                    .upsert({
                        email: est.email,
                        nombre: est.nombre,
                        rol: 'estudiante'
                        // codigo: est.codigo // Si tuviéramos columna código en usuarios, pero está en usuarios o separado?
                        // El esquema actual tiene 'rol', 'nombre', 'email'. Código es propio de estudiante.
                        // Asumimos que nombre y email bastan por ahora.
                    }, { onConflict: 'email' })
                    .select('id')
                    .single();

                if (usuarioError) {
                    console.error(`Error upserting user ${est.email}:`, usuarioError);
                    errorCount++;
                    continue;
                }

                const usuarioId = usuarioData.id;

                // 2. Crear inscripción
                const { error: inscripcionError } = await supabase
                    .from('inscripciones')
                    .upsert({
                        curso_id: cursoId,
                        estudiante_id: usuarioId
                    }, { onConflict: 'curso_id,estudiante_id' }); // Requiere constraint unique, definido en init_schema

                if (inscripcionError) {
                    console.error(`Error enrolling user ${usuarioId}:`, inscripcionError);
                    errorCount++;
                } else {
                    successCount++;
                }
            }

            showToast(`Importación completada: ${successCount} inscritos, ${errorCount} errores.`, successCount > 0 ? 'success' : 'error');
            setOpen(false);
            setStep('upload');
            setFile(null);
            setEstudiantes([]);
        } catch (error: any) {
            showToast(`Error crítico en importación: ${error.message}`, 'error');
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
                                onChange={handleFileChange}
                            />
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <FileSpreadsheet className="w-8 h-8 text-green-600" />
                            </div>
                            <p className="text-sm font-medium text-foreground">
                                {loading ? 'Procesando...' : 'Click para subir archivo'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Formatos soportados: .xlsx, .csv
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
                            <div className="border rounded-md max-h-[300px] overflow-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50 sticky top-0">
                                        <tr>
                                            <th className="p-2 text-left font-medium">Nombre</th>
                                            <th className="p-2 text-left font-medium">Email</th>
                                            <th className="p-2 text-left font-medium">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {estudiantes.map((est, i) => (
                                            <tr key={i} className="border-t">
                                                <td className="p-2">{est.nombre}</td>
                                                <td className="p-2 text-muted-foreground">{est.email}</td>
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
                    <Button
                        onClick={handleImport}
                        disabled={!file || !cursoId || loading || step === 'upload'}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                        Confirmar Importación
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
