"use client";

import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { motion } from "framer-motion";
import { Wand2 } from "lucide-react";
import { useEffect } from "react";

// =====================================
// UPLOAD YOUR OWN PHOTOS HERE (5 PHOTOS)
// (Apni image files public folder me rakhein, jaise public/photo-1.jpg, 
// aur niche unka path de dein)
// =====================================
const col1Images =[
  "/photo-6.jpg", // Apni 1st Photo ka link dalen
  "/photo-7.jpg", // Apni 2nd Photo ka link dalen
  "/photo-8.jpg", // Apni 3rd Photo ka link dalen
];

const col2Images = [
  "/photo-9.jpg", // Apni 4th Photo ka link dalen
  "/photo-1.jpg", // Apni 5th Photo ka link dalen
];

export default function SignInPage() {
  
  // Scroll Lock
  useEffect(() => {
    document.body.style.overflow = "hidden"; 
    return () => {
      document.body.style.overflow = "auto"; 
    };
  },[]);

  return (
    <div className="h-screen w-full bg-[#030508] relative overflow-hidden flex flex-col lg:flex-row pt-4 sm:pt-6 md:pt-8 lg:pt-[80px] pb-4 sm:pb-6 px-4 sm:px-6 gap-4 sm:gap-6 lg:gap-6 selection:bg-cyan-500/30">
      
      {/* ==========================================
          GLOBAL AMBIENT BACKGROUND
      ========================================== */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <motion.div animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, -50, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-cyan-600/15 rounded-full blur-[100px]" />
        <motion.div animate={{ scale: [1, 1.5, 1], x: [0, -50, 0], y: [0, 50, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
      </div>

      {/* ==========================================
          LEFT PANEL: SLOW-MOTION MASONRY CARDS 
      ========================================== */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="hidden lg:flex lg:w-1/2 h-full relative z-10 flex-col justify-center gap-6 sm:gap-8 p-4 sm:p-6 lg:pl-8 xl:pl-16"
      >
        
        {/* PREMIUM ANIMATED PHOTO CAROUSEL BOX (NO BORDER & LARGER) */}
        {/* Dimensions are scaled up: w-[460px], xl:w-[520px] */}
        <div className="relative w-full max-w-[320px] sm:max-w-[420px] md:max-w-[480px] lg:max-w-[460px] xl:max-w-[520px] aspect-square rounded-2xl sm:rounded-3xl lg:rounded-[2rem] bg-[#0c121e]/40 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] lg:shadow-[0_30px_90px_rgba(0,0,0,0.8)] overflow-hidden group border-0 border-none mx-auto lg:mx-0">
          
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-80" />

          {/* GRADIENT FADE MASK */}
          <div className="absolute inset-0 z-10" style={{ WebkitMaskImage: "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)" }}>
            
            <div className="flex w-full gap-5 px-5 h-[200%] absolute top-0 -left-3 mt-4 overflow-hidden transform rotate-[-4deg] scale-[1.15]">
              
              {/* COLUMN 1 : Scrolls UP slowly */}
              <div className="flex-1 w-full overflow-hidden relative">
                <motion.div 
                  animate={{ y: ["0%", "-50%"] }} 
                  transition={{ duration: 25, ease: "linear", repeat: Infinity }} 
                  className="flex flex-col gap-5 w-full"
                >
                  {[...col1Images, ...col1Images].map((src, i) => (
                    <div key={`col1-${i}`} className="w-full aspect-[4/5] rounded-[1.5rem] overflow-hidden shadow-2xl shrink-0 bg-white/5 flex items-center justify-center">
                       {/* If path is missing, it stays white/5 color instead of ugly block. Image applied naturally */}
                      <img src={src} onError={(e) => { e.target.style.display = 'none'; }} className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity" alt="Custom Portfolio" />
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* COLUMN 2 : Scrolls DOWN much slower */}
              <div className="flex-1 w-full overflow-hidden relative pt-20">
                <motion.div 
                  initial={{ y: "-50%" }} 
                  animate={{ y: "0%" }} 
                  transition={{ duration: 30, ease: "linear", repeat: Infinity }} 
                  className="flex flex-col gap-5 w-full"
                >
                  {[...col2Images, ...col2Images].map((src, i) => (
                    <div key={`col2-${i}`} className="w-full aspect-[4/5] rounded-[1.5rem] overflow-hidden shadow-2xl shrink-0 bg-white/5 flex items-center justify-center">
                      <img src={src} onError={(e) => { e.target.style.display = 'none'; }} className="w-full h-full object-cover opacity-90 filter grayscale-[15%] hover:grayscale-0 hover:opacity-100 transition-all duration-500" alt="Custom Design" />
                    </div>
                  ))}
                </motion.div>
              </div>

            </div>
          </div>

          {/* CENTER FLOATING STATUS BOARD OVER SCROLLING PICS */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, y:[-8, 8, -8] }} 
            transition={{ y: { duration: 6, repeat: Infinity, ease: "easeInOut" }, opacity: { delay: 0.5, duration: 0.6 } }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
          >
             {/* Note: Added border-0 border-none on this to match "border remove" */}
             <div className="bg-[#050810]/80 backdrop-blur-3xl border-none p-5 rounded-2xl shadow-[0_30px_70px_rgba(0,0,0,0.8)] flex items-center justify-center border-0">
                <div className="flex gap-4">
                  {/* Remove inner border around spinner: `border-transparent border-t-cyan-400` ensures its a ring with no solid background */}
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="w-12 h-12 rounded-full border-2 border-transparent border-t-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.7)] shrink-0" />
                  <div className="w-36 h-12 rounded-xl bg-black/40 flex items-center px-4 gap-3 relative overflow-hidden border-none shadow-inner">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-cyan-500/10 opacity-60"/>
                    <Wand2 className="w-[18px] h-[18px] text-cyan-400 relative z-10 shrink-0 drop-shadow-md" />
                    <div className="h-[6px] w-full bg-white/10 rounded-full overflow-hidden relative z-10">
                      <motion.div initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 2.5, repeat: Infinity }} className="h-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,1)] rounded-full" />
                    </div>
                  </div>
                </div>
             </div>
          </motion.div>

        </div>

        {/* Text Area Under The Photo Box */}
        <div className="pl-2 sm:pl-4 relative z-20 drop-shadow-md text-center lg:text-left">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[38px] xl:text-[44px] font-black text-white leading-tight mb-2 sm:mb-3 tracking-wide">
            Welcome back to <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-500 drop-shadow-sm">Your Creative Studio.</span>
          </h2>
          <p className="text-slate-400 max-w-full sm:max-w-[440px] text-xs sm:text-sm lg:text-base font-medium leading-relaxed opacity-90 mx-auto lg:mx-0">Experience breathtaking performance. Sign in to seamlessly edit, design, and render stunning imagery inside our powerful pro-creator space.</p>
        </div>
      </motion.div>

      {/* ==========================================
          RIGHT PANEL: CLERK AUTH SIGN IN BOX 
      ========================================== */}
      <div className="w-full lg:w-1/2 h-auto lg:h-full flex flex-col items-center justify-center relative z-10 py-4 sm:py-6">
        
        {/* Glow Fallback For Mobile Views */}
        <div className="absolute inset-0 lg:hidden pointer-events-none z-0 flex items-center justify-center">
          <div className="w-[300px] h-[300px] bg-cyan-600/20 rounded-full blur-[100px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.6, delay: 0.2, type: "spring", bounce: 0.4 }}
          className="relative z-10 w-full max-w-[360px] sm:max-w-[400px] md:max-w-[440px] px-2 sm:px-0"
        >
          {/* Clerk Integration */}
          <SignIn
            appearance={{
              baseTheme: dark,
              variables: { colorPrimary: "#06b6d4", colorBackground: "transparent", colorText: "white", colorInputBackground: "rgba(15, 23, 42, 0.7)", colorInputText: "white", borderRadius: "1.5rem" },
              elements: {
                card: "bg-slate-900/40 backdrop-blur-2xl border border-white/5 shadow-[0_30px_70px_rgba(0,0,0,0.7)] mx-auto p-4 w-full relative z-30",
                headerTitle: "text-3xl font-black text-white tracking-tight drop-shadow-md",
                headerSubtitle: "text-slate-400 text-sm mt-1",
                socialButtonsBlockButton: "border border-white/10 bg-black/40 hover:bg-slate-800 text-slate-300 hover:text-white transition-all duration-300 rounded-xl h-12 font-medium tracking-wide shadow-sm",
                formButtonPrimary: "bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-extrabold h-12 rounded-xl transition-all hover:scale-[1.02] shadow-[0_5px_20px_rgba(6,182,212,0.3)] hover:shadow-[0_5px_25px_rgba(6,182,212,0.45)] text-[15px] border-none",
                formFieldInput: "bg-[#0b101b]/80 border border-white/5 focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/50 focus:bg-[#0b101b] text-white h-[50px] rounded-xl transition-all px-4 font-medium text-base shadow-inner",
                formFieldLabel: "text-slate-400 font-semibold mb-1 text-[13px] uppercase tracking-wide",
                dividerLine: "bg-white/5",
                dividerText: "text-slate-500 text-sm font-semibold tracking-wide",
                footerActionText: "text-slate-400 font-medium",
                footerActionLink: "text-cyan-400 hover:text-cyan-300 font-bold transition-colors ml-1 border-b border-transparent hover:border-cyan-400",
                formFieldWarningText: "text-red-400 text-xs font-semibold",
              },
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}