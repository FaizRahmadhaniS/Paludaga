import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Plus, 
  Search, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  Download,
  FileText
} from 'lucide-react';
import { Saving, cn } from '../types';

export default function Savings() {
  const [savings, setSavings] = useState<Saving[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(100000);

  useEffect(() => {
    fetch('/api/savings')
      .then(res => res.json())
      .then(data => {
        setSavings(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setSavings([]);
        setLoading(false);
      });
  }, []);

  const handleTopUp = async () => {
    if (topUpAmount < 10000) {
      alert('Minimal setoran Rp 10.000');
      return;
    }
    setIsPaying(true);
    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: topUpAmount,
          customerDetails: {
            first_name: "User",
            email: "user@example.com"
          }
        })
      });
      const { token } = await res.json();
      
      if (window.snap) {
        window.snap.pay(token, {
          onSuccess: (result: any) => {
            console.log('success', result);
            alert('Top up berhasil!');
          },
          onPending: (result: any) => {
            console.log('pending', result);
            alert('Menunggu pembayaran...');
          },
          onError: (result: any) => {
            console.log('error', result);
            alert('Pembayaran gagal!');
          },
          onClose: () => {
            console.log('customer closed the popup without finishing the payment');
          }
        });
      }
    } catch (err) {
      console.error(err);
      alert('Gagal membuat transaksi');
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:flex-none">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">Rp</span>
            <input 
              type="number" 
              className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 w-full sm:w-40"
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(Number(e.target.value))}
              min="10000"
              step="10000"
            />
          </div>
          <button 
            onClick={handleTopUp}
            disabled={isPaying}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-200 disabled:opacity-50"
          >
            {isPaying ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <ArrowUpRight size={18} />}
            Setoran Baru
          </button>
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Simpanan</h1>
          <p className="text-slate-500 text-sm sm:text-base">Kelola saldo dan transaksi simpanan anggota.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 p-6 rounded-2xl shadow-xl text-white relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Saldo Koperasi</p>
            <h3 className="text-3xl font-bold">Rp 1,245,800,000</h3>
            <div className="mt-6 flex items-center gap-2 text-emerald-400 text-xs font-semibold">
              <TrendingUp size={14} />
              <span>+12.5% dari bulan lalu</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Wallet size={20} />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Simpanan Pokok</span>
          </div>
          <div className="mt-4">
            <h4 className="text-xl font-bold text-slate-900">Rp 450.0M</h4>
            <p className="text-xs text-slate-500 mt-1">35% dari total simpanan</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <FileText size={20} />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Simpanan Wajib</span>
          </div>
          <div className="mt-4">
            <h4 className="text-xl font-bold text-slate-900">Rp 795.8M</h4>
            <p className="text-xs text-slate-500 mt-1">65% dari total simpanan</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <h3 className="font-bold text-slate-900 text-sm">Transaksi Terakhir</h3>
          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Cari transaksi..." 
                className="w-full sm:w-auto pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200">
              <Download size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                <th className="px-6 py-4 border-b border-slate-100">Status</th>
                <th className="px-6 py-4 border-b border-slate-100">ID Transaksi</th>
                <th className="px-6 py-4 border-b border-slate-100">Anggota</th>
                <th className="px-6 py-4 border-b border-slate-100">Tipe</th>
                <th className="px-6 py-4 border-b border-slate-100">Jumlah</th>
                <th className="px-6 py-4 border-b border-slate-100">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {savings.map((saving) => (
                <tr key={saving.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
                      Sukses
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-slate-500">{saving.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[10px]">
                        {(saving.memberName || '').split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm font-semibold text-slate-900">{saving.memberName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-md">{saving.type}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-emerald-600">Rp {saving.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{saving.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

function TrendingUp({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}
