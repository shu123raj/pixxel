"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import Link from "next/link";

export default function ScrollPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenDismissed, setHasBeenDismissed] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const pathname = usePathname();

  // Route change hone par state reset karein
  useEffect(() => {
    setIsVisible(false);
    setHasBeenDismissed(false);
    setIsClosing(false);
  }, [pathname]);

  // Optimized Scroll Logic
  useEffect(() => {
    const handleScroll = () => {
      // Agar popup already dismiss ho chuka hai ya dikh raha hai, toh aage kuch mat check karo (Performance ke liye)
      if (hasBeenDismissed || isVisible || isClosing) return;

      const scrollY = window.scrollY;
      
      // 🌟 YAHAN FIX KIYA HAI:
      // Ab popup tab aayega jab user kam se kam 1.2x (lagbhag 1 poora bada section + thoda extra) scroll kar lega.
      // Isse ye turant nahi aayega, balki sahi time par aayega.
      const triggerThreshold = Math.max(520, window.innerHeight * 0.9); 

      if (scrollY > triggerThreshold) {
        setIsVisible(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    
    // Check on initial load
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasBeenDismissed, isVisible, isClosing]);

  // Close Animation Handle
  const handleClose = () => {
    setIsClosing(true); // Icon ghumaane aur fade karne ka trigger
    
    setTimeout(() => {
      setIsVisible(false);
      setHasBeenDismissed(true); // Wapas show nahi hoga
      setIsClosing(false);
    }, 500); 
  };

  if (!isVisible && !isClosing) return null;

  const hiddenPages = ["/sign-in", "/sign-up", "/dashboard", "/pricing", "/editor"]; 
  
  // Check if current page is in the hiddenPages list
  const isHidden = hiddenPages.some((hiddenPath) => pathname?.startsWith(hiddenPath));

  // Agar page hidden list mein hai, toh kuch bhi return (show) mat karo
  if (isHidden) {
    return null;
  }

  return (
    // Background Overlay
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 transition-opacity duration-500 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Modal Box */}
      <div
        className={`relative w-full max-w-[650px] bg-[#111111] text-white shadow-2xl p-6 md:p-8 transition-transform duration-500 ${
          isClosing ? "scale-95" : "scale-100" 
        }`}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-white transition-colors z-6"
        >
          <X 
            size={20} 
            className={`transition-transform duration-500 ${
              isClosing ? "rotate-180" : "rotate-0"
            }`} 
          />
        </button>

        {/* Content Layout */}
        <div className="flex flex-col md:flex-row items-stretch justify-between gap-6 md:gap-8 mt-3">
          
          {/* Left Column */}
          <div className="flex-1 flex flex-col items-center text-center space-y-3">
            <h2 className="text-lg md:text-xl font-small tracking-wide">Get it all at once with Pixxel</h2>
            
            {/* LEFT IMAGE BOX */}
            <div className="w-full aspect-[5/3] rounded-2xl overflow-hidden relative shadow-inner">
              <img 
                src="device3.jpg" 
                alt="Pixxel Desktop and Mobile" 
                className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
              />
            </div>

            <p className="text-gray-400 text-xs md:text-sm px-1 flex-grow">
              Combine the power of Pixxel with the freedom of device App
            </p>
            <Link href="/pricing">
              <button
                onClick={handleClose}
                className="font-extrabold uppercase tracking-[0.2em] transition-all duration-300 hover:-translate-y-[2px] active:scale-95"
                style={{
                  background: "linear-gradient(90deg, #22d3ee 0%, #a855f7 100%)",
                  color: "#000000",
                  fontSize: "12px",
                  padding: "8px 80px",
                  borderRadius: "3px",
                  boxShadow: "0 6px 28px rgba(13, 78, 88, 0.14), 0 2px 8px rgba(168,85,247,0.2)",
                  letterSpacing: "0.1em",
                }}
              >
                VIEW PLANS
              </button>
            </Link>
          </div>

          {/* Center Divider ("or") */}
          <div className="hidden md:flex flex-col items-center justify-center gap-3 text-gray-600">
            <div className="w-[1px] h-full min-h-[80px] bg-gray-800"></div>
            <span className="italic text-xs font-serif text-gray-500">or</span>
            <div className="w-[1px] h-full min-h-[80px] bg-gray-800"></div>
          </div>

          {/* Right Column */}
          <div className="flex-1 flex flex-col items-center text-center space-y-3">
            <h2 className="text-lg md:text-xl font-small tracking-wide">Edit your photos anywhere</h2>
            
            {/* RIGHT IMAGE BOX */}
            <div className="w-full aspect-[5/3] rounded-2xl overflow-hidden relative shadow-inner">
              <img
                src="device11.png"
                alt="Pixxel Mobile App"
                className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
              />
            </div>

            <p className="text-gray-400 text-xs md:text-sm px-1 flex-grow">
              Get Pixxel Mobile and bring professional editing power to your phone.
            </p>
            <Link href="/pricing">
              <button
                onClick={handleClose} 
                className="font-extrabold uppercase tracking-[0.2em] transition-all duration-300 hover:-translate-y-[2px] active:scale-95"
                style={{
                  background: "linear-gradient(90deg, #ffffff 0%, #ffffff 100%)",
                  color: "#000000",
                  fontSize: "12px",
                  padding: "8px 80px",
                  borderRadius: "3px",
                  boxShadow: "0 6px 28px rgba(13, 78, 88, 0.14), 0 2px 8px rgba(168,85,247,0.2)",
                  letterSpacing: "0.1em",
                }}
              >
                VIEW PLANS
              </button>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
