import { supabase } from './supabase';

interface SendEmailParams {
    to: string[];
    subject: string;
    body: string;
    fromName?: string;
    fromEmail?: string;
}

interface EmailResult {
    to: string;
    status: 'sent' | 'failed';
    id: string | null;
    error: string | null;
}

interface SendEmailResponse {
    success: boolean;
    message: string;
    results?: EmailResult[];
}

/**
 * Send email notifications via Supabase Edge Function + Resend
 */
export async function sendEmail(params: SendEmailParams): Promise<SendEmailResponse> {
    try {
        const { data, error } = await supabase.functions.invoke('send-email', {
            body: {
                to: params.to,
                subject: params.subject,
                body: params.body,
                from_name: params.fromName || 'AcademicFlow CUL',
                from_email: params.fromEmail,
            },
        });

        if (error) {
            console.error('Edge Function error:', error);
            return {
                success: false,
                message: error.message || 'Error conectando con el servicio de email',
            };
        }

        return data as SendEmailResponse;
    } catch (err) {
        console.error('Send email error:', err);
        return {
            success: false,
            message: 'Error de red al enviar el correo. Verifica tu conexión.',
        };
    }
}

/**
 * Send a test email to verify the configuration
 */
export async function sendTestEmail(toEmail: string): Promise<SendEmailResponse> {
    return sendEmail({
        to: [toEmail],
        subject: '✅ Test - AcademicFlow Email Configurado',
        body: `¡Hola!\n\nEste es un correo de prueba de AcademicFlow Pro.\n\nSi recibes este mensaje, tu sistema de notificaciones por email está funcionando correctamente.\n\n¡Listo para enviar alertas académicas a tus estudiantes!\n\n— AcademicFlow CUL`,
    });
}
