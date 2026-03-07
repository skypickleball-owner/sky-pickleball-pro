"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "../../lib/supabase"; 
import { CheckCircle, XCircle, MessageCircle, Lock, BarChart3, Wallet, Loader2, Trash2, Download, Search, TrendingUp, LogOut } from "lucide-react";

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [bookings, setBookings] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({ total: 0, income: 0 });
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const SECRET_PIN = "130675"; 

  const handleLogin = () => {
    if (password === SECRET_PIN) setIsLoggedIn(true);
    else alert("PIN SALAH, DOK!");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setPassword("");
  };

  useEffect(() => {
    if (isLoggedIn) fetchBookings();
  }, [isLoggedIn, selectedMonth, selectedYear]);

  async function fetchBookings() {
    try {
      const { data, error } = await supabase.from("bookings").select(`*, courts(name, price_weekday, price_weekend)`).order('created_at', { ascending: false });
      if (error) throw error;
      const filtered = data?.filter(b => b.booking_date.startsWith(`${selectedYear}-${selectedMonth}`)) || [];
      const income = filtered.filter(b => b.status === 'confirmed').reduce((acc, curr) => acc + curr.total_price, 0) || 0;
      setBookings(data || []);
      setStats({ total: filtered.length, income });
    } catch (err: any) { console.error(err.message); }
  }

  const updateStatus = async (id: string, status: string) => {
    setIsUpdating(id);
    await supabase.from("bookings").update({ status }).eq('id', id);
    await fetchBookings();
    setIsUpdating(null);
  };

  const deleteSingle = async (id: string) => {
    if (confirm("HAPUS DATA PERMANEN?")) {
      await supabase.from("bookings").delete().eq('id', id);
      fetchBookings();
    }
  };

  const deleteCancelled = async () => {
    if (confirm("Bersihkan semua data CANCELLED?")) {
      await supabase.from("bookings").delete().eq('status', 'cancelled');
      fetchBookings();
    }
  };

  const chartData = useMemo(() => {
    const days = new Date(Number(selectedYear), Number(selectedMonth), 0).getDate();
    return Array.from({ length: days }, (_, i) => {
      const date = `${selectedYear}-${selectedMonth}-${(i + 1).toString().padStart(2, '0')}`;
      const val = bookings.filter(b => b.status === 'confirmed' && b.booking_date === date).reduce((sum, b) => sum + b.total_price, 0);
      return { day: i + 1, val };
    });
  }, [bookings, selectedMonth, selectedYear]);

  const maxVal = Math.max(...chartData.map(d => d.val), 100000);

  const downloadReport = () => {
    const data = bookings.filter(b => b.status === 'confirmed' && b.booking_date.startsWith(`${selectedYear}-${selectedMonth}`));
    if (data.length === 0) return alert("DATA KOSONG!");
    let csv = "\uFEFFSEP=;\nNAMA;UNIT;TANGGAL;JAM;TOTAL\n";
    let total = 0;
    data.forEach(b => {
      total += b.total_price;
      csv += `${b.user_name};${b.courts?.name};${b.booking_date};${b.start_time};${b.total_price}\n`;
    });
    csv += `\n;;;;TOTAL;${total}\n`;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    link.download = `SKY_REPORT_${selectedYear}_${selectedMonth}.csv`;
    link.click();
  };

  // REVISI FINAL: PESAN WA KONFIRMASI LENGKAP
  const confirmToWA = (booking: any) => {
    const waNumber = booking.user_phone.replace(/^0/, '62');
    const gmapsLink = "https://maps.app.goo.gl/cJZfpdYqBwp7J3EB9";
    const msg = `Halo ${booking.user_name}, Booking di *${booking.courts?.name}* dikonfirmasi!%0A%0A` +
                `Jadwal: ${booking.booking_date}%0A` +
                `Jam: ${booking.start_time.substring(0,5)} WIB%0A` +
                `LOKASI: ${gmapsLink}%0A%0A` +
                `TERIMA KASIH!`;
    window.open(`https://wa.me/${waNumber}?text=${msg}`, "_blank");
  };

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6 font-bold">
        <div className="bg-[#1E293B] border-4 border-[#F472B6] p-10 shadow-[10px_10px_0px_0px_rgba(244,114,182,1)] text-center max-w-sm w-full">
          <Lock size={48} className="mx-auto mb-6 text-[#FDE047]" />
          <h1 className="text-2xl font-black mb-6 uppercase text-white tracking-widest italic">SKY ADMIN</h1>
          <input type="password" maxLength={6} placeholder="PIN" className="w-full p-4 border-2 border-slate-700 text-center text-3xl font-black mb-6 bg-[#0F172A] text-[#FDE047] outline-none focus:border-[#F472B6]" onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
          <button onClick={handleLogin} className="w-full bg-[#F472B6] text-black p-4 text-xl font-black uppercase">ENTER</button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0F172A] text-slate-200 font-bold p-4 md:p-10 flex flex-col gap-10">
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-[#1E293B] p-6 border-2 border-slate-700 shadow-xl relative text-center">
        <div className="space-y-4 w-full xl:w-auto">
          <h1 className="text-3xl font-black uppercase tracking-tighter text-white italic underline decoration-[#F472B6]">COMMAND CENTER V2.4</h1>
          <div className="relative group max-w-md mx-auto xl:mx-0">
            <Search className="absolute left-3 top-3 text-slate-500" size={20} />
            <input type="text" placeholder="CARI NAMA..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[#0F172A] border-2 border-slate-700 p-3 pl-12 outline-none text-white uppercase text-sm" />
          </div>
        </div>
        <div className="flex flex-wrap gap-4 w-full xl:w-auto justify-center xl:justify-end">
          <div className="bg-[#0F172A] p-4 border-2 border-slate-700 flex items-center gap-4 min-w-[200px]">
            <Wallet className="text-[#4ADE80]" />
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-black italic">Confirmed Omzet</p>
              <p className="text-xl font-black text-white italic">Rp {stats.income.toLocaleString('id-ID')}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 items-center xl:items-end">
            <div className="flex gap-1">
                <select value={selectedMonth} onChange={(e)=>setSelectedMonth(e.target.value)} className="bg-slate-800 border p-2 text-[10px] rounded text-white font-black">{["01","02","03","04","05","06","07","08","09","10","11","12"].map(m => <option key={m} value={m}>Bln {m}</option>)}</select>
                <select value={selectedYear} onChange={(e)=>setSelectedYear(e.target.value)} className="bg-slate-800 border p-2 text-[10px] rounded text-white font-black">{["2024","2025","2026"].map(y => <option key={y} value={y}>{y}</option>)}</select>
                <button onClick={handleLogout} className="bg-red-900/40 text-red-500 p-2 rounded border border-red-900" title="LOG OUT"><LogOut size={16} /></button>
            </div>
            <div className="flex gap-2">
                <button onClick={downloadReport} className="bg-white text-black px-4 py-2 hover:bg-[#F472B6] transition-all flex items-center gap-2 uppercase text-[10px] border-2 border-black font-black"><Download size={14}/> Export Report</button>
                <button onClick={deleteCancelled} className="text-red-500 border border-red-900 px-4 py-2 uppercase text-[10px] font-black flex items-center gap-2 italic"><Trash2 size={14}/> Clean Junk</button>
            </div>
          </div>
        </div>
      </header>

      <section className="overflow-x-auto border-2 border-slate-700 bg-[#1E293B] shadow-2xl">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-[#0F172A] text-slate-400 uppercase text-[10px] tracking-[0.2em] italic">
              <th className="p-4 border-b border-slate-700">Customer / Schedule</th>
              <th className="p-4 border-b border-slate-700">Unit</th>
              <th className="p-4 border-b border-slate-700 text-center">Receipt</th>
              <th className="p-4 border-b border-slate-700">Status</th>
              <th className="p-4 border-b border-slate-700 text-right">Nav</th>
            </tr>
          </thead>
          <tbody>
            {bookings.filter(b => b.user_name.toLowerCase().includes(searchTerm.toLowerCase())).map((b) => (
              <tr key={b.id} className="border-b border-slate-800 hover:bg-[#253145] transition-colors group">
                <td className="p-4 text-white font-black uppercase tracking-tight">
                    <span className="text-[#F472B6]">{b.user_name}</span>
                    <div className="text-[10px] text-[#FDE047] font-mono mt-1 uppercase italic">{b.booking_date} | {b.start_time.substring(0,5)} WIB</div>
                </td>
                <td className="p-4 uppercase"><span className={`px-2 py-1 text-[10px] rounded border border-current font-black ${b.courts?.name.includes('FUTSAL') ? 'text-blue-400' : 'text-pink-400'}`}>{b.courts?.name}</span></td>
                <td className="p-4 text-center"><a href={b.receipt_url} target="_blank" className="text-[#38BDF8] hover:underline text-[10px] font-black uppercase italic">CHECK PHOTO</a></td>
                <td className="p-4 uppercase text-[10px] font-black italic"><div className={b.status === 'confirmed' ? 'text-[#4ADE80]' : b.status === 'cancelled' ? 'text-red-500' : 'text-[#FDE047]'}>● {b.status}</div></td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-3">
                    {isUpdating === b.id ? <Loader2 className="animate-spin text-white" size={20} /> : (
                        <>
                        <button onClick={() => updateStatus(b.id, 'confirmed')} className="text-[#4ADE80] hover:scale-125 transition-transform"><CheckCircle size={22}/></button>
                        <button onClick={() => confirmToWA(b)} className="text-[#25D366] hover:scale-125 transition-transform"><MessageCircle size={22}/></button>
                        <button onClick={() => deleteSingle(b.id)} className="text-red-500 hover:scale-125 transition-transform"><Trash2 size={22}/></button>
                        </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="bg-[#1E293B] border-2 border-slate-700 p-8 shadow-xl mb-10 italic">
        <div className="flex items-center gap-3 mb-8 border-b-2 border-slate-700 pb-4 uppercase">
            <TrendingUp className="text-[#4ADE80]" size={28} />
            <h2 className="text-2xl font-black tracking-tighter text-white">Monthly Revenue Trend</h2>
        </div>
        <div className="h-64 flex items-end gap-[4px] md:gap-[8px]">
            {chartData.map((d, i) => (
                <div key={i} className="flex-1 group relative h-full flex items-end">
                    <div className="w-full bg-[#4ADE80] rounded-t-sm" style={{ height: `${(d.val / maxVal) * 100}%`, minHeight: '2px' }}></div>
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#4ADE80] text-black text-[10px] px-2 py-1 rounded font-black opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-2xl uppercase text-center border border-black">Tgl {d.day}: Rp {d.val.toLocaleString('id-ID')}</div>
                </div>
            ))}
        </div>
      </section>
    </main>
  );
}