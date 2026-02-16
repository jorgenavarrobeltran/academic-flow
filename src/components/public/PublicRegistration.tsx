import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, CheckCircle, Loader2, School, UserPlus } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function PublicRegistration() {
    const { cursoId } = useParams<{ cursoId: string }>();

    const [step, setStep] = useState(1); // 1: Form, 2: Success
    const [course, setCourse] = useState<any>(null);
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState<string>('');

    // Form Data
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        confirmPassword: '',
        documento: '',
        celular: '',
        // Additional Fields requested by user
        edad: '',
        semestre: '',
        programa: '',
        facultad: '',
        esHomologante: false,
        haVistoClaseAntes: false
    });

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (cursoId) {
            loadCourseData();
        }
    }, [cursoId]);

    const loadCourseData = async () => {
        try {
            setLoading(true);

            // Fetch course details
            const { data: routeData, error: routeError } = await supabase
                .from('cursos')
                .select('*, usuarios:docente_id(nombre)')
                .eq('id', cursoId)
                .single();

            if (routeError) throw routeError;
            setCourse(routeData);

            // Fetch existing students from the course
            const { data: enrollmentData, error: enrollmentError } = await supabase
                .from('inscripciones')
                .select(`
                    estudiante_id,
                    usuarios (
                        id,
                        nombre,
                        apellido,
                        email
                    )
                `)
                .eq('curso_id', cursoId);

            if (enrollmentError) throw enrollmentError;

            if (enrollmentData) {
                const studentList = enrollmentData
                    .filter((item: any) => item.usuarios)
                    .map((item: any) => ({
                        id: item.estudiante_id,
                        full_name: `${item.usuarios.nombre} ${item.usuarios.apellido || ''}`.trim(),
                        email: item.usuarios.email
                    }))
                    .sort((a: any, b: any) => a.full_name.localeCompare(b.full_name));

                setStudents(studentList);
            }

        } catch (err: any) {
            console.error('Error loading data:', err);
            setError('No se pudo cargar la información del curso.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (!selectedStudentId) {
            setError('Debes seleccionarte en la lista o elegir "No estoy en el listado"');
            return;
        }

        const isNewStudent = selectedStudentId === 'new_student';

        if (isNewStudent && (!formData.nombre || !formData.apellido)) {
            setError('Por favor ingresa tu nombre y apellido');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            // 1. Auth Registration
            const authEmail = formData.email;
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: authEmail,
                password: formData.password,
                options: {
                    data: {
                        full_name: isNewStudent ? `${formData.nombre} ${formData.apellido}` : (students.find(s => s.id === selectedStudentId)?.full_name),
                        rol: 'estudiante'
                    }
                }
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error('Error al crear cuenta');

            const newUserId = authData.user.id;
            const placeholderUserId = selectedStudentId;

            // 2. Profile Creation/Update
            const profileData = {
                id: newUserId,
                nombre: isNewStudent ? formData.nombre : (students.find(s => s.id === selectedStudentId)?.full_name.split(' ')[0] || ''),
                apellido: isNewStudent ? formData.apellido : (students.find(s => s.id === selectedStudentId)?.full_name.split(' ').slice(1).join(' ') || ''),
                email: formData.email,
                documento_identidad: formData.documento,
                celular: formData.celular,
                rol: 'estudiante',
                // Additional fields
                semestre: parseInt(formData.semestre) || 1,
                programa: formData.programa,
                facultad: formData.facultad,
                es_homologante: formData.esHomologante,
                ha_visto_clase_antes: formData.haVistoClaseAntes,
                // Age workaround (storing as string in bio or similar if no column, but let's try to map if column exists)
                // Assuming we might use a field called 'biografia' or just not store if not in schema
                biografia: `Edad: ${formData.edad}`
            };

            const { error: profileError } = await supabase
                .from('usuarios')
                .upsert(profileData);

            if (profileError) throw profileError;

            // 3. Enrollment Logic
            if (isNewStudent) {
                // Just create new enrollment
                const { error: enrollError } = await supabase
                    .from('inscripciones')
                    .insert({
                        estudiante_id: newUserId,
                        curso_id: cursoId
                    });
                if (enrollError) throw enrollError;
            } else {
                // Move existing enrollment
                const { error: updateEnrollError } = await supabase
                    .from('inscripciones')
                    .update({ estudiante_id: newUserId })
                    .eq('curso_id', cursoId)
                    .eq('estudiante_id', placeholderUserId);

                if (!updateEnrollError) {
                    // Cleanup old placeholder
                    await supabase.from('usuarios').delete().eq('id', placeholderUserId);
                }
            }

            setStep(2);

        } catch (err: any) {
            console.error('Registration error:', err);
            setError(err.message || 'Error en el registro');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (step === 2) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <CardTitle>¡Registro Exitoso!</CardTitle>
                        <CardDescription>
                            Tus datos han sido registrados en el curso <strong>{course?.nombre}</strong>.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="justify-center">
                        <Link to="/login">
                            <Button className="w-full bg-[#0070a0]">Iniciar Sesión</Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 py-12">
            <div className="mb-8 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <School className="w-10 h-10 text-[#0070a0]" />
                    <h1 className="text-3xl font-bold text-slate-900">AcademicFlow</h1>
                </div>
                <p className="text-slate-500 font-medium">Formulario de Inscripción y Actualización</p>
            </div>

            <Card className="w-full max-w-2xl">
                <CardHeader className="border-b bg-slate-50/50">
                    <CardTitle className="text-xl">Datos del Estudiante</CardTitle>
                    <CardDescription>
                        Curso: <span className="font-bold text-slate-900">{course?.nombre}</span> <br />
                        Profesor: <span className="font-medium">{course?.usuarios?.nombre}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    {error && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Atención</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleRegister} className="space-y-6">
                        {/* Selección de Identidad */}
                        <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="student-select" className="flex items-center gap-2">
                                    <UserPlus className="w-4 h-4 text-blue-600" />
                                    ¿Quién eres?
                                </Label>
                                <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                                    <SelectTrigger className="bg-white">
                                        <SelectValue placeholder="Busca tu nombre en el listado..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="new_student" className="font-bold text-blue-600">
                                            ✨ No estoy en el listado (Soy nuevo)
                                        </SelectItem>
                                        {students.map((student) => (
                                            <SelectItem key={student.id} value={student.id}>
                                                {student.full_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {selectedStudentId === 'new_student' && (
                                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="nombre">Nombres</Label>
                                        <Input
                                            id="nombre"
                                            placeholder="Ej: Juan Camilo"
                                            value={formData.nombre}
                                            onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="apellido">Apellidos</Label>
                                        <Input
                                            id="apellido"
                                            placeholder="Ej: Pérez García"
                                            value={formData.apellido}
                                            onChange={e => setFormData({ ...formData, apellido: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Datos Básicos */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Correo Institucional o Personal</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="estudiante@cuc.edu.co"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="documento">Documento de Identidad</Label>
                                <Input
                                    id="documento"
                                    placeholder="C.C. / T.I. / Pasaporte"
                                    value={formData.documento}
                                    onChange={e => setFormData({ ...formData, documento: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="celular">Número de Celular</Label>
                                <Input
                                    id="celular"
                                    placeholder="300 123 4567"
                                    value={formData.celular}
                                    onChange={e => setFormData({ ...formData, celular: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edad">Edad</Label>
                                <Input
                                    id="edad"
                                    type="number"
                                    placeholder="Años"
                                    value={formData.edad}
                                    onChange={e => setFormData({ ...formData, edad: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {/* Perfil Académico */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="facultad">Facultad</Label>
                                <Select value={formData.facultad} onValueChange={v => setFormData({ ...formData, facultad: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona facultad..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Ingeniería">Ingeniería</SelectItem>
                                        <SelectItem value="Ciencias Económicas">Ciencias Económicas</SelectItem>
                                        <SelectItem value="Derecho y C. Sociales">Derecho y C. Sociales</SelectItem>
                                        <SelectItem value="Ciencias de la Educación">Ciencias de la Educación</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="programa">Programa Académico</Label>
                                <Select value={formData.programa} onValueChange={v => setFormData({ ...formData, programa: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona programa..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Ingeniería de Sistemas">Ingeniería de Sistemas</SelectItem>
                                        <SelectItem value="Ingeniería Industrial">Ingeniería Industrial</SelectItem>
                                        <SelectItem value="Contaduría Pública">Contaduría Pública</SelectItem>
                                        <SelectItem value="Administración de Empresas">Administración de Empresas</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="semestre">Semestre Actual</Label>
                                <Input
                                    id="semestre"
                                    type="number"
                                    min="1"
                                    max="12"
                                    value={formData.semestre}
                                    onChange={e => setFormData({ ...formData, semestre: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {/* Datos adicionales */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="homologacion"
                                    checked={formData.esHomologante}
                                    onCheckedChange={(v) => setFormData({ ...formData, esHomologante: !!v })}
                                />
                                <Label htmlFor="homologacion" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Soy estudiante de homologación
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="visto-antes"
                                    checked={formData.haVistoClaseAntes}
                                    onCheckedChange={(v) => setFormData({ ...formData, haVistoClaseAntes: !!v })}
                                />
                                <Label htmlFor="visto-antes" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    He dado clases con el profesor antes
                                </Label>
                            </div>
                        </div>

                        {/* Credenciales */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">Crea tu Contraseña</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Mínimo 6 caracteres"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirma tu Contraseña</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full bg-[#0070a0] hover:bg-[#005a82] h-12 text-lg" disabled={submitting}>
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Procesando Registro...
                                </>
                            ) : (
                                'Completar Registro e Inscripción'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
