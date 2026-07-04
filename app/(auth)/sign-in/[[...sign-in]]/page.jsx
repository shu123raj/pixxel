"use client";

import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { motion } from "framer-motion";
import { Wand2 } from "lucide-react";

// =====================================
// UPLOAD YOUR OWN PHOTOS HERE (5 PHOTOS)
// =====================================
const col1Images =[
  "/photo-6.jpg", 
  "/photo-7.jpg", 
  "/photo-8.jpg", 
];

const col2Images = [
  "/photo-9.jpg", 
  "/photo-1.jpg", 
];

export default function SignInPage() {
  
  return (
    // 🌟 h-[100dvh] aur overflow-hidden se ye page permanently fit to screen ho gaya hai
    <div className="h-[100dvh] w-full bg-[#030508] relative overflow-hidden flex flex-col lg:flex-row selection:bg-cyan-500/30">
      
      {/* ==========================================
          GLOBAL AMBIENT BACKGROUND
      ========================================== */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <motion.div animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, -50, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-20 -left-20 w-[300px] md:w-[400px] lg:w-[500px] h-[300px] md:h-[400px] lg:h-[500px] bg-cyan-600/15 rounded-full blur-[80px] lg:blur-[100px]" />
        <motion.div animate={{ scale: [1, 1.5, 1], x: [0, -50, 0], y: [0, 50, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-0 right-0 w-[400px] md:w-[500px] lg:w-[600px] h-[400px] md:h-[500px] lg:h-[600px] bg-blue-600/15 rounded-full blur-[100px] lg:blur-[120px]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
      </div>

      {/* ==========================================
          LEFT PANEL: WELCOME TEXT & MASONRY
      ========================================== */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="w-full lg:w-1/2 flex flex-col justify-center items-center lg:items-start gap-4 lg:gap-8 pt-8 lg:pt-0 lg:pl-12 xl:pl-20 relative z-10 h-auto lg:h-full"
      >
        
        {/* MOBILE/TABLET HEADER TEXT (Visible only on small screens to fit perfectly) */}
        <div className="block lg:hidden text-center px-4">
          <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-2 tracking-wide drop-shadow-md">
            Welcome to <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-500 drop-shadow-sm">Your Creative Studio.</span>
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm font-medium leading-relaxed opacity-90 mx-auto max-w-[400px]">Sign in to seamlessly edit, design, and render stunning imagery.</p>
        </div>

        {/* PREMIUM ANIMATED PHOTO CAROUSEL BOX (Visible only on Desktop) */}
        <div className="hidden lg:block relative w-full max-w-[460px] xl:max-w-[500px]  h-[350px] rounded-[2rem] bg-[#0c121e]/40 backdrop-blur-3xl shadow-[0_30px_90px_rgba(0,0,0,0.8)] overflow-hidden group border-none mx-auto lg:mx-0">
          
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

          {/* CENTER FLOATING STATUS BOARD */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, y:[-8, 8, -8] }} 
            transition={{ y: { duration: 6, repeat: Infinity, ease: "easeInOut" }, opacity: { delay: 0.5, duration: 0.6 } }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
          >
             <div className="bg-[#050810]/80 backdrop-blur-3xl border-none p-5 rounded-2xl shadow-[0_30px_70px_rgba(0,0,0,0.8)] flex items-center justify-center">
                <div className="flex gap-4">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="w-12 h-12 rounded-full border-2 border-transparent border-t-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.7)] shrink-0" />
                  <div className="w-36 h-12 rounded-xl bg-black/40 flex items-center px-4 gap-3 relative overflow-hidden shadow-inner">
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

        {/* Desktop Text Area Under The Photo Box */}
        <div className="hidden lg:block pl-4 relative z-20 drop-shadow-md text-left">
          <h2 className="text-4xl xl:text-[44px] font-black text-white leading-tight mb-3 tracking-wide">
            Welcome back to <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-500 drop-shadow-sm">Your Creative Studio.</span>
          </h2>
          <p className="text-slate-400 max-w-[440px] text-base font-medium leading-relaxed opacity-90">Experience breathtaking performance. Sign in to seamlessly edit, design, and render stunning imagery inside our powerful pro-creator space.</p>
        </div>
      </motion.div>

      {/* ==========================================
          RIGHT PANEL: CLERK AUTH SIGN IN BOX 
      ========================================== */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center relative z-10 h-full pb-8 lg:pb-0 px-4 sm:px-0">
        
        {/* Glow Fallback For Mobile Views */}
        <div className="absolute inset-0 lg:hidden pointer-events-none z-0 flex items-center justify-center">
          <div className="w-[300px] h-[300px] bg-cyan-600/20 rounded-full blur-[100px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.6, delay: 0.2, type: "spring", bounce: 0.4 }}
          className="relative z-10 w-full max-w-[360px] sm:max-w-[400px] md:max-w-[440px]"
        >
          {/* Clerk Integration */}
          <SignIn
            appearance={{
              baseTheme: dark,
              variables: { colorPrimary: "#06b6d4", colorBackground: "transparent", colorText: "white", colorInputBackground: "rgba(15, 23, 42, 0.7)", colorInputText: "white", borderRadius: "1.5rem" },
              elements: {
                card: "bg-slate-900/50 backdrop-blur-2xl border border-white/5 shadow-[0_30px_70px_rgba(0,0,0,0.7)] mx-auto p-4 w-full relative z-30",
                headerTitle: "text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md",
                headerSubtitle: "text-slate-400 text-xs sm:text-sm mt-1",
                socialButtonsBlockButton: "border border-white/10 bg-black/40 hover:bg-slate-800 text-slate-300 hover:text-white transition-all duration-300 rounded-xl h-10 sm:h-12 font-medium tracking-wide shadow-sm text-[13px] sm:text-[14px]",
                formButtonPrimary: "bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-extrabold h-10 sm:h-12 rounded-xl transition-all hover:scale-[1.02] shadow-[0_5px_20px_rgba(6,182,212,0.3)] hover:shadow-[0_5px_25px_rgba(6,182,212,0.45)] text-[14px] sm:text-[15px] border-none",
                formFieldInput: "bg-[#0b101b]/80 border border-white/5 focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/50 focus:bg-[#0b101b] text-white h-[45px] sm:h-[50px] rounded-xl transition-all px-4 font-medium text-sm sm:text-base shadow-inner",
                formFieldLabel: "text-slate-400 font-semibold mb-1 text-[11px] sm:text-[13px] uppercase tracking-wide",
                dividerLine: "bg-white/5",
                dividerText: "text-slate-500 text-xs sm:text-sm font-semibold tracking-wide",
                footerActionText: "text-slate-400 font-medium text-[12px] sm:text-[13px]",
                footerActionLink: "text-cyan-400 hover:text-cyan-300 font-bold transition-colors ml-1 border-b border-transparent hover:border-cyan-400 text-[12px] sm:text-[13px]",
                formFieldWarningText: "text-red-400 text-xs font-semibold",
              },
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}