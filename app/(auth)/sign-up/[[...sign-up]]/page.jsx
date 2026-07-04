"use client";

import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { useEffect, useState } from "react";

// =====================================
// UPLOAD YOUR OWN PHOTOS HERE (TOTAL 5 PHOTOS)
// =====================================
const row1Photos =[
  "/photo-1.jpg", 
  "/photo-2.jpg", 
  "/photo-3.jpg",
];

const row2Photos = [
  "/photo-4.jpg", 
  "/photo-5.jpg",
];

export default function SignUpPage() {

  const [isDesktop, setIsDesktop] = useState(true);

  // Screen size check for mobile scrolling fallback
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Lock scrolling on large screens to fit strictly in one view
  useEffect(() => {
    if (isDesktop) {
      document.body.style.overflow = "hidden"; 
    } else {
      document.body.style.overflow = "auto"; 
    }
    return () => {
      document.body.style.overflow = "auto"; 
    };
  }, [isDesktop]);

  // Array expanding magic trick loop for endless auto seamless infinite scroll lengths
  const inf1 = [...row1Photos, ...row1Photos];
  const extendedR1 = [...inf1, ...inf1]; 

  const inf2 = [...row2Photos, ...row2Photos, ...row2Photos];
  const extendedR2 = [...inf2, ...inf2]; 

  return (
    // 🌟 h-[100dvh] used here to lock page into the viewport exactly like Sign-in
    <div className="h-[100dvh] w-full bg-[#030508] relative overflow-hidden flex flex-col lg:flex-row-reverse pt-12 sm:pt-16 lg:pt-[80px] pb-10 lg:pb-6 px-6 sm:px-10 lg:px-6 gap-10 lg:gap-6 selection:bg-purple-500/30 overflow-y-auto lg:overflow-y-hidden">
      
      {/* ==========================================
          GLOBAL AMBIENT BACKGROUND (Purple Theme)
      ========================================== */}
      <div className="fixed lg:absolute inset-0 pointer-events-none z-0">
        <motion.div animate={{ scale:[1, 1.2, 1], x:[0, -50, 0], y:[0, 50, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-20 -right-20 w-[300px] md:w-[400px] lg:w-[500px] h-[300px] md:h-[400px] lg:h-[500px] bg-purple-600/15 rounded-full blur-[80px] lg:blur-[100px]" />
        <motion.div animate={{ scale:[1, 1.5, 1], x:[0, 50, 0], y:[0, -50, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-0 left-0 w-[400px] md:w-[500px] lg:w-[600px] h-[400px] md:h-[500px] lg:h-[600px] bg-pink-600/15 rounded-full blur-[100px] lg:blur-[120px]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
      </div>

      {/* ==========================================
          LEFT VISUAL PANEL (Reversed layout)
      ========================================== */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="w-full lg:w-1/2 flex flex-col justify-center items-center lg:items-end gap-6 sm:gap-8 lg:pr-12 xl:pr-20 relative z-10 h-auto lg:h-full"
      >
        
        {/* MOBILE/TABLET HEADER TEXT (Visible only on small screens) */}
        <div className="block lg:hidden text-center px-4 mt-4">
          <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-2 tracking-wide drop-shadow-md">
            Join the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-pink-500 to-purple-400 drop-shadow-sm">AI Revolution.</span>
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm font-medium leading-relaxed opacity-90 mx-auto max-w-[400px]">Create your free account today. Start to unlock professional & fast premium workflow edits tools.</p>
        </div>

        {/* HUGE IMMERSIVE MASONRY WRAPPER CARD (Visible on Desktop) */}
        {/* 🌟 Fixed height applied here instead of aspect ratio as requested: h-[350px] on normal screens, h-[450px] on XL */}
        <div className="hidden lg:block relative mx-auto lg:ml-auto lg:mr-0 w-full max-w-[460px] xl:max-w-[500px] h-[350px] xl:h-[450px] rounded-[2rem] border-none bg-white/[0.01] backdrop-blur-2xl shadow-[0_30px_90px_rgba(0,0,0,0.9)] overflow-hidden pointer-events-none group">
            
            {/* Color Wash Overlay inside glass */}
            <div className="absolute inset-0 bg-gradient-to-t from-purple-500/15 via-transparent to-transparent opacity-80" />

            {/* RADIAL SCATTER GRADIENT WRAPPER */}
            <div className="absolute inset-0 z-10 flex flex-col justify-center gap-6" 
                 style={{ 
                    transform: "scale(1.3) rotate(-12deg)", 
                    transformOrigin: "center center", 
                    WebkitMaskImage: "radial-gradient(circle at 50% 50%, black 25%, transparent 75%)" 
                 }}>

               {/* ROW 1: SLIDING LEFT CONTINUOUSLY */}
               <motion.div 
                   animate={{ x: ["0%", "-50%"] }} 
                   transition={{ duration: 40, ease: "linear", repeat: Infinity }} 
                   className="flex gap-6 w-max"
               >
                   {extendedR1.map((src, i) => (
                      <div key={`row1-${i}`} className="w-[200px] xl:w-[240px] aspect-[4/3] rounded-[1.2rem] bg-white/[0.04] shrink-0 overflow-hidden shadow-2xl flex items-center justify-center">
                          <img src={src} onError={(e) => { e.target.style.display='none';}} className="w-full h-full object-cover opacity-90 grayscale-[10%]" alt="Creative Concept" />
                      </div>
                   ))}
               </motion.div>

               {/* ROW 2: SLIDING RIGHT OPPOSITE SCROLL OFFSET */}
               <motion.div 
                   animate={{ x: ["-50%", "0%"] }} 
                   transition={{ duration: 45, ease: "linear", repeat: Infinity }} 
                   className="flex gap-6 w-max pl-[120px]"
               >
                   {extendedR2.map((src, i) => (
                      <div key={`row2-${i}`} className="w-[150px] xl:w-[180px] aspect-[3/4] rounded-[1.2rem] bg-white/[0.04] shrink-0 overflow-hidden shadow-2xl flex items-center justify-center">
                          <img src={src} onError={(e) => { e.target.style.display='none';}} className="w-full h-full object-cover opacity-90 grayscale-[25%] transition-all" alt="Model Portrait Layout" />
                      </div>
                   ))}
               </motion.div>
            </div>

            {/* OVERLAPPING ART STATUS BOX OVER */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, y:[-12, 12, -12] }} 
              transition={{ y: { duration: 7, repeat: Infinity, ease: "easeInOut" }, opacity: { delay: 0.5, duration: 1 } }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center justify-center"
            >
               {/* Rounded floating Icon Logo block */}
               <div className="w-[80px] h-[80px] xl:w-[100px] xl:h-[100px] rounded-3xl bg-[#080b15]/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] border-none ring-1 ring-purple-500/30 flex items-center justify-center relative overflow-hidden">
                   <motion.div animate={{ rotate: 360 }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }} className="absolute -inset-6 bg-gradient-to-tr from-purple-600/30 via-transparent to-pink-500/20 blur-[15px]" />
                   <Zap className="w-8 h-8 xl:w-10 xl:h-10 text-pink-400 animate-pulse relative z-10 drop-shadow-[0_0_15px_rgba(244,114,182,0.6)]" />
               </div>

               {/* Simulated computing engine HUD */}
               <div className="mt-4 flex flex-col gap-2 w-[120px] xl:w-[140px] p-2.5 rounded-[1rem] bg-[#020308]/60 border-none backdrop-blur-xl shadow-2xl overflow-hidden ring-1 ring-white/10">
                   <div className="h-[3px] xl:h-[4px] w-full bg-slate-800 rounded-full relative overflow-hidden">
                       <motion.div initial={{ x: "-100%" }} animate={{ x: "250%" }} transition={{ duration: 2, ease:"easeInOut", repeat: Infinity }} className="h-full w-2/5 bg-gradient-to-r from-transparent via-pink-400 to-transparent absolute" />
                   </div>
                   <div className="h-[3px] xl:h-[4px] w-4/5 ml-auto bg-slate-800/80 rounded-full relative overflow-hidden">
                       <motion.div initial={{ x: "-100%" }} animate={{ x: "200%" }} transition={{ delay:0.3, duration: 2.2, ease:"easeInOut", repeat: Infinity }} className="h-full w-3/5 bg-gradient-to-r from-transparent via-purple-400 to-transparent absolute" />
                   </div>
                   <div className="h-[3px] xl:h-[4px] w-3/5 mr-auto bg-slate-800/60 rounded-full" />
               </div>
            </motion.div>
        </div>

        {/* Text Element Info - Desktop View */}
        <div className="hidden lg:block text-right ml-auto drop-shadow-md pr-2 w-full max-w-[440px]">
          <h2 className="text-3xl xl:text-4xl lg:text-[38px] font-black text-white leading-tight mb-3">
            Join the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-pink-500 to-purple-400 drop-shadow-sm">AI Revolution.</span>
          </h2>
          <p className="text-slate-400 text-sm font-medium leading-relaxed opacity-90">Create your free account today. Start to unlock professional & fast premium workflow edits tools all automatically hosted in the scalable seamless edge space cloud saving network. Fast delivery layout generation!</p>
        </div>

      </motion.div>

      {/* ==========================================
          RIGHT PANEL (Form Side): CLERK AUTH SIGN IN BOX 
      ========================================== */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center relative z-10 pb-8 lg:pb-0 px-4 sm:px-0">
        
        {/* Glow Fallback For Mobile Views */}
        <div className="absolute inset-0 lg:hidden pointer-events-none z-0 flex items-center justify-center">
          <div className="w-[300px] h-[300px] bg-purple-600/20 rounded-full blur-[100px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.6, delay: 0.2, type: "spring", bounce: 0.4 }}
          className="relative z-10 w-full max-w-[360px] sm:max-w-[400px] md:max-w-[440px]"
        >
          <SignUp
            appearance={{
              baseTheme: dark,
              variables: { colorPrimary: "#a855f7", colorBackground: "transparent", colorText: "white", colorInputBackground: "rgba(15, 23, 42, 0.65)", colorInputText: "white", borderRadius: "1.2rem" },
              elements: {
                card: "bg-slate-900/40 backdrop-blur-2xl border-none ring-1 ring-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.65)] mx-auto p-2 sm:p-4 w-full relative z-30",
                headerTitle: "text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md",
                headerSubtitle: "text-slate-400 text-xs sm:text-sm mt-1",
                socialButtonsBlockButton: "border border-white/5 hover:border-white/20 bg-black/50 hover:bg-slate-800 text-slate-300 transition-all duration-300 rounded-xl h-[45px] sm:h-[50px] shadow-sm font-semibold tracking-wide text-xs sm:text-sm hover:text-white",
                formButtonPrimary: "bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white font-extrabold text-[14px] sm:text-[15px] h-[45px] sm:h-[50px] rounded-xl transition-all hover:scale-[1.02] shadow-[0_5px_20px_rgba(168,85,247,0.3)] hover:shadow-[0_5px_25px_rgba(168,85,247,0.45)] border-none mt-2",
                formFieldInput: "bg-[#0b101b]/80 border-none ring-1 ring-white/5 focus:ring-purple-500/60 focus:bg-[#0b101b] text-white h-[45px] sm:h-[50px] rounded-xl transition-all text-sm sm:text-base px-4 font-medium shadow-inner outline-none focus:outline-none focus:shadow-[0_0_0_1px_rgba(168,85,247,0.5)]",
                formFieldLabel: "text-slate-300 font-semibold text-[11px] sm:text-[13px] tracking-wide mb-1.5 ml-1",
                dividerLine: "bg-white/5",
                dividerText: "text-slate-500 text-xs sm:text-xs font-semibold uppercase tracking-wider",
                footerActionText: "text-slate-400 text-xs sm:text-sm",
                footerActionLink: "text-pink-400 hover:text-pink-300 font-bold transition-colors text-xs sm:text-sm hover:underline border-b border-transparent ml-1",
                formFieldWarningText: "text-pink-500 text-xs font-semibold ml-1 mt-1",
              },
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}