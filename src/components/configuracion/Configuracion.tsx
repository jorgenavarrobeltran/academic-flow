import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUI, useAuth } from '@/hooks/useStore';
import { User, Bell, Shield, Save, Globe } from 'lucide-react';

export function Configuracion() {
    const { showToast } = useUI();
    const { usuario } = useAuth();
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState({
        nombre: usuario?.nombre || '',
        apellido: usuario?.apellido || '',
        email: usuario?.email || '',
        titulo: (usuario as any)?.titulo || 'Magister en Educación',
        departamento: (usuario as any)?.departamento || 'Ciencias Básicas',
        bio: (usuario as any)?.bio || 'Docente comprometido con la excelencia académica.',
        fotoUrl: usuario?.fotoUrl || '',
    });

    const resizeImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 150;
                    const MAX_HEIGHT = 150;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.8)); // Reduce quality to 80%
                };
                img.onerror = (error) => reject(error);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showToast('Por favor selecciona un archivo de imagen válido', 'error');
            return;
        }

        try {
            setLoading(true);
            const resizedImage = await resizeImage(file);
            setFormData(prev => ({ ...prev, fotoUrl: resizedImage }));
            showToast('Foto actualizada (cambios pendientes de guardar)', 'info');
        } catch (error) {
            console.error('Error procesando imagen', error);
            showToast('Error al procesar la imagen', 'error');
        } finally {
            setLoading(false);
        }
    };

    const [notifications, setNotifications] = useState({
        alertasEmail: true,
        alertasApp: true,
        nuevosInscritos: true,
        reportesSemanales: false,
    });

    const handleSave = () => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            showToast('Cambios guardados exitosamente', 'success');
        }, 1000);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#1f1f1f]">Configuración</h1>
                    <p className="text-[#626a72]">Administra tu cuenta y preferencias</p>
                </div>
                <Button onClick={handleSave} disabled={loading} className="bg-[#0070a0] hover:bg-[#00577c]">
                    {loading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    ) : (
                        <Save className="w-4 h-4 mr-2" />
                    )}
                    Guardar cambios
                </Button>
            </div>

            <Tabs defaultValue="perfil" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="perfil" className="flex items-center gap-2">
                        <User className="w-4 h-4" /> Perfil
                    </TabsTrigger>
                    <TabsTrigger value="notificaciones" className="flex items-center gap-2">
                        <Bell className="w-4 h-4" /> Notificaciones
                    </TabsTrigger>
                    <TabsTrigger value="cuenta" className="flex items-center gap-2">
                        <Shield className="w-4 h-4" /> Seguridad
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="perfil">
                    <Card>
                        <CardHeader>
                            <CardTitle>Información Personal</CardTitle>
                            <CardDescription>Actualiza tu información pública y de contacto</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-start gap-6">
                                <div className="space-y-2 text-center">
                                    <div className="w-24 h-24 rounded-full bg-slate-100 mx-auto overflow-hidden border-2 border-white shadow-sm group relative">
                                        {formData.fotoUrl ? (
                                            <img src={formData.fotoUrl} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="flex h-full items-center justify-center text-2xl font-bold text-slate-400">
                                                {formData.nombre[0]}{formData.apellido[0]}
                                            </span>
                                        )}
                                        {/* Overlay de carga */}
                                        {loading && (
                                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                                <div className="w-6 h-6 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={loading}
                                    >
                                        Cambiar foto
                                    </Button>
                                </div>

                                <div className="flex-1 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="nombre">Nombre</Label>
                                            <Input
                                                id="nombre"
                                                value={formData.nombre}
                                                onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="apellido">Apellido</Label>
                                            <Input
                                                id="apellido"
                                                value={formData.apellido}
                                                onChange={e => setFormData({ ...formData, apellido: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Institucional</Label>
                                            <Input
                                                id="email"
                                                value={formData.email}
                                                disabled
                                                className="bg-slate-50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="titulo">Título Académico</Label>
                                            <Input
                                                id="titulo"
                                                value={formData.titulo}
                                                onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="bio">Biografía</Label>
                                        <textarea
                                            id="bio"
                                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={formData.bio}
                                            onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                        />
                                        <p className="text-xs text-muted-foreground">Breve descripción para tu perfil público de investigador.</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notificaciones">
                    <Card>
                        <CardHeader>
                            <CardTitle>Preferencias de Notificación</CardTitle>
                            <CardDescription>Elige cómo y cuándo quieres ser contactado</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Alertas por Email</Label>
                                    <p className="text-sm text-muted-foreground">Recibir notificaciones cuando un estudiante esté en riesgo crítico.</p>
                                </div>
                                <Switch
                                    checked={notifications.alertasEmail}
                                    onCheckedChange={checked => setNotifications({ ...notifications, alertasEmail: checked })}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Notificaciones Push en App</Label>
                                    <p className="text-sm text-muted-foreground">Avisos instantáneos sobre eventos del calendario.</p>
                                </div>
                                <Switch
                                    checked={notifications.alertasApp}
                                    onCheckedChange={checked => setNotifications({ ...notifications, alertasApp: checked })}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Nuevas Inscripciones</Label>
                                    <p className="text-sm text-muted-foreground">Notificar cuando un estudiante se inscriba a mis cursos.</p>
                                </div>
                                <Switch
                                    checked={notifications.nuevosInscritos}
                                    onCheckedChange={checked => setNotifications({ ...notifications, nuevosInscritos: checked })}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Reporte Semanal</Label>
                                    <p className="text-sm text-muted-foreground">Resumen de actividad enviado cada lunes.</p>
                                </div>
                                <Switch
                                    checked={notifications.reportesSemanales}
                                    onCheckedChange={checked => setNotifications({ ...notifications, reportesSemanales: checked })}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="cuenta">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Contraseña</CardTitle>
                                <CardDescription>Cambia tu contraseña de acceso</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="current-pass">Contraseña Actual</Label>
                                    <Input id="current-pass" type="password" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="new-pass">Nueva Contraseña</Label>
                                    <Input id="new-pass" type="password" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirm-pass">Confirmar Nueva Contraseña</Label>
                                    <Input id="confirm-pass" type="password" />
                                </div>
                                <Button variant="outline" className="w-full">Actualizar Contraseña</Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Sesiones Activas</CardTitle>
                                <CardDescription>Gestiona tus dispositivos conectados</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50">
                                    <div className="flex items-center gap-3">
                                        <Globe className="w-5 h-5 text-slate-500" />
                                        <div>
                                            <p className="font-medium text-sm">Chrome en macOS (Esta sesión)</p>
                                            <p className="text-xs text-muted-foreground">Barranquilla, CO • Hace un momento</p>
                                        </div>
                                    </div>
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                </div>
                                <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">Cerrar otras sesiones</Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
