import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  HandCoins, 
  FileText, 
  Settings as SettingsIcon, 
  ChevronRight,
  Menu,
  X,
  LogOut,
  Bell,
  LogIn
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './types';

// Pages
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Loans from './pages/Loans';
import Savings from './pages/Savings';
import Reports from './pages/Reports';
import Login from './pages/Login';
import Settings from './pages/Settings';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Keanggotaan', href: '/members', icon: Users },
  { name: 'Simpanan', href: '/savings', icon: Wallet },
  { name: 'Pinjaman', href: '/loans', icon: HandCoins },
  { name: 'Laporan', href: '/reports', icon: FileText },
  { name: 'Pengaturan', href: '/settings', icon: SettingsIcon },
];

function Sidebar({ user, onLogout, isOpen, onClose }: { user: any, onLogout: () => void, isOpen: boolean, onClose: () => void }) {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const sidebarContent = (
    <div className={cn(
      "flex flex-col h-full bg-slate-900 text-slate-300 transition-all duration-300 border-r border-slate-800",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
        {!isCollapsed && (
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl font-bold text-white tracking-tight"
          >
            Palugada<span className="text-emerald-500">.</span>
          </motion.span>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors hidden lg:block"
        >
          {isCollapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
        <button 
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors lg:hidden"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className={cn(
                "flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                isActive 
                  ? "bg-emerald-500/10 text-emerald-400" 
                  : "hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon size={20} className={cn(
                "min-w-[20px]",
                isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-white"
              )} />
              {(!isCollapsed || window.innerWidth < 1024) && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="ml-3 font-medium text-sm"
                >
                  {item.name}
                </motion.span>
              )}
              {isActive && (!isCollapsed || window.innerWidth < 1024) && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute right-2 w-1.5 h-1.5 rounded-full bg-emerald-500"
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={onLogout}
          className={cn(
            "flex items-center w-full px-3 py-2 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 group",
            isCollapsed ? "justify-center" : ""
          )}
        >
          <LogOut size={20} className="text-slate-400 group-hover:text-red-400" />
          {(!isCollapsed || window.innerWidth < 1024) && <span className="ml-3 text-sm font-medium">Keluar</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-screen sticky top-0">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 z-50 lg:hidden"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function Header({ user, onMenuClick }: { user: any, onMenuClick: () => void }) {
  return (
    <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg lg:hidden"
        >
          <Menu size={20} />
        </button>
        <h2 className="text-sm font-medium text-slate-500 hidden sm:block">
          Selamat Datang, <span className="text-slate-900 font-semibold">{user?.name || 'User'}</span>
        </h2>
        <span className="text-xl font-bold text-slate-900 lg:hidden">
          Palugada<span className="text-emerald-500">.</span>
        </span>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="h-8 w-8 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-xs uppercase">
          {user?.name?.substring(0, 2) || 'US'}
        </div>
      </div>
    </header>
  );
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        setUser(event.data.user);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login onLogin={setUser} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
        <Sidebar 
          user={user} 
          onLogout={handleLogout} 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header user={user} onMenuClick={() => setIsSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 lg:p-8">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/members" element={<Members />} />
                <Route path="/loans" element={<Loans />} />
                <Route path="/savings" element={<Savings />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/login" element={<Navigate to="/" replace />} />
              </Routes>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </Router>
  );
}
