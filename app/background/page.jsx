"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Check, 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  Apple, 
  Monitor, 
  ChevronDown, 
  Sparkles,
  ChevronUp, 
  X, 
  Smartphone, 
  Layers, 
  Zap, 
  ShieldCheck, 
  Info,
  ArrowRight
} from "lucide-react";

// ==========================================
// 1. SOCIAL ICONS & GRADIENT TEXT
// ==========================================
const Github = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-6.5a5.4 5.4 0 0 0-1.5-3.8 5.3 5.3 0 0 0-.1-3.8s-1.2-.4-3.9 1.4a13.3 13.3 0 0 0-7 0C6.2 1.5 5 1.9 5 1.9a5.3 5.3 0 0 0-.1 3.8A5.4 5.4 0 0 0 3 9.5c0 5 3 6.2 6 6.5a4.8 4.8 0 0 0-1 3.2v4" /></svg>);
const Twitter = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5 2.8 12 3 12c.5.2 1 .3 1.5.3C3 11 2.5 7 3 7c.5.7 1.2 1.2 2 1.3C3 5.5 4 2 4 2c2.6 3.2 6.5 5.3 10.5 5.5.3-2.6 2.1-4.5 4.8-4.5 1.5 0 2.9.6 3.9 1.7.9-.2 1.8-.7 2.6-1.1-.3 1-1 1.8-1.8 2.4.8-.1 1.6-.3 2.3-.6-.3.9-.9 1.7-1.5 2.3z" /></svg>);
const Instagram = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>);
const Linkedin = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>);

const GradientText = ({ children, className = "" }) => (
  <span className={`text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 ${className}`}>
    {children}
  </span>
);

// ==========================================
// 2. REUSABLE BEFORE/AFTER SLIDER (UPDATED TO SUPPORT 2 URLS)
// ==========================================
const BeforeAfterSlider = ({ beforeImage, afterImage, heightClass = "h-[400px] md:h-[600px]", hideLabels = false }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef(null);

  const handleMove = (event) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    let x = clientX - rect.left;
    x = Math.max(0, Math.min(x, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full rounded-2xl overflow-hidden cursor-ew-resize select-none bg-zinc-900 shadow-2xl ${heightClass}`}
      onMouseMove={handleMove}
      onTouchMove={handleMove}
    >
      {!hideLabels && (
        <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full flex justify-between px-10 z-20 pointer-events-none drop-shadow-lg">
          <span className="text-white text-[11px] font-bold tracking-[0.15em] opacity-90 uppercase">BEFORE</span>
          <span className="text-white text-[11px] font-bold tracking-[0.15em] opacity-90 uppercase">AFTER</span>
        </div>
      )}
      {/* AFTER IMAGE (Base Image) */}
      <img src={afterImage} alt="After" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
      
      {/* BEFORE IMAGE (Clipped on top) */}
      <img src={beforeImage} alt="Before" className="absolute inset-0 w-full h-full object-cover pointer-events-none" style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }} />
      
      <div 
        className="absolute top-0 bottom-0 w-[1.5px] bg-white shadow-[0_0_15px_rgba(0,0,0,0.5)] z-10 pointer-events-none flex items-center justify-center"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
      ></div>
    </div>
  );
};

// ==========================================
// 3. PRICING CARD COMPONENT
// ==========================================
const PricingCard = ({ plan, isMostPopular }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`relative flex flex-col rounded-[2rem] p-[1.5px] transition-all duration-500 h-fit
      ${isMostPopular ? 'bg-gradient-to-r from-cyan-400 to-purple-500  scale-105 z-10 shadow-[0_0_60px_rgba(34,211,238,0.10),0_0_120px_rgba(168,85,247,0.08)]' : 'bg-white/10 hover:bg-white/20'}`}>
      
      {isMostPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-400 to-purple-500  text-black text-[10px] font-black px-4 py-1.5 rounded-full tracking-widest uppercase">
          Most Popular
        </div>
      )}

      <div className="bg-[#0c0c0f] rounded-[1.9rem] p-8 h-full flex flex-col">
        <h3 className="text-xl font-bold text-white mb-1">{plan.title}</h3>
        <p className="text-slate-400 text-sm mb-4">{plan.subtitle}</p>
        
        {/* Platform Icons */}
        <div className="flex gap-2 mb-6">
          {plan.platforms.map((Icon, idx) => (
            <Icon key={idx} size={18} className="text-slate-400" />
          ))}
        </div>

        <div className="flex items-center justify-between py-4 border-t border-white/5">
          <span className="text-slate-300 text-xs">Pixxel OS on Desktop</span>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/5 transition-colors"
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        <div className="mt-4">
          <div className="text-3xl font-black text-white">₹{plan.price}</div>
          <p className="text-slate-500 text-xs mt-1">One-time payment</p>
        </div>

        <Button className={`w-full mt-8 h-12 rounded-xl font-bold uppercase tracking-widest text-[11px] transition-all
          ${isMostPopular ? 'bg-gradient-to-r from-cyan-400 to-purple-500   text-black shadow-lg shadow-amber-500/20' : 'bg-transparent border border-white/20 text-white hover:bg-white/5'}`}>
          BUY NOW
        </Button>

        {/* Feature Accordion */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-4 pt-8">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center text-xs">
                    {feature.included ? (
                      <Check size={14} className="text-amber-500 mr-3 shrink-0" />
                    ) : (
                      <X size={14} className="text-slate-600 mr-3 shrink-0" />
                    )}
                    <span className={feature.included ? "text-slate-300" : "text-slate-600"}>
                      {feature.text}
                    </span>
                    {feature.info && <Info size={12} className="ml-1.5 text-slate-500 cursor-pointer" />}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Static Bottom Features (Visible Always) */}
        {!isExpanded && (
           <div className="space-y-4 mt-8">
              <div className="flex items-center text-xs text-slate-400">
                <ShieldCheck size={14} className="text-slate-500 mr-3" />
                30 days money back guarantee
              </div>
              <div className="flex items-center text-xs text-slate-400">
                <Check size={14} className="text-amber-500 mr-3" />
                Desktop for Windows/MacOS
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 4. DISCOVER CAPABILITIES COMPONENT
// ==========================================
const discoverFeatures = [
  { id: "toybox", label: "AI-powered Background Effect", badge: "NEW", badgeColor: "bg-amber-500", icon: (<svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3" /><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>), video: "Video Project 7.mp4", description: "Transform ordinary portraits into dreamy masterpieces with AI-powered depth-of-field simulation." },
  { id: "bokeh", label: "AI-instant Background change", badge: "NEW", badgeColor: "bg-amber-500", icon: (<svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3" /><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>), video: "Video Project 6.mp4", description: "Transform ordinary portraits into dreamy masterpieces with AI-powered depth-of-field simulation." },
  { id: "face", label: "Enhance facial features", badge: "IMPROVED", badgeColor: "bg-cyan-600", icon: (<svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>), video: "video project 5.mp4", description: "Refine eyes, lips, and facial contours with precision using intelligent facial landmark detection." },
  { id: "revive", label: "Double-Exposure", badge: "PRO", badgeColor: "bg-amber-500", icon: (<svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>), video: "double-exposure.mp4", description: "Restore faded, damaged, or aged photographs to vibrant modern quality with generative AI." },
  { id: "lighting", label: "Add dimensional lighting", badge: null, icon: (<svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="5"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>), video: "desktop-demo.mp4", description: "Add studio-quality light sources and dramatic lighting effects to any photo in seconds." },
  { id: "enhance", label: "Enhance in seconds", badge: null, icon: (<svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>), video: "enhance.mp4", description: "One-tap enhancement that intelligently adjusts exposure, contrast, color and sharpness." },
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
          <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-cyan-300 text-[11px] font-bold tracking-[0.2em] uppercase mb-5">
            <Sparkles size={13} className="text-amber-400" />AI-Powered Toolkit
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-4 leading-tight">
            Unlock Pixxel's{" "}<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">feature</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto font-light">
            Level up your photography with Pixxel's AI-powered photo editing tools.
          </motion.p>
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
            <div className="relative w-full h-full min-h-[300px] md:min-h-[440px] lg:min-h-[520px] rounded-2xl overflow-hidden border border-white/[0.08] bg-[#080810] shadow-[0_0_60px_rgba(0,0,0,0.7)]">
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
          <Link href="/pricing"><button
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
          </button></Link>
        </div>
      </div>
    </section>
  );
};

// ==========================================
// 5. MAIN PAGE: BACKGROUND REMOVAL
// ==========================================
export default function BackgroundRemovalPage() {
  
  // State for Navigation / Features Mega-Menu (Added)
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);

  // State for Top Hero Tabs (0 = Video, 1 = Final Result)
  const [heroTab, setHeroTab] = useState(0);

  // State for "How to Use" Section Steps
  const [howToStep, setHowToStep] = useState(1);
  const howToVideos = [
    "video1.mp4",
    "video2.mp4",
    "video3.mp4",
    "https://res.cloudinary.com/do6jlckzy/video/upload/v1783107147/video4_knntqs.mp4",
    "video5.mp4"
  ];

  // State for FAQ Section
  const [openFAQ, setOpenFAQ] = useState(null);

  // Footer Backend Logic
  const sendMessage = useMutation(api.messages.sendMessage);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) { toast.error("Please fill in all fields"); return; }
    setIsSubmitting(true);
    try {
      await sendMessage(contactForm);
      toast.success("Message sent successfully!");
      setContactForm({ name: "", email: "", message: "" });
    } catch (error) { toast.error("Failed to send message."); } finally { setIsSubmitting(false); }
  };

  const plansData = [
    {
      title: "Perpetual", subtitle: "Desktop License", price: "4999.00", platforms: [Monitor, Apple],
      features: [
        { text: "30 days money back guarantee", included: true },
        { text: "Desktop for Windows/MacOS", included: true },
        { text: "Pixxel OS Video Course", included: true },
        { text: "Mobile App for iOS/Android", included: false },
        { text: "Creative Library Access", included: false },
      ]
    },
    {
      title: "Cross-device", subtitle: "Perpetual License", price: "6499.00", platforms: [Monitor, Apple, Smartphone, Layers],
      features: [
        { text: "30 days money back guarantee", included: true },
        { text: "Desktop for Windows/MacOS", included: true },
        { text: "Pixxel OS Video Course", included: true },
        { text: "Mobile App for iOS/Android", included: true },
        { text: "Creative Library Access", included: false },
      ]
    },
    {
      title: "Perpetual", subtitle: "Max License", price: "6999.00", platforms: [Monitor, Apple, Smartphone, Layers, Zap],
      features: [
        { text: "30 days money back guarantee", included: true },
        { text: "Desktop for Windows/MacOS", included: true },
        { text: "Pixxel OS Video Course", included: true },
        { text: "Mobile App for iOS/Android", included: true },
        { text: "Creative Library Access", included: true, info: true },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#ffb400]/30 font-sans">
      
      {/* ========================================== */}
      {/* 🌟 1. HERO SECTION WITH 2-TAB BIG BOX */}
      {/* ========================================== */}
      <section className="relative w-full pt-20 pb-24 flex flex-col items-center bg-gradient-to-b from-[#110c08] via-[#050505] to-[#050505] overflow-hidden">
        
        {/* ========================================== */}
        {/* 🌟 NEW NAVBAR WITH MEGA-MENU FROM SKIN PAGE */}
        {/* ========================================== */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.5 }}
          className="relative z-50 w-full max-w-[1400px] mx-auto px-5 sm:px-5 flex items-center justify-between mb-1"
        >
          {/* Left: ✨ pixxel OS */}
          <div className="flex items-center gap-2 cursor-pointer group">
            <span className="mb-1 font-black text-2xl tracking-tighter text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
              Pixxel <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 relative"> OS.</span>
            </span>
          </div>

          {/* Right: Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 pr-2 relative mb-0">
            <Link href="#overview" className="text-[14px] text-[#a1a1aa] hover:text-white transition-colors">Overview</Link>
            
            {/* 🔥 NEW MEGA MENU (FEATURES BUTTON) 🔥 */}
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
                      
                      {/* COLUMN 1 & 2: FEATURES */}
                      <div className="col-span-2">
                        <h4 className="text-[10px] text-zinc-500 font-medium tracking-[0.15em] uppercase border-b border-white/10 pb-3 mb-4">
                          Features
                        </h4>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                          {/* 10 Links */}
                          <Link href="/bokeh" className="flex items-center text-[13px] text-[#a1a1aa] hover:text-white transition-colors py-2">
                            Bokeh AI <span className="ml-2 px-1.5 py-[2px] bg-[#fbbc05] text-black text-[9px] font-black rounded-sm bg-gradient-to-r from-cyan-400 to-purple-500">NEW</span>
                          </Link>
                          <Link href="/features/sky" className="flex items-center text-[13px] text-[#a1a1aa] hover:text-white transition-colors py-2">
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
                        
                        <button className="w-full mt-6 bg-[#fbbc05] bg-gradient-to-r from-cyan-400 to-purple-500 text-black font-bold py-3 rounded text-[11px] uppercase tracking-widest transition-colors shadow-lg">
                          See All 30+ Features
                        </button>
                      </div>

                      {/* COLUMN 3: USE CASES */}
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
                          <Link href="/ecommerce" className="flex items-center text-[13px] text-[#a1a1aa] hover:text-white transition-colors py-2">
                            E-Com Photography
                          </Link>
                        </div>
                      </div>

                      {/* COLUMN 4: PRO TOOLS */}
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


        <div className="text-center z-10 px-4 max-w-6xl mx-auto mb-12 mt-6">
          <div className="flex items-center justify-center gap-1 text-[13px] font-semibold text-white/80 mb-15">
            Excellent 4.6 out of 5 <Star className="w-4 h-4 fill-[#00b67a] text-[#00b67a] ml-1" /> <span className="font-bold ml-1">Trustpilot</span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-[47px] font-bold text-white leading-[1.1] tracking-tight mb-5">
            AI Background Remover:  <GradientText>Select. Click. Remove.</GradientText>
          </h1>
          <p className="text-lg md:text-xl text-white/70 font-light mb-8 max-w-6xl mx-auto leading-relaxed">
            Erase backgrounds instantly with smart AI detection—no masking, no effort, just clean results in one click.
          </p>
          <Link href="/pricing">
                    <button
                      className="font-extrabold uppercase tracking-[0.2em] transition-all duration-300 hover:-translate-y-[2px] active:scale-95 mb-4"
                      style={{
                        background: "linear-gradient(90deg, #22d3ee 0%, #a855f7 100%)",
                        color: "#000000",
                        fontSize: "12px",
                        padding: "12px 95px",
                        borderRadius: "4px",
                        boxShadow: "0 6px 28px rgba(13, 78, 88, 0.14), 0 2px 8px rgba(168,85,247,0.2)",
                        letterSpacing: "0.1em",
                      }}
                    >
                      VIEW PLANS
                    </button>
                  </Link>
          <div className="flex items-center justify-center gap-2 text-sm text-white/60">
            Works as <Apple className="w-4 h-4 text-white" /> <span className="text-white font-medium">MacOS</span> & <Monitor className="w-4 h-4 text-white" /> <span className="text-white font-medium">Windows</span> app
          </div>
        </div>

        {/* Big Container Box with Tabs */}
        <div className="w-[1200px] max-w-full h-[680px] mx-auto px-9 z-20 ">
          <div className="w-full h-full bg-[#111]  rounded-2xl overflow-hidden shadow-2xl p-1 pb-0 flex flex-col">
            
            {/* Media Area */}
            <div className="relative w-full aspect-[16/9] md:aspect-ratio  overflow-hidden rounded-2xl">
              <AnimatePresence mode="wait">
                {heroTab === 0 ? (
                  <motion.div key="video" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full">
                    {/* VIDEO PLACEHOLDER URL */}
                    <video src="remover3.mp4" autoPlay loop muted className="w-full h-full object-cover" />
                  </motion.div>
                ) : (
                  <motion.div key="slider" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full">
                    <BeforeAfterSlider 
                      heightClass="h-full rounded-none shadow-none" 
                      beforeImage="remover2.jpg"
                      afterImage="remover1.jpg" 
                      hideLabels={false}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Tabs */}
            <div className="flex items-center w-full bg-[#111] p-2 gap-1">
              <button 
                onClick={() => setHeroTab(0)} 
                className={`flex-1 py-1 text-xs md:text-sm font-medium tracking-widest uppercase rounded-lg transition-colors ${heroTab === 0 ? 'bg-white/10 text-white' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}
              >
                BACKGROUND REMOVAL AI
              </button>
              <button 
                onClick={() => setHeroTab(1)} 
                className={`flex-1 py-1 text-xs md:text-sm font-bold tracking-widest uppercase rounded-lg transition-colors ${heroTab === 1 ? 'bg-white/10 text-white' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}
              >
                FINAL RESULT
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 🌟 2. HOW TO USE BACKGROUND REMOVAL AI */}
      {/* ========================================== */}
      <section className="py-24 max-w-7xl mx-auto px-6 grid md:grid-cols-12 gap-12 items-center">
        <div className="md:col-span-12 text-center mb-6">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">How to Use <GradientText>Background Removal AI</GradientText></h2>
        </div>

        {/* Left Side: 5 Steps */}
        <div className="md:col-span-4 space-y-6 pl-4 border-l border-white/10 relative">
          {[
            "1. Open your photo in Pixxel OS",
            "2. Let the AI detect your subject",
            "3. Remove or replace the background",
            "4. Fine-tune your settings",
            "5. Enjoy the final result"
          ].map((stepText, index) => {
            const stepNum = index + 1;
            const isActive = howToStep === stepNum;
            return (
              <div 
                key={stepNum}
                onClick={() => setHowToStep(stepNum)} 
                className={`cursor-pointer transition-all duration-300 relative ${isActive ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
              >
                {isActive && <div className="absolute -left-[17px] top-1 bottom-1 w-[2px] bg-amber-500 rounded-full shadow-[0_0_10px_rgba(251,188,5,0.8)]"></div>}
                <h3 className={`text-xl md:text-2xl font-medium ${isActive ? 'text-amber-500' : 'text-white'}`}>{stepText}</h3>
              </div>
            );
          })}
        </div>

        {/* Right Side: Media Display (Dynamic Video) */}
        <div className="md:col-span-8 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black aspect-[4/3] md:aspect-video relative">
           <AnimatePresence mode="wait">
             <motion.div key={howToStep} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full">
                 <video src={howToVideos[howToStep - 1]} autoPlay loop muted className="w-full h-full object-cover"></video>
             </motion.div>
           </AnimatePresence>
        </div>
      </section>

      {/* ========================================== */}
      {/* 🌟 3. WHY CHOOSE SECTION (4 ALTERNATING BLOCKS) */}
      {/* ========================================== */}
      <section className="py-24 max-w-7xl mx-auto px-6 space-y-32">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white">Why Choose Pixxel OS <GradientText>AI Background Remover?</GradientText></h2>
        </div>

        {/* Block 1 */}
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="space-y-6 order-2 md:order-1">
            <h2 className="text-4xl font-bold text-white leading-tight">Remove backgrounds in one click</h2>
            <p className="text-white/60 text-lg font-light leading-relaxed">
              Just select your photo—Pixxel OS’s AI instantly cuts out the subject with perfect precision. No need for tedious masking or manual edge refinement.
            </p>
            <Link href="/pricing">
              <button className="bg-gradient-to-r from-cyan-400 to-purple-500  text-black font-bold uppercase tracking-widest px-10 py-4 rounded-md text-sm transition-transform  shadow-[0_0_30px_rgba(251,188,5,0.2)] mt-4">
                VIEW PLANS
              </button>
            </Link>
          </div>
          <div className="order-1 md:order-2" >
            <BeforeAfterSlider 
              heightClass="h-[350px] md:h-[470px]"
              beforeImage="remover5.jpg"
              afterImage="remover6.jpg" 
            />
          </div>
        </div>

        {/* Block 2 */}
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="order-1">
             <BeforeAfterSlider 
                heightClass="h-[350px] md:h-[450px]"
                beforeImage="remover7.jpg"
                afterImage="remover8.jpg" 
             />
          </div>
          <div className="space-y-6 order-2">
            <h2 className="text-4xl font-bold text-white leading-tight">Get studio-quality product photos</h2>
            <p className="text-white/60 text-lg font-light leading-relaxed">
              Make every product shot look clean and professional. Delete the cluttered background, keep lighting consistent, and save hours of manual editing for your e-commerce store.
            </p>
            <Link href="/pricing">
              <button className="bg-gradient-to-r from-cyan-400 to-purple-500  text-black font-bold uppercase tracking-widest px-10 py-4 rounded-md text-sm transition-transform  shadow-[0_0_30px_rgba(251,188,5,0.2)] mt-4">
                VIEW PLANS
              </button>
            </Link>
          </div>
        </div>

        {/* Block 3 */}
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="space-y-6 order-2 md:order-1">
            <h2 className="text-4xl font-bold text-white leading-tight">Enhance portraits with better backgrounds</h2>
            <p className="text-white/60 text-lg font-light leading-relaxed">
              Give your portraits the setting they deserve—from soft studio tones to scenic outdoor looks. Every replaced background blends naturally and stays highly realistic.
            </p>
            <Link href="/pricing">
              <button className="bg-gradient-to-r from-cyan-400 to-purple-500  text-black font-bold uppercase tracking-widest px-10 py-4 rounded-md text-sm transition-transform  shadow-[0_0_30px_rgba(251,188,5,0.2)] mt-4">
                VIEW PLANS
              </button>
            </Link>
          </div>
          <div className="order-1 md:order-2">
             <BeforeAfterSlider 
                heightClass="h-[350px] md:h-[450px]"
                beforeImage="remover9.jpg"
                afterImage="remover10.jpg" 
             />
          </div>
        </div>

        {/* Block 4 */}
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="order-1">
             <BeforeAfterSlider 
                heightClass="h-[350px] md:h-[450px]"
                beforeImage="YOUR_BEFORE_CAR_IMAGE_URL.jpg"
                afterImage="YOUR_AFTER_CAR_IMAGE_URL.jpg" 
             />
          </div>
          <div className="space-y-6 order-2">
            <h2 className="text-4xl font-bold text-white leading-tight">Perfect for E-commerce & Automotive</h2>
            <p className="text-white/60 text-lg font-light leading-relaxed">
              Instantly isolate vehicles, clothing, or complex subjects. Our AI handles challenging edges, reflections, and transparent areas seamlessly, ready for any marketplace.
            </p>
            <Link href="/pricing">
              <button className="bg-gradient-to-r from-cyan-400 to-purple-500  text-black font-bold uppercase tracking-widest px-10 py-4 rounded-md text-sm transition-transform  shadow-[0_0_30px_rgba(251,188,5,0.2)] mt-4">
                VIEW PLANS
              </button>
            </Link>
          </div>
        </div>
      </section>

     {/* --- DISCOVER CAPABILITIES --- */}
      <DiscoverCapabilitiesSection />

      {/* ========================================== */}
      {/* 🌟 5. UNLOCK POWER */}
      {/* ========================================== */}
      <section className="py-24 max-w-6xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-1 text-[13px] font-semibold text-white/80 mb-4">
            Excellent 4.6 out of 5 <Star className="w-4 h-4 fill-[#00b67a] text-[#00b67a] ml-1" /> <span className="font-bold ml-1">Trustpilot</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-16">Unlock the power of Pixxel OS</h2>

          <div className="grid md:grid-cols-2 gap-12 bg-gradient-to-br from-[#1a120b] to-[#0a0705] border border-[#ffb400]/20 rounded-3xl p-10 md:p-16 items-center text-left">
              <div>
                  <img src="remover4.png" className="w-full rounded-xl shadow-2xl" alt="Mockup" />
                  <div className="mt-6 text-center text-sm text-white/60 flex items-center justify-center gap-2">
                      Works as <Apple className="w-4 h-4 text-white" /> <span className="text-white font-medium">MacOS</span> & <Monitor className="w-4 h-4 text-white" /> <span className="text-white font-medium">Windows</span> app
                  </div>
              </div>
              <div className="space-y-6">
                  {[
                      "24+ AI-based tools", 
                      "100+ precise features", 
                      "Full privacy with on-device editing", 
                      "Award-winning, intuitive interface", 
                      "30 days money back guarantee"
                  ].map((item, i) => (
                      <div key={i} className="flex items-center gap-4 text-xl text-white/90 font-medium">
                          <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center shrink-0">
                              <Check className="w-4 h-4 text-[#ffb400]" />
                          </div>
                          {item}
                      </div>
                  ))}
              </div>
          </div>
          <Link href="/pricing">
            <button className="bg-gradient-to-r from-cyan-400 to-purple-500  text-black font-bold uppercase tracking-widest px-10 py-4 rounded-md text-sm transition-transform  shadow-[0_0_30px_rgba(251,188,5,0.2)] mt-10">
              VIEW PLANS
            </button>
          </Link>
      </section>

      {/* ========================================== */}
      {/* 🌟 6. PRICING SECTION (Collapsible Cards) */}
      {/* ========================================== */}
      <section className="py-24 max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-[#ffb400] mb-2">Lifetime editing <span className="text-white">made flexible!</span></h2>
          <h3 className="text-4xl font-bold text-white mb-16">Choose the plan that works for you</h3>

          <div className="grid md:grid-cols-3 gap-8 text-left mb-16 items-start">
            {plansData.map((plan, idx) => (
              <PricingCard key={idx} plan={plan} isMostPopular={idx === 1} />
            ))}
          </div>

          <div className="border border-[#ffb400] bg-[#1a120b] rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-white">Reliable support, trusted by our users</h3>
              <div className="flex items-center gap-6 text-sm font-medium">
                  <div className="flex items-center gap-2"><span className="text-[#ffb400]">💬</span> 24/7 Chat support</div>
                  <div className="flex items-center gap-2"><span className="text-[#ffb400]">⚙️</span> Technical assistance</div>
              </div>
          </div>
      </section>

      {/* ========================================== */}
      {/* 🌟 7. FAQ SECTION (Premium Style) */}
      {/* ========================================== */}
      <section className="py-16 bg-[#050505] relative overflow-hidden mb-32 max-w-4xl mx-auto rounded-[2.5rem] border border-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[700px] bg-gradient-to-r from-cyan-400/10 to-purple-500/10 blur-[140px] rounded-full pointer-events-none" />
        <div className="px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-flex items-center px-4 py-2 rounded-full border border-white/10 bg-white/[0.02] text-xs uppercase tracking-[0.25em] text-white/60 mb-6">SUPPORT</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-[-0.04em]">
              Frequently Asked <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Questions</span>
            </h2>
          </div>
          <div className="space-y-4">
            {[
              { question: "What is Background Removal AI?", answer: "The Pixxel OS AI BG remover is designed to make erasing backgrounds easy and fast. This tool eliminates hours of tedious work by automating the process of selecting and cutting out backgrounds in just a few clicks." },
              { question: "Why do you need an AI-powered background remover?", answer: "It allows you to cleanly isolate your subject without spending hours on complex masking, making it perfect for e-commerce, portraits, and creative edits." },
              { question: "How can I erase the background of a photo?", answer: "Just open your photo in Pixxel OS, select the Background Removal tool, and let the AI automatically detect the subject. Click remove, and you're done!" },
              { question: "Can I use AI to remove backgrounds in a batch?", answer: "Yes, our batch processing feature allows you to apply the same AI background removal settings to multiple photos at once, saving you significant time." },
            ].map((faq, index) => (
              <div key={index} className="group rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-white/[0.03]">
                <button onClick={() => setOpenFAQ(openFAQ === index ? null : index)} className="w-full flex items-center justify-between px-7 py-6 text-left">
                  <span className="text-white font-medium text-[15px] md:text-[16px] tracking-[-0.02em]">{faq.question}</span>
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400/10 to-purple-500/10 border border-white/10 transition-all duration-300 ${openFAQ === index ? "rotate-45" : ""}`}>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 text-xl font-semibold">+</span>
                  </div>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openFAQ === index ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
                  <p className="px-7 pb-6 text-[14px] leading-7 text-white/60">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 🌟 8. FOOTER WITH BACKEND LOGIC */}
      {/* ============================================================== */}
      <footer className="py-20 relative z-20 border-t border-white/[0.05] bg-[#020202]">
       <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="grid gap-12 lg:gap-16 grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.5fr] items-start">
          <div>
            <div className="mb-8 font-black text-2xl tracking-tighter text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">Pixxel <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 relative"> OS.</span></div>
            <p className="text-[14px] text-slate-500/80 leading-relaxed mb-8 max-w-[280px] font-medium">Infrastructure grade image orchestration natively rendered in high definition across your visual matrix.</p>
            <form className="flex max-w-[320px] shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] rounded-[1rem] p-1 border border-white/10 bg-[#0a0a0a]" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Your work email..." className="flex-1 bg-transparent px-4 py-3 text-[14px] text-white outline-none border-none placeholder-slate-600" />
              <button type="submit" className="rounded-[0.8rem] bg-gradient-to-r from-cyan-400 to-purple-500 text-black px-6 text-[13px] font-bold shadow-md hover:brightness-110 transition-colors">Access</button>
            </form>
          </div>
          <div>
            <h4 className="text-[12px] font-black text-white mb-6 uppercase tracking-[0.2em] opacity-90">Sitemap</h4>
            <ul className="space-y-4 text-[14px] text-slate-500 font-medium">
              {['Console', 'Mechanics', 'Packages', 'Enterprise'].map(link => (<li key={link}><Link href="/" className="hover:text-amber-500 hover:tracking-wide transition-all">{link}</Link></li>))}
            </ul>
          </div>
          <div>
            <h4 className="text-[12px] font-black text-white mb-6 uppercase tracking-[0.2em] opacity-90">Corporate</h4>
            <ul className="space-y-4 text-[14px] text-slate-500 font-medium">
              {['Leadership', 'Press Release', 'Terms of Use', 'Security Details'].map(link => (<li key={link}><Link href="/" className="hover:text-amber-500 hover:tracking-wide transition-all">{link}</Link></li>))}
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
              <Button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-cyan-400 to-purple-500 text-black font-extrabold tracking-widest uppercase text-[11px] h-12 rounded-xl transition-all border border-white/10">{isSubmitting ? "TRANSMITTING..." : "OPEN TICKET PROTOCOL"}</Button>
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

    </div>
  );
}