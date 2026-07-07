"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Droplet, Crop, Sparkles, Eraser, PenTool, PlayCircle, User, ChevronLeft, ChevronRight } from "lucide-react";

// ==========================================
// 1. SOCIAL ICONS (For Footer)
// ==========================================
const Github = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-6.5a5.4 5.4 0 0 0-1.5-3.8 5.3 5.3 0 0 0-.1-3.8s-1.2-.4-3.9 1.4a13.3 13.3 0 0 0-7 0C6.2 1.5 5 1.9 5 1.9a5.3 5.3 0 0 0-.1 3.8A5.4 5.4 0 0 0 3 9.5c0 5 3 6.2 6 6.5a4.8 4.8 0 0 0-1 3.2v4" /></svg>);
const Twitter = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5 2.8 12 3 12c.5.2 1 .3 1.5.3C3 11 2.5 7 3 7c.5.7 1.2 1.2 2 1.3C3 5.5 4 2 4 2c2.6 3.2 6.5 5.3 10.5 5.5.3-2.6 2.1-4.5 4.8-4.5 1.5 0 2.9.6 3.9 1.7.9-.2 1.8-.7 2.6-1.1-.3 1-1 1.8-1.8 2.4.8-.1 1.6-.3 2.3-.6-.3.9-.9 1.7-1.5 2.3z" /></svg>);
const Instagram = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>);
const Linkedin = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>);

// ==========================================
// 2A. SLIDER COMPONENT: WITH TWO SEPARATE URLs (As Requested)
// ==========================================
const BeforeAfterDualURL = ({ beforeImage, afterImage, heightClass = "h-[400px] md:h-[600px]", showLabels = true }) => {
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
      className={`relative w-full overflow-hidden cursor-ew-resize select-none bg-black shadow-2xl ${heightClass}`}
      onMouseMove={handleMove}
      onTouchMove={handleMove}
    >
      {/* AFTER IMAGE (Base) */}
      <img src={afterImage} alt="After: wildlife photo enhanced with Pixxel AI" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
      
      {/* BEFORE IMAGE (Clipped on top) */}
      <img src={beforeImage} alt="Before: unedited wildlife photo" className="absolute inset-0 w-full h-full object-cover pointer-events-none" style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }} />

      {showLabels && (
        <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full flex justify-between px-12 z-20 pointer-events-none drop-shadow-md">
          <span className="text-white text-[10px] font-bold tracking-[0.15em] opacity-70 uppercase">BEFORE</span>
          <span className="text-white text-[10px] font-bold tracking-[0.15em] opacity-70 uppercase">AFTER</span>
        </div>
      )}

      {/* SLIDER HANDLE */}
      <div 
        className="absolute top-0 bottom-0 w-[1px] bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10 pointer-events-none flex items-center justify-center"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
      ></div>
    </div>
  );
};

// ==========================================
// 2B. SLIDER COMPONENT: WITH CSS FILTERS (For the rest of the page)
// ==========================================
const BeforeAfterFilter = ({ image, beforeFilter, afterFilter = "none", heightClass = "h-[400px]", showLabels = false }) => {
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
        className={`relative w-full rounded-2xl overflow-hidden cursor-ew-resize select-none bg-[#111] shadow-2xl ${heightClass}`}
        onMouseMove={handleMove}
        onTouchMove={handleMove}
      >
        <img src={image} alt="After: wildlife photo enhanced with Pixxel AI" className="absolute inset-0 w-full h-full object-cover pointer-events-none" style={{ filter: afterFilter }} />
        <img src={image} alt="Before: unedited wildlife photo" className="absolute inset-0 w-full h-full object-cover pointer-events-none" style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`, filter: beforeFilter }} />
        <div className="absolute top-0 bottom-0 w-[1.5px] bg-white/50 z-10 pointer-events-none flex items-center justify-center" style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}>
            {/* Small diamond handle for aesthetic */}
            <div className="w-2 h-2 bg-white rotate-45 shadow-md"></div>
        </div>
      </div>
    );
  };

// ==========================================
// 3. MAIN PAGE: WILDLIFE/NATURE EDITOR
// ==========================================
export default function WildlifeEditor() {
  
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

  // State for Interactive Buttons Section (5 Buttons)
  // DHYAN RAHE: Yahan par aap apne alag-alag tools ke liye alag alag URL daal sakte hain
  const interactiveTools = [
      {
          id: 0,
          name: "Dodge & Burn",
          icon: <Droplet size={14} className="text-[#00d2ff]" />,
          beforeUrl: "wildlife.jpg", // YOUR_DODGE_BEFORE_URL_HERE
          afterUrl: "wildlife1.jpg" // YOUR_DODGE_AFTER_URL_HERE (Currently using Unsplash params to simulate change, replace with pure URLs)
      },
      {
        id: 1,
        name: "Composition AI",
        icon: <Crop size={14} className="text-[#ffb400]" />,
        beforeUrl: "https://images.unsplash.com/photo-1504006833117-8886a355efbf?q=80&w=1600&auto=format&fit=crop", // YOUR_COMPOSITION_BEFORE_URL_HERE
        afterUrl: "https://images.unsplash.com/photo-1504006833117-8886a355efbf?q=80&w=1600&auto=format&fit=crop&crop=focalpoint&fp-x=0.5&fp-y=0.5&fp-z=1.5" // YOUR_COMPOSITION_AFTER_URL_HERE
      },
      {
        id: 2,
        name: "Enhance AI",
        icon: <Sparkles size={14} className="text-[#0088ff]" />,
        beforeUrl: "wildlife2.jpg", // YOUR_ENHANCE_BEFORE_URL_HERE
        afterUrl: "wildlife3.jpg" // YOUR_ENHANCE_AFTER_URL_HERE
      },
      {
        id: 3,
        name: "Erase AI",
        icon: <Eraser size={14} className="text-[#0066ff]" />,
        beforeUrl: "wildlife4.jpg", // YOUR_ERASE_BEFORE_URL_HERE
        afterUrl: "wildlife5.jpg" // YOUR_ERASE_AFTER_URL_HERE
      },
      {
        id: 4,
        name: "Masking",
        icon: <PenTool size={14} className="text-white" />,
        beforeUrl: "https://images.unsplash.com/photo-1456926631375-92c8ce872def?q=80&w=1600&auto=format&fit=crop", // YOUR_MASKING_BEFORE_URL_HERE
        afterUrl: "https://images.unsplash.com/photo-1456926631375-92c8ce872def?q=80&w=1600&auto=format&fit=crop&con=150" // YOUR_MASKING_AFTER_URL_HERE
      }
      
  ];
  const [activeTool, setActiveTool] = useState(0);
  // =======================================
  // DISCOVER FEATURES DATA (Video + Text Logic)
  // =======================================
  // =======================================
  // DISCOVER FEATURES DATA (Video, Auto-Slide & Nav Logic)
  // =======================================
  const [activeDiscoverIdx, setActiveDiscoverIdx] = useState(0);
  const pillsContainerRef = useRef(null);

  // Yahan aap apne 10 ya usse zyada features add kar sakte hain
  const discoverFeaturesData = [
    { name: "Face AI", badge: "Face AI", title: "Retouch facial features naturally", desc: "Add face light, remove dark circles, enhance lips, and do so much more.", thumb: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop", videoUrl: "YOUR_VIDEO_1.mp4" },
    { name: "Body AI", badge: "Body AI", title: "Shape bodies effortlessly", desc: "Naturally adjust body proportions to achieve a realistic and perfect look.", thumb: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=400&auto=format&fit=crop", videoUrl: "YOUR_VIDEO_2.mp4" },
    { name: "Skin AI", badge: "Skin AI", title: "Smooth skin flawlessly", desc: "Remove blemishes and smooth uneven skin textures with intelligent AI.", thumb: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=400&auto=format&fit=crop", videoUrl: "YOUR_VIDEO_3.mp4" },
    { name: "Portrait Bokeh", badge: "Bokeh AI", title: "Create cinematic depth", desc: "Instantly blur the background of any portrait to create stunning depth of field.", thumb: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=400&auto=format&fit=crop", videoUrl: "YOUR_VIDEO_4.mp4" },
    { name: "Color Harmony", badge: "Color AI", title: "Balance tones perfectly", desc: "Take control of color grading and achieve perfect color harmony in one click.", thumb: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=400&auto=format&fit=crop", videoUrl: "YOUR_VIDEO_5.mp4" },
    { name: "Sky AI", badge: "Sky AI", title: "Command the Heavens", desc: "Replace dull skies with dramatic sunsets or clear blue heavens in a click.", thumb: "https://images.unsplash.com/photo-1506744626753-f39009ec30fb?q=80&w=400&auto=format&fit=crop", videoUrl: "YOUR_VIDEO_6.mp4" },
    { name: "Structure AI", badge: "Structure", title: "Reveal hidden details", desc: "Enhance image structure and bring out the finest details without adding noise.", thumb: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=400&auto=format&fit=crop", videoUrl: "YOUR_VIDEO_7.mp4" },
  ];

  // Manual Next/Prev Functions
  const handleNextDiscover = () => setActiveDiscoverIdx((prev) => (prev + 1) % discoverFeaturesData.length);
  const handlePrevDiscover = () => setActiveDiscoverIdx((prev) => (prev - 1 + discoverFeaturesData.length) % discoverFeaturesData.length);

  // 10-Second Auto-Slide Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveDiscoverIdx((prev) => (prev + 1) % discoverFeaturesData.length);
    }, 10000); // 10000ms = 10 Seconds
    return () => clearInterval(timer); // Cleanup on unmount or manual change
  }, []);

  // Auto-scroll the Pills Container to keep active pill in center
  useEffect(() => {
    if (pillsContainerRef.current) {
      const container = pillsContainerRef.current;
      const activePill = container.children[activeDiscoverIdx];
      if (activePill) {
        const scrollLeft = activePill.offsetLeft - container.offsetLeft - (container.clientWidth / 2) + (activePill.clientWidth / 2);
        container.scrollTo({ left: scrollLeft, behavior: "smooth" });
      }
    }
  }, [activeDiscoverIdx]);
  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 selection:bg-[#ffb400]/30 font-sans">
      
      {/* ========================================== */}
      {/* 1. HERO SECTION (Full Screen with DUAL URLs) */}
      {/* ========================================== */}
      <section className="relative h-screen w-full flex flex-col justify-center items-center overflow-hidden">
        
        {/* Full Screen Dual Slider */}
        <div className="absolute inset-0 z-0">
           <BeforeAfterDualURL 
               beforeImage="lion1.jpg" // <--- YAHAN APNA HERO 'BEFORE' URL DAALEIN
               afterImage="lion.jpg"    // <--- YAHAN APNA HERO 'AFTER' URL DAALEIN
               heightClass="h-full"
               showLabels={false}
           />
           {/* Dark Overlays for Text Legibility */}
           <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent pointer-events-none"></div>
           <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-black/50 pointer-events-none"></div>
        </div>

        {/* Hero Content (Floating over image) */}
        <div className="relative z-10 max-w-4xl px-6 text-center md:text-left md:mr-auto md:ml-16 mt-20">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 mb-6 justify-center md:justify-start">
             
            <span className="text-3xl font-medium tracking-tight text-white">Pixxel<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 relative">'OS</span></span>
          </motion.div>
          
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-6xl lg:text-[60px] font-bold text-white leading-[1.1] tracking-tight mb-8">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 relative">Make Wildlife's Photo</span><br className="hidden md:block"/> worth all efforts
          </motion.h1>
          
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg md:text-xl text-white/80 font-light leading-relaxed mb-8 max-w-md mx-auto md:mx-0">
            Get stunning editing results of wildlife photos with exclusive AI tools.
          </motion.p>
          
          <Link href="/pricing" className="mb-10">
                    <button
                      className="font-extrabold uppercase tracking-[0.2em] transition-all duration-300  active:scale-95"
                      style={{
                        background: "linear-gradient(90deg, #22d3ee 0%, #a855f7 100%)",
                        color: "#000000",
                        fontSize: "12px",
                        padding: "13px 40px",
                        borderRadius: "20px",
                        boxShadow: "0 6px 28px rgba(13, 78, 88, 0.14), 0 2px 8px rgba(168,85,247,0.2)",
                        letterSpacing: "0.1em",
                      }}
                    >
                      VIEW PLANS
                    </button>
                  </Link>
        </div>
      </section>

      {/* ========================================== */}
      {/* 2. REVEAL THE WILD BEAUTY (Interactive 5 Buttons & DUAL URLs) */}
      {/* ========================================== */}
      <section className="py-24 bg-[#050505] ">
         <div className="text-center max-w-4xl mx-auto px-6 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight"><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 relative">Reveal the wild </span> beauty of each photo</h2>
            <p className="text-white/60 text-xl font-light">Edit your images to bring out every detail from your wildlife photos</p>
         </div>

         <div className="max-w-6xl mx-auto px-4 lg:px-8 flex flex-col items-center">
            
            {/* The Main Changing Slider */}
            <div className="w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 mb-8 bg-[#111]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTool}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <BeforeAfterDualURL 
                            beforeImage={interactiveTools[activeTool].beforeUrl} 
                            afterImage={interactiveTools[activeTool].afterUrl}
                            heightClass="h-[40vh] md:h-[85vh]"
                            showLabels={true}
                        />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* The 5 Interactive Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 bg-[#0a0a0a] border border-white/2 rounded-full p-2 md:p-3 shadow-lg">
                {interactiveTools.map((tool, index) => (
                    <button
                        key={tool.id}
                        onClick={() => setActiveTool(index)}
                        className={`flex items-center gap-2 px-4 py-2 md:py-2.5 rounded-full transition-all text-xs md:text-sm font-small ${
                            activeTool === index 
                            ? "bg-white/10 text-white shadow-inner" 
                            : "text-white/50 hover:text-white hover:bg-white/5"
                        }`}
                    >
                        {tool.icon} {tool.name}
                    </button>
                ))}
            </div>
         </div>
      </section>

      {/* ========================================== */}
      {/* 3. POWERFUL EXTENSIONS (Filter-based Sliders) */}
      {/* ========================================== */}
      <section className="py-24 bg-[#0a0a0a] border-b ">
         <div className="text-center max-w-3xl mx-auto px-6 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 flex items-center justify-center gap-3">
                <span className="text-[#ffb400]">🧩</span> Powerful Extensions Pixxel<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 relative">'OS</span>
            </h2>
            <p className="text-white/60 text-lg font-light leading-relaxed">
                Add new functionality and power up your photo art with these extensions for Luminar Neo
            </p>
         </div>

         {/* Horizontal Scrolling Grid of Extensions */}
         <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-6 md:px-12 pb-8 custom-scrollbar">
            
            {/* HDR Merge Mockup */}
            <div className="snap-center shrink-0 w-[280px] md:w-[320px] rounded-2xl overflow-hidden shadow-2xl relative border border-white/10 group">
                <BeforeAfterFilter 
                    heightClass="h-[450px]"
                    image="https://images.unsplash.com/photo-1550853024-fae8cd4be47f?q=80&w=800&auto=format&fit=crop"
                    beforeFilter="contrast(0.7) brightness(0.8)"
                    afterFilter="contrast(1.3) saturate(1.2)"
                />
            </div>

            {/* Upscale AI Mockup */}
            <div className="snap-center shrink-0 w-[280px] md:w-[320px] rounded-2xl overflow-hidden shadow-2xl relative border border-[#ffb400]/40 group bg-black">
                <BeforeAfterFilter 
                    heightClass="h-[450px]"
                    image="https://images.unsplash.com/photo-1542152865-cdaebdb5a7c2?q=80&w=800&auto=format&fit=crop"
                    beforeFilter="blur(3px)" // Simulate low res
                />
                <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
                    <h3 className="text-white font-bold text-lg mb-1 flex items-center gap-1">Upscale <span className="text-[10px] bg-white/20 px-1 rounded">AI</span></h3>
                    <p className="text-white/60 text-xs">Pixel-perfect upscaling</p>
                </div>
            </div>

            {/* Focus Mockup */}
            <div className="snap-center shrink-0 w-[280px] md:w-[320px] rounded-2xl overflow-hidden shadow-2xl relative border border-[#ffb400]/40 group bg-black">
                <BeforeAfterFilter 
                    heightClass="h-[450px]"
                    image="https://images.unsplash.com/photo-1497206365907-f5e630693ce0?q=80&w=800&auto=format&fit=crop"
                    beforeFilter="blur(2px)" 
                />
                <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
                    <h3 className="text-white font-bold text-lg mb-1 flex items-center gap-1">Supersharp <span className="text-[10px] bg-white/20 px-1 rounded">AI</span></h3>
                    <p className="text-white/60 text-xs">Remove motion blur</p>
                </div>
            </div>

            {/* Noise Mockup */}
            <div className="snap-center shrink-0 w-[280px] md:w-[320px] rounded-2xl overflow-hidden shadow-2xl relative border border-white/10 group">
                <BeforeAfterFilter 
                    heightClass="h-[450px]"
                    image="https://images.unsplash.com/photo-1504450874802-0ca2ba82fae2?q=80&w=800&auto=format&fit=crop"
                    beforeFilter="contrast(2) brightness(0.6)" // Simulate noise/grain visually
                />
            </div>
         </div>
      </section>

      {/* ========================================== */}
      {/* 4. WATCH EXTENSIONS IN ACTION (Video Mockup) */}
      {/* ========================================== */}
      {/* ========================================== */}
      {/* 5. INTERACTIVE FEATURES & DISCOVER (Split Promo) */}
      {/* ========================================== */}
      <section className="py-24 max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center ">
         <div className="space-y-6 md:pr-10">
            <div className="flex items-center gap-2 mb-4">
                
                <span className="text-2xl font-medium tracking-tight text-white">Pixxel<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 relative">'OS</span></span>
            </div>

            {/* Dynamic Text Content based on active feature */}
            <AnimatePresence mode="wait">
                <motion.div 
                    key={activeDiscoverIdx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="flex items-center gap-2 text- font-bold text-lg mb-4">
                        <User size={20} /> {discoverFeaturesData[activeDiscoverIdx].badge.split(' ')[0]} <span className="text-xs bg-white/20 px-1 rounded text-white ml-1">AI</span>
                    </div>

                    <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
                        {discoverFeaturesData[activeDiscoverIdx].title}
                    </h2>
                    
                    <p className="text-white/60 text-lg font-light leading-relaxed mb-8">
                        {discoverFeaturesData[activeDiscoverIdx].desc}
                    </p>

                    <Link href="/pricing" className="mb-10">
                    <button
                      className="font-extrabold uppercase tracking-[0.2em] transition-all duration-300  active:scale-95"
                      style={{
                        background: "linear-gradient(90deg, #22d3ee 0%, #a855f7 100%)",
                        color: "#000000",
                        fontSize: "12px",
                        padding: "13px 40px",
                        borderRadius: "20px",
                        boxShadow: "0 6px 28px rgba(13, 78, 88, 0.14), 0 2px 8px rgba(168,85,247,0.2)",
                        letterSpacing: "0.1em",
                      }}
                    >
                      VIEW PLANS
                    </button>
                  </Link>
                </motion.div>
            </AnimatePresence>
         </div>

         {/* Dynamic Video Player */}
         <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative bg-gradient-to-br from-blue-900 to-indigo-900 p-4 md:p-8">
            <div className="w-full h-full rounded-xl overflow-hidden border border-white/20 relative shadow-2xl bg-black">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeDiscoverIdx}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="w-full h-full"
                    >
                        <video 
                            src={discoverFeaturesData[activeDiscoverIdx].videoUrl} 
                            autoPlay 
                            loop 
                            muted 
                            playsInline 
                            className="w-full h-full object-cover"
                        />
                    </motion.div>
                </AnimatePresence>
            </div>
         </div>
      </section>

      {/* Feature Pills Row (Clickable) */}
      {/* Feature Pills Row (Clickable with Auto-Scroll & Nav Icons) */}
      <section className="pb-24 max-w-7xl mx-auto px-6 overflow-hidden relative">
          <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Discover Pixxel'OS features</h3>
              
              {/* Navigation Icons (Top Right for Desktop) */}
              <div className="hidden md:flex items-center gap-2">
                  <button onClick={handlePrevDiscover} className="w-10 h-10 rounded-full border border-white/20 bg-gradient-to-r from-cyan-400 to-purple-500 hover:bg-white/10 flex items-center justify-center text-white transition-colors backdrop-blur-md">
                      <ChevronLeft size={20} />
                  </button>
                  <button onClick={handleNextDiscover} className="w-10 h-10 rounded-full border border-white/20 bg-gradient-to-r from-cyan-400 to-purple-500 hover:bg-white/10 flex items-center justify-center text-white transition-colors backdrop-blur-md">
                      <ChevronRight size={20} />
                  </button>
              </div>
          </div>

          <div className="relative">
              {/* Left/Right Fade Overlays for Premium Look */}
              <div className="absolute top-0 left-0 bottom-0 w-12 bg-gradient-to-r from-[#050505] to-transparent z-10 pointer-events-none"></div>
              <div className="absolute top-0 right-0 bottom-0 w-12 bg-gradient-to-l from-[#050505] to-transparent z-10 pointer-events-none"></div>

              {/* Mobile Navigation Icons (Overlay on sides) */}
              <button onClick={handlePrevDiscover} className="md:hidden absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full border border-white/20 bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center text-white backdrop-blur-md">
                  <ChevronLeft size={16} />
              </button>
              <button onClick={handleNextDiscover} className="md:hidden absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full border border-white/20 bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center text-white backdrop-blur-md">
                  <ChevronRight size={16} />
              </button>

              {/* Scrollable Pills Container */}
              <div 
                  ref={pillsContainerRef}
                  className="flex gap-4 overflow-x-auto snap-x snap-mandatory custom-scrollbar py-4 px-4 scroll-smooth"
                  style={{ scrollbarWidth: 'none' }} // Hides scrollbar on Firefox for cleaner look
              >
                  {discoverFeaturesData.map((pill, i) => (
                      <div 
                          key={i} 
                          onClick={() => setActiveDiscoverIdx(i)}
                          className={`snap-center shrink-0 w-[200px] h-[100px] rounded-xl overflow-hidden relative border-2 transition-all duration-300 cursor-pointer ${
                              activeDiscoverIdx === i ? 'border-[#ffb400] shadow-[0_0_20px_rgba(255,180,0,0.3)] scale-[1.05] z-10' : 'border-white/10 hover:border-white/30'
                          }`}
                      >
                          <img src={pill.thumb} className={`absolute inset-0 w-full h-full object-cover transition-opacity ${activeDiscoverIdx === i ? 'opacity-100' : 'opacity-50'}`} alt={pill.name} />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none"></div>
                          
                          {/* Active Indicator & Name */}
                          <div className={`absolute bottom-3 left-3 flex flex-col z-10 transition-colors ${activeDiscoverIdx === i ? 'text-[#ffb400]' : 'text-white'}`}>
                              {activeDiscoverIdx === i && <span className="w-4 h-1 bg-[#ffb400] rounded-full mb-1"></span>}
                              <span className="font-bold text-sm drop-shadow-md">{pill.name}</span>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </section>
      {/* ========================================== */}
      {/* 6. 6 REASONS GRID */}
      {/* ========================================== */}
      <section className="py-24 bg-[#0a0a0a] ">
          <div className="text-center mb-16 px-6">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">6 reasons why Luminar Neo is the</h2>
              <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 ">best image editing software for you</h2>
          </div>

          <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="bg-[#111] border border-white/5 rounded-3xl p-6 hover:bg-[#151515] transition-colors">
                  <div className="w-full aspect-[4/3] rounded-xl bg-black mb-6 overflow-hidden border border-white/10"><img src="https://images.unsplash.com/photo-1512413914470-36d7a4645062?q=80&w=600&auto=format&fit=crop" className="opacity-50" /></div>
                  <h3 className="text-xl font-bold text-white mb-3">Easy to use</h3>
                  <p className="text-white/50 text-sm font-light leading-relaxed">Accessible to everyone thanks to an intuitive and user-friendly interface.</p>
              </div>
              {/* Card 2 */}
              <div className="bg-[#111] border border-white/5 rounded-3xl p-6 hover:bg-[#151515] transition-colors">
                  <div className="w-full aspect-[4/3] rounded-xl bg-black mb-6 overflow-hidden border border-white/10 flex items-center justify-center text-6xl font-black text-[#ffb400]">AI</div>
                  <h3 className="text-xl font-bold text-white mb-3">AI-powered</h3>
                  <p className="text-white/50 text-sm font-light leading-relaxed">Replace skies, enhance landscapes and portraits, all with AI-powered tools.</p>
              </div>
              {/* Card 3 */}
              <div className="bg-[#111] border border-white/5 rounded-3xl p-6 hover:bg-[#151515] transition-colors">
                  <div className="w-full aspect-[4/3] rounded-xl bg-gradient-to-br from-orange-600 to-red-900 mb-6 border border-white/10 opacity-80"></div>
                  <h3 className="text-xl font-bold text-white mb-3">Editing tools</h3>
                  <p className="text-white/50 text-sm font-light leading-relaxed">Enjoy a wide range of instruments including layers, masking, and local adjustments.</p>
              </div>
              {/* Added placeholders for the other 3 cards shown in screenshot */}
              {[1, 2, 3].map((_, i) => (
                  <div key={i} className="bg-[#111] border border-white/5 rounded-3xl p-6 hover:bg-[#151515] transition-colors">
                      <div className="w-full aspect-[4/3] rounded-xl bg-zinc-900 mb-6 overflow-hidden border border-white/10 opacity-70"></div>
                  </div>
              ))}
          </div>
      </section>

      {/* ========================================== */}
      {/* 7. APP & PLUGIN CTA */}
      {/* ========================================== */}
      <section className="relative py-32 overflow-hidden  bg-[#050505]">
        {/* Golden spotlight background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-r from-cyan-400/20 to-purple-500/20 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto px-6 flex flex-col items-center text-center relative z-10">
          
          <div className="w-32 h-32 bg-[#0a0a0a] rounded-[32px] border border-white/10 flex items-center justify-center mb-8 shadow-2xl">
              <span className="text-[#ffb400] text-7xl leading-none">✱</span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-12 leading-tight tracking-tight">
            An application & Lightroom plugin <br/> For <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 relative">MacOS</span> & <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 relative">Windows</span>
          </h2>
          
          <Link href="/pricing" className="mb-10">
                    <button
                      className="font-extrabold uppercase tracking-[0.2em] transition-all duration-300 hover:-translate-y-[2px] active:scale-95"
                      style={{
                        background: "linear-gradient(90deg, #22d3ee 0%, #a855f7 100%)",
                        color: "#000000",
                        fontSize: "12px",
                        padding: "13px 40px",
                        borderRadius: "20px",
                        boxShadow: "0 6px 28px rgba(13, 78, 88, 0.14), 0 2px 8px rgba(168,85,247,0.2)",
                        letterSpacing: "0.1em",
                      }}
                    >
                      VIEW PLANS
                    </button>
                  </Link>
          {/* Features Strip */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 text-[15px] font-medium text-white/90">
             <span className="flex items-center gap-2"><div className="w-5 h-5 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center"><Check size={14} className="text-black stroke-[3]"/></div> High-performance image editor</span>
             <span className="flex items-center gap-2"><div className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 flex items-center justify-center"><Check size={14} className="text-black stroke-[3]"/></div> 24/7 technical support</span>
             <span className="flex items-center gap-2"><div className="w-5 h-5 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center"><Check size={14} className="text-black stroke-[3]"/></div> 30-day money back guarantee</span>
             <span className="flex items-center gap-2"><div className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 flex items-center justify-center"><Check size={14} className="text-black stroke-[3]"/></div> Join our communities</span>
          </div>
        </div>
      </section>


      {/* ============================================================== */}
      {/* 8. FOOTER WITH BACKEND LOGIC */}
      {/* ============================================================== */}
      <footer className="py-20 relative z-20  bg-[#020202]">
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
              {['Console', 'Mechanics', 'Packages', 'Enterprise'].map(link => (<li key={link}><Link href="/" className="hover:text-[#ffb400] hover:tracking-wide transition-all">{link}</Link></li>))}
            </ul>
          </div>

          <div>
            <h4 className="text-[12px] font-black text-white mb-6 uppercase tracking-[0.2em] opacity-90">Corporate</h4>
            <ul className="space-y-4 text-[14px] text-slate-500 font-medium">
              {['Leadership', 'Press Release', 'Terms of Use', 'Security Details'].map(link => (<li key={link}><Link href="/" className="hover:text-[#ffb400] hover:tracking-wide transition-all">{link}</Link></li>))}
            </ul>
          </div>

          <div>
            <h4 className="text-[12px] font-black text-white mb-6 uppercase tracking-[0.2em] opacity-90">Priority Sync</h4>
            <form onSubmit={handleContactSubmit} className="space-y-3">
              <div className="flex gap-3">
                 <Input 
                    placeholder="Ident" 
                    value={contactForm.name} 
                    onChange={(e) => setContactForm(p => ({ ...p, name: e.target.value }))} 
                    className="bg-[#0a0a0a] border-white/10 text-white rounded-xl h-12 text-[14px] flex-1 focus-visible:ring-1 focus-visible:ring-[#ffb400]" 
                    required 
                 />
                 <Input 
                    type="email" 
                    placeholder="Terminal@mail.com" 
                    value={contactForm.email} 
                    onChange={(e) => setContactForm(p => ({ ...p, email: e.target.value }))} 
                    className="bg-[#0a0a0a] border-white/10 text-white rounded-xl h-12 text-[14px] flex-[1.5] focus-visible:ring-1 focus-visible:ring-[#ffb400]" 
                    required 
                 />
              </div>
              <textarea 
                placeholder="Diagnostic data query..." 
                value={contactForm.message} 
                onChange={(e) => setContactForm(p => ({ ...p, message: e.target.value }))} 
                className="w-full bg-[#0a0a0a] border border-white/10 text-white rounded-xl px-4 py-4 text-[14px] min-h-[90px] resize-none focus:outline-none focus:border-[#ffb400]/50 transition-colors shadow-inner custom-scrollbar" 
                required 
              />
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full  bg-gradient-to-r from-cyan-400 to-purple-500  font-extrabold tracking-widest uppercase text-[11px] h-12 rounded-xl transition-all border border-white/10"
              >
                {isSubmitting ? "TRANSMITTING..." : "OPEN TICKET PROTOCOL"}
              </Button>
            </form>
          </div>

        </div>

        <div className="mt-20 pt-8 border-t border-white/[0.05] flex flex-col md:flex-row items-center justify-between gap-6 text-[13px] font-medium text-slate-600">
          <p>Operational Runtime: © {new Date().getFullYear()} Pixxel LLC. Hosted Securely.</p>
          <div className="flex items-center gap-4">
             {[<Twitter key="1"/>, <Instagram key="2"/>, <Linkedin key="3"/>, <Github key="4"/>].map((icon, idx) => (
                <div key={idx} className="w-10 h-10 flex items-center justify-center rounded-[0.8rem] bg-[#0a0a0a] hover:bg-slate-200 hover:text-black border border-white/10 hover:scale-110 cursor-pointer transition-all duration-300 *:w-4 *:h-4">
                    {icon}
                </div>
             ))}
          </div>
        </div>
       </div>
      </footer>

    </div>
  );
}