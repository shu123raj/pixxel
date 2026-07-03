"use client";

import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { useEffect } from "react";

// =====================================
// UPLOAD YOUR OWN PHOTOS HERE (TOTAL 5 PHOTOS)
// (Apni images ki details apne `/public/` directory mai place kariye
// aur path is format may lagae jaise "/myphoto1.jpg" wagera )
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

  // Disable user scrolling background interaction
  useEffect(() => {
    document.body.style.overflow = "hidden"; 
    return () => {
      document.body.style.overflow = "auto"; 
    };
  },[]);

  // Array expanding magic trick loop for endless auto seamless infinite scroll lengths
  const inf1 = [...row1Photos, ...row1Photos];
  const extendedR1 = [...inf1, ...inf1]; 

  const inf2 = [...row2Photos, ...row2Photos, ...row2Photos];
  const extendedR2 = [...inf2, ...inf2]; 

  return (
    <div className="h-screen w-full bg-[#030508] relative overflow-hidden flex flex-col lg:flex-row-reverse pt-4 sm:pt-6 md:pt-8 lg:pt-[80px] pb-4 sm:pb-6 px-4 sm:px-6 gap-4 sm:gap-6 lg:gap-6 selection:bg-purple-500/30">
      
      {/* ==========================================
          GLOBAL AMBIENT BACKGROUND (Purple Theme)
      ========================================== */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <motion.div animate={{ scale:[1, 1.2, 1], x:[0, -50, 0], y:[0, 50, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[100px]" />
        <motion.div animate={{ scale:[1, 1.5, 1], x:[0, 50, 0], y:[0, -50, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-pink-600/15 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
      </div>

      {/* ==========================================
          RIGHT VISUAL PANEL (Reversed layout)
      ========================================== */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="hidden lg:flex lg:w-1/2 h-full relative z-10 flex-col justify-center gap-6 sm:gap-10 p-4 sm:p-6 lg:pr-8 xl:pr-16"
      >
        
        {/* HUGE IMMERSIVE MASONRY WRAPPER CARD (No-Border Class Attached) */}
        {/* We extended sizing w-[460px] to maxing [520px] on 2xl display*/}
        <div className="relative mx-auto lg:ml-auto lg:mr-0 w-[460px] xl:w-[520px] h-[460px] xl:h-[520px] rounded-[2rem] border-none bg-white/[0.01] backdrop-blur-2xl shadow-[0_30px_90px_rgba(0,0,0,0.9)] overflow-hidden pointer-events-none group">
            
            {/* Color Wash Overlay inside glass */}
            <div className="absolute inset-0 bg-gradient-to-t from-purple-500/15 via-transparent to-transparent opacity-80" />

            {/* RADIAL SCATTER GRADIENT WRAPPER */}
            <div className="absolute inset-0 z-10 flex flex-col justify-center gap-6" 
                 style={{ 
                    transform: "scale(1.3) rotate(-12deg)", 
                    transformOrigin: "center center", 
                    WebkitMaskImage: "radial-gradient(circle at 50% 50%, black 25%, transparent 75%)" 
                 }}>

               {/* ROW 1: SLIDING LEFT CONTINUOUSLY (Horizontally Array Moving -50% Distance seamlessly) */}
               <motion.div 
                   animate={{ x: ["0%", "-50%"] }} 
                   transition={{ duration: 40, ease: "linear", repeat: Infinity }} 
                   className="flex gap-6 w-max"
               >
                   {extendedR1.map((src, i) => (
                      <div key={`row1-${i}`} className="w-[240px] xl:w-[280px] aspect-[4/3] rounded-[1.2rem] bg-white/[0.04] shrink-0 overflow-hidden shadow-2xl flex items-center justify-center">
                          {/* If not found will appear empty gray rounded soft block gently waiting inside container */}
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
                      <div key={`row2-${i}`} className="w-[180px] xl:w-[220px] aspect-[3/4] rounded-[1.2rem] bg-white/[0.04] shrink-0 overflow-hidden shadow-2xl flex items-center justify-center">
                          <img src={src} onError={(e) => { e.target.style.display='none';}} className="w-full h-full object-cover opacity-90 grayscale-[25%] transition-all" alt="Model Portrait Layout" />
                      </div>
                   ))}
               </motion.div>
            </div>

            {/* OVERLAPPING ART STATUS BOX OVER (Static middle hovering overlay interface ) */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, y:[-12, 12, -12] }} 
              transition={{ y: { duration: 7, repeat: Infinity, ease: "easeInOut" }, opacity: { delay: 0.5, duration: 1 } }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center justify-center"
            >
               {/* Rounded floating Icon Logo block  */}
               <div className="w-[100px] h-[100px] xl:w-[120px] xl:h-[120px] rounded-3xl bg-[#080b15]/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] border-none ring-1 ring-purple-500/30 flex items-center justify-center relative overflow-hidden">
                   {/* Blur spinning sphere effect inner mask  */}
                   <motion.div animate={{ rotate: 360 }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }} className="absolute -inset-6 bg-gradient-to-tr from-purple-600/30 via-transparent to-pink-500/20 blur-[15px]" />
                   <Zap className="w-10 h-10 xl:w-12 xl:h-12 text-pink-400 animate-pulse relative z-10 drop-shadow-[0_0_15px_rgba(244,114,182,0.6)]" />
               </div>

               {/* Simulated computing engine HUD under center ring */}
               <div className="mt-5 flex flex-col gap-2.5 w-[140px] xl:w-[160px] p-3 rounded-[1rem] bg-[#020308]/60 border-none backdrop-blur-xl shadow-2xl overflow-hidden ring-1 ring-white/10">
                   <div className="h-[4px] xl:h-[5px] w-full bg-slate-800 rounded-full relative overflow-hidden">
                       <motion.div initial={{ x: "-100%" }} animate={{ x: "250%" }} transition={{ duration: 2, ease:"easeInOut", repeat: Infinity }} className="h-full w-2/5 bg-gradient-to-r from-transparent via-pink-400 to-transparent absolute" />
                   </div>
                   <div className="h-[4px] xl:h-[5px] w-4/5 ml-auto bg-slate-800/80 rounded-full relative overflow-hidden">
                       <motion.div initial={{ x: "-100%" }} animate={{ x: "200%" }} transition={{ delay:0.3, duration: 2.2, ease:"easeInOut", repeat: Infinity }} className="h-full w-3/5 bg-gradient-to-r from-transparent via-purple-400 to-transparent absolute" />
                   </div>
                   <div className="h-[4px] xl:h-[5px] w-3/5 mr-auto bg-slate-800/60 rounded-full" />
               </div>

            </motion.div>
        </div>

        {/* Text Element Info - Keeping strictly Left / Reversed standard arrangement alignment Right side  */}
        <div className="text-right ml-auto drop-shadow-md pr-2 w-full lg:max-w-md">
          <h2 className="text-3xl xl:text-4xl lg:text-[38px] font-black text-white leading-tight mb-3">
            Join the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-pink-500 to-purple-400 drop-shadow-sm">AI Revolution.</span>
          </h2>
          <p className="text-slate-400 text-sm xl:text-[15px] font-medium leading-relaxed max-w-sm ml-auto opacity-90">Create your free account today. Start to unlock professional & fast premium workflow edits tools all automatically hosted in the scalable seamless edge space cloud saving network. Fast delivery layout generation!</p>
        </div>

      </motion.div>

      {/* ==========================================
          AUTHENTICATION PANEL (Compact Form Display)
      ========================================== */}
      <div className="w-full lg:w-1/2 h-full flex flex-col items-center justify-center relative z-10 lg:-mt-0 -mt-[140px] sm:-mt-[22px] px-2 sm:px-4">
        
        {/* Background ambient specifically targeting under the Form section (Small displays only focus handling color patch display visual enhancement shadow mapping form layer gradient falloff */}
        <div className="absolute inset-0 lg:hidden pointer-events-none z-0 flex items-center justify-center">
          <div className="w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[100px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.6, delay: 0.2, type: "spring", bounce: 0.4 }}
          // SignUP interface size setup wrapper limiting scale (Width sizing standard structure bounds control framework structure display interface standard form logic box wrapper card structure display )
          className="relative z-10 w-full max-w-[400px] xl:max-w-[440px]"
        >
          {/* Main Frame Implementation Box System Standard Clerk Layer Core Integrator Auth Interface Application Overlay Auth Component Generation Base Design Style Application Box System Core Frame Layout Display Integration Block View Engine Renderer Render Method Form Form Configuration Block Overlay */}
          <SignUp
            appearance={{
              baseTheme: dark,
              variables: { colorPrimary: "#a855f7", colorBackground: "transparent", colorText: "white", colorInputBackground: "rgba(15, 23, 42, 0.65)", colorInputText: "white", borderRadius: "1.2rem" },
              elements: {
                card: "bg-slate-900/40 backdrop-blur-2xl border-none ring-1 ring-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.65)] mx-auto p-4 w-full relative z-30",
                headerTitle: "text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md",
                headerSubtitle: "text-slate-400 text-sm",
                socialButtonsBlockButton: "border border-white/5 hover:border-white/20 bg-black/50 hover:bg-slate-800 text-slate-300 transition-all duration-300 rounded-xl h-[50px] shadow-sm font-semibold tracking-wide text-sm hover:text-white",
                formButtonPrimary: "bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white font-extrabold text-[15px] h-[50px] rounded-xl transition-all hover:scale-[1.02] shadow-[0_5px_20px_rgba(168,85,247,0.3)] hover:shadow-[0_5px_25px_rgba(168,85,247,0.45)] border-none mt-2",
                formFieldInput: "bg-[#0b101b]/80 border-none ring-1 ring-white/5 focus:ring-purple-500/60 focus:bg-[#0b101b] text-white h-[50px] rounded-xl transition-all text-[14px] px-4 font-medium shadow-inner outline-none focus:outline-none focus:shadow-[0_0_0_1px_rgba(168,85,247,0.5)]",
                formFieldLabel: "text-slate-300 font-semibold text-[13px] tracking-wide mb-1.5 ml-1",
                dividerLine: "bg-white/5",
                dividerText: "text-slate-500 text-xs font-semibold uppercase tracking-wider",
                footerActionText: "text-slate-400 text-sm",
                footerActionLink: "text-pink-400 hover:text-pink-300 font-bold transition-colors text-sm hover:underline border-b border-transparent ml-1",
                formFieldWarningText: "text-pink-500 text-xs font-semibold ml-1 mt-1",
              },
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}