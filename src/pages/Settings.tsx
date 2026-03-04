import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Settings as SettingsIcon, 
  Shield, 
  Bell, 
  Database, 
  Link as LinkIcon, 
  Globe,
  Key,
  CreditCard,
  Code,
  Loader2
} from 'lucide-react';

export default function Settings() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/system/status')
      .then(res => res.json())
      .then(data => {
        setStatus(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const sections = [
    {
      title: 'General',
      items: [
        { icon: Globe, label: 'Bahasa & Wilayah', value: 'Indonesia (ID)' },
        { icon: Bell, label: 'Notifikasi', value: 'Aktif' },
        { icon: Shield, label: 'Keamanan Akun', value: 'Tinggi' },
      ]
    },
    {
      title: 'Bridging & Integration',
      items: [
        { icon: LinkIcon, label: 'Google OAuth', value: 'Connected', status: 'success' },
        { icon: CreditCard, label: 'Midtrans Payment', value: 'Sandbox Mode', status: 'warning' },
        { icon: Code, label: 'API Documentation', value: `v${status?.version || '1.2.0'}`, status: 'info' },
        { icon: Database, label: 'Database Status', value: status?.status === 'healthy' ? `SQLite Active (${status.users} Users)` : 'Connection Error', status: status?.status === 'healthy' ? 'success' : 'danger' },
      ]
    },
    {
      title: 'Developer Tools',
      items: [
        { icon: Key, label: 'API Keys', value: 'Manage Keys' },
        { icon: SettingsIcon, label: 'System Logs', value: 'View Logs' },
      ]
    }
  ];

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Pengaturan</h1>
        <p className="text-slate-500 text-sm sm:text-base">Konfigurasi sistem dan integrasi pihak ketiga.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {sections.map((section) => (
          <div key={section.title} className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-1">
              {section.title}
            </h3>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-100">
                {section.items.map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-slate-100 text-slate-500 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
                        <item.icon size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                        <p className="text-xs text-slate-500">{item.value}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.status && (
                        <span className={`w-2 h-2 rounded-full ${
                          item.status === 'success' ? 'bg-emerald-500' : 
                          item.status === 'warning' ? 'bg-amber-500' : 
                          item.status === 'danger' ? 'bg-red-500' : 'bg-blue-500'
                        }`} />
                      )}
                      <SettingsIcon size={16} className="text-slate-300 group-hover:text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 bg-slate-900 rounded-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <h4 className="font-bold">Versi Aplikasi</h4>
          <p className="text-slate-400 text-sm">Palugada Digital v1.2.0-stable</p>
        </div>
        <button className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-semibold transition-all">
          Periksa Pembaruan
        </button>
      </div>
    </motion.div>
  );
}
