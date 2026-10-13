import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import {
  BookOpen,
  LayoutDashboard,
  Layers,
  Repeat,
  History,
  Settings,
  LogOut,
  User as UserIcon,
} from 'lucide-react';

export function AppShell() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const navItems = [
    { name: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
    { name: 'Revisions', path: '/app/revisions', icon: Repeat },
    { name: 'Subjects', path: '/app/subjects', icon: Layers },
    { name: 'History', path: '/app/history', icon: History },
    { name: 'Settings', path: '/app/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex-shrink-0 flex flex-col justify-between">
        <div>
          <div className="h-16 flex items-center space-x-3 px-6 border-b border-slate-200">
            <div className="bg-sky-600 p-2 rounded-lg text-white">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">ReviseMind</span>
          </div>

          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-sky-50 text-sky-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Sign Out */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center space-x-3 mb-3 px-2">
            <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}
