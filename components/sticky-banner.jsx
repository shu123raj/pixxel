"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation"; 
import { motion, AnimatePresence } from "framer-motion";

export function StickyBanner() {
  const [isVisible, setIsVisible] = useState(false);
  
  // URL path get kar rahe hain, null fallback ke sath
  const pathname = usePathname() || ""; 

  useEffect(() => {
    const handleScroll = () => {
      const firstSectionThreshold = Math.max(420, window.innerHeight * 0.82);
      setIsVisible(window.scrollY > firstSectionThreshold);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [pathname]);

  // ===============================================
  // 🚫 BULLETPROOF HIDE LOGIC
  // ===============================================
  
  // 1. Exact Homepage Check (Ye root path, khali path, /home aur /hdr sabko block karega)
  // (Pichli baar aapne /hdr page ka code bheja tha, isliye maine wo bhi list me add kar diya hai)
  const isHomePage = false;

  // 2. Starts-With Check (Dashboard ya login pages ke andar ke pages ke liye)
  const prefixHiddenPaths = ["/sign-in", "/sign-up", "/dashboard", "/editor"]; 
  const isHiddenPrefix = prefixHiddenPaths.some((path) => pathname.startsWith(path));

  // Agar dono mein se koi bhi condition true hai, toh turant return null kar do
  if (isHomePage || isHiddenPrefix) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{
            duration: 0.35,
            ease: "easeOut",
          }}
          className="fixed top-0 left-0 right-0 z-[999] h-[57px] flex items-center bg-black/20 backdrop-blur-[70px] shadow-[0_8px_32px_rgba(0,0,0,.50)]"
        >
          {/* Top Gradient Line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500" />

          {/* Glow Effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[100px] bg-gradient-to-r from-cyan-400/10 to-purple-500/10 blur-[60px] rounded-full pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between w-full px-6 lg:px-10">
            
            {/* Logo */}
            <div className="flex-1 flex justify-start">
              <Link
                href="/"
                className="flex items-center transition-opacity hover:opacity-90"
              >
                <Image
                  src="/logo-text.png"
                  alt="Pixxel"
                  width={150}
                  height={40}
                  priority
                  className="h-30 sm:h-32 w-auto object-contain"
                />
              </Link>
            </div>

            {/* Center Text */}
            <div className="hidden md:flex flex-1 flex-col items-center justify-center">
              <span className="text-white text-[14px] font-semibold tracking-wide">
                Edit photos with ease
              </span>
              <span className="text-white/50 text-[11px] tracking-wide">
                Powered by Pixxel AI
              </span>
            </div>

            {/* Button */}
            <div className="flex-1 flex justify-end">
              <Link href="/pricing">
                <button
                  className="font-extrabold uppercase transition-all duration-300 hover:-translate-y-[2px] active:scale-95"
                  style={{
                    background:
                      "linear-gradient(90deg, #22d3ee 0%, #a855f7 100%)",
                    color: "#000",
                    fontSize: "10px",
                    padding: "12px 28px",
                    borderRadius: "10px",
                    letterSpacing: "0.15em",
                    boxShadow:
                      "0 8px 30px rgba(34,211,238,0.18), 0 4px 15px rgba(168,85,247,0.25)",
                  }}
                >
                  VIEW PLANS
                </button>
              </Link>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
