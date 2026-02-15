import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useStore, useAlertas, useUI } from '@/hooks/useStore';
import { 
  Search, 
  Bell, 
  Calendar, 
  User, 
  Settings, 
  LogOut, 
  Moon,
  Sun,
  ChevronDown,
  AlertTriangle,
  Info
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function Header() {
  const { state } = useStore();
  const { sidebarOpen, showToast } = useUI();
  const { alertas, alertasNoLeidas, marcarLeida, marcarTodasLeidas } = useAlertas();
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  const usuario = state.usuario;
  const today = new Date();

  const getAlertaIcon = (tipo: string) => {
    switch (tipo) {
      case 'riesgo_academico':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'inasistencia':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'fecha_limite':
        return <Calendar className="w-4 h-4 text-blue-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getAlertaColor = (prioridad: string) => {
    switch (prioridad) {
      case 'alta':
        return 'bg-red-50 border-red-200';
      case 'media':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <header
      className={cn(
        'fixed top-0 right-0 h-16 bg-white border-b border-[#dee5eb] z-30 transition-all duration-300',
        sidebarOpen ? 'left-64' : 'left-16'
      )}
    >
      <div className="h-full px-6 flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#99a4af]" />
            <Input
              type="text"
              placeholder="Buscar estudiantes, cursos, recursos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-[#f7f9fa] border-[#dee5eb] focus:bg-white focus:border-[#0070a0] w-full"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-4">
          {/* Date */}
          <div className="hidden md:flex items-center gap-2 text-sm text-[#626a72]">
            <Calendar className="w-4 h-4" />
            <span className="capitalize">
              {format(today, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
            </span>
          </div>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative w-10 h-10 rounded-lg hover:bg-[#f7f9fa] flex items-center justify-center transition-colors">
                <Bell className="w-5 h-5 text-[#626a72]" />
                {alertasNoLeidas.length > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center justify-center animate-pulse">
                    {alertasNoLeidas.length}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notificaciones</span>
                {alertasNoLeidas.length > 0 && (
                  <button 
                    onClick={marcarTodasLeidas}
                    className="text-xs text-[#0070a0] hover:text-[#00577c]"
                  >
                    Marcar todas como leídas
                  </button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-y-auto">
                {alertas.length === 0 ? (
                  <div className="p-4 text-center text-[#99a4af]">
                    No hay notificaciones
                  </div>
                ) : (
                  alertas.slice(0, 5).map((alerta) => (
                    <DropdownMenuItem
                      key={alerta.id}
                      className={cn(
                        'p-3 cursor-pointer border-l-4 mb-1',
                        getAlertaColor(alerta.prioridad),
                        !alerta.leida && 'bg-[#f7f9fa]'
                      )}
                      onClick={() => marcarLeida(alerta.id)}
                    >
                      <div className="flex gap-3">
                        {getAlertaIcon(alerta.tipo)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#1f1f1f] truncate">
                            {alerta.titulo}
                          </p>
                          <p className="text-xs text-[#626a72] line-clamp-2">
                            {alerta.mensaje}
                          </p>
                          <p className="text-xs text-[#99a4af] mt-1">
                            {format(new Date(alerta.fecha), 'dd/MM/yyyy HH:mm')}
                          </p>
                        </div>
                        {!alerta.leida && (
                          <div className="w-2 h-2 bg-[#0070a0] rounded-full flex-shrink-0 mt-1" />
                        )}
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="justify-center text-[#0070a0] cursor-pointer"
                onClick={() => {}}
              >
                Ver todas las notificaciones
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Dark mode toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-10 h-10 rounded-lg hover:bg-[#f7f9fa] flex items-center justify-center transition-colors"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-[#626a72]" />
            ) : (
              <Moon className="w-5 h-5 text-[#626a72]" />
            )}
          </button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 hover:bg-[#f7f9fa] rounded-lg p-2 transition-colors">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={usuario?.fotoUrl} />
                  <AvatarFallback className="bg-[#0070a0] text-white text-sm">
                    {usuario?.nombre?.[0]}{usuario?.apellido?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-[#1f1f1f]">
                    {usuario?.nombre} {usuario?.apellido}
                  </p>
                  <p className="text-xs text-[#99a4af]">Docente</p>
                </div>
                <ChevronDown className="w-4 h-4 text-[#99a4af] hidden md:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => showToast('Perfil en desarrollo', 'info')}>
                <User className="w-4 h-4 mr-2" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => showToast('Configuración en desarrollo', 'info')}>
                <Settings className="w-4 h-4 mr-2" />
                Configuración
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => showToast('Sesión cerrada', 'info')}
                className="text-red-600"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
