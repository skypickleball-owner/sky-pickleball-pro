"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { Navigation, Zap, Hourglass, CheckCircle, ArrowLeft, AlertCircle, MapPin } from "lucide-react";
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

  // 1. AMBIL DATA UNIT DARI SUPABASE
  useEffect(() => {
    async function fetchCourts() {
      try {
        const { data, error } = await supabase.from("courts").select("*").order('name', { ascending: true });
        if (error) {
          console.error("❌ GAGAL AMBIL UNIT:", error.message);
        } else {
          setCourts(data || []);
        }
      } catch (err) {
        console.error("🔥 ERROR SISTEM:", err);
      }
    }
    fetchCourts();
  }, []);

  // 2. TIMER BOOKING (SULTAN TIME)
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

  // 3. HITUNG HARGA OTOMATIS
  useEffect(() => {
    if (selectedCourt && selectedDate) {
      const day = new Date(selectedDate).getDay();
      const isWeekend = [0, 5, 6].includes(day);
      const rate = isWeekend ? selectedCourt.price_weekend : selectedCourt.price_weekday;
      setTotalPrice(rate * duration);
    }
  }, [selectedCourt, selectedDate, duration]);

  // 4. RADAR TELEGRAM (VIA JALUR PIPA API)
  const sendTelegramAlert = async (bookingData: any) => {
    const text = `🚨 *BOOKING BARU SKY!* 🚨\n\n` +
                 `👤 *Nama:* ${bookingData.user_name}\n` +
                 `🏟️ *Unit:* ${bookingData.court_name}\n` +
                 `📅 *Tanggal:* ${bookingData.booking_date}\n` +
                 `⏰ *Jam:* ${bookingData.start_time} (${bookingData.duration} Jam)\n` +
                 `💰 *Total:* Rp ${bookingData.total_price.toLocaleString('id-ID')}\n\n` +
                 `👉 *Segera cek dashboard Admin!*`;

    try {
      await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text })
      });
    } catch (e) { 
      console.error("Gagal kirim Telegram", e); 
    }
  };

  const handleBooking = async () => {
    if (!selectedCourt) return alert("PILIH LAPANGAN DAHULU!");
    if (!selectedDate) return alert("TANGGAL BELUM DIISI!");
    if (!selectedTime) return alert("JAM MULAI BELUM DIPILIH!");
    if (!custName) return alert("NAMA PENYEWA MASIH KOSONG!");
    if (!custWA) return alert("NOMOR WHATSAPP BELUM DIISI!");
    if (!receiptFile) return alert("UNGGAH FOTO BUKTI BAYAR!");

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

      const { error: dbError } = await supabase.from("bookings").insert([{
        court_id: selectedCourt.id,
        booking_date: selectedDate,
        start_time: selectedTime,
        user_name: custName,
        user_phone: custWA,
        total_price: totalPrice,
        receipt_url: urlData.publicUrl,
        status: 'pending'
      }]);
      
      if (dbError) throw dbError;

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
          <h1 className="text-3xl md:text-4xl font-black mb-4 uppercase italic">MANTEP DOK!</h1>
          <p className="mb-6 uppercase text-xs text-black">Radar Admin sudah berbunyi.<br/>Silakan lapor via WA untuk aktivasi jadwal Anda.</p>
          <div className="space-y-4">
            <button onClick={() => window.open(`https://wa.me/6289616265702?text=KONFIRMASI%20BOOKING%20SKY:%20${savedBooking.user_name}`, "_blank")} className="bg-[#25D366] text-white p-5 w-full text-xl font-black uppercase shadow-[6px_6px_0px_0px_black] active:translate-y-1 transition-all">LAPOR KE ADMIN (WA)</button>
            <button onClick={() => window.location.reload()} className="bg-white text-black border-4 border-black p-3 w-full text-sm font-black uppercase flex items-center justify-center gap-2 italic">
              <ArrowLeft size={16} /> Booking Unit Lagi
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#EAB308] text-black font-bold pb-10 overflow-x-hidden flex flex-col">
      {/* HEADER OPTIMIZED */}
      <header className="relative min-h-[450px] flex items-center justify-center border-b-[10px] border-black p-6">
        <Image src="/header-bg.jpg" alt="Court" fill className="object-cover brightness-[0.25]" priority />
        <div className="relative z-10 w-full max-w-6xl flex flex-col md:flex-row justify-between items-center gap-8 text-white">
          
          {/* UPDATED G-MAPS LINK */}
          <a href="https://maps.app.goo.gl/YayFKRZKqfwzWTTk7" target="_blank" rel="noopener noreferrer" className="bg-[#FDE047] border-4 border-black p-4 shadow-[6px_6px_0px_0px_black] hover:rotate-3 transition-transform text-black flex flex-col items-center group">
            <Navigation size={40} className="group-hover:animate-bounce" />
            <p className="text-[12px] font-black uppercase mt-1">LOKASI CIATER</p>
          </a>

          <div className="flex flex-col items-center">
             <div className="bg-[#F472B6] border-2 border-black px-4 py-1 mb-4 shadow-[4px_4px_0px_0px_black] -rotate-1">
                <p className="text-sm md:text-xl font-black uppercase text-white italic tracking-widest">#1 Family Sportainment</p>
             </div>
             <h1 className="text-5xl md:text-7xl font-black uppercase italic text-center drop-shadow-[6px_6px_0px_rgba(0,0,0,1)] leading-tight">
               <span className="text-[#38BDF8]">Dad's Hero,</span><br/>
               <span className="text-[#F472B6]">Mom's Glows,</span><br/>
               <span className="text-[#4ADE80]">Kid's Happy</span>
             </h1>
          </div>

          <div className="bg-[#F472B6] border-4 border-black p-2 shadow-[6px_6px_0px_0px_black] rotate-3 hidden md:block">
            <div className="relative w-24 h-24 bg-white border-2 border-black">
              <Image src="/qr-ig.png" alt="QR" fill className="p-1 object-contain" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8 md:mt-12 px-4 flex-grow">
        <div className="lg:col-span-2 space-y-10">
          
          {/* STEP 1: PILIH LAPANGAN */}
          <section className="bg-white border-4 border-black p-6 shadow-[10px_10px_0px_0px_black]">
            <div className="flex items-center gap-3 mb-8 bg-black text-[#FDE047] p-3 border-4 border-black inline-flex transform -rotate-1">
              <Zap size={28} />
              <h2 className="text-2xl uppercase font-black tracking-tighter">1. Pilih Lapangan</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {courts.length > 0 ? courts.map((court) => {
                const bgImg = court.name.toLowerCase().includes('futsal 1') ? '/futsal1.jpg' : 
                              court.name.toLowerCase().includes('futsal 2') ? '/futsal2.jpg' :
                              court.name.toLowerCase().includes('1') ? '/pb1.jpg' : '/pb2.jpg';
                return (
                  <button key={court.id} onClick={() => setSelectedCourt(court)} className={`relative h-48 border-4 border-black flex items-center justify-center overflow-hidden transition-all ${selectedCourt?.id === court.id ? "bg-[#F472B6] scale-[1.02]" : "bg-white shadow-[8px_8px_0px_0px_black] hover:-translate-y-1"}`}>
                    <Image src={bgImg} alt="Court" fill className={`object-cover transition-opacity ${selectedCourt?.id === court.id ? 'opacity-70' : 'opacity-100'}`} />
                    <div className="absolute inset-4 z-10 p-2 pointer-events-none">
                      <Image src={court.type === 'FUTSAL' ? '/logo-futsal.png' : '/logo-pb.png'} alt="Logo" fill className="object-contain drop-shadow-2xl" />
                    </div>
                    <div className="absolute top-2 left-2 z-20">
                      <span className="bg-black text-white px-3 py-1 text-xs font-black uppercase italic shadow-[2px_2px_0px_0px_black]">{court.name}</span>
                    </div>
                  </button>
                )
              }) : (
                <div className="col-span-2 flex flex-col items-center py-10 text-red-600 bg-red-50 border-2 border-dashed border-red-200 uppercase">
                  <AlertCircle size={40} className="mb-2" />
                  <p className="font-black italic">DATA UNIT ERROR KONEKSI!</p>
                </div>
              )}
            </div>
          </section>

          {/* STEP 2: DATA & JADWAL */}
          <section className="bg-white border-4 border-black p-6 shadow-[10px_10px_0px_0px_black] grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-4">
                <h3 className="text-lg uppercase font-black border-b-4 border-pink-500 inline-block mb-2 italic tracking-wider">Jadwal & Durasi</h3>
                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full p-4 border-4 border-black bg-[#FDE047] font-black outline-none text-base" />
                <div className="flex gap-2 font-black">
                  <select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} className="flex-1 p-4 border-4 border-black bg-white outline-none text-base">
                    <option value="">JAM MULAI</option>
                    {Array.from({ length: 16 }, (_, i) => `${(i + 7).toString().padStart(2, "0")}:00`).map(slot => <option key={slot} value={slot}>{slot} WIB</option>)}
                  </select>
                  <select value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-24 p-4 border-4 border-black bg-white outline-none text-base">
                    {[1,2,3,4].map(h => <option key={h} value={h}>{h} Jam</option>)}
                  </select>
                </div>
             </div>
             <div className="space-y-4 font-black uppercase">
                <h3 className="text-lg uppercase font-black border-b-4 border-[#38BDF8] inline-block mb-2 italic">Biodata</h3>
                <input placeholder="NAMA LENGKAP" value={custName} onChange={(e)=>setCustName(e.target.value.toUpperCase())} className="w-full p-4 border-4 border-black outline-none focus:bg-white text-base" />
                <input placeholder="NOMOR WA" type="tel" value={custWA} onChange={(e)=>setCustWA(e.target.value)} className="w-full p-4 border-4 border-black outline-none focus:bg-white text-base" />
             </div>
          </section>
        </div>

        {/* ASIDE: SUMMARY (MOBILE FRIENDLY POSITIONING) */}
        <aside className="lg:col-span-1">
          <div className="bg-[#F472B6] border-8 border-black p-6 shadow-[12px_12px_0px_0px_black] sticky top-6">
            <h2 className="text-3xl font-black uppercase mb-2 border-b-4 border-black pb-2 italic text-white">Ringkasan</h2>
            {selectedCourt ? (
              <div className="space-y-6">
                <div className="bg-white border-4 border-black p-2 flex items-center justify-center gap-3 animate-pulse">
                  <Hourglass className="text-red-600" size={24} />
                  <p className="text-xl md:text-2xl font-black font-mono">TIMER: {Math.floor(timeLeft/60).toString().padStart(2,'0')}:{(timeLeft%60).toString().padStart(2,'0')}</p>
                </div>
                
                <p className="text-4xl font-black uppercase italic tracking-tighter text-white drop-shadow-[3px_3px_0px_rgba(0,0,0,1)]">{selectedCourt.name}</p>
                
                <div className="bg-white p-4 border-4 border-black shadow-[4px_4px_0px_black]">
                    <p className="text-[11px] uppercase font-black mb-2 text-blue-700 italic border-b-2 border-blue-100 pb-1">
                      🏧 TRANSFER: BCA - 4970537771 a/n DINAH PATRICIA
                    </p>
                    <label className="text-[10px] uppercase font-black block mb-1 tracking-tighter">Upload Bukti Bayar:</label>
                    <input type="file" accept="image/*" onChange={(e) => setReceiptFile(e.target.files ? e.target.files[0] : null)} className="w-full text-[10px] font-black file:bg-[#4ADE80] file:border-black file:border-2 file:px-2 file:py-1 file:mr-2" />
                </div>

                <div className="bg-black text-[#FDE047] p-4 border-4 border-white transform -rotate-2 shadow-xl">
                  <p className="text-[10px] uppercase mb-1 font-black text-white italic">Total ({duration} Jam):</p>
                  <p className="text-4xl font-black text-center italic">Rp {totalPrice.toLocaleString('id-ID')}</p>
                </div>

                <button onClick={handleBooking} disabled={isSubmitting} className="w-full bg-[#4ADE80] text-black border-4 border-black p-5 text-2xl font-black uppercase shadow-[8px_8px_0px_0px_black] active:translate-y-1 active:shadow-none transition-all hover:bg-[#22c55e]">
                  {isSubmitting ? "SABAR DOK..." : "BOOKING SEKARANG!"}
                </button>
              </div>
            ) : (
              <div className="text-center py-20 border-4 border-black border-dashed bg-white uppercase italic font-black text-black">SILAKAN PILIH UNIT!</div>
            )}
          </div>
        </aside>
      </div>

      <footer className="mt-20 py-8 bg-black text-white border-t-8 border-black text-center">
         <p className="text-lg md:text-2xl font-black uppercase tracking-[0.2em] italic">SKY PICKLEBALL & FUTSAL SYSTEM</p>
         <p className="text-[10px] mt-2 opacity-50 uppercase tracking-widest">© 2026 BSD CITY ELITE NETWORK</p>
      </footer>
    </main>
  );
}