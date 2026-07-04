"use client";

import FeaturesSection from "@/components/features";
import InteractiveStats from "@/components/interactive-stats";
import PricingSection from "@/components/pricing";
import Chatbot from "@/components/chatbot";
import IntroVideo from "@/components/intro-video"; // 🌟 NAYA IMPORT

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { useConvexMutation, useConvexQuery } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { usePlanAccess } from "@/hooks/use-plan-access";
import { UpgradeModal } from "@/components/upgrade-modal";
import { NewProjectModal } from "./(main)/dashboard/_components/new-project-modal";
import { Sparkles, Hexagon, Zap, Layers, Wand2, UploadCloud, Loader2, ChevronLeft, ChevronRight, GripVertical, Sliders, ShieldCheck, Star, BadgeCheck, PlayCircle, ChevronDown, Check } from "lucide-react";

const customEase = [0.76, 0, 0.24, 1]; // Animation curve

const GradientCheckIcon = () => (
  <svg className="w-[18px] h-[18px] mr-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="cyanPurpleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#22d3ee" />
        <stop offset="100%" stopColor="#a855f7" />
      </linearGradient>
    </defs>
    <path d="M4.5 12.5L9 17L19.5 6.5" stroke="url(#cyanPurpleGradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const myPhotos = [
  "/photo-1.jpg", "/photo-2.jpg", "/photo-3.jpg", "/photo-4.jpg",
  "/photo-5.jpg", "/photo-6.jpg", "/photo-7.jpg", "/photo-8.jpg",
];

const Github = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-6.5a5.4 5.4 0 0 0-1.5-3.8 5.3 5.3 0 0 0-.1-3.8s-1.2-.4-3.9 1.4a13.3 13.3 0 0 0-7 0C6.2 1.5 5 1.9 5 1.9a5.3 5.3 0 0 0-.1 3.8A5.4 5.4 0 0 0 3 9.5c0 5 3 6.2 6 6.5a4.8 4.8 0 0 0-1 3.2v4" /></svg>);
const Twitter = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5 2.8 12 3 12c.5.2 1 .3 1.5.3C3 11 2.5 7 3 7c.5.7 1.2 1.2 2 1.3C3 5.5 4 2 4 2c2.6 3.2 6.5 5.3 10.5 5.5.3-2.6 2.1-4.5 4.8-4.5 1.5 0 2.9.6 3.9 1.7.9-.2 1.8-.7 2.6-1.1-.3 1-1 1.8-1.8 2.4.8-.1 1.6-.3 2.3-.6-.3.9-.9 1.7-1.5 2.3z" /></svg>);
const Instagram = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>);
const Linkedin = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>);

const staggerContainer = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.15 } } };
const fadeUpVariant = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } } };

// ==========================================
// 🌟 CTA BLOCK
// ==========================================
const CallToActionPricingShowcase = () => {
  return (
    <section className="relative w-full overflow-hidden flex justify-center py-20 pb-12 sm:pb-24 bg-[#000] z-20" id="pricing-showcase-section">
      <div className="relative z-10 w-full max-w-[1100px] h-auto mx-auto rounded-[30px] p-[1.5px] bg-gradient-to-r from-cyan-400 to-purple-500 drop-shadow-[0_20px_60px_rgba(0,0,0,1)]">
          <div className="relative w-full h-full bg-[#07050a] rounded-[29px] flex flex-col items-center pt-10 pb-10 px-6 lg:pt-14 lg:pb-12 lg:px-12 overflow-hidden">
              <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[85%] max-w-[900px] h-[450px] bg-gradient-to-r from-cyan-400/30 via-purple-500/30 to-cyan-400/30 blur-[100px] rounded-full pointer-events-none z-0"></div>
              <div className="text-center z-30 relative mx-auto w-full mt-0 mb-6">
                  <h1 className="text-4xl sm:text-[45px] md:text-5xl font-bold mb-4 text-white tracking-tight leading-[1.2] relative">
                      Choose your ideal <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 relative">creative plan</span>
                  </h1>
                  <p className="text-slate-300 font-light text-[16px] sm:text-lg">Edit on any device with the most innovative tools yet</p>
              </div>
              <div className="flex justify-center relative z-30">
                <Link href="/pricing">
                  <button
                    className="font-extrabold uppercase tracking-[0.2em] transition-all duration-300 hover:-translate-y-[2px] active:scale-95"
                    style={{
                      background: "linear-gradient(90deg, #22d3ee 0%, #a855f7 100%)",
                      color: "#000",
                      fontSize: "13px",
                      padding: "13px 40px",
                      borderRadius: "4px",
                      boxShadow: "0 6px 28px rgba(34,211,238,0.28), 0 2px 8px rgba(168,85,247,0.2)",
                      letterSpacing: "0.2em",
                    }}
                  >
                    VIEW PLANS
                  </button>
                </Link>
              </div>
              <div className="relative w-full max-w-[900px] mx-auto aspect-[1.2] sm:aspect-[4/3] md:aspect-[16/9] z-20 flex justify-center -mt-16 md:-mt-[80px] lg:-mt-[110px] pointer-events-none transform md:scale-100 sm:scale-[0.9]">
                  <div className="absolute z-[8] bottom-[18%] left-[12%] md:bottom-[15%] md:left-[6%] lg:left-[-1%] w-[52%] md:w-[45%] lg:w-[40%]"><img src="/ipad.png" style={{ width: "100%", height: "auto" }} className="relative z-10 object-contain pointer-events-none drop-shadow-[0_15px_50px_rgba(0,0,0,0.7)] scale-[0.95]" alt="Second Tablet Layout Setup Left" /></div>
                  <div className="absolute z-10 bottom-[14%] right-[20%] md:bottom-[15%] md:right-[0%] lg:right-[[-1%] w-[58%] md:w-[48%] lg:w-[40%]"><img src="/ipad1.png" style={{ width: "100%", height: "auto" }} className="relative z-10 object-contain pointer-events-none hover:-translate-y-1 drop-shadow-[0_15px_60px_rgba(0,0,0,0.8)] scale-[1.02]" alt="Tablet Layout Setup" /></div>
                  <div className="absolute z-[15] left-[-3%] md:left-[2%] lg:left-[-8%] bottom-[8%] md:bottom-[3%] w-[22%] md:w-[20%] lg:w-[23%]"><img src="/mobile.png" style={{ width: "100%", height: "auto" }} className="relative z-10 object-contain hover:-translate-y-1 drop-shadow-[20px_30px_70px_rgba(0,0,0,0.95)]" alt="Phone Frame Render File Overlay" /></div>
                  <div className="absolute z-[20] w-[88%] md:w-[74%] lg:w-[72%] bottom-[-5%] left-1/2 -translate-x-1/2 transition-all"><img src="/macbook.png" style={{ width: "100%", height: "auto" }} className="relative z-[25] object-contain drop-shadow-[0_-5px_80px_rgba(0,0,0,0.45)] hover:-translate-y-1 transition-transform duration-1000 transform-origin-bottom hover:-translate-y-1 hover:brightness-[1.05]" alt="Device Monitor Empty Mask View" /></div>
                  <div className="absolute z-[30] bottom-[-3%] right-[-5%] sm:bottom-[-4%] md:bottom-[0%] lg:bottom-[5%] lg:-right-[3%] w-[18%] sm:w-[15%] md:w-[13.5%] lg:w-[12%]"><img src="/iphone.png" style={{ width: "100%", height: "auto" }} className="relative z-[35] object-contain scale-[1.03] transform pointer-events-auto hover:-translate-y-1 transition-all duration-300 drop-shadow-[0_20px_50px_rgba(0,0,0,1)] hover:brightness-[1.1]" alt="Premium App iPhone Base File Display" /></div>
              </div>
              <div className="relative w-full z-30 mt-[-20px] sm:mt-[-40px] lg:mt-[-5px] flex flex-col items-center justify-center">
                  <div className="flex flex-col md:flex-row justify-center items-center md:space-x-8 lg:space-x-12 space-y-4 md:space-y-0 text-slate-200 text-[14px] lg:text-[15px] font-normal tracking-wide mb-4 md:mb-5">
                      <span className="flex items-center whitespace-nowrap"><GradientCheckIcon />No risks & no hidden fees</span>
                      <span className="flex items-center whitespace-nowrap"><GradientCheckIcon />24/7 technical support</span>
                      <span className="flex items-center whitespace-nowrap"><GradientCheckIcon />30-day money back guarantee</span>
                  </div>
                  <div className="flex justify-center items-center text-slate-200 text-[14px] lg:text-[15px] font-normal tracking-wide">
                      <span className="flex items-center whitespace-nowrap"><GradientCheckIcon />One-time purchase — no subscriptions</span>
                  </div>
              </div>
          </div>
      </div>
    </section>
  );
};

// ==========================================
// 🌟 DISCOVER CAPABILITIES SECTION
// ==========================================
const discoverFeatures = [
  { id: "toybox", label: "AI-powered Background Effect", badge: "NEW", badgeColor: "bg-amber-500", icon: (<svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3" /><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>), video: "Video Project 7.mp4", description: "Transform ordinary portraits into dreamy masterpieces with AI-powered depth-of-field simulation." },
  { id: "bokeh", label: "AI-instant Background change", badge: "NEW", badgeColor: "bg-amber-500", icon: (<svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3" /><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>), video: "Video Project 6.mp4", description: "Transform ordinary portraits into dreamy masterpieces with AI-powered depth-of-field simulation." },
  { id: "face", label: "Enhance facial features", badge: "IMPROVED", badgeColor: "bg-cyan-600", icon: (<svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>), video: "video project 5.mp4", description: "Refine eyes, lips, and facial contours with precision using intelligent facial landmark detection." },
  { id: "revive", label: "Double-Exposure", badge: "PRO", badgeColor: "bg-amber-500", icon: (<svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>), video: "double-exposure.mp4", description: "Restore faded, damaged, or aged photographs to vibrant modern quality with generative AI." },
  { id: "lighting", label: "Add dimensional lighting", badge: null, icon: (<svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="5"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>), video: "desktop-demo.mp4", description: "Add studio-quality light sources and dramatic lighting effects to any photo in seconds." },
  { id: "enhance", label: "Enhance in seconds", badge: null, icon: (<svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>), video: "https://res.cloudinary.com/do6jlckzy/video/upload/v1783105517/enhance_ae4vaq.mp4", description: "One-tap enhancement that intelligently adjusts exposure, contrast, color and sharpness." },
  { id: "remove", label: "One-word remover", badge: null, icon: (<svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5"><path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/></svg>), video: "remover.mp4", description: "Erase unwanted objects, people, or blemishes seamlessly with generative fill technology." },
  { id: "sky", label: "Instantly replace skies", badge: null, icon: (<svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>), video: "desktop-demo.mp4", description: "Swap dull skies with stunning alternatives — dramatic sunsets, stormy clouds, starry nights." },
  { id: "replace", label: "Replace objects seamlessly", badge: null, icon: (<svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>), video: "desktop-demo.mp4", description: "Select and swap any object in your photo with AI-generated replacements that match perfectly." },
];

const DiscoverCapabilitiesSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const AUTO_DURATION = 6000;

  const goToNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % discoverFeatures.length);
    setProgress(0);
  }, []);

  const handleVideoEnded = useCallback(() => { goToNext(); }, [goToNext]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    setProgress(0);
    const playPromise = video.play();
    if (playPromise !== undefined) { playPromise.catch(() => { startFallbackTimer(); }); }
    const updateProgress = () => { if (video.duration && video.duration > 0) { setProgress((video.currentTime / video.duration) * 100); } };
    video.addEventListener("timeupdate", updateProgress);
    return () => { video.removeEventListener("timeupdate", updateProgress); clearInterval(progressIntervalRef.current); };
  }, [activeIndex]);

  const startFallbackTimer = useCallback(() => {
    clearInterval(progressIntervalRef.current);
    const startTime = Date.now();
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / AUTO_DURATION) * 100, 100);
      setProgress(pct);
      if (pct >= 100) { clearInterval(progressIntervalRef.current); goToNext(); }
    }, 50);
  }, [goToNext]);

  const activeFeature = discoverFeatures[activeIndex];

  return (
    <section className="relative w-full py-16 md:py-24 bg-[#000] z-20 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[150px]" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-cyan-300 text-[11px] font-bold tracking-[0.2em] uppercase mb-5"><Sparkles size={13} className="text-amber-400" />AI-Powered Toolkit</motion.div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-4 leading-tight">Unlock Pixxel's{" "}<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">feature</span></motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto font-light">Level up your photography with Pixxel's AI-powered photo editing tools.</motion.p>
        </div>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }} className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-stretch">
          <div className="w-full lg:w-[310px] xl:w-[340px] flex-shrink-0">
            <div className="bg-[#0c0c0f] border border-white/[0.07] rounded-2xl overflow-hidden h-full">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.07] bg-[#111115]"><span className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">Top Features</span><ChevronDown size={14} className="text-slate-500" /></div>
              <div className="py-2">
                {discoverFeatures.map((feature, idx) => {
                  const isActive = idx === activeIndex;
                  return (
                    <button key={feature.id} onClick={() => { setActiveIndex(idx); setProgress(0); }} className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 group relative ${isActive ? "bg-white/[0.06] text-white" : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"}`}>
                      {isActive && (<div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-cyan-400 to-purple-500 rounded-r-full" />)}
                      <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isActive ? "bg-gradient-to-br from-cyan-500/20 to-purple-500/20 text-cyan-400" : "bg-white/[0.04] text-slate-500 group-hover:text-slate-300"}`}>{feature.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[13px] font-semibold leading-tight truncate ${isActive ? "text-white" : ""}`}>{feature.label}</span>
                          {feature.badge && (<span className={`text-[9px] font-black tracking-wider px-1.5 py-0.5 rounded text-white/90 flex-shrink-0 ${feature.badgeColor}`}>{feature.badge}</span>)}
                        </div>
                      </div>
                      {isActive && (<div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5"><div className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-none" style={{ width: `${progress}%` }} /></div>)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="flex-1 min-h-[300px] md:min-h-[440px] lg:min-h-0 relative">
            <div className="relative w-full h-full min-h-[300px] md:min-h-[440px] lg:min-h-[520px] rounded-2xl overflow-hidden   bg-[#080810] shadow-[0_0_60px_rgba(0,0,0,0.7)]">
              <AnimatePresence mode="wait">
                <motion.div key={activeFeature.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="absolute inset-0">
                  <div className="relative w-full aspect-video overflow-hidden rounded-3xl bg-black">
                    <video ref={videoRef} src={activeFeature.video} className="absolute inset-0 w-full h-full object-cover" muted playsInline autoPlay onEnded={handleVideoEnded} />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                </motion.div>
              </AnimatePresence>
              <div className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/10">After</div>
              <AnimatePresence mode="wait">
                <motion.div key={activeFeature.id + "_info"} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.3 }} className="absolute bottom-0 left-0 right-0 z-20 p-5 md:p-7">
                  <div className="flex items-end justify-between gap-4">
                    <div><h3 className="text-white font-bold text-lg md:text-xl mb-1 drop-shadow-lg">{activeFeature.label}</h3><p className="text-slate-300/80 text-sm font-light max-w-sm leading-snug">{activeFeature.description}</p></div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => { setActiveIndex((prev) => (prev - 1 + discoverFeatures.length) % discoverFeatures.length); setProgress(0); }} className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"><ChevronLeft size={16} /></button>
                      <button onClick={goToNext} className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"><ChevronRight size={16} /></button>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
              <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5">
                {discoverFeatures.map((_, idx) => (<button key={idx} onClick={() => { setActiveIndex(idx); setProgress(0); }} className={`transition-all duration-300 rounded-full ${idx === activeIndex ? "w-5 h-1.5 bg-cyan-400" : "w-1.5 h-1.5 bg-white/30 hover:bg-white/50"}`} />))}
              </div>
            </div>
          </div>
        </motion.div>
        <div className="flex justify-center mt-12">
          <Link href="/pricing">
            <button
              className="font-extrabold uppercase tracking-[0.2em] transition-all duration-300 hover:-translate-y-[2px] active:scale-95"
              style={{
                background: "linear-gradient(90deg, #22d3ee 0%, #a855f7 100%)",
                color: "#000",
                fontSize: "13px",
                padding: "13px 40px",
                borderRadius: "4px",
                boxShadow: "0 6px 28px rgba(34,211,238,0.28), 0 2px 8px rgba(168,85,247,0.2)",
                letterSpacing: "0.2em",
              }}
            >
              VIEW PLANS
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

// ==========================================
// 🌟 VIDEO SHOWCASE
// ==========================================
const VideoShowcase = () => {
  const [centerId, setCenterId] = useState(1);
  const videoUrls = ["https://res.cloudinary.com/do6jlckzy/video/upload/v1783145093/desktop-demo_tqzbun.mp4", "https://res.cloudinary.com/do6jlckzy/video/upload/v1783145093/desktop-demo_tqzbun.mp4", "https://res.cloudinary.com/do6jlckzy/video/upload/v1783145093/desktop-demo_tqzbun.mp4"];
  return (
    <section className="relative w-full py-2 md:py-6 flex flex-col items-center justify-center overflow-hidden z-40 bg-[#000]">
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[1200px] h-[400px] md:h-[500px] bg-gradient-to-r from-cyan-400/20 via-purple-500/20 to-cyan-400/20 blur-[130px] rounded-full pointer-events-none z-0"></div>
       <div className="text-center z-20 relative px-4 mb-16 sm:mb-20">
          <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 shadow-[0_0_20px_rgba(168,85,247,0.15)] text-cyan-300 text-[12px] md:text-sm font-bold tracking-[0.2em] uppercase mb-6"><Sparkles size={16} className="text-amber-400 animate-pulse" />Cinematic Experience</motion.div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight mb-5 leading-tight">Immerse in <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 drop-shadow-[0_0_20px_rgba(34,211,238,0.3)]">Brilliance</span></motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="text-slate-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-light leading-relaxed">Experience our next-generation visual rendering. <span className="text-cyan-400 font-medium">Tap on any video</span> to bring it to the main stage and explore the details.</motion.p>
       </div>
       <div className="relative w-full max-w-[1900px] h-[350px] sm:h-[500px] md:h-[650px] lg:h-[550px] flex items-center justify-center mx-auto mb-10 z-10 perspective-[1000px]">
          {videoUrls.map((url, i) => {
             const isCenter = i === centerId;
             const isLeft = i === (centerId + 2) % 3;
             const position = isCenter ? 'center' : isLeft ? 'left' : 'right';
             return (
               <motion.div key={`${url}-${i}`} onClick={() => setCenterId(i)} className={`absolute top-1/2 -translate-y-1/2 w-[85%] sm:w-[75%] md:w-[65%] lg:w-[65%] aspect-video rounded-[16px] md:rounded-[20px] overflow-hidden cursor-pointer will-change-transform ${isCenter ? 'shadow-[0_40px_100px_rgba(0,0,0,0.9)]' : 'shadow-2xl border border-white/5'}`} initial={false} animate={{ left: position === 'center' ? '50%' : position === 'left' ? '0%' : '100%', x: position === 'center' ? '-50%' : position === 'left' ? '-20%' : '-90%', scale: position === 'center' ? 1.15 : 0.8, zIndex: position === 'center' ? 30 : 10, opacity: position === 'center' ? 1 : 0.35 }} transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}>
                 <video src={url} loop muted={!isCenter} autoPlay playsInline controls={isCenter} className={`w-full h-full object-cover bg-[#0c0d0e] ${isCenter ? '' : 'pointer-events-none'}`} />
                 <motion.div initial={false} animate={{ opacity: isCenter ? 0 : 1 }} transition={{ duration: 0.5 }} className="absolute inset-0 bg-black/40 pointer-events-none" />
                 {!isCenter && (<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/50 pointer-events-none"><PlayCircle size={60} strokeWidth={1} /></div>)}
               </motion.div>
             );
          })}
       </div>
    </section>
  );
};

// ==========================================
// 🌟 AI FEATURES SHOWCASE
// ==========================================
const aiCarouselData = [
  { id: 1, title: "Upscale", description: "Enlarge your photos while preserving every detail and texture.", buttonLabel: "Apply Upscale", image: "https://images.unsplash.com/photo-1550853024-fae8cd4be47f?q=80&w=2000&auto=format&fit=crop", beforeFilter: "blur(5px)", afterFilter: "blur(0px) contrast(1.1)" },
  { id: 2, title: "Restore Color", description: "Bring vintage or faded photographs back to vivid, colorful life.", buttonLabel: "Apply Colorize", image: "photo-6.jpg", beforeFilter: "grayscale(100%) sepia(30%)", afterFilter: "grayscale(0%) sepia(0%) saturate(1.2)" },
  { id: 3, title: "Smart Relight", description: "Automatically balance shadows and highlights for perfect exposure.", buttonLabel: "Apply Relight", image: "photo-7.jpg", beforeFilter: "brightness(40%) contrast(120%)", afterFilter: "brightness(110%) contrast(105%)" },
  { id: 4, title: "Vivid Enhance", description: "Instantly boost dull elements and make your subjects pop beautifully.", buttonLabel: "Apply Enhance", image: "photo-8.jpg", beforeFilter: "saturate(30%) brightness(0.8)", afterFilter: "saturate(150%) brightness(1.1)" },
];

const InteractiveAICard = ({ data, isActive }) => {
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  useEffect(() => { setSliderPos(50); }, [isActive]);
  const handleMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pos = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPos(pos);
  };
  const handleMouseMove = (e) => { if (isDragging) handleMove(e.clientX); };
  const handleTouchMove = (e) => { if (isDragging) handleMove(e.touches[0].clientX); };
  return (
    <div className={`relative w-full h-full rounded-[2rem] overflow-hidden select-none transition-all duration-700 ease-in-out ${isActive ? 'shadow-[0_0_50px_rgba(0,0,0,0.8)]' : 'shadow-none pointer-events-none'}`} ref={containerRef} onMouseMove={handleMouseMove} onTouchMove={handleTouchMove} onMouseUp={() => setIsDragging(false)} onMouseLeave={() => setIsDragging(false)} onTouchEnd={() => setIsDragging(false)}>
      <div className="absolute inset-0 z-0 bg-[#111]"><img src={data.image} alt="Before" className="w-full h-full object-cover transition-all duration-300" style={{ filter: data.beforeFilter }} draggable={false} /></div>
      <div className="absolute inset-0 z-10" style={{ clipPath: `inset(0 0 0 ${sliderPos}%)`, transition: isDragging ? 'none' : 'clip-path 0.4s ease-in-out' }}><img src={data.image} alt="After" className="w-full h-full object-cover transition-all duration-300" style={{ filter: data.afterFilter }} draggable={false} /></div>
      <div className="absolute top-0 bottom-0 z-20 flex items-center justify-center w-1 hover:cursor-ew-resize group" style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)', transition: isDragging ? 'none' : 'left 0.4s ease-in-out' }} onMouseDown={() => setIsDragging(true)} onTouchStart={() => setIsDragging(true)}>
        <div className="w-[1px] h-full bg-white/50 shadow-[0_0_10px_rgba(0,0,0,0.5)]"></div>
        <div className="absolute w-6 h-12 bg-white/20 backdrop-blur-md border border-white/5 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><GripVertical className="w-4 h-4 text-white" /></div>
      </div>
      <div className={`absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[200px] flex justify-between z-10 pointer-events-none transition-opacity duration-300 ${isDragging ? 'opacity-0' : 'opacity-100'}`} style={{ paddingLeft: '20px', paddingRight: '20px' }}>
        <span className="text-[10px] md:text-xs font-bold text-white/80 tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">BEFORE</span>
        <span className="text-[10px] md:text-xs font-bold text-white/80 tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">AFTER</span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 z-30 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pointer-events-auto">
        <div className="max-w-md"><h2 className="text-3xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg">{data.title}</h2><p className="text-sm md:text-base text-white/80 drop-shadow-md">{data.description}</p></div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button onClick={() => setSliderPos(100)} className="flex-1 md:flex-none px-6 py-3 rounded-lg border border-white/20 bg-black/40 backdrop-blur-md text-white font-semibold text-sm hover:bg-white/10 transition-colors">Original</button>
          <button onClick={() => setSliderPos(0)} className="flex-1 md:flex-none px-6 py-3 rounded-lg bg-white text-black font-bold text-sm hover:bg-slate-200 transition-colors">{data.buttonLabel}</button>
        </div>
      </div>
    </div>
  );
};

const AIFeaturesShowcase = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % aiCarouselData.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + aiCarouselData.length) % aiCarouselData.length);
  return (
    <section className="py-20 bg-[#000] relative overflow-hidden z-20">
      <div className="text-center max-w-4xl mx-auto px-4 mb-12">
        <h3 className="text-sm md:text-base text-white/80 font-medium mb-4">Enhance your photos with powerful AI editing <br className="hidden md:block" /><span className="text-cyan-400">Choose your best plan</span></h3>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">Discover Pixxel's <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">capabilities</span></h1>
        <p className="text-slate-400 text-sm md:text-lg max-w-2xl mx-auto font-light leading-relaxed">With Pro Tools, you can sharpen, denoise, upscale, and merge exposures or panoramas to reveal every detail exactly as you imagined it.</p>
      </div>
      <div className="relative w-full max-w-[1600px] mx-auto h-[450px] md:h-[600px] flex items-center justify-center px-4">
        <button onClick={prevSlide} className="absolute left-4 md:left-10 z-40 w-12 h-12 rounded-full border border-white/10 bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/10 transition-colors"><ChevronLeft className="w-6 h-6" /></button>
        <div className="relative w-full h-full flex items-center justify-center perspective-[1200px]">
          {aiCarouselData.map((item, index) => {
            let offset = index - currentIndex;
            if (offset < -1) offset += aiCarouselData.length;
            if (offset > 1) offset -= aiCarouselData.length;
            const isActive = offset === 0;
            const isLeft = offset === -1;
            const isRight = offset === 1;
            let transform = "translateX(0) scale(1) translateZ(0)";
            let opacity = 0; let zIndex = 0;
            if (isActive) { transform = "translateX(0) scale(1) translateZ(0px)"; opacity = 1; zIndex = 30; }
            else if (isLeft) { transform = "translateX(-85%) scale(0.85) translateZ(-100px)"; opacity = 0.4; zIndex = 20; }
            else if (isRight) { transform = "translateX(85%) scale(0.85) translateZ(-100px)"; opacity = 0.4; zIndex = 20; }
            return (<div key={item.id} className="absolute w-full max-w-[900px] h-full transition-all duration-700 ease-[cubic-bezier(0.25,0.8,0.25,1)]" style={{ transform, opacity, zIndex }}><InteractiveAICard data={item} isActive={isActive} /></div>);
          })}
        </div>
        <button onClick={nextSlide} className="absolute right-4 md:right-10 z-40 w-12 h-12 rounded-full border border-white/10 bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/10 transition-colors"><ChevronRight className="w-6 h-6" /></button>
      </div>
      <div className="flex justify-center mt-12">
        <Link href="/pricing">
          <button
            className="font-extrabold uppercase tracking-[0.2em] transition-all duration-300 hover:-translate-y-[2px] active:scale-95"
            style={{
              background: "linear-gradient(90deg, #22d3ee 0%, #a855f7 100%)",
              color: "#000",
              fontSize: "13px",
              padding: "13px 40px",
              borderRadius: "4px",
              boxShadow: "0 6px 28px rgba(34,211,238,0.28), 0 2px 8px rgba(168,85,247,0.2)",
              letterSpacing: "0.2em",
            }}
          >
            VIEW PLANS
          </button>
        </Link>
      </div>
    </section>
  );
};

const StepImageSlider = ({ image, filter, isOriginal }) => {
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  useEffect(() => { if (isOriginal) setSliderPos(100); else setSliderPos(50); }, [filter, isOriginal]);
  const handleMove = (clientX) => {
    if (!containerRef.current || isOriginal) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pos = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPos(pos);
  };
  const handleMouseMove = (e) => { if (isDragging) handleMove(e.clientX); };
  const handleTouchMove = (e) => { if (isDragging) handleMove(e.touches[0].clientX); };
  return (
    <div className="relative w-full aspect-[4/3] md:aspect-auto md:h-full rounded-[1.5rem] overflow-hidden select-none" ref={containerRef} onMouseMove={handleMouseMove} onTouchMove={handleTouchMove} onMouseUp={() => setIsDragging(false)} onMouseLeave={() => setIsDragging(false)} onTouchEnd={() => setIsDragging(false)}>
      <div className="absolute inset-0 z-0"><img src={image} alt="Before" className="w-full h-full object-cover" draggable={false} /></div>
      <div className="absolute inset-0 z-10" style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}><img src={image} alt="After" className="w-full h-full object-cover transition-all duration-500" style={{ filter }} draggable={false} /></div>
      {!isOriginal && (
        <>
          <div className="absolute top-0 bottom-0 z-20 flex items-center justify-center w-1 hover:cursor-ew-resize group" style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }} onMouseDown={() => setIsDragging(true)} onTouchStart={() => setIsDragging(true)}>
            <div className="w-[1px] h-full bg-white/70 shadow-[0_0_5px_rgba(0,0,0,0.5)]"></div>
            <div className="absolute w-5 h-10 bg-white/30 backdrop-blur-md border border-white/60 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-110"><GripVertical className="w-3 h-3 text-white" /></div>
          </div>
          <div className={`absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[160px] flex justify-between z-10 pointer-events-none transition-opacity duration-300 ${isDragging ? 'opacity-0' : 'opacity-100'}`} style={{ paddingLeft: '15px', paddingRight: '15px' }}>
            <span className="text-[9px] md:text-[10px] font-bold text-white/90 tracking-widest drop-shadow-md">BEFORE</span>
            <span className="text-[9px] md:text-[10px] font-bold text-white/90 tracking-widest drop-shadow-md">AFTER</span>
          </div>
        </>
      )}
    </div>
  );
};

const FeatureStepShowcase = ({ title, description, image, steps, reverseLayout = false }) => {
  const [activeStep, setActiveStep] = useState(0);
  const activeFilter = steps[activeStep].filter;
  const isOriginal = activeStep === 0;
  return (
    <div className={`flex flex-col ${reverseLayout ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-10 lg:gap-20 max-w-7xl mx-auto px-6`}>
      <div className="flex-1 w-full flex flex-col justify-center">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">{title}</h2>
        <p className="text-slate-400 text-sm md:text-lg font-light leading-relaxed mb-12">{description}</p>
        <div className="relative w-full mt-4 mb-10 pl-2 pr-2">
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1.5 bg-slate-800 rounded-full">
            <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full transition-all duration-500 ease-out" style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}></div>
          </div>
          <div className="relative z-10 flex justify-between w-full h-4">
            {steps.map((step, idx) => {
              const percentage = (idx / (steps.length - 1)) * 100;
              const isActive = idx === activeStep;
              const isCompleted = idx <= activeStep;
              return (
                <div key={idx} className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group" style={{ left: `${percentage}%`, transform: `translate(-50%, -50%)` }} onClick={() => setActiveStep(idx)}>
                  <div className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${isActive ? 'bg-gradient-to-r from-cyan-400 to-purple-500 shadow-[0_0_15px_rgba(34,211,238,1)]' : isCompleted ? 'bg-cyan-500 border-cyan-400' : 'bg-slate-800 border-slate-600 group-hover:border-slate-400'}`} />
                  <span className={`absolute top-6 whitespace-nowrap text-[10px] md:text-sm font-bold transition-colors ${isActive ? 'text-white' : isCompleted ? 'text-cyan-100' : 'text-slate-500 group-hover:text-slate-300'}`}>{step.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex-1 w-full h-[400px] md:h-[550px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[1.5rem] border border-white/10 p-2 bg-[#0a0f1c]">
        <StepImageSlider image={image} filter={activeFilter} isOriginal={isOriginal} />
      </div>
    </div>
  );
};

// ==========================================
// 🌟 NEW HERO SECTION
// ==========================================
const HeroSection = ({ isLoggedIn, setShowUpgradeModal }) => {
  const { scrollY } = useScroll();
  const yOffset = useTransform(scrollY, [0, 800], [0, 200]);
  const opacityOffset = useTransform(scrollY, [0, 600], [1, 0]);

  const heroVideos = [
    { src: "Video Project 7.mp4", label: "BokehAI" },
    { src: "https://res.cloudinary.com/do6jlckzy/video/upload/v1783106848/frontend_wbgog7.mp4",    label: "SkinAI"  },
    { src: "Video Project 6.mp4", label: "FaceAI"  },
  ];
  
  const [centerIdx, setCenterIdx] = useState(1);
  const videoRefs = useRef([]); 

  useEffect(() => {
    if (videoRefs.current[centerIdx]) {
      videoRefs.current[centerIdx].currentTime = 0;
      videoRefs.current[centerIdx].play().catch((e) => console.log("Auto-play prevented", e));
    }
  }, [centerIdx]);

  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);

  const handleVideoEnd = (i) => {
    if (i === centerIdx) {
      setCenterIdx((prev) => (prev + 1) % heroVideos.length);
    }
  };

  const getPos = (i) => {
    const diff = (i - centerIdx + heroVideos.length) % heroVideos.length;
    if (diff === 0) return "center";
    if (diff === 1) return "right";
    return "left";
  };

  return (
    <motion.section
      style={{ y: yOffset, opacity: opacityOffset }}
      className="relative min-h-screen flex flex-col items-center justify-start overflow-hidden pt-19 z-30"
    >
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 70% 60% at 50% 42%, 
              rgba(169, 85, 247, 0.19) 22%, 
              rgba(25, 206, 234, 0.1) 35%, 
              transparent 65%
            ),
            #020104
          `,
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse 100% 70% at 50% 0%, black 30%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 100% 70% at 50% 0%, black 30%, transparent 100%)",
        }}
      />
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div style={{ position:"absolute", top:"-5%", left:"50%", transform:"translateX(-50%)", width:"800px", height:"420px", background:"radial-gradient(ellipse at top, rgba(34,211,238,0.13) 0%, rgba(168,85,247,0.07) 55%, transparent 75%)" }} />
        <div style={{ position:"absolute", top:"8%", left:"-5%", width:"500px", height:"400px", background:"radial-gradient(ellipse, rgba(168,85,247,0.07) 0%, transparent 70%)" }} />
      </div>
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.5 }}
        className="relative z-50 w-full max-w-[1400px] mx-auto px-4 sm:px-8 flex items-center justify-between mb-9"
      >
        <div className="flex items-center gap-2 cursor-pointer group">
          <span className="mb-1 font-black text-2xl tracking-tighter text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
            Pixxel <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 relative"> OS.</span>
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-8 pr-2 relative">
          <Link href="#overview" className="text-[14px] text-[#a1a1aa] hover:text-white transition-colors">Overview</Link>
          <div className="relative">
            <button 
              onClick={() => setIsFeaturesOpen(!isFeaturesOpen)}
              className="group flex items-center gap-1 text-[14px] text-[#a1a1aa] hover:text-white transition-colors outline-none"
            >
              Features 
              <ChevronDown 
                size={14} 
                className={`opacity-60 transition-transform duration-300 ${isFeaturesOpen ? 'rotate-180 opacity-100 text-white' : 'group-hover:opacity-100'}`} 
              />
            </button>
            <AnimatePresence>
              {isFeaturesOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute top-[calc(100%+30px)] right-[-180px] w-[800px] bg-[#111111] border border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.9)] rounded-xl p-8 cursor-default z-[100]"
                >
                  <div className="grid grid-cols-4 gap-8">
                    <div className="col-span-2">
                      <h4 className="text-[10px] text-zinc-500 font-medium tracking-[0.15em] uppercase border-b border-white/10 pb-3 mb-4">
                        Features
                      </h4>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        <Link href="/bokeh" className="flex items-center text-[13px] text-white hover:text-white transition-colors py-2">
                          Bokeh AI <span className="ml-2 px-1.5 py-[2px] bg-[#fbbc05] text-black text-[9px] font-black rounded-sm bg-gradient-to-r from-cyan-400 to-purple-500">NEW</span>
                        </Link>
                        <Link href="/sky" className="flex items-center text-[13px] text-[#a1a1aa] hover:text-white transition-colors py-2">
                          Sky AI
                        </Link>
                        <Link href="/face" className="flex items-center text-[13px] text-[#a1a1aa] hover:text-white transition-colors py-2">
                          Face AI <span className="ml-2 px-1.5 py-[2px] bg-[#fbbc05] text-black text-[9px] font-black rounded-sm bg-gradient-to-r from-cyan-400 to-purple-500">NEW</span>
                        </Link>
                        <Link href="/features/structure" className="flex items-center text-[13px] text-[#a1a1aa] hover:text-white transition-colors py-2">
                          Structure AI
                        </Link>
                        <Link href="/skin" className="flex items-center text-[13px] text-[#a1a1aa] hover:text-white transition-colors py-2">
                          Skin AI <span className="ml-2 px-1.5 py-[2px] bg-[#fbbc05] text-black text-[9px] font-black rounded-sm bg-gradient-to-r from-cyan-400 to-purple-500">NEW</span>
                        </Link>
                        <Link href="/features/enhance" className="flex items-center text-[13px] text-[#a1a1aa] hover:text-white transition-colors py-2">
                          Enhance AI
                        </Link>
                        <Link href="/features/erase" className="flex items-center text-[13px] text-[#a1a1aa] hover:text-white transition-colors py-2">
                          GenErase
                        </Link>
                      </div>
                      <button className="w-full mt-6 bg-[#fbbc05]  bg-gradient-to-r from-cyan-400 to-purple-500 text-black font-bold py-3 rounded text-[11px] uppercase tracking-widest transition-colors shadow-lg">
                        See All 30+ Features
                      </button>
                    </div>
                    <div className="col-span-1">
                      <h4 className="text-[10px] text-zinc-500 font-medium tracking-[0.15em] uppercase border-b border-white/10 pb-3 mb-4">
                        Use Cases
                      </h4>
                      <div className="flex flex-col gap-1">
                        <Link href="/landscape" className="flex items-center text-[13px] text-[#a1a1aa] hover:text-white transition-colors py-2">
                          Landscape Photography
                        </Link>
                        <Link href="/wildlife" className="flex items-center text-[13px] text-[#a1a1aa] hover:text-white transition-colors py-2">
                          Wildlife Photography
                        </Link>
                        <Link href="/family" className="flex items-center text-[13px] text-[#a1a1aa] hover:text-white transition-colors py-2">
                          Family Photography
                        </Link>
                      </div>
                    </div>
                    <div className="col-span-1">
                      <h4 className="text-[10px] text-zinc-500 font-medium tracking-[0.15em] uppercase border-b border-white/10 pb-3 mb-4">
                        Pro Tools
                      </h4>
                      <div className="flex flex-col gap-1">
                        <Link href="/pro/upscale" className="flex items-center text-[13px] text-[#a1a1aa] hover:text-white transition-colors py-2">
                          Upscale AI
                        </Link>
                        <Link href="/background" className="flex items-center text-[13px] text-[#a1a1aa] hover:text-white transition-colors py-2">
                          Background Removal
                        </Link>
                        <Link href="/hdr" className="flex items-center text-[13px] text-[#a1a1aa] hover:text-white transition-colors py-2">
                          HDR Merge
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <Link href="/pricing" className="text-[14px] text-[#a1a1aa] hover:text-white transition-colors">Pricing</Link>
          <Link href="/demo" className="text-[14px] text-[#a1a1aa] hover:text-white transition-colors">What's new</Link>
        </nav>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="relative z-15 mb-6 mt-1"
      >
        <div
          className="flex items-center gap-2.5 px-5 py-2.5 rounded-full backdrop-blur-xl"
          style={{
            border: "1px solid rgba(34,211,238,0.3)",
            background: "rgba(8,7,13,0.9)",
            boxShadow: "0 0 24px rgba(34,211,238,0.08), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          <Sparkles size={12} style={{ color: "#22d3ee" }} />
          <span style={{ color: "#94e8f5", fontSize: "11px", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", lineHeight: 1 }}>
            PIXXEL 2.0 IS HERE — NOW WITH{" "}
            <span style={{ color: "#22d3ee" }}>BOKEH</span>
            <sup style={{ color: "#22d3ee", fontSize: "7px" }}>AI</sup>
            {" "}AND ENHANCED{" "}
            <span style={{ color: "#22d3ee" }}>FACE</span>
            <sup style={{ color: "#22d3ee", fontSize: "7px" }}>AI</sup>
            {" "}&amp;{" "}
            <span style={{ color: "#22d3ee" }}>SKIN</span>
            <sup style={{ color: "#22d3ee", fontSize: "7px" }}>AI</sup>
          </span>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.6 }}
        className="relative z-20 text-center px-4 mb-5"
        style={{ maxWidth: "900px" }}
      >
        <h1
          className="font-semibold text-white tracking-tight leading-[1.0] mb-2"
          style={{ fontSize: "clamp(1.6rem, 5.5vw, 4.0rem)" }}
        >
          Create stunning photos with 
          <br />
          <span
            style={{
              background: "linear-gradient(95deg, #22d3ee 0%, #a855f7 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
           Pixxel 'OS{" "} 
          </span>
        </h1>
        <div
          className="flex flex-wrap justify-center gap-7 mb-8"
          style={{ color: "#7a8fa8", fontSize: "14px", fontWeight: 500 }}
        >
          {["One-time purchase — no subscriptions", "30 days money back guarantee"].map((txt) => (
            <span key={txt} className="flex items-center gap-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {txt}
            </span>
          ))}
        </div>
        <Link href="/pricing">
          <button
            className="font-extrabold uppercase tracking-[0.2em] transition-all duration-300 hover:-translate-y-[2px] active:scale-95"
            style={{
              background: "linear-gradient(90deg, #22d3ee 0%, #a855f7 100%)",
              color: "#000000",
              fontSize: "12px",
              padding: "9px 104px",
              borderRadius: "8px",
              boxShadow: "0 6px 28px rgba(13, 78, 88, 0.14), 0 2px 8px rgba(168,85,247,0.2)",
              letterSpacing: "0.1em",
            }}
          >
            VIEW PLANS
          </button>
        </Link>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[1400px] mx-auto z-10 px-2 sm:px-4"
        style={{ height: "650px", marginTop: "2px" }}
      >
        {heroVideos.map((video, i) => {
          const pos      = getPos(i);
          const isCenter = pos === "center";
          const isLeft   = pos === "left";
          return (
            <motion.div
               key={i}
              onClick={() => setCenterIdx(i)}
              animate={{
                left:    isCenter ? "50%"  : isLeft ? "14%"   : "86%",
                x:       "-50%",
                y:       "-50%",
                scale:   isCenter ? 1      : 0.8,
                zIndex:  isCenter ? 50     : 20,
                opacity: isCenter ? 1      : 2,
              }}
              transition={{ duration: 0.72, ease: [0.32, 0.72, 0, 1] }}
              className="absolute top-1/2 cursor-pointer" 
              style={{
                width: isCenter ? "min(1120px, 70vw)" : "min(550px, 40vw)",
                aspectRatio: "16/9",
              }}
            >
              {isCenter && (
                <div
                  className="absolute pointer-events-none z-0"
                  style={{
                    inset: "-16px",
                    borderRadius: "24px",
                    background: "radial-gradient(ellipse at 50% 110%, rgba(168,85,247,0.22) 0%, rgba(34,211,238,0.1) 45%, transparent 20%)",
                    filter: "blur(18px)",
                  }}
                />
              )}
              <div
                className="relative overflow-hidden w-full h-full"
                style={{
                  borderRadius: "17px",
                  boxShadow: isCenter
                    ? "0 28px 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(168,85,247,0.08)"
                    : "0 16px 40px rgba(0,0,0,0.6)",
                }}
              >
                <video
                  ref={(el) => (videoRefs.current[i] = el)}
                  src={video.src}
                  className="w-full h-full object-fill bg-black"
                  autoPlay
                  muted
                  playsInline
                  loop={!isCenter}
                  onEnded={() => handleVideoEnd(i)}
                  style={{
                    filter: isCenter ? "none" : "brightness(0.80) saturate(0.9)",
                  }}
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 65%)" }}
                />
                {isCenter && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="absolute bottom-4 left-4 flex items-center gap-2 backdrop-blur-md rounded-lg px-3 py-1.5"
                    style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.09)" }}
                  >
                    <span
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ background: "#22d3ee", display: "inline-block" }}
                    />
                    <span style={{ color: "#fff", fontSize: "10px", fontWeight: 700, letterSpacing: "0.13em", textTransform: "uppercase" }}>
                      {video.label}
                    </span>
                  </motion.div>
                )}
                {!isCenter && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm"
                      style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.09)" }}
                    >
                      {isLeft
                        ? <ChevronLeft  size={17} style={{ color: "rgba(255,255,255,0.45)" }} />
                        : <ChevronRight size={17} style={{ color: "rgba(255,255,255,0.45)" }} />}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
        <div className="absolute bottom-[-28px] left-1/2 -translate-x-1/2 flex items-center gap-2 z-40">
          {heroVideos.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCenterIdx(idx)}
              className="transition-all duration-300 rounded-full"
              style={{
                width: idx === centerIdx ? "20px" : "6px",
                height: "6px",
                background: idx === centerIdx ? "#22d3ee" : "rgba(255,255,255,0.25)",
              }}
            />
          ))}
        </div>
      </motion.div>
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none z-40"
        style={{ height: "130px", background: "linear-gradient(to top, #000 0%, transparent 100%)" }}
      />
    </motion.section>
  );
};

// ==========================================
// 🌟 PREMIUM SHOWCASE GALLERY (RESTORED)
// ==========================================
const PremiumShowcaseGallery = () => {
  return (
    <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ margin: "-100px" }} transition={{ duration: 1.2, ease: "easeOut" }} className="relative w-full h-[55vh] md:h-[60vh] lg:h-[70vh] min-h-[450px] mb-20 md:mb-32 flex items-center justify-center -mt-6 sm:-mt-10 lg:-mt-16 overflow-visible z-40 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#140b2e]/10 to-[#000] pointer-events-none z-0" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center select-none pointer-events-none z-0 opacity-[0.03]"><h1 className="text-[12vw] sm:text-[14vw] md:text-[180px] font-black leading-none text-white whitespace-nowrap tracking-tighter">AI VISION</h1></div>
        <div className="w-full max-w-[1500px] h-[450px] sm:h-[600px] relative z-40 px-2 lg:px-4 mx-auto overflow-visible pointer-events-auto">
            <div className="absolute inset-0 flex items-center justify-center group pointer-events-none">
                <motion.div initial={{ y: "20%" }} animate={{ y: "-20%" }} transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" }} className="absolute z-[60] left-[50%] -translate-x-1/2 w-[60%] sm:w-[45%] md:w-[35%] lg:w-[28%] xl:w-[24%] aspect-[3/4] sm:aspect-[4/5] rounded-[1.5rem] lg:rounded-[2rem] overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.8)] border border-white/[0.08] bg-[#0c0817] rotate-0 md:rotate-2 p-1 md:p-1.5 backdrop-blur-xl pointer-events-auto cursor-crosshair hover:shadow-[0_0_80px_rgba(168,85,247,0.3)] transition-shadow duration-300"><div className="w-full h-full rounded-[1.1rem] overflow-hidden"><img src={myPhotos[0]} className="w-full h-full object-cover scale-[1.02] hover:scale-[1.1] transition-transform duration-1000 grayscale-[5%]" alt="AI Focal Edit"/></div></motion.div>
                <motion.div initial={{ y: "-15%" }} animate={{ y: "15%" }} transition={{ duration: 6, delay: 0.5, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" }} className="absolute z-[50] left-[5%] sm:left-[10%] md:left-[15%] lg:left-[22%] w-[40%] sm:w-[28%] md:w-[22%] lg:w-[18%] aspect-[4/4] lg:aspect-[4/3] rounded-[1.2rem] overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.6)] border border-white/5 opacity-80 -rotate-3 sm:-rotate-6 pointer-events-auto cursor-crosshair"><div className="absolute inset-0 bg-cyan-500/10 z-10 pointer-events-none mix-blend-color"/><img src={myPhotos[1]} className="w-full h-full object-cover opacity-90" alt="Parallax Asset Left" /></motion.div>
                <motion.div initial={{ y: "30%" }} animate={{ y: "-30%" }} transition={{ duration: 8, delay: 1, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" }} className="absolute z-[50] right-[5%] sm:right-[10%] md:right-[14%] lg:right-[20%] w-[45%] sm:w-[32%] md:w-[26%] lg:w-[20%] aspect-[16/9] lg:aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-white/[0.04] opacity-[0.85] rotate-2 sm:rotate-6 bg-[#040813] pointer-events-auto cursor-crosshair"><img src={myPhotos[2]} className="w-full h-full object-cover grayscale-[20%] mix-blend-screen opacity-[0.75]" alt="Parallax Asset Right" /></motion.div>
                <motion.div initial={{ y: "20%" }} animate={{ y: "-20%" }} transition={{ duration: 9, delay: 1.5, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" }} className="hidden sm:block absolute z-[20] left-[-2%] lg:left-[5%] bottom-[5%] lg:bottom-[15%] w-[35%] lg:w-[16%] xl:w-[18%] aspect-video lg:aspect-[4/5] rounded-[1rem] overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.8)] border border-pink-500/10 opacity-50 -rotate-12 bg-black pointer-events-none"><img src={myPhotos[3]} className="w-full h-full object-cover opacity-60" alt="Layer Far Depth" /></motion.div>
                <motion.div initial={{ y: "-25%" }} animate={{ y: "25%" }} transition={{ duration: 7.5, delay: 2, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" }} className="hidden md:block absolute z-[40] right-0 lg:right-[5%] xl:right-[8%] top-[0%] w-[25%] lg:w-[15%] aspect-square rounded-[1rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/5 opacity-[0.70] rotate-[15deg] pointer-events-auto"><div className="absolute inset-0 bg-purple-600/10 mix-blend-overlay z-10" /><img src={myPhotos[4]} className="w-full h-full object-cover grayscale-[40%]" alt="Back depth asset right" /></motion.div>
            </div>
        </div>
    </motion.section>
  );
};

// ==========================================
// 🌟 TESTIMONIALS SECTION (RESTORED)
// ==========================================
const TestimonialsSection = () => {
  const latestReviews = useQuery(api.reviews.getLatestReviews, { limit: 3 }) || [];
  const fallbackTestimonials = [
    { name: "Sarah Johnson", role: "Product Designer", text: "Pixxel has completely transformed my design workflow. The AI tools are incredibly intuitive and save me hours every day.", rating: 5, avatar: "" },
    { name: "Alex Martinez", role: "Content Creator", text: "The background removal is so accurate! I've tried other tools, but nothing comes close to Pixxel's precision and speed.", rating: 5, avatar: "" },
    { name: "Emma Wilson", role: "E-commerce Manager", text: "Managing product images for our store has never been easier. Pixxel's bulk editing and AI features are game-changers.", rating: 5, avatar: "" },
  ];
  const testimonials = latestReviews.length > 0 ? latestReviews.map((review) => ({
    name: review.userName,
    role: review.projectTitle || "Pixxel User",
    title: review.title,
    text: review.comment,
    rating: review.rating,
    avatar: review.userImage || "",
  })) : fallbackTestimonials;
  return (
    <section className="py-16 sm:py-20 md:py-32 relative overflow-hidden z-20 bg-[#000]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-12 sm:mb-16 md:mb-20">
          <motion.h2 variants={fadeUpVariant} className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-white">Loved by <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Creators</span></motion.h2>
          <motion.p variants={fadeUpVariant} className="text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-light px-4">Join thousands of satisfied users who have transformed their creative workflow.</motion.p>
        </motion.div>
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div key={index} variants={fadeUpVariant} className="backdrop-blur-xl bg-[#0a0a0a] rounded-2xl lg:rounded-3xl p-6 sm:p-8 lg:p-10  hover:bg-[#111] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(168,85,247,0.15)] relative group overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-t-2xl lg:rounded-t-3xl" />
              <div className="flex gap-1 mb-4 sm:mb-6">{[...Array(testimonial.rating)].map((_, i) => (<span key={i} className="text-lg sm:text-xl text-yellow-400">★</span>))}</div>
              {testimonial.title && (<h3 className="text-base sm:text-lg font-bold text-cyan-300 mb-2 sm:mb-3">{testimonial.title}</h3>)}
              <p className="text-slate-300 mb-6 sm:mb-8 leading-relaxed italic font-light text-sm sm:text-base lg:text-lg z-10 relative">"{testimonial.text}"</p>
              <div className="flex items-center gap-3 sm:gap-4 relative z-10">
                {testimonial.avatar && (
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border border-white/15 shadow-lg flex-shrink-0 bg-slate-900"
                  />
                )}
                <div className="min-w-0"><h4 className="font-bold text-white text-sm sm:text-base tracking-wide truncate">{testimonial.name}</h4><p className="text-xs sm:text-sm text-slate-400 truncate">{testimonial.role}</p></div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// ==========================================
// 🌟 BATCH EDIT SECTION (RESTORED)
// ==========================================
const batchPresets = [
  { id: "original", name: "ORIGINAL", filter: "none" },
  { id: "cinematic", name: "CINEMATIC", filter: "contrast(1.2) saturate(1.3) sepia(20%) hue-rotate(-10deg) brightness(1.1)" },
  { id: "natural", name: "NATURAL", filter: "brightness(1.1) saturate(1.1) contrast(1.05)" },
  { id: "monochrome", name: "MONOCHROME", filter: "grayscale(100%) contrast(1.2) brightness(0.9)" },
  { id: "faded", name: "FADED", filter: "brightness(0.9) contrast(0.8) sepia(20%) saturate(0.7)" },
];
const batchPhotos = ["/photo-1.jpg","/photo-2.jpg","/photo-3.jpg","/photo-4.jpg","/photo-5.jpg","/photo-6.jpg","/photo-7.jpg","/photo-8.jpg","/photo-9.jpg"];

const BatchEditSection = () => {
  const [isActivated, setIsActivated] = useState(false);
  const [activePreset, setActivePreset] = useState(batchPresets[0]);
  return (
    <section className="relative w-full py-24 bg-[#000] overflow-hidden z-20 ">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">In one click'& <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent"> Photoshoot</span></motion.h2>
        <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-slate-400 text-lg md:text-xl max-w-3xl mx-auto mb-16 font-light">Save time with batch editing and a rich selection of presets that keep every photo looking stunning.</motion.p>
        <div className="relative mb-20">
          <div className="grid grid-cols-5 gap-3 mb-3">
            {batchPhotos.slice(0, 5).map((img, i) => (<motion.div key={i} className="aspect-[4/3] overflow-hidden rounded-sm bg-zinc-900 "><motion.img animate={{ filter: activePreset.filter }} transition={{ duration: 0.8 }} src={img} className="w-full h-full object-cover" /></motion.div>))}
          </div>
          <div className="grid grid-cols-4 gap-3 px-[10%]">
            {batchPhotos.slice(5, 9).map((img, i) => (<motion.div key={i} className="aspect-[4/3] overflow-hidden rounded-sm bg-zinc-900 "><motion.img animate={{ filter: activePreset.filter }} transition={{ duration: 0.8 }} src={img} className="w-full h-full object-cover" /></motion.div>))}
          </div>
          <div className="absolute left-1/2 -bottom-10 -translate-x-1/2 z-30 flex flex-col items-center">
            <AnimatePresence mode="wait">
              {!isActivated ? (
                <motion.button key="action-btn" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} onClick={() => setIsActivated(true)} className="bg-[#fbbc05] hover:bg-[#ffcc33] text-black font-bold text-[11px] tracking-widest px-10 py-4 rounded-md shadow-2xl transition-all uppercase whitespace-nowrap">Edit All Photos At Once</motion.button>
              ) : (
                <motion.div key="preset-bar" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-1 p-1 bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                  {batchPresets.map((preset) => (
                    <button key={preset.id} onClick={() => setActivePreset(preset)} className={`relative px-4 py-3 text-[10px] font-bold tracking-widest transition-all rounded-lg overflow-hidden ${activePreset.id === preset.id ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}>
                      {activePreset.id === preset.id && (<motion.div layoutId="active-pill" className="absolute inset-0 bg-white/10 border border-white/20 rounded-lg z-0" />)}
                      <span className="relative z-10">{preset.name}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            <motion.div animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="mt-4 flex flex-col items-center select-none">
               <div className="text-white font-serif text-xl flex items-center gap-2 italic">
                 <svg width="40" height="30" viewBox="0 0 40 30" fill="none" className="rotate-[-20deg]"><path d="M5 5C5 5 25 5 30 25M30 25L25 20M30 25L35 20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                 <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Try it!!</span>
               </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ==========================================
// MAIN APP COMPONENT
// ==========================================
const App = () => {
  const [isIntroFinished, setIsIntroFinished] = useState(false);
  const [didIntroPlay, setDidIntroPlay] = useState(false);

  const sendMessage = useMutation(api.messages.sendMessage);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showPreloader, setShowPreloader] = useState(true);

  const currentUser = useQuery(api.users.getCurrentUser);
  const isLoadingUser = currentUser === undefined;
  const isLoggedIn = currentUser !== null && currentUser !== undefined;

  // Jab intro video file se message aayega ki intro khatam, tab page reveal hoga
  const handleIntroComplete = useCallback((played) => {
    setDidIntroPlay(played);
    setIsIntroFinished(true);
  }, []);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    const handleScroll = () => setIsScrolled(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => { document.documentElement.style.scrollBehavior = "auto"; window.removeEventListener("scroll", handleScroll); };
  }, []);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) { toast.error("Please fill in all fields"); return; }
    setIsSubmitting(true);
    try {
      await sendMessage(contactForm);
      toast.success("Message sent successfully!");
      setContactForm({ name: "", email: "", message: "" });
    } catch (error) { toast.error("Failed to send message."); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-[#000] text-slate-200 selection:bg-cyan-500/30 overflow-x-hidden relative">
      
      {/* 🌟 IntroVideo ko alag file se yahan call kiya gaya hai */}
      <IntroVideo 
        isLoadingUser={isLoadingUser} 
        isLoggedIn={isLoggedIn} 
        onComplete={handleIntroComplete} 
      />

      {/* 🌟 Main Page Wrapper (Intro ke baad aayega) */}
      <motion.div
        initial={didIntroPlay ? { opacity: 0, y: 100, scale: 0.95 } : false}
        animate={isIntroFinished ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 100, scale: 0.95 }}
        transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1], delay: 0.1 }}
        className="w-full flex flex-col"
      >
        <HeroSection isLoggedIn={isLoggedIn} setShowUpgradeModal={setShowUpgradeModal} />
        <PremiumShowcaseGallery />
        <InteractiveStats />
        <DiscoverCapabilitiesSection />
        <FeaturesSection />
        <AIFeaturesShowcase />
        <div className="bg-[#000] py-16 md:py-32 space-y-32 md:space-y-48 border-b border-white/[0.04]">
          <FeatureStepShowcase title="Retouch portrait like a pro in four steps" description="Bring out the best in every face. Enhance skin, refine light, and add depth with intuitive tools that do the hard work for you." image="photo-9.jpg" reverseLayout={false} steps={[{ name: "Original", filter: "none" },{ name: "Skin AI", filter: "contrast(1.05) saturate(1.1) brightness(1.05)" },{ name: "Face AI", filter: "contrast(1.1) saturate(1.15) brightness(1.1)" },{ name: "Lips", filter: "contrast(1.15) saturate(1.3) brightness(1.1)" },{ name: "Color", filter: "contrast(1.2) saturate(1.4) brightness(1.15) sepia(10%) hue-rotate(-5deg)" }]} />
          <FeatureStepShowcase title="Just 4 steps to spectacular results" description="Transform any photo from ordinary to breathtaking in just a few clicks. With intelligent AI tools guiding every step, you'll enhance, refine, and perfect your image effortlessly." image="photo-10.jpg" reverseLayout={true} steps={[{ name: "Original", filter: "none" },{ name: "GenErase", filter: "contrast(1.05) brightness(1.05)" },{ name: "Sky AI", filter: "contrast(1.15) saturate(1.2)" },{ name: "Color", filter: "contrast(1.25) saturate(1.4)" },{ name: "Sunrays", filter: "contrast(1.25) saturate(1.5) brightness(1.2) sepia(20%)" }]} />
        </div>
        <VideoShowcase />
        <TestimonialsSection />
        <PricingSection />
        <BatchEditSection />
        <CallToActionPricingShowcase />

        <footer className="py-20 relative z-20 border-t border-white/[0.02] bg-[#020202]">
         <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="grid gap-12 lg:gap-16 grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.5fr] items-start">
            <div>
              <div className="mb-8 font-black text-2xl tracking-tighter text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">Pixxel <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 relative"> OS.</span></div>
              <p className="text-[14px] text-slate-500/80 leading-relaxed mb-8 max-w-[280px] font-medium">Infrastructure grade image orchestration natively rendered in high definition across your visual matrix.</p>
              <form className="flex max-w-[320px] shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] rounded-[1rem] p-1 border border-white/10 bg-[#0a0a0a]" onSubmit={(e) => e.preventDefault()}>
                <input type="email" placeholder="Your work email..." className="flex-1 bg-transparent px-4 py-3 text-[14px] text-white outline-none border-none placeholder-slate-600" />
                <button type="submit" className="rounded-[0.8rem] bg-gradient-to-r from-cyan-400 to-purple-500 text-black px-6 text-[13px] font-bold shadow-md hover:bg-amber-400 transition-colors">Access</button>
              </form>
            </div>
            <div>
              <h4 className="text-[12px] font-black text-white mb-6 uppercase tracking-[0.2em] opacity-90">Sitemap</h4>
              <ul className="space-y-4 text-[14px] text-slate-500 font-medium">
                {['Console', 'Mechanics', 'Packages', 'Enterprise'].map(link => (<li key={link}><Link href="/" className="hover:text-amber-400 hover:tracking-wide transition-all">{link}</Link></li>))}
              </ul>
            </div>
            <div>
              <h4 className="text-[12px] font-black text-white mb-6 uppercase tracking-[0.2em] opacity-90">Corporate</h4>
              <ul className="space-y-4 text-[14px] text-slate-500 font-medium">
                {['Leadership', 'Press Release', 'Terms of Use', 'Security Details'].map(link => (<li key={link}><Link href="/" className="hover:text-amber-400 hover:tracking-wide transition-all">{link}</Link></li>))}
              </ul>
            </div>
            <div>
              <h4 className="text-[12px] font-black text-white mb-6 uppercase tracking-[0.2em] opacity-90">Priority Sync</h4>
              <form onSubmit={handleContactSubmit} className="space-y-3">
                <div className="flex gap-3">
                   <Input placeholder="Ident" value={contactForm.name} onChange={(e) => setContactForm(p => ({ ...p, name: e.target.value }))} className="bg-[#0a0a0a] border-white/10 text-white rounded-xl h-12 text-[14px] flex-1 focus-visible:ring-1 focus-visible:ring-amber-500" required />
                   <Input type="email" placeholder="Terminal@mail.com" value={contactForm.email} onChange={(e) => setContactForm(p => ({ ...p, email: e.target.value }))} className="bg-[#0a0a0a] border-white/10 text-white rounded-xl h-12 text-[14px] flex-[1.5] focus-visible:ring-1 focus-visible:ring-amber-500" required />
                </div>
                <textarea placeholder="Diagnostic data query..." value={contactForm.message} onChange={(e) => setContactForm(p => ({ ...p, message: e.target.value }))} className="w-full bg-[#0a0a0a] border border-white/10 text-white rounded-xl px-4 py-4 text-[14px] min-h-[90px] resize-none focus:outline-none focus:border-amber-500/50 transition-colors shadow-inner custom-scrollbar" required />
                <Button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-cyan-400 to-purple-500 hover:bg-amber-500 text-black font-extrabold tracking-widest uppercase text-[11px] h-12 rounded-xl transition-all shadow-[inset_0_2px_5px_rgba(255,255,255,0.05)] border-[1px] border-white/10">{isSubmitting ? "TRANSMITTING..." : "OPEN TICKET PROTOCOL"}</Button>
              </form>
            </div>
          </div>
          <div className="mt-20 pt-8 border-t border-white/[0.05] flex flex-col md:flex-row items-center justify-between gap-6 text-[13px] font-medium text-slate-600">
            <p>Operational Runtime: © {new Date().getFullYear()} Pixxel LLC. Hosted Securely.</p>
            <div className="flex items-center gap-4">
               {[<Twitter key="1"/>, <Instagram key="2"/>, <Linkedin key="3"/>, <Github key="4"/>].map((icon, idx) => (
                  <div key={idx} className="w-10 h-10 flex items-center justify-center rounded-[0.8rem] bg-[#0a0a0a] hover:bg-slate-200 hover:text-black border border-white/10 hover:scale-110 cursor-pointer transition-all duration-300 *:w-4 *:h-4">{icon}</div>
               ))}
            </div>
          </div>
         </div>
        </footer>
      </motion.div>

      <Chatbot />

      <AnimatePresence>
        {isLoggedIn && isScrolled && (
          <motion.div initial={{ opacity: 0, scale: 0.8, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, y: 50, transition: { duration: 0.2 } }} className="fixed bottom-6 right-6 lg:left-6 lg:right-auto z-[100]">
            <button onClick={() => setIsUploadModalOpen(true)} className="group flex items-center gap-3 bg-white text-slate-950 pr-5 pl-3 h-[60px] rounded-full shadow-[0_15px_30px_rgba(255,255,255,0.25)] hover:shadow-[0_20px_40px_rgba(255,255,255,0.35)] transition-all duration-400 hover:-translate-y-2 font-bold font-sans tracking-wide">
              <div className="w-11 h-11 bg-[#000] rounded-full flex items-center justify-center text-amber-400 shadow-[inset_0_2px_10px_rgba(251,188,5,0.2)] group-hover:scale-95 transition-transform duration-300">
                <UploadCloud strokeWidth={2} size={10} className="group-hover:-translate-y-0.5 group-hover:text-amber-300 transition-all"/>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <NewProjectModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />
      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} restrictedTool="projects" reason="Free plan includes 3 projects and 20 exports per month. Upgrade to Pro for unlimited projects, unlimited exports, batch editing, and all AI tools." />
    </div>
  );
};

export default App;
