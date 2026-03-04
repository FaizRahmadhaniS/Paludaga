import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Filter,
  ArrowRight,
  HandCoins,
  FileText,
  UserPlus
} from 'lucide-react';
import { Loan, cn, Status, Member } from '../types';

export default function Loans() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Status | 'all'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    memberId: '',
    amount: 0,
    purpose: ''
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/loans').then(res => res.json()),
      fetch('/api/members').then(res => res.json())
    ]).then(([loansData, membersData]) => {
      setLoans(Array.isArray(loansData) ? loansData : []);
      setMembers(Array.isArray(membersData) ? membersData : []);
      setLoading(false);
    }).catch(() => {
      setLoans([]);
      setMembers([]);
      setLoading(false);
    });
  }, []);

  const handleStatusUpdate = async (id: string, status: Status) => {
    try {
      const res = await fetch(`/api/loans/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setLoans(prev => prev.map(l => l.id === id ? { ...l, status } : l));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedMember = members.find(m => m.id === formData.memberId);
    if (!selectedMember) return;

    const id = `L-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    const newLoan = {
      ...formData,
      id,
      memberName: selectedMember.name,
      status: 'pending' as Status,
      date: new Date().toISOString().split('T')[0]
    };

    try {
      const res = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLoan)
      });
      if (res.ok) {
        setLoans(prev => [...prev, newLoan as Loan]);
        setIsFormOpen(false);
        setFormData({ memberId: '', amount: 0, purpose: '' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredLoans = activeTab === 'all' 
    ? loans 
    : loans.filter(l => l.status === activeTab);

  const stats = {
    pending: loans.filter(l => l.status === 'pending').length,
    approved: loans.filter(l => l.status === 'approved').length,
    rejected: loans.filter(l => l.status === 'rejected').length,
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <button 
          onClick={() => setIsFormOpen(true)}
          className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-200"
        >
          <Plus size={18} />
          Pengajuan Baru
        </button>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Pinjaman</h1>
          <p className="text-slate-500 text-sm sm:text-base">Kelola pengajuan dan status pinjaman anggota.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Pending</p>
            <h3 className="text-2xl font-bold text-slate-900">{stats.pending} Pengajuan</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Disetujui</p>
            <h3 className="text-2xl font-bold text-slate-900">{stats.approved} Pengajuan</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-red-50 text-red-600">
            <XCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Ditolak</p>
            <h3 className="text-2xl font-bold text-slate-900">{stats.rejected} Pengajuan</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-2 p-1 bg-slate-200/50 rounded-xl overflow-x-auto no-scrollbar">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap",
                  activeTab === tab 
                    ? "bg-white text-slate-900 shadow-sm" 
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                {tab === 'all' ? 'Semua' : tab}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Cari pinjaman..." 
                className="w-full sm:w-auto pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                <th className="px-6 py-4 border-b border-slate-100">Aksi</th>
                <th className="px-6 py-4 border-b border-slate-100">ID</th>
                <th className="px-6 py-4 border-b border-slate-100">Anggota</th>
                <th className="px-6 py-4 border-b border-slate-100">Jumlah</th>
                <th className="px-6 py-4 border-b border-slate-100">Tujuan</th>
                <th className="px-6 py-4 border-b border-slate-100">Tanggal</th>
                <th className="px-6 py-4 border-b border-slate-100">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLoans.map((loan) => (
                <tr key={loan.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {loan.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleStatusUpdate(loan.id, 'approved')}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-all" 
                            title="Setujui"
                          >
                            <CheckCircle2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(loan.id, 'rejected')}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-all" 
                            title="Tolak"
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                      <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-all">
                        <ArrowRight size={18} />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-slate-500">{loan.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-[10px]">
                        {(loan.memberName || '').split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm font-semibold text-slate-900">{loan.memberName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900">Rp {loan.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{loan.purpose}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{loan.date}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                      loan.status === 'approved' ? "bg-emerald-100 text-emerald-700" :
                      loan.status === 'pending' ? "bg-amber-100 text-amber-700" :
                      "bg-red-100 text-red-700"
                    )}>
                      {loan.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Loan Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-xl font-bold text-slate-900">Pengajuan Pinjaman</h3>
                <button 
                  onClick={() => setIsFormOpen(false)}
                  className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <Plus size={20} className="rotate-45" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Pilih Anggota</label>
                  <select 
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    value={formData.memberId}
                    onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                  >
                    <option value="">Pilih Anggota...</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.id})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Jumlah Pinjaman (Rp)</label>
                  <input 
                    type="number" 
                    required
                    min="100000"
                    step="100000"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Tujuan Pinjaman</label>
                  <textarea 
                    required
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    placeholder="Contoh: Renovasi rumah, biaya pendidikan..."
                  />
                </div>
                <div className="pt-4">
                  <button 
                    type="submit"
                    className="w-full py-3.5 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
                  >
                    <HandCoins size={20} /> Kirim Pengajuan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
