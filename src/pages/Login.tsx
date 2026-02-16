import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, BookOpen, Users, Lock, Mail, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useUI, useAuth } from '../hooks/useStore';
import { supabase } from '../lib/supabase';


export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { showToast } = useUI();
    const [role, setRole] = useState<'docente' | 'estudiante'>('docente');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent, email: string, pass: string) => {
        e.preventDefault();
        setIsLoading(true);



        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password: pass
            });

            if (error) throw error;

            if (data.user) {
                // Fetch profile to get name and role
                const { data: profile, error: profileError } = await supabase
                    .from('usuarios')
                    .select('*')
                    .eq('id', data.user.id)
                    .single();

                if (profileError) {
                    // Try to insert profile if it doesn't exist (e.g. first login after seed)
                    // Or just use metadata
                    console.warn('Profile not found, using meta', profileError);
                }

                login({
                    id: data.user.id,
                    email: data.user.email!,
                    nombre: profile?.nombre || data.user.user_metadata.nombre || 'Usuario',
                    apellido: profile?.apellido || '',
                    rol: profile?.rol || role,
                    fotoUrl: data.user.user_metadata.avatar_url,
                    fechaRegistro: new Date(data.user.created_at),
                    activo: true
                });

                showToast(`Bienvenido, ${profile?.nombre || 'Usuario'}`, 'success');
                navigate('/dashboard');
            }
        } catch (error: any) {
            console.error('Login error:', error);
            showToast(error.message || 'Error al iniciar sesión', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left Side - Form */}
            <div className="flex items-center justify-center p-8 bg-background">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center space-y-2">
                        <div className="flex justify-center mb-4">
                            <div className="h-12 w-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
                                <GraduationCap className="h-8 w-8" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">Bienvenido a AcademicFlow</h1>
                        <p className="text-muted-foreground">
                            Plataforma de Gestión Académica - CUL
                        </p>
                    </div>

                    <Tabs defaultValue="docente" className="w-full" onValueChange={(v) => setRole(v as any)}>
                        <TabsList className="grid w-full grid-cols-2 mb-8">
                            <TabsTrigger value="docente">
                                <BookOpen className="mr-2 h-4 w-4" />
                                Docente
                            </TabsTrigger>
                            <TabsTrigger value="estudiante">
                                <Users className="mr-2 h-4 w-4" />
                                Estudiante
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="docente">
                            <LoginForm role="docente" isLoading={isLoading} onSubmit={handleLogin} />
                        </TabsContent>
                        <TabsContent value="estudiante">
                            <LoginForm role="estudiante" isLoading={isLoading} onSubmit={handleLogin} />
                        </TabsContent>
                    </Tabs>

                    <p className="px-8 text-center text-sm text-muted-foreground">
                        ¿Olvidaste tu contraseña?{' '}
                        <a href="/forgot-password" className="underline underline-offset-4 hover:text-primary">
                            Recuperar acceso
                        </a>
                    </p>
                </div>
            </div>

            {/* Right Side - Visual */}
            <div className="hidden lg:flex flex-col bg-muted relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-blue-900/90 z-10" />
                <img
                    src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop"
                    alt="University Campus"
                    className="absolute inset-0 object-cover w-full h-full"
                />

                <div className="relative z-20 flex flex-col justify-between h-full p-12 text-white">
                    <div className="flex items-center space-x-2">
                        <GraduationCap className="h-8 w-8" />
                        <span className="text-xl font-bold">Corporación Universitaria Latinoamericana</span>
                    </div>

                    <div className="space-y-6 max-w-lg">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h2 className="text-4xl font-bold leading-tight">
                                Gestiona tu vida académica con excelencia
                            </h2>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                                    <BookOpen className="h-4 w-4" />
                                </div>
                                <p className="text-lg text-white/90">Acceso a recursos bibliográficos</p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                                    <Users className="h-4 w-4" />
                                </div>
                                <p className="text-lg text-white/90">Colaboración en tiempo real</p>
                            </div>
                        </motion.div>
                    </div>

                    <div className="flex justify-between items-end text-white/60 text-sm">
                        <p>© 2026 AcademicFlow CUL. Todos los derechos reservados.</p>
                        <div className="flex space-x-4">
                            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
                            <a href="#" className="hover:text-white transition-colors">Términos</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function LoginForm({ role, isLoading, onSubmit }: { role: string, isLoading: boolean, onSubmit: (e: React.FormEvent, email: string, pass: string) => void }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');


    const handleSubmit = (e: React.FormEvent) => {
        onSubmit(e, email, password);
    };

    return (
        <Card className="border-0 shadow-none">
            <CardHeader className="px-0">
                <CardTitle>Ingreso {role === 'docente' ? 'Docente' : 'Estudiante'}</CardTitle>
                <CardDescription>
                    Ingresa tus credenciales institucionales para continuar.
                </CardDescription>
            </CardHeader>
            <CardContent className="px-0 space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor={`email-${role}`}>Correo Institucional</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id={`email-${role}`}
                                placeholder="usuario@cul.edu.co"
                                className="pl-9"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`password-${role}`}>Contraseña</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id={`password-${role}`}
                                type="password"
                                className="pl-9"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox id={`remember-${role}`} />
                        <Label htmlFor={`remember-${role}`} className="text-sm font-normal">Recordar dispositivo</Label>
                    </div>

                    <Button type="submit" className="w-full text-md py-5" disabled={isLoading}>
                        {isLoading ? (
                            <span className="flex items-center">
                                <span className="h-4 w-4 border-2 border-white/50 border-t-white rounded-full animate-spin mr-2" />
                                Ingresando...
                            </span>
                        ) : (
                            <>
                                Iniciar Sesión <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                        )}

                    </Button>


                </form>
            </CardContent>
        </Card>
    );
}
