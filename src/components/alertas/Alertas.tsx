import { useState, useMemo } from 'react';
import { sendEmail, sendTestEmail } from '@/lib/email';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAlertas, useCursos, useUI, useAuth } from '@/hooks/useStore';
import { StudentAlertas } from './StudentAlertas';
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  TrendingDown,
  Users,
  FileText,
  CheckCheck,
  Trash2,
  Mail,
  Send,
  MailCheck,
  MailWarning,
  X,
  Copy,
  Sparkles,
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Alerta } from '@/types';

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

// Email templates for common scenarios
const emailTemplates = [
  {
    id: 'riesgo_inasistencia',
    nombre: '⚠️ Alerta de Inasistencia',
    asunto: 'Alerta Académica - Riesgo de pérdida por inasistencias',
    cuerpo: `Estimado/a {nombre_estudiante},

Le informo que según el registro de asistencia del curso {nombre_curso} (Grupo {grupo}), usted acumula un {porcentaje_fallas}% de inasistencias.

De acuerdo con el Reglamento Estudiantil de la CUL, el máximo permitido es del 20%. Si supera este límite, la asignatura se pierde con nota de 0.0.

Le recomiendo:
• Asistir a todas las clases restantes
• Presentar excusas médicas justificadas si las tiene
• Comunicarse conmigo para revisar su situación

Atentamente,
{nombre_docente}
Docente - {nombre_curso}
Universidad Libre - Seccional Barranquilla`,
  },
  {
    id: 'bajo_rendimiento',
    nombre: '📉 Bajo Rendimiento',
    asunto: 'Alerta Académica - Bajo rendimiento en {nombre_curso}',
    cuerpo: `Estimado/a {nombre_estudiante},

Le informo que su rendimiento académico en el curso {nombre_curso} presenta una situación de riesgo. Su nota acumulada hasta el momento es de {nota_actual}/5.0.

Recuerde que la nota mínima aprobatoria es de 3.0. Si su nota final queda entre 2.0 y 3.0, podrá presentar examen de habilitación (máximo 2 materias).

Le sugiero:
• Asistir a las tutorías y asesorías disponibles
• Revisar el material de apoyo en la plataforma
• Prepararse con anticipación para los próximos cortes

Quedo atento/a para agendar una tutoría personalizada.

Atentamente,
{nombre_docente}
Docente - {nombre_curso}
Universidad Libre - Seccional Barranquilla`,
  },
  {
    id: 'fecha_limite_entrega',
    nombre: '📅 Recordatorio de Entrega',
    asunto: 'Recordatorio - Entrega próxima en {nombre_curso}',
    cuerpo: `Estimado/a {nombre_estudiante},

Le recuerdo que la fecha límite para la entrega de {nombre_entrega} del curso {nombre_curso} es el {fecha_limite}.

Especificaciones:
• Formato: Según normas ICONTEC/APA
• Medio: Plataforma institucional
• Hora límite: 11:59 PM

Si tiene dudas sobre el contenido o formato, por favor contácteme antes de la fecha de entrega.

Atentamente,
{nombre_docente}
Docente - {nombre_curso}
Universidad Libre - Seccional Barranquilla`,
  },
  {
    id: 'nota_disponible',
    nombre: '📊 Nota Disponible',
    asunto: 'Nota disponible - {nombre_curso} - Corte {num_corte}',
    cuerpo: `Estimado/a {nombre_estudiante},

Le informo que la nota del Corte {num_corte} del curso {nombre_curso} ya se encuentra disponible en la plataforma.

Su nota: {nota_corte}/5.0

Si tiene alguna observación sobre la calificación, dispone de {dias_correccion} días hábiles para presentar reclamación formal.

Atentamente,
{nombre_docente}
Docente - {nombre_curso}
Universidad Libre - Seccional Barranquilla`,
  },
];

interface EmailDraft {
  destinatarios: string[];
  asunto: string;
  cuerpo: string;
  alertaId?: string;
}

export function Alertas() {
  const { alertas, alertasNoLeidas, alertasRiesgo, marcarLeida, marcarTodasLeidas } = useAlertas();
  const { cursos } = useCursos();
  const { showToast } = useUI();
  const { usuario } = useAuth();

  if (usuario?.rol === 'estudiante') {
    return <StudentAlertas />;
  }

  const [filtroTipo, setFiltroTipo] = useState<string>('todas');
  const [filtroPrioridad, setFiltroPrioridad] = useState<string>('todas');
  const [emailPanelOpen, setEmailPanelOpen] = useState(false);
  const [emailDraft, setEmailDraft] = useState<EmailDraft>({ destinatarios: [], asunto: '', cuerpo: '' });
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailsSent, setEmailsSent] = useState<{ to: string; subject: string; date: Date; status: 'sent' | 'failed' }[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [customRecipient, setCustomRecipient] = useState('');
  const [cursoFiltro, setCursoFiltro] = useState<string>('todos');

  const alertasFiltradas = useMemo(() => {
    return alertas.filter(alerta => {
      const matchTipo = filtroTipo === 'todas' || alerta.tipo === filtroTipo;
      const matchPrioridad = filtroPrioridad === 'todas' || alerta.prioridad === filtroPrioridad;
      const matchCurso = cursoFiltro === 'todos' || alerta.cursoId === cursoFiltro;
      return matchTipo && matchPrioridad && matchCurso;
    }).sort((a, b) => {
      if (a.leida !== b.leida) return a.leida ? 1 : -1;
      const prioridadOrder: Record<string, number> = { alta: 0, media: 1, baja: 2 };
      if (prioridadOrder[a.prioridad] !== prioridadOrder[b.prioridad]) {
        return prioridadOrder[a.prioridad] - prioridadOrder[b.prioridad];
      }
      return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
    });
  }, [alertas, filtroTipo, filtroPrioridad, cursoFiltro]);

  const getEstudiante = (estudianteId?: string) => {
    if (!estudianteId) return null;
    // Buscar estudiante en los cursos cargados en memoria
    for (const curso of cursos) {
      if (curso.estudiantes) {
        const found = curso.estudiantes.find(e => e.estudianteId === estudianteId);
        if (found) return found;
      }
    }
    return null;
  };

  const handleMarcarLeida = (alertaId: string) => {
    marcarLeida(alertaId);
    showToast('Alerta marcada como leída', 'success');
  };

  const handleMarcarTodas = () => {
    marcarTodasLeidas();
    showToast('Todas las alertas marcadas como leídas', 'success');
  };

  // Email functions
  const openEmailFromAlert = (alerta: Alerta) => {
    const estudiante = getEstudiante(alerta.estudianteId);
    const curso = cursos.find(c => c.id === alerta.cursoId);

    // Auto-select template based on alert type
    let template = emailTemplates.find(t => {
      if (alerta.tipo === 'inasistencia') return t.id === 'riesgo_inasistencia';
      if (alerta.tipo === 'riesgo_academico') return t.id === 'bajo_rendimiento';
      if (alerta.tipo === 'fecha_limite' || alerta.tipo === 'entrega_pendiente') return t.id === 'fecha_limite_entrega';
      if (alerta.tipo === 'nota_disponible') return t.id === 'nota_disponible';
      return false;
    });

    let asunto = template?.asunto || `Notificación: ${alerta.titulo}`;
    let cuerpo = template?.cuerpo || alerta.mensaje;

    // Replace placeholders
    const replacements: Record<string, string> = {
      '{nombre_estudiante}': estudiante ? `${estudiante.nombre || ''} ${estudiante.apellido || ''}`.trim() : 'Estudiante',
      '{nombre_curso}': curso?.nombre || 'Curso',
      '{grupo}': curso?.grupo || '',
      '{nombre_docente}': 'Juan Pérez',
      '{porcentaje_fallas}': '19',
      '{nota_actual}': '2.8',
      '{nombre_entrega}': 'Marco Teórico',
      '{fecha_limite}': format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: es }),
      '{num_corte}': '1',
      '{nota_corte}': '3.5',
      '{dias_correccion}': '3',
    };

    Object.entries(replacements).forEach(([key, val]) => {
      asunto = asunto.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), val);
      cuerpo = cuerpo.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), val);
    });

    setEmailDraft({
      destinatarios: estudiante ? [(estudiante.email || '').toLowerCase()] : [],
      asunto,
      cuerpo,
      alertaId: alerta.id,
    });
    setSelectedTemplate(template?.id || '');
    setEmailPanelOpen(true);
  };

  const applyTemplate = (templateId: string) => {
    const template = emailTemplates.find(t => t.id === templateId);
    if (!template) return;
    setSelectedTemplate(templateId);
    setEmailDraft(prev => ({
      ...prev,
      asunto: template.asunto,
      cuerpo: template.cuerpo,
    }));
  };

  const addRecipient = () => {
    if (customRecipient && customRecipient.includes('@')) {
      setEmailDraft(prev => ({
        ...prev,
        destinatarios: [...prev.destinatarios, customRecipient],
      }));
      setCustomRecipient('');
    }
  };

  const removeRecipient = (email: string) => {
    setEmailDraft(prev => ({
      ...prev,
      destinatarios: prev.destinatarios.filter(d => d !== email),
    }));
  };

  const addAllStudentsFromCourse = (cursoId: string) => {
    const curso = cursos.find(c => c.id === cursoId);
    if (!curso?.estudiantes) return;
    const emails = curso.estudiantes.map(e => {
      // En un entorno real, el email debería estar en el objeto estudiante
      // Si no está, lo generamos o usamos un campo si existiera
      return e.email || `${(e.nombre || '').toLowerCase()}.${(e.apellido || '').toLowerCase()}@unilibre.edu.co`;
    }).filter(e => e.includes('@'));
    setEmailDraft(prev => ({
      ...prev,
      destinatarios: [...new Set([...prev.destinatarios, ...emails])],
    }));
    showToast(`${emails.length} destinatarios añadidos`, 'success');
  };

  const handleSendEmail = async () => {
    if (emailDraft.destinatarios.length === 0) {
      showToast('Agrega al menos un destinatario', 'error');
      return;
    }
    if (!emailDraft.asunto.trim()) {
      showToast('El asunto es obligatorio', 'error');
      return;
    }

    setSendingEmail(true);

    try {
      // Send via Resend Edge Function
      const response = await sendEmail({
        to: emailDraft.destinatarios,
        subject: emailDraft.asunto,
        body: emailDraft.cuerpo,
      });

      const newEmails = response.results
        ? response.results.map(r => ({
          to: r.to,
          subject: emailDraft.asunto,
          date: new Date(),
          status: r.status as 'sent' | 'failed',
        }))
        : emailDraft.destinatarios.map(to => ({
          to,
          subject: emailDraft.asunto,
          date: new Date(),
          status: response.success ? 'sent' as const : 'failed' as const,
        }));

      setEmailsSent(prev => [...newEmails, ...prev]);
      setEmailPanelOpen(false);
      setEmailDraft({ destinatarios: [], asunto: '', cuerpo: '' });

      const sentCount = newEmails.filter(e => e.status === 'sent').length;
      const failedCount = newEmails.filter(e => e.status === 'failed').length;

      if (failedCount === 0) {
        showToast(`✉️ ${sentCount} correo${sentCount > 1 ? 's' : ''} enviado${sentCount > 1 ? 's' : ''} exitosamente`, 'success');
      } else {
        showToast(`✉️ ${sentCount} enviados, ${failedCount} fallidos — ${response.message}`, 'error');
      }

      // Mark the alert as read if it was from an alert
      if (emailDraft.alertaId) {
        marcarLeida(emailDraft.alertaId);
      }
    } catch (err) {
      showToast(`Error al enviar: ${(err as Error).message}`, 'error');
    } finally {
      setSendingEmail(false);
    }
  };

  const openComposeEmail = () => {
    setEmailDraft({ destinatarios: [], asunto: '', cuerpo: '' });
    setSelectedTemplate('');
    setEmailPanelOpen(true);
  };

  const handleTestEmail = async () => {
    const testTo = prompt('¿A qué correo enviar la prueba?', 'tu_email@gmail.com');
    if (!testTo) return;
    setTestingEmail(true);
    const result = await sendTestEmail(testTo);
    setTestingEmail(false);
    if (result.success) {
      showToast(`✅ Email de prueba enviado a ${testTo}`, 'success');
      setEmailsSent(prev => [{ to: testTo, subject: 'Test AcademicFlow', date: new Date(), status: 'sent' }, ...prev]);
    } else {
      showToast(`❌ Error: ${result.message}`, 'error');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1f1f1f]">Centro de Alertas y Notificaciones</h1>
          <p className="text-[#626a72]">Gestiona alertas y envía notificaciones por email a tus estudiantes</p>
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
          <Button variant="outline" onClick={() => setShowHistory(!showHistory)}>
            <MailCheck className="w-4 h-4 mr-2" />
            Historial ({emailsSent.length})
          </Button>
          <Button variant="outline" onClick={handleTestEmail} disabled={testingEmail}>
            {testingEmail ? (
              <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin mr-2" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            {testingEmail ? 'Enviando...' : 'Probar Email'}
          </Button>
          <Button onClick={openComposeEmail} className="bg-[#0070a0] hover:bg-[#00577c]">
            <Mail className="w-4 h-4 mr-2" />
            Redactar Email
          </Button>
          {alertasNoLeidas.length > 0 && (
            <Button variant="outline" onClick={handleMarcarTodas}>
              <CheckCheck className="w-4 h-4 mr-2" />
              Marcar todas leídas
            </Button>
          )}
        </div>
      </div>

      {/* Email Send History */}
      {showHistory && emailsSent.length > 0 && (
        <Card className="border-0 shadow-md bg-gradient-to-r from-slate-50 to-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <MailCheck className="w-5 h-5 text-blue-600" />
              Historial de Emails Enviados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {emailsSent.map((email, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/80 text-sm">
                  <div className="flex items-center gap-2">
                    {email.status === 'sent'
                      ? <MailCheck className="w-4 h-4 text-green-500" />
                      : <MailWarning className="w-4 h-4 text-red-500" />
                    }
                    <span className="font-medium">{email.to}</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span className="truncate max-w-[200px]">{email.subject}</span>
                    <span>{format(email.date, "HH:mm")}</span>
                    <Badge variant={email.status === 'sent' ? 'default' : 'destructive'} className="text-xs">
                      {email.status === 'sent' ? 'Enviado' : 'Fallido'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-[#626a72]">Total Alertas</p>
              <p className="text-2xl font-bold">{alertas.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Bell className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-[#626a72]">No Leídas</p>
              <p className="text-2xl font-bold">{alertasNoLeidas.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-[#626a72]">Riesgo Alto</p>
              <p className="text-2xl font-bold">{alertasRiesgo.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Mail className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-[#626a72]">Emails Enviados</p>
              <p className="text-2xl font-bold">{emailsSent.filter(e => e.status === 'sent').length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Tabs value={filtroTipo} onValueChange={setFiltroTipo} className="flex-1">
              <TabsList className="grid grid-cols-4 md:grid-cols-7">
                <TabsTrigger value="todas">Todas</TabsTrigger>
                <TabsTrigger value="riesgo_academico">Riesgo</TabsTrigger>
                <TabsTrigger value="inasistencia">Inasist.</TabsTrigger>
                <TabsTrigger value="fecha_limite">Fechas</TabsTrigger>
                <TabsTrigger value="entrega_pendiente">Entregas</TabsTrigger>
                <TabsTrigger value="nota_disponible">Notas</TabsTrigger>
                <TabsTrigger value="general">General</TabsTrigger>
              </TabsList>
            </Tabs>

            <Tabs value={filtroPrioridad} onValueChange={setFiltroPrioridad}>
              <TabsList>
                <TabsTrigger value="todas">Prioridad</TabsTrigger>
                <TabsTrigger value="alta">Alta</TabsTrigger>
                <TabsTrigger value="media">Media</TabsTrigger>
                <TabsTrigger value="baja">Baja</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Alert List */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Alertas ({alertasFiltradas.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alertasFiltradas.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-16 h-16 text-[#c2cdd8] mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[#1f1f1f]">No hay alertas</h3>
                <p className="text-[#626a72]">No se encontraron alertas con los filtros seleccionados</p>
              </div>
            ) : (
              alertasFiltradas.map((alerta) => {
                const config = tipoConfig[alerta.tipo];
                const Icon = config.icon;
                const estudiante = getEstudiante(alerta.estudianteId);
                const diasTranscurridos = differenceInDays(new Date(), new Date(alerta.fecha));

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

                            <div className="flex items-center gap-4 mt-2 text-xs text-[#99a4af] flex-wrap">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {diasTranscurridos === 0
                                  ? 'Hoy'
                                  : diasTranscurridos === 1
                                    ? 'Ayer'
                                    : `Hace ${diasTranscurridos} días`
                                }
                              </span>
                              <span className="flex items-center gap-1">
                                {format(new Date(alerta.fecha), 'dd/MM/yyyy')}
                              </span>
                              {estudiante && (
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {estudiante.nombre} {estudiante.apellido}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEmailFromAlert(alerta)}
                              className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                              title="Enviar notificación por email"
                            >
                              <Mail className="w-4 h-4 mr-1" />
                              <span className="hidden md:inline">Notificar</span>
                            </Button>
                            {!alerta.leida && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarcarLeida(alerta.id)}
                                className="text-[#0070a0] hover:text-[#00577c]"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                <span className="hidden md:inline">Leída</span>
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => showToast('Alerta eliminada', 'info')}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
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

      {/* Email Compose Modal */}
      {emailPanelOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Redactar Notificación por Email
                </CardTitle>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => setEmailPanelOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* Template selector */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">
                  <Sparkles className="w-3 h-3 inline mr-1" />
                  Plantilla
                </label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                  value={selectedTemplate}
                  onChange={(e) => applyTemplate(e.target.value)}
                >
                  <option value="">Seleccionar plantilla...</option>
                  {emailTemplates.map(t => (
                    <option key={t.id} value={t.id}>{t.nombre}</option>
                  ))}
                </select>
              </div>

              {/* Recipients */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Destinatarios</label>
                <div className="flex flex-wrap gap-1 mb-2">
                  {emailDraft.destinatarios.map(email => (
                    <Badge key={email} variant="secondary" className="flex items-center gap-1 px-2 py-1">
                      {email}
                      <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => removeRecipient(email)} />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="email@unilibre.edu.co"
                    value={customRecipient}
                    onChange={e => setCustomRecipient(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addRecipient()}
                    className="flex-1"
                  />
                  <Button variant="outline" size="sm" onClick={addRecipient}>Agregar</Button>
                </div>
                {/* Quick add course students */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {cursos.filter(c => c.activo).slice(0, 4).map(c => (
                    <Button
                      key={c.id}
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => addAllStudentsFromCourse(c.id)}
                    >
                      <Users className="w-3 h-3 mr-1" />
                      + {c.grupo}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Asunto</label>
                <Input
                  value={emailDraft.asunto}
                  onChange={e => setEmailDraft(prev => ({ ...prev, asunto: e.target.value }))}
                  placeholder="Asunto del correo"
                />
              </div>

              {/* Body */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Mensaje</label>
                <textarea
                  className="w-full min-h-[250px] border rounded-md px-3 py-2 text-sm bg-background resize-y font-mono"
                  value={emailDraft.cuerpo}
                  onChange={e => setEmailDraft(prev => ({ ...prev, cuerpo: e.target.value }))}
                  placeholder="Cuerpo del correo..."
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(emailDraft.cuerpo);
                      showToast('Texto copiado al portapapeles', 'success');
                    }}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copiar
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setEmailPanelOpen(false)}>
                    Cancelar
                  </Button>
                  <Button
                    className="bg-indigo-600 hover:bg-indigo-700"
                    onClick={handleSendEmail}
                    disabled={sendingEmail}
                  >
                    {sendingEmail ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Enviar ({emailDraft.destinatarios.length})
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
