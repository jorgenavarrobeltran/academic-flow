import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
    LayoutDashboard,
    BookOpen,
    Users,
    Calendar,
    FileText,
    LogOut,
    Menu,
    GraduationCap,
    BookMarked,
    Bell,
    FolderOpen,
    Megaphone,
    PieChart,
    Settings,
    ShieldAlert,
    ListChecks,
    FileQuestion,
    Briefcase
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/button';
import Chatbot from '../components/chatbot/Chatbot';
import { useAuth } from '../hooks/useStore';

export default function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const { usuario, isAuthenticated } = useAuth();

    // Close sidebar on mobile on initial load
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };

        // Set initial state
        if (window.innerWidth < 768) {
            setSidebarOpen(false);
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Protect all routes wrapped by Layout
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const handleLogout = () => {
        // In a real app, clear auth state here
        navigate('/login');
    };

    const allNavItems = [
        { icon: LayoutDashboard, label: 'Panel de Control', path: '/dashboard', roles: ['docente', 'estudiante'] },
        { icon: BookOpen, label: 'Mis Cursos', path: '/courses', roles: ['docente', 'estudiante'] },
        { icon: GraduationCap, label: 'Estudiantes', path: '/students', roles: ['docente'] },
        { icon: Users, label: 'Asistencia', path: '/attendance', roles: ['docente', 'estudiante'] },
        { icon: FileText, label: 'Calificaciones', path: '/grades', roles: ['docente', 'estudiante'] },
        { icon: BookMarked, label: 'Grupos', path: '/groups', roles: ['docente', 'estudiante'] },
        { icon: Calendar, label: 'Calendario', path: '/calendar', roles: ['docente', 'estudiante'] },
        { icon: Bell, label: 'Alertas', path: '/alerts', roles: ['docente', 'estudiante'] },
        { icon: FolderOpen, label: 'Recursos', path: '/resources', roles: ['docente', 'estudiante'] },
        { icon: Megaphone, label: 'Convocatorias', path: '/convocatorias', roles: ['docente', 'estudiante'] },
        { icon: FileQuestion, label: 'Evaluaciones', path: '/evaluations', roles: ['docente', 'estudiante'] },
        { icon: ListChecks, label: 'Rúbricas', path: '/rubrics', roles: ['docente'] },
        { icon: Briefcase, label: 'Portafolio', path: '/portfolio', roles: ['docente', 'estudiante'] },
        { icon: PieChart, label: 'Reportes', path: '/reports', roles: ['docente'] },
        { icon: ShieldAlert, label: 'Detección Riesgos', path: '/early-warning', roles: ['docente'] },
        { icon: Settings, label: 'Configuración', path: '/settings', roles: ['docente', 'estudiante'] },
    ];

    const navItems = allNavItems.filter(item => item.roles.includes(usuario?.rol || 'docente'));

    return (
        <>
            <div className="flex h-screen bg-background overflow-hidden selection:bg-primary/20">
                {/* Mobile Sidebar Overlay */}
                <AnimatePresence>
                    {sidebarOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-sm"
                            onClick={() => setSidebarOpen(false)}
                        />
                    )}
                </AnimatePresence>

                {/* Sidebar with Glassmorphism */}
                <aside
                    className={cn(
                        "fixed inset-y-0 left-0 z-50 w-64 border-r border-white/20 transition-all duration-300 ease-in-out md:relative",
                        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-[80px]",
                        "bg-white/80 backdrop-blur-xl shadow-xl" // Glass effect
                    )}
                >
                    <div className="flex flex-col h-full">
                        {/* Logo */}
                        <div className="h-20 flex items-center justify-center border-b border-primary/10 px-4">
                            <div className="p-2 bg-primary/10 rounded-xl">
                                <GraduationCap className="h-8 w-8 text-primary shrink-0" />
                            </div>
                            <span className={cn(
                                "ml-3 font-bold text-lg text-primary transition-all duration-300",
                                !sidebarOpen ? "md:hidden w-0 opacity-0" : "block w-auto opacity-100"
                            )}>
                                AcademiFlow
                            </span>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) => cn(
                                        "flex items-center px-3 py-3 rounded-xl transition-all duration-200 group relative",
                                        isActive
                                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                            : "text-muted-foreground hover:bg-white/50 hover:text-foreground hover:shadow-sm",
                                        !sidebarOpen && "justify-center"
                                    )}
                                >
                                    <item.icon className={cn(
                                        "h-5 w-5 shrink-0 transition-transform duration-300",
                                        !sidebarOpen && "group-hover:scale-110"
                                    )} />
                                    <span className={cn(
                                        "ml-3 font-medium transition-all duration-300",
                                        !sidebarOpen ? "md:hidden w-0 opacity-0 overflow-hidden" : "block w-auto opacity-100"
                                    )}>
                                        {item.label}
                                    </span>

                                    {/* Tooltip for collapsed mode */}
                                    {!sidebarOpen && (
                                        <div className="absolute left-full ml-4 px-3 py-1.5 bg-foreground text-background text-xs font-medium rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
                                            {item.label}
                                        </div>
                                    )}
                                </NavLink>
                            ))}
                        </nav>

                        {/* User Profile & Logout */}
                        <div className="p-4 border-t border-primary/10 bg-gradient-to-t from-white/50 to-transparent">
                            <div className={cn(
                                "flex items-center mb-4 transition-all",
                                !sidebarOpen && "justify-center"
                            )}>
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shrink-0 border-2 border-white shadow-md">
                                    <span className="font-bold text-white text-sm">
                                        {usuario?.nombre?.[0]}{usuario?.apellido?.[0] || ''}
                                    </span>
                                </div>
                                <div className={cn(
                                    "ml-3 overflow-hidden transition-all duration-300",
                                    !sidebarOpen ? "md:hidden w-0 opacity-0" : "w-auto opacity-100"
                                )}>
                                    <p className="text-sm font-semibold text-foreground truncate">
                                        {usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Invitado'}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate font-medium">{usuario?.rol || 'Usuario'} Principal</p>
                                </div>
                            </div>

                            <Button
                                variant="ghost"
                                className={cn(
                                    "w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50/80 rounded-xl",
                                    !sidebarOpen && "justify-center px-0"
                                )}
                                onClick={handleLogout}
                            >
                                <LogOut className="h-5 w-5 shrink-0" />
                                <span className={cn(
                                    "ml-2 transition-all duration-300",
                                    !sidebarOpen ? "md:hidden w-0 opacity-0" : "block w-auto opacity-100"
                                )}>
                                    Cerrar Sesión
                                </span>
                            </Button>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-slate-50/50">
                    {/* Top Header Glass */}
                    <header className="h-16 bg-white/70 backdrop-blur-md border-b border-white/20 flex items-center justify-between px-6 z-10 sticky top-0 shadow-sm">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="md:block hidden hover:bg-black/5 rounded-xl"
                        >
                            <Menu className="h-5 w-5 text-muted-foreground" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="md:hidden block"
                        >
                            <Menu className="h-5 w-5 text-muted-foreground" />
                        </Button>

                        <div className="flex items-center space-x-4">
                            <div className="px-4 py-1.5 bg-white/50 rounded-full border border-white/40 shadow-sm">
                                <span className="text-sm font-medium text-muted-foreground">
                                    {new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </span>
                            </div>
                        </div>
                    </header>

                    {/* Page Content with Transitions */}
                    <div className="flex-1 overflow-auto p-6 relative">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className="h-full"
                            >
                                <Outlet />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </div>
            <Chatbot />
        </>
    );
}
