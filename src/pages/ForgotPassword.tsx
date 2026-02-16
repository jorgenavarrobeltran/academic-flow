
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { useUI } from '../hooks/useStore';

export default function ForgotPassword() {
    const navigate = useNavigate();
    const { showToast } = useUI();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Mock API call
        setTimeout(() => {
            setIsLoading(false);
            setIsSubmitted(true);
            showToast('Correo de recuperación enviado', 'success');
        }, 1500);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
            <Card className="w-full max-w-md shadow-lg border-primary/10">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <GraduationCap className="h-8 w-8" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Recuperar Contraseña</CardTitle>
                    <CardDescription>
                        {!isSubmitted
                            ? "Ingresa tu correo institucional y te enviaremos las instrucciones."
                            : "Revisa tu bandeja de entrada."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!isSubmitted ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Correo Institucional</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        placeholder="usuario@academiflow.com"
                                        className="pl-9"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={isLoading}
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading || !email}>
                                {isLoading ? "Enviando..." : "Enviar Instrucciones"}
                            </Button>
                        </form>
                    ) : (
                        <div className="flex flex-col items-center space-y-4 py-4 animate-in fade-in zoom-in duration-300">
                            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="font-medium text-lg">¡Correo Enviado!</h3>
                                <p className="text-sm text-muted-foreground">
                                    Hemos enviado un enlace de recuperación a <strong>{email}</strong>.
                                    Por favor revisa tu bandeja de entrada (y spam).
                                </p>
                            </div>
                            <Button variant="outline" className="w-full" onClick={() => setIsSubmitted(false)}>
                                Intentar con otro correo
                            </Button>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-center border-t p-4 bg-slate-50/50">
                    <Button variant="link" size="sm" className="text-muted-foreground hover:text-primary" onClick={() => navigate('/login')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver al inicio de sesión
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
