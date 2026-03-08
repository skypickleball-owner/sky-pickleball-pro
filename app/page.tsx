"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { Navigation, Zap, Hourglass, CheckCircle, ArrowLeft } from "lucide-react";
import Image from "next/image";

export default function Home() {
  const [courts, setCourts] = useState<any[]>([]);
  const [selectedCourt, setSelectedCourt] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [duration, setDuration] = useState(1);
  const [custName, setCustName] = useState("");
  const [custWA, setCustWA] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [timeLeft, setTimeLeft] = useState(3600);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [savedBooking, setSavedBooking] = useState<any>(null);

  useEffect(() => {
    async function fetchCourts() {
      const { data } = await supabase.from("courts").select("*").order('name', { ascending: true });
      setCourts(data || []);
    }
    fetchCourts();
  }, []);

  useEffect(() => {
    if (selectedCourt) {
      setTimeLeft(3600);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            window.location.reload();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [selectedCourt]);

  useEffect(() => {
    if (selectedCourt && selectedDate) {
      const day = new Date(selectedDate).getDay();
      const isWeekend = [0, 5, 6].includes(day);
      const rate = isWeekend ? selectedCourt.price_weekend : selectedCourt.price_weekday;
      setTotalPrice(rate * duration);
    }
  }, [selectedCourt, selectedDate, duration]);

  // FUNGSI ALARM OTOMATIS TELEGRAM
  const sendTelegramAlert = async (bookingData: any) => {
    const token = process.env.NEXT_PUBLIC_TELEGRAM_TOKEN;
    const chatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;
    const text = `🚨 *BOOKING BARU SKY!* 🚨\n\n` +
                 `👤 *Nama:* ${bookingData.user_name}\n` +
                 `🏟️ *Unit:* ${bookingData.court_name}\n` +
                 `📅 *Tanggal:* ${bookingData.booking_date}\n` +
                 `⏰ *Jam:* ${bookingData.start_time} (${bookingData.duration} Jam)\n` +
                 `💰 *Total:* Rp ${bookingData.total_price.toLocaleString('id-ID')}\n\n` +
                 `👉 *Segera cek dashboard Admin!*`;

    try {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: text, parse_mode: 'Markdown' })
      });
    } catch (e) { console.error("Gagal kirim Telegram", e); }
  };

  const handleBooking = async () => {
    if (!selectedCourt) return alert("PILIH LAPANGAN DAHULU, DOK!");
    if (!selectedDate) return alert("TANGGAL BELUM DIISI!");
    if (!selectedTime) return alert("JAM MULAI BELUM DIPILIH!");
    if (!custName) return alert("NAMA PENYEWA MASIH KOSONG!");
    if (!custWA) return alert("NOMOR WHATSAPP BELUM DIISI!");
    if (!receiptFile) return alert("UNGGAH FOTO BUKTI BAYAR DAHULU!");

    setIsSubmitting(true);
    try {
      const fileName = `${Date.now()}-${receiptFile.name.replace(/\s/g, '_')}`;
      await supabase.storage.from('receipts').upload(fileName, receiptFile);
      const { data: urlData } = supabase.storage.from('receipts').getPublicUrl(fileName);
      
      const newBooking = {
        user_name: custName,
        court_name: selectedCourt.name,
        booking_date: selectedDate,
        start_time: selectedTime,
        total_price: totalPrice,
        receipt_url: urlData.publicUrl,
        duration: duration
      };

      await supabase.from("bookings").insert([{
        court_id: selectedCourt.id,
        booking_date: selectedDate,
        start_time: selectedTime,
        user_name: custName,
        user_phone: custWA,
        total_price: totalPrice,
        receipt_url: urlData.publicUrl,
        status: 'pending'
      }]);
      
      // KIRIM ALARM KE HP ADMIN
      await sendTelegramAlert(newBooking);

      setSavedBooking(newBooking);
      setIsSuccess(true);
    } catch (err: any) {
      alert("ERROR: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <main className="min-h-screen bg-[#EAB308] flex items-center justify-center p-4 font-bold">
        <div className="bg-white border-8 border-black p-8 shadow-[15px_15px_0px_0px_black] text-center max-w-lg w-full">
          <CheckCircle size={80} className="mx-auto mb-4 text-green-500" />
          <h1 className="text-4xl font-black mb-4 uppercase italic">MANTEP DOK!</h1>
          <p className="mb-6 uppercase text-sm">Data sudah masuk ke Radar Admin.<br/>Silakan lapor via WA untuk aktivasi.</p>
          <div className="space-y-4">
            <button onClick={() => window.open(`https://wa.me/6289616265702?text=KONFIRMASI%20BOOKING%20SKY:%20${savedBooking.user_name}`, "_blank")} className="bg-[#25D366] text-white p-5 w-full text-xl font-black uppercase shadow-[6px_6px_0px_0px_black]">LAPOR KE ADMIN (WA)</button>
            <button onClick={() => window.location.reload()} className="bg-white text-black border-4 border-black p-3 w-full text-sm font-black uppercase flex items-center justify-center gap-2">
              <ArrowLeft size={16} /> Booking Lagi
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#EAB308] text-black font-bold pb-10 overflow-x-hidden flex flex-col">
      <header className="relative min-h-[500px] flex items-center justify-center border-b-[10px] border-black p-6">
        <Image src="/header-bg.jpg" alt="Court" fill className="object-cover brightness-[0.25]" />
        <div className="relative z-10 w-full max-w-6xl flex flex-col md:flex-row justify-between items-center gap-8">
          <a href="https://maps.app.goo.gl/cJZfpdYqBwp7J3EB9" target="_blank" className="bg-[#FDE047] border-4 border-black p-3 shadow-[6px_6px_0px_0px_black]"><Navigation size={32} /><p className="text-[10px] font-black uppercase text-center">CEK LOKASI</p></a>
          <div className="flex flex-col items-center">
             <div className="bg-[#F472B6] border-2 border-black px-4 py-1 mb-4 shadow-[4px_4px_0px_0px_black] -rotate-1"><p className="text-sm md:text-xl font-black uppercase text-white italic tracking-widest">#1 Family Sportainment</p></div>
             <h1 className="text-5xl md:text-8xl font-black uppercase leading-[0.8] tracking-tighter italic text-center drop-shadow-[8px_8px_0px_rgba(0,0,0,1)]">
               <span className="text-[#38BDF8]">Dad's Hero,</span><br/><span className="text-[#F472B6]">Mom's Glows,</span><br/><span className="text-[#4ADE80]">Kid's Happy</span>
             </h1>
          </div>
          <div className="bg-[#F472B6] border-4 border-black p-2 shadow-[6px_6px_0px_0px_black] rotate-3">
            <div className="relative w-24 h-24 bg-white border-2 border-black"><Image src="/qr-ig.png" alt="QR" fill className="p-1 object-contain" /></div>
            <p className="text-[8px] mt-1 font-black text-white italic uppercase text-center">IG @SKY.FUTSA</p>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12 px-4 flex-grow">
        <div className="lg:col-span-2 space-y-10">
          <section className="bg-white border-4 border-black p-6 shadow-[10px_10px_0px_0px_black]">
            <div className="flex items-center gap-3 mb-8 bg-black text-[#FDE047] p-3 border-4 border-black inline-flex transform -rotate-1"><Zap size={28} /><h2 className="text-2xl uppercase font-black">1. Pilih Lapangan</h2></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {courts.map((court) => {
                // DINAMIS BACKGROUND BERDASARKAN FILE DI PUBLIC
                const bgImg = court.name.toLowerCase().includes('futsal 1') ? '/futsal1.jpg' : 
                              court.name.toLowerCase().includes('futsal 2') ? '/futsal2.jpg' :
                              court.name.toLowerCase().includes('1') ? '/pb1.jpg' : '/pb2.jpg';
                return (
                <button key={court.id} onClick={() => setSelectedCourt(court)} className={`relative h-48 border-4 border-black flex items-center justify-center overflow-hidden transition-all ${selectedCourt?.id === court.id ? "bg-[#F472B6] scale-[1.02]" : "bg-white shadow-[8px_8px_0px_0px_black]"}`}>
                  {/* FOTO LAPANGAN SEBAGAI BACKGROUND */}
                  <Image src={bgImg} alt="Court" fill className={`object-cover transition-opacity ${selectedCourt?.id === court.id ? 'opacity-40' : 'opacity-20 hover:opacity-50'}`} />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all" />
                  <div className="absolute inset-4 z-10 p-2"><Image src={court.type === 'FUTSAL' ? '/logo-futsal.png' : '/logo-pb.png'} alt="Logo" fill className="object-contain drop-shadow-lg" /></div>
                  <div className="absolute top-2 left-2 z-20"><span className="bg-black text-white px-3 py-1 text-sm font-black uppercase italic shadow-[2px_2px_0px_0px_black]">{court.name}</span></div>
                </button>
              )})}
            </div>
          </section>
          <section className="bg-white border-4 border-black p-6 shadow-[10px_10px_0px_0px_black] grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-4">
                <h3 className="text-lg uppercase font-black border-b-4 border-pink-500 inline-block mb-2 italic">Jadwal & Durasi</h3>
                <input type="date" onChange={(e) => setSelectedDate(e.target.value)} className="w-full p-4 border-4 border-black bg-[#FDE047] font-black outline-none" />
                <div className="flex gap-2 font-black">
                  <select onChange={(e) => setSelectedTime(e.target.value)} className="flex-1 p-4 border-4 border-black bg-white outline-none"><option value="">JAM MULAI</option>{Array.from({ length: 16 }, (_, i) => `${(i + 7).toString().padStart(2, "0")}:00`).map(slot => <option key={slot} value={slot}>{slot} WIB</option>)}</select>
                  <select value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-24 p-4 border-4 border-black bg-white outline-none">{[1,2,3,4].map(h => <option key={h} value={h}>{h} Jam</option>)}</select>
                </div>
             </div>
             <div className="space-y-4 font-black uppercase">
                <h3 className="text-lg uppercase font-black border-b-4 border-[#38BDF8] inline-block mb-2 italic uppercase">Biodata</h3>
                <input placeholder="NAMA LENGKAP" onChange={(e)=>setCustName(e.target.value.toUpperCase())} className="w-full p-4 border-4 border-black outline-none" />
                <input placeholder="NOMOR WA" type="tel" onChange={(e)=>setCustWA(e.target.value)} className="w-full p-4 border-4 border-black outline-none" />
             </div>
          </section>
        </div>
        <aside className="lg:col-span-1">
          <div className="bg-[#F472B6] border-8 border-black p-6 shadow-[12px_12px_0px_0px_black] sticky top-6">
            <h2 className="text-3xl font-black uppercase mb-2 border-b-4 border-black pb-2 italic">Ringkasan</h2>
            {selectedCourt ? (
              <div className="space-y-6">
                <div className="bg-white border-4 border-black p-2 flex items-center justify-center gap-3 animate-pulse border-4 border-black"><Hourglass className="text-red-600" size={20} /><p className="text-xl font-black font-mono tracking-tighter">TIMER: {Math.floor(timeLeft/60).toString().padStart(2,'0')}:{(timeLeft%60).toString().padStart(2,'0')}</p></div>
                <p className="text-4xl font-black uppercase tracking-tighter italic">{selectedCourt.name}</p>
                <div className="bg-white p-4 border-4 border-black shadow-[4px_4px_0px_black]"><p className="text-[10px] uppercase font-black mb-1 italic underline text-blue-600 font-black italic">TRANSFER: BANK BCA - 4585573541 a/n DINAH PATRICIA</p><input type="file" accept="image/*" onChange={(e) => setReceiptFile(e.target.files ? e.target.files[0] : null)} className="w-full text-[10px] font-black file:bg-[#4ADE80]" /></div>
                <div className="bg-black text-white p-4 border-4 border-white transform -rotate-2 shadow-xl border-4 border-black"><p className="text-[10px] uppercase mb-1 font-black">Total ({duration} Jam):</p><p className="text-4xl font-black text-center text-[#FDE047] italic">Rp {totalPrice.toLocaleString('id-ID')}</p></div>
                <button onClick={handleBooking} disabled={isSubmitting} className="w-full bg-[#4ADE80] text-black border-4 border-black p-5 text-2xl font-black uppercase shadow-[8px_8px_0px_0px_black]">
                  {isSubmitting ? "WAIT..." : "BOOKING SEKARANG!"}
                </button>
              </div>
            ) : (<div className="text-center py-20 border-4 border-black border-dashed bg-white uppercase italic font-black text-black">SILAKAN PILIH UNIT!</div>)}
          </div>
        </aside>
      </div>
      <footer className="mt-20 py-8 bg-black text-white border-t-8 border-black text-center"><p className="text-lg md:text-2xl font-black uppercase tracking-[0.2em] italic">SKY PICKLEBALL & FUTSAL BOOKING SYSTEM</p></footer>
    </main>
  );
}