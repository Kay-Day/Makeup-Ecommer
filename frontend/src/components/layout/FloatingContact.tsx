export function FloatingContact() {
  return (
    <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-50">
      
      {/* Phone Icon */}
      <a 
        href="tel:0766669266" 
        className="w-14 h-14 bg-[#4CAF50] rounded-full shadow-[0_10px_30px_rgba(76,175,80,0.4)] flex items-center justify-center hover:scale-110 transition-transform relative group animate-float"
        style={{ animationDuration: '3s' }}
      >
        <div className="absolute inset-0 bg-[#4CAF50] rounded-full animate-ping opacity-70"></div>
        <span className="material-symbols-outlined text-white text-3xl z-10 animate-pulse">call</span>
        <span className="absolute right-full mr-4 bg-[#4CAF50] text-white px-4 py-2 rounded-lg shadow-lg font-bold text-sm text-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          0766.669.266
        </span>
      </a>

      {/* Zalo Icon */}
      <a 
        href="https://zalo.me/0393409881" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="w-14 h-14 bg-white rounded-full shadow-[0_10px_30px_rgba(0,132,255,0.3)] flex items-center justify-center hover:scale-110 transition-transform relative group animate-float"
        style={{ animationDuration: '3.5s' }}
      >
        <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-30"></div>
        <div className="z-10 text-[#0068FF] font-bold text-xl tracking-tighter" style={{ fontFamily: 'Arial, sans-serif' }}>
          Zalo
        </div>
        <span className="absolute right-full mr-4 bg-[#0068FF] text-white px-4 py-2 rounded-lg shadow-lg font-bold text-sm text-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Chat Zalo ngay
        </span>
      </a>

    </div>
  );
}
