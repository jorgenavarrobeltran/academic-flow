
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, X, Send, Bot, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: '¡Hola! Soy tu asistente académico. ¿En qué puedo ayudarte hoy?',
            sender: 'bot',
            timestamp: new Date()
        }
    ]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSendMessage = () => {
        if (!inputValue.trim()) return;

        const newUserMsg: Message = {
            id: Date.now().toString(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newUserMsg]);
        setInputValue('');

        // Simulate bot response
        setTimeout(() => {
            const botResponse = getBotResponse(newUserMsg.text);
            const newBotMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: botResponse,
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, newBotMsg]);
        }, 1000);
    };

    const getBotResponse = (text: string): string => {
        const lowerText = text.toLowerCase();
        if (lowerText.includes('nota') || lowerText.includes('calificacion')) {
            return 'Puedes consultar tus notas detalladas en la sección de "Calificaciones" del menú lateral.';
        }
        if (lowerText.includes('horario') || lowerText.includes('clase')) {
            return 'Tu horario está disponible en el Panel de Control y en la sección de Calendario.';
        }
        if (lowerText.includes('ayuda') || lowerText.includes('soporte')) {
            return 'Si tienes problemas técnicos, por favor contacta a soporte@academiflow.com.';
        }
        return 'Entiendo. Para más detalles, te sugiero revisar la sección de Recursos o contactar a tu docente.';
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
            <AnimatePresence>
                {isOpen && !isMinimized && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="mb-2"
                    >
                        <Card className="w-[350px] md:w-[400px] shadow-2xl border-primary/20 bg-background/95 backdrop-blur-sm">
                            <CardHeader className="p-4 bg-primary text-primary-foreground rounded-t-xl flex flex-row items-center justify-between space-y-0">
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8 bg-white/20 border-white/20">
                                        <AvatarImage src="/bot-avatar.png" />
                                        <AvatarFallback className="bg-white/20 text-white"><Bot className="h-5 w-5" /></AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="text-base font-bold">Asistente Virtual</CardTitle>
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                            <span className="text-xs text-primary-foreground/80">En línea</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground hover:bg-white/20" onClick={() => setIsMinimized(true)}>
                                        <Minimize2 className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground hover:bg-white/20" onClick={() => setIsOpen(false)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div ref={scrollRef} className="h-[400px] overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
                                    {messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={cn(
                                                "flex w-full",
                                                msg.sender === 'user' ? "justify-end" : "justify-start"
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    "max-w-[80%] px-4 py-2.5 rounded-2xl text-sm shadow-sm",
                                                    msg.sender === 'user'
                                                        ? "bg-primary text-primary-foreground rounded-br-none"
                                                        : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-bl-none"
                                                )}
                                            >
                                                <p>{msg.text}</p>
                                                <span className={cn(
                                                    "text-[10px] mt-1 block opacity-70",
                                                    msg.sender === 'user' ? "text-primary-foreground/70 text-right" : "text-muted-foreground"
                                                )}>
                                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                            <CardFooter className="p-3 bg-background border-t">
                                <form
                                    onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                                    className="flex w-full gap-2"
                                >
                                    <Input
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder="Escribe tu consulta..."
                                        className="flex-1 focus-visible:ring-primary/20"
                                    />
                                    <Button type="submit" size="icon" disabled={!inputValue.trim()} className="shrink-0 bg-primary hover:bg-primary/90">
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </form>
                            </CardFooter>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {(!isOpen || isMinimized) && (
                    <motion.div
                        initial={{ scale: 0, rotate: 180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: -180 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    >
                        <Button
                            size="lg"
                            className={cn(
                                "h-14 w-14 rounded-full shadow-xl shadow-primary/30 flex items-center justify-center transition-all bg-primary hover:bg-primary/90",
                                isMinimized && "bg-white text-primary border-2 border-primary hover:bg-slate-50"
                            )}
                            onClick={() => {
                                setIsOpen(true);
                                setIsMinimized(false);
                            }}
                        >
                            {isMinimized ? (
                                <MessageCircle className="h-7 w-7" />
                            ) : (
                                <MessageCircle className="h-7 w-7" />
                            )}
                            {isMinimized && (
                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                </span>
                            )}
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
