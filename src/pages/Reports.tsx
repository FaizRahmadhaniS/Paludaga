import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  Download, 
  Printer, 
  Calendar, 
  Filter,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileSpreadsheet
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import bwipjs from 'bwip-js';
import * as XLSX from 'xlsx';
import { Loan, Saving } from '../types';

export default function Reports() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingExcel, setIsGeneratingExcel] = useState(false);

  const generateExcel = async () => {
    setIsGeneratingExcel(true);
    try {
      const res = await fetch('/api/savings');
      const savings: Saving[] = await res.json() || [];
      
      if (!Array.isArray(savings)) {
        throw new Error('Invalid savings data received');
      }
      
      const worksheet = XLSX.utils.json_to_sheet(savings.map(s => ({
        'ID Transaksi': s.id,
        'Nama Anggota': s.memberName,
        'Tipe Simpanan': s.type,
        'Jumlah (Rp)': s.amount,
        'Tanggal': s.date
      })));
      
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Simpanan");
      
      XLSX.writeFile(workbook, "Laporan_Simpanan_Syskop.xlsx");
    } catch (error) {
      console.error('Excel Generation Error:', error);
    } finally {
      setIsGeneratingExcel(false);
    }
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      const res = await fetch('/api/loans');
      const loans: Loan[] = await res.json() || [];
      
      if (!Array.isArray(loans)) {
        throw new Error('Invalid loans data received');
      }
      
      const doc = new jsPDF();
      
      // Header
      doc.setFillColor(16, 185, 129); // Emerald 500
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('PALUGADA KOPERASI', 20, 25);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Laporan Pinjaman Anggota - Maret 2024', 20, 32);
      
      // Generate Barcode
      const canvas = document.createElement('canvas');
      try {
        bwipjs.toCanvas(canvas, {
          bcid: 'code128',       // Barcode type
          text: 'PLGD-REP-202403',    // Text to encode
          scale: 3,              // 3x scaling factor
          height: 10,            // Bar height, in millimeters
          includetext: true,     // Show human-readable text
          textxalign: 'center',  // Always good to set this
        });
        
        const barcodeData = canvas.toDataURL('image/png');
        doc.addImage(barcodeData, 'PNG', 150, 10, 40, 20);
      } catch (e) {
        console.error('Barcode generation failed', e);
      }

      // Content
      doc.setTextColor(30, 41, 59); // Slate 800
      doc.setFontSize(14);
      doc.text('Ringkasan Pinjaman', 20, 55);
      
      const tableData = loans.map(loan => [
        loan.id,
        loan.memberName,
        `Rp ${loan.amount.toLocaleString()}`,
        loan.purpose,
        loan.status.toUpperCase(),
        loan.date
      ]);

      autoTable(doc, {
        startY: 65,
        head: [['ID', 'Nama Anggota', 'Jumlah', 'Tujuan', 'Status', 'Tanggal']],
        body: tableData,
        headStyles: { fillColor: [16, 185, 129] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { left: 20, right: 20 }
      });

      // Footer
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`Dicetak pada: ${new Date().toLocaleString()}`, 20, 285);
        doc.text(`Halaman ${i} dari ${pageCount}`, 180, 285);
      }

      doc.save('Laporan_Koperasi_Syskop.pdf');
    } catch (error) {
      console.error('PDF Generation Error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Laporan</h1>
        <p className="text-slate-500 text-sm sm:text-base">Generate dan cetak laporan aktivitas koperasi.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-start justify-between mb-6">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
              <FileText size={24} />
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase tracking-wider">PDF Ready</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900">Laporan Pinjaman</h3>
          <p className="text-sm text-slate-500 mt-2 mb-6">Laporan detail pengajuan pinjaman, status, dan riwayat pembayaran.</p>
          <button 
            onClick={generatePDF}
            disabled={isGenerating}
            className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-emerald-200"
          >
            {isGenerating ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download size={18} />
                Download PDF
              </>
            )}
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-start justify-between mb-6">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
              <Calendar size={24} />
            </div>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase tracking-wider">Excel Ready</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900">Laporan Simpanan</h3>
          <p className="text-sm text-slate-500 mt-2 mb-6">Rekapitulasi simpanan pokok, wajib, dan sukarela seluruh anggota.</p>
          <button 
            onClick={generateExcel}
            disabled={isGeneratingExcel}
            className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isGeneratingExcel ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <FileSpreadsheet size={18} />
                Download Excel
              </>
            )}
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-start justify-between mb-6">
            <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
              <AlertCircle size={24} />
            </div>
            <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-full uppercase tracking-wider">Financial</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900">Laporan SHU</h3>
          <p className="text-sm text-slate-500 mt-2 mb-6">Perhitungan Sisa Hasil Usaha (SHU) berdasarkan transaksi anggota.</p>
          <button className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
            <Filter size={18} />
            Filter & Export
          </button>
        </div>
      </div>

      <div className="bg-emerald-900 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl text-center lg:text-left">
            <h2 className="text-2xl font-bold">Butuh Laporan Kustom?</h2>
            <p className="text-emerald-100/80">Anda dapat membuat laporan kustom dengan memilih parameter tertentu seperti rentang tanggal, departemen, atau jenis transaksi.</p>
            <button className="w-full sm:w-auto bg-white text-emerald-900 px-6 py-2.5 rounded-xl font-bold hover:bg-emerald-50 transition-all">
              Buka Report Builder
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="flex-1 min-w-[120px] bg-emerald-800/50 p-6 rounded-2xl border border-emerald-700/50 backdrop-blur-sm text-center">
              <p className="text-emerald-300 text-xs font-bold uppercase tracking-widest mb-2">Laporan Terkirim</p>
              <p className="text-3xl font-bold">128</p>
            </div>
            <div className="flex-1 min-w-[120px] bg-emerald-800/50 p-6 rounded-2xl border border-emerald-700/50 backdrop-blur-sm text-center">
              <p className="text-emerald-300 text-xs font-bold uppercase tracking-widest mb-2">Akurasi Data</p>
              <p className="text-3xl font-bold">100%</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
