import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useUI, useAlertas } from '@/hooks/useStore';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ClipboardCheck,
  GraduationCap,
  Calendar,
  Bell,
  FolderOpen,
  Library,
  Award,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu
} from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

const menuItems: SidebarItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'cursos', label: 'Mis Cursos', icon: BookOpen },
  { id: 'estudiantes', label: 'Estudiantes', icon: Users },
  { id: 'asistencia', label: 'Asistencia', icon: ClipboardCheck },
  { id: 'calificaciones', label: 'Calificaciones', icon: GraduationCap },
  { id: 'grupos', label: 'Grupos', icon: FolderOpen },
  { id: 'calendario', label: 'Calendario', icon: Calendar },
  { id: 'alertas', label: 'Alertas', icon: Bell, badge: 0 },
  { id: 'recursos', label: 'Recursos', icon: Library },
  { id: 'convocatorias', label: 'Convocatorias', icon: Award },
];

const bottomItems: SidebarItem[] = [
  { id: 'configuracion', label: 'Configuración', icon: Settings },
];

export function Sidebar() {
  const { sidebarOpen, toggleSidebar, setActiveTab, activeTab } = useUI();
  const { contadorNoLeidas } = useAlertas();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleItemClick = (itemId: string) => {
    setActiveTab(itemId);
    setMobileMenuOpen(false);
  };

  const renderMenuItem = (item: SidebarItem, isBottom = false) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    const badge = item.id === 'alertas' ? contadorNoLeidas : item.badge;

    return (
      <button
        key={item.id}
        onClick={() => handleItemClick(item.id)}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative',
          isActive
            ? 'bg-[#0070a0] text-white'
            : 'text-[#626a72] hover:bg-[#e6f7ff] hover:text-[#0070a0]',
          !sidebarOpen && !isBottom && 'justify-center px-2'
        )}
      >
        <Icon className={cn(
          'w-5 h-5 flex-shrink-0',
          isActive ? 'text-white' : 'text-[#99a4af] group-hover:text-[#0070a0]'
        )} />

        {(sidebarOpen || isBottom) && (
          <span className="text-sm font-medium truncate">{item.label}</span>
        )}

        {badge !== undefined && badge > 0 && (
          <span className={cn(
            'ml-auto text-xs font-semibold px-2 py-0.5 rounded-full',
            isActive
              ? 'bg-white text-[#0070a0]'
              : 'bg-red-500 text-white'
          )}>
            {badge}
          </span>
        )}

        {/* Tooltip para modo colapsado */}
        {!sidebarOpen && !isBottom && (
          <div className="absolute left-full ml-2 px-2 py-1 bg-[#1f1f1f] text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
            {item.label}
          </div>
        )}
      </button>
    );
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center text-[#1f1f1f]"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full bg-white border-r border-[#dee5eb] z-40 transition-all duration-300',
          sidebarOpen ? 'w-64' : 'w-16',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className={cn(
          'h-16 flex items-center border-b border-[#dee5eb] px-4',
          !sidebarOpen && 'justify-center px-2'
        )}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0070a0] rounded-xl flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <h1 className="font-bold text-[#1f1f1f] text-lg leading-tight">AcademiFlow</h1>
                <p className="text-xs text-[#99a4af]">Jorge Navarro Beltran</p>
              </div>
            )}
          </div>
        </div>

        {/* Main menu */}
        <div className="p-3 space-y-1 overflow-y-auto" style={{ height: 'calc(100% - 140px)' }}>
          {menuItems.map(item => renderMenuItem(item))}
        </div>

        {/* Bottom section */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-[#dee5eb] bg-white">
          {bottomItems.map(item => renderMenuItem(item, true))}

          <button
            onClick={() => { }}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-[#626a72] hover:bg-red-50 hover:text-red-600 mt-1',
              !sidebarOpen && 'justify-center px-2'
            )}
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm font-medium">Cerrar Sesión</span>}
          </button>
        </div>

        {/* Toggle button */}
        <button
          onClick={toggleSidebar}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-[#0070a0] text-white rounded-full items-center justify-center shadow-lg hover:bg-[#00577c] transition-colors"
        >
          {sidebarOpen ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>
      </aside>
    </>
  );
}
