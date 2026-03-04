import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  HandCoins,
  Clock
} from 'lucide-react';
import { Loan } from '../types';
import { cn } from '../types';

export default function Dashboard() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [memberCount, setMemberCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/loans').then(res => res.json()).catch(() => []),
      fetch('/api/members').then(res => res.json()).catch(() => [])
    ]).then(([loansData, membersData]) => {
      setLoans(Array.isArray(loansData) ? loansData : []);
      setMemberCount(Array.isArray(membersData) ? membersData.length : 0);
      setLoading(false);
    });
  }, []);

  const stats = [
    { name: 'Total Anggota', value: memberCount.toString(), change: '+12%', trend: 'up', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Total Simpanan', value: 'Rp 425.8M', change: '+8.2%', trend: 'up', icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { name: 'Pinjaman Aktif', value: 'Rp 150.2M', change: '-2.4%', trend: 'down', icon: HandCoins, color: 'text-amber-600', bg: 'bg-amber-50' },
    { name: 'Pendapatan SHU', value: 'Rp 45.2M', change: '+15%', trend: 'up', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500 text-sm sm:text-base">Ringkasan aktivitas koperasi hari ini.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={stat.bg + " p-3 rounded-xl " + stat.color}>
                <stat.icon size={24} />
              </div>
              <div className={cn(
                "flex items-center text-xs font-semibold px-2 py-1 rounded-full",
                stat.trend === 'up' ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50"
              )}>
                {stat.trend === 'up' ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
                {stat.change}
              </div>
            </div>
            <p className="text-sm font-medium text-slate-500">{stat.name}</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden order-2 lg:order-1">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Pengajuan Pinjaman Terbaru</h3>
            <button className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">Lihat Semua</button>
          </div>
          <div className="divide-y divide-slate-100">
            {loans.map((loan) => (
              <div key={loan.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                    {(loan.memberName || '').split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{loan.memberName}</p>
                    <p className="text-xs text-slate-500">{loan.purpose}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">Rp {loan.amount.toLocaleString()}</p>
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                    loan.status === 'approved' ? "bg-emerald-100 text-emerald-700" :
                    loan.status === 'pending' ? "bg-amber-100 text-amber-700" :
                    "bg-red-100 text-red-700"
                  )}>
                    {loan.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 order-1 lg:order-2">
          <h3 className="font-bold text-slate-900 mb-6">Aktivitas Terakhir</h3>
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <Clock size={16} />
                  </div>
                  {i !== 4 && <div className="absolute top-8 left-4 w-px h-6 bg-slate-200"></div>}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Setoran Simpanan</p>
                  <p className="text-xs text-slate-500">Budi Santoso menyetor Rp 100.000</p>
                  <p className="text-[10px] text-slate-400 mt-1">2 jam yang lalu</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
