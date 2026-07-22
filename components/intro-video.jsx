"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

// Premium animation curve
const customEase = [0.76, 0, 0.24, 1];

export default function IntroVideo({ isLoadingUser, isLoggedIn, onComplete }) {
  const [showVideo, setShowVideo] = useState(false);
  const [isSessionChecked, setIsSessionChecked] = useState(false);

  useEffect(() => {
    // Jab tak user ka data load ho raha hai, tab tak kuch mat karo
    if (isLoadingUser) return;

    const currentStatus = isLoggedIn ? "logged_in" : "guest";
    const savedStatus = sessionStorage.getItem("pixxel_preloader_status");

    if (savedStatus === currentStatus) {
      // User purana hai -> Video skip karo
      setIsSessionChecked(true);
      setShowVideo(false);
      if (onComplete) onComplete(false); // false = video didn't play
    } else {
      // Naya user hai ya login hua hai -> Video chalao
      setIsSessionChecked(true);
      setShowVideo(true);
      document.body.style.overflow = "hidden";

      const timer = setTimeout(() => {
        setShowVideo(false);
        sessionStorage.setItem("pixxel_preloader_status", currentStatus);
        document.body.style.overflow = "";
        if (onComplete) onComplete(true); // true = video finished playing
      }, 3000); // 3 seconds video timer

      return () => {
        clearTimeout(timer);
        document.body.style.overflow = "";
      };
    }
  }, [isLoadingUser, isLoggedIn, onComplete]);

  // Jab tak session check ho raha hai, Verifying wali screen dikhao
  if (isLoadingUser || !isSessionChecked) {
    return <div className="fixed inset-0 bg-[#000] z-[999999]" />;
  }

  // Session check hone ke baad video ka wrapper
  return (
    <AnimatePresence mode="wait">
      {showVideo && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[999999] flex items-center justify-center bg-[#000] overflow-hidden pointer-events-auto"
          exit={{
            opacity: 0,
            y: -100,
            scale: 0.95,
            filter: "blur(10px)",
            transition: { duration: 0.8, ease: customEase },
          }}
        >
          <video
            src="https://res.cloudinary.com/oqoeovyq/video/upload/v1784754376/Green_and_White_Minimalist_Intro_Video_2_cf9tvk.mp4"
            autoPlay
            muted
            playsInline
            /* 🌟 RESPONSIVE FIX: Mobile par 'object-contain' taaki side se cut na ho, 
                aur badi screen par 'sm:object-cover' taaki full screen dikhe 🌟 */
            className="w-full h-full max-w-[100vw] max-h-[100vh] object-contain sm:object-cover pointer-events-none"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}