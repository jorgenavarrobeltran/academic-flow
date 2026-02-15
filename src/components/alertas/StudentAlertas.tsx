import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAlertas, useCursos, useUI, useAuth } from '@/hooks/useStore';
import {
    Bell,
    CheckCircle,
    XCircle,
    Clock,
    Calendar,
    TrendingDown,
    FileText,
    CheckCheck,
} from 'lucide-react';
import { differenceInDays } from 'date-fns';

const tipoConfig: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
    riesgo_academico: { icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50', label: 'Riesgo Académico' },
    inasistencia: { icon: XCircle, color: 'text-orange-600', bg: 'bg-orange-50', label: 'Inasistencia' },
    fecha_limite: { icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Fecha Límite' },
    entrega_pendiente: { icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50', label: 'Entrega Pendiente' },
    nota_disponible: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'Nota Disponible' },
    general: { icon: Bell, color: 'text-gray-600', bg: 'bg-gray-50', label: 'General' },
};

const prioridadConfig: Record<string, { color: string; label: string }> = {
    alta: { color: 'bg-red-500', label: 'Alta' },
    media: { color: 'bg-orange-500', label: 'Media' },
    baja: { color: 'bg-blue-500', label: 'Baja' },
};

export function StudentAlertas() {
    const { alertas, marcarLeida } = useAlertas();
    const { cursos } = useCursos();
    const { showToast } = useUI();
    const { usuario } = useAuth();

    const misAlertas = useMemo(() => {
        if (!usuario) return [];

        return alertas.filter(a => {
            // 1. Alertas dirigidas específicamente al estudiante
            if (a.estudianteId) {
                return a.estudianteId === usuario.id;
            }

            // 2. Alertas generales del curso (sin estudianteId)
            // Verificar si el estudiante está inscrito en este curso
            if (a.cursoId) {
                return cursos.some(c => c.id === a.cursoId);
            }

            // 3. Ocultar el resto (alertas de otros cursos o globales no dirigidas)
            return false;
        }).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    }, [alertas, usuario, cursos]);

    const alertasNoLeidas = useMemo(() => misAlertas.filter(a => !a.leida), [misAlertas]);

    const handleMarcarLeida = (alertaId: string) => {
        marcarLeida(alertaId);
        showToast('Alerta marcada como leída', 'success');
    };

    const handleMarcarTodas = () => {
        // Solo marcar las mias
        misAlertas.forEach(a => {
            if (!a.leida) marcarLeida(a.id);
        });
        showToast('Todas las alertas marcadas como leídas', 'success');
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#1f1f1f]">Mis Notificaciones</h1>
                    <p className="text-[#626a72]">Mantente al día con tus compromisos académicos</p>
                </div>
                {alertasNoLeidas.length > 0 && (
                    <Button variant="outline" onClick={handleMarcarTodas}>
                        <CheckCheck className="w-4 h-4 mr-2" />
                        Marcar todas leídas
                    </Button>
                )}
            </div>

            {/* Listado */}
            <Card className="border-0 shadow-md">
                <CardContent className="p-4">
                    <div className="space-y-3">
                        {misAlertas.length === 0 ? (
                            <div className="text-center py-12">
                                <Bell className="w-16 h-16 text-[#c2cdd8] mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-[#1f1f1f]">Estás al día</h3>
                                <p className="text-[#626a72]">No tienes nuevas notificaciones.</p>
                            </div>
                        ) : (
                            misAlertas.map(alerta => {
                                const config = tipoConfig[alerta.tipo] || tipoConfig.general;
                                const Icon = config.icon;
                                const diasTranscurridos = differenceInDays(new Date(), new Date(alerta.fecha));
                                const curso = cursos.find(c => c.id === alerta.cursoId);

                                return (
                                    <div
                                        key={alerta.id}
                                        className={`
                            p-4 rounded-lg border-l-4 transition-all
                            ${alerta.leida ? 'bg-[#f7f9fa] border-gray-300' : 'bg-white border-[#0070a0] shadow-md'}
                            `}
                                        style={{ borderLeftColor: alerta.leida ? '#c2cdd8' : undefined }}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${config.bg}`}>
                                                <Icon className={`w-5 h-5 ${config.color}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <h4 className={`font-medium ${alerta.leida ? 'text-[#626a72]' : 'text-[#1f1f1f]'}`}>
                                                                {alerta.titulo}
                                                            </h4>
                                                            <Badge className={`${prioridadConfig[alerta.prioridad].color} text-white text-xs`}>
                                                                {prioridadConfig[alerta.prioridad].label}
                                                            </Badge>
                                                            {!alerta.leida && (
                                                                <span className="w-2 h-2 bg-[#0070a0] rounded-full" />
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-[#626a72] mt-1">{alerta.mensaje}</p>
                                                        <div className="flex items-center gap-4 mt-2 text-xs text-[#99a4af]">
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                {diasTranscurridos === 0 ? 'Hoy' : diasTranscurridos === 1 ? 'Ayer' : `Hace ${diasTranscurridos} días`}
                                                            </span>
                                                            {curso && (
                                                                <span className="font-medium text-[#0070a0]">{curso.nombre}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {!alerta.leida && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleMarcarLeida(alerta.id)}
                                                            className="text-[#0070a0] hover:text-[#00577c]"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
