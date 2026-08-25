import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Camera, UtensilsCrossed, BookOpen,
  MessageCircle, History, BarChart2, User, Settings,
  LogOut, Menu, X, ChevronRight, Leaf, Info, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import { classNames } from '../utils/formatters';

const navItems = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/food',         icon: Camera,           label: 'Food Recognition' },
  { to: '/meal-analyzer', icon: UtensilsCrossed, label: 'Meal Analyzer' },
  { to: '/diet',         icon: BookOpen,         label: 'Diet Planner' },
  { to: '/assistant',    icon: MessageCircle,    label: 'AI Assistant' },
  { to: '/history',      icon: History,          label: 'Meal History' },
  { to: '/analytics',    icon: BarChart2,        label: 'Analytics' },
];

const bottomItems = [
  { to: '/profile',   icon: User,     label: 'Profile' },
  { to: '/settings',  icon: Settings, label: 'Settings' },
  { to: '/about',     icon: Info,     label: 'About' },
];

function NavItem({ to, icon: Icon, label, mobile = false, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        classNames(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
          mobile ? 'w-full' : '',
          isActive
            ? 'bg-primary-50 text-primary-700'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        )
      }
    >
      <Icon className="h-4.5 w-4.5 shrink-0" style={{ width: '1.125rem', height: '1.125rem' }} />
      <span>{label}</span>
    </NavLink>
  );
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      toast.success('Logged out successfully');
    } catch {
      navigate('/');
    }
  };

  const Sidebar = ({ mobile = false }) => (
    <div className={classNames('flex flex-col h-full', mobile ? '' : 'w-56 shrink-0')}>
      {/* Logo  */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Leaf className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900">NutriAI</div>
            <div className="text-xs text-gray-400 flex items-center gap-0.5">
              <Zap className="h-3 w-3 text-amber-500" />
              AI-Powered
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5 scrollbar-thin">
        {navItems.map((item) => (
          <NavItem key={item.to} {...item} mobile={mobile} onClick={() => setMobileOpen(false)} />
        ))}
        <div className="mt-4 mb-1 px-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Account</div>
        {bottomItems.map((item) => (
          <NavItem key={item.to} {...item} mobile={mobile} onClick={() => setMobileOpen(false)} />
        ))}
      </nav>

      {/* User / Logout */}
      <div className="border-t border-gray-100 px-3 py-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-xs font-semibold text-primary-700">
              {user?.name?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-gray-900 truncate">{user?.name}</div>
            <div className="text-xs text-gray-400 truncate">{user?.email}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col bg-white border-r border-gray-100 shadow-sm">
        <Sidebar />
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="relative h-full w-64 bg-white shadow-xl animate-slide-up">
            <button
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-4 w-4" />
            </button>
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
          <button onClick={() => setMobileOpen(true)} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-1.5">
            <Leaf className="h-4 w-4 text-primary-600" />
            <span className="font-bold text-sm text-gray-900">NutriAI</span>
          </div>
          <div className="w-8" />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 md:px-6 py-5">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
