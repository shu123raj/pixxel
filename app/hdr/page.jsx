"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery } from "convex/react"; // Added useQuery
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
  ArrowRight,
  PlayCircle
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

// Framer Motion Variants for Feedback Section
const staggerContainer = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.15 } } };
const fadeUpVariant = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } } };

// ==========================================
// 2. REUSABLE BEFORE/AFTER SLIDER (With ALAG URLs)
// ==========================================
const BeforeAfterSlider = ({ beforeImage, afterImage, heightClass = "h-full", hideLabels = false }) => {
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
      className={`relative w-full rounded-2xl overflow-hidden cursor-ew-resize select-none bg-[#0a0a0a] ${heightClass}`}
      onMouseMove={handleMove}
      onTouchMove={handleMove}
    >
      {!hideLabels && (
        <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full flex justify-between px-6 md:px-10 z-20 pointer-events-none drop-shadow-lg">
          <span className="text-white text-[10px] font-bold tracking-[0.15em] opacity-90 uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">BEFORE</span>
          <span className="text-white text-[10px] font-bold tracking-[0.15em] opacity-90 uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">AFTER</span>
        </div>
      )}
      
      {/* AFTER IMAGE (Base Image) */}
      <img src={afterImage} alt="After" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
      
      {/* BEFORE IMAGE (Clipped on top) */}
      <img src={beforeImage} alt="Before" className="absolute inset-0 w-full h-full object-cover pointer-events-none" style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }} />
      
      <div 
        className="absolute top-0 bottom-0 w-[2px] bg-white shadow-[0_0_15px_rgba(0,0,0,0.8)] z-10 pointer-events-none flex items-center justify-center"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
      >
        <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm border border-white/50 flex items-center justify-center">
            <div className="w-1 h-3 flex justify-between gap-[2px]">
                <div className="w-[1.5px] h-full bg-white rounded-full"></div>
                <div className="w-[1.5px] h-full bg-white rounded-full"></div>
            </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. PAGE COMPONENT
// ==========================================
export default function DoubleExposurePage() {
  // State for Navigation / Features Mega-Menu
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);

  // Footer Form Logic
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

  // Feedback / Testimonials Logic (Fetched from Backend)
  const latestReviews = useQuery(api.reviews.getLatestReviews, { limit: 3 }) || [];
  const fallbackTestimonials = [
    { name: "Richard Shusha", role: "Photographer", text: "I've used Lightroom for years and love Pixxel OS as a replacement - and their email follow up to questions is superb!", rating: 5 },
    { name: "Dino Mastropaolo", role: "Designer", text: "I'm blown away at how useful this software is. It's made my photo editing so much easier.", rating: 5 },
    { name: "Johnny", role: "Content Creator", text: "Great software. I made a mistake when registering and emailed support and they got back to me within a few hours. Great product, responsive team. Thank you!", rating: 5 },
  ];
  
  const testimonials = latestReviews.length > 0 
    ? latestReviews.map((review) => ({ 
        name: review.userName, 
        role: review.projectTitle || "Pixxel User", 
        title: review.title, 
        text: review.comment, 
        rating: review.rating || 5 
      })) 
    : fallbackTestimonials;


  // ----------------------------------------------------
  // HERO SECTION DATA (3 Images)
  // ----------------------------------------------------
  const heroData = [
    { id: 1, thumb: "hdr/hdr1.jpg", before: "hdr/hdr11.jpg", after: "hdr/hdr111.jpg" },
    { id: 2, thumb: "hdr/hdr2.jpg", before: "hdr/hdr22.jpg", after: "hdr/hdr222.jpg" },
    { id: 3, thumb: "hdr/hdr3.jpg", before: "hdr/hdr33.jpg", after: "hdr/hdr333.jpg" },
  ];
  const [activeHeroIdx, setActiveHeroIdx] = useState(0);

  // ----------------------------------------------------
  // CUSTOMIZATION SECTION 1 (4 Thumbnails)
  // ----------------------------------------------------
  const customSet1 = [
    { id: 1, name: "Greenery", thumb: "hdr/hdr4.jpg", before: "hdr/hdr44.jpg", after: "hdr/hdr444.jpg" },
    { id: 2, name: "Lace Pattern", thumb: "hdr/hdr5.jpg", before: "hdr/hdr55.jpg", after: "hdr/hdr555.jpg" },
    { id: 3, name: "Monstera", thumb: "hdr/hdr6.jpg", before: "hdr/hdr66.jpg", after: "hdr/hdr666.jpg" },
    { id: 4, name: "Palm Leaf", thumb: "hdr/hdr7.jpg", before: "hdr/hdr77.jpg", after: "hdr/hdr777.jpg" },
  ];
  const [activeCustom1Idx, setActiveCustom1Idx] = useState(0);

  // ----------------------------------------------------
  // CUSTOMIZATION SECTION 2 (4 Thumbnails)
  // ----------------------------------------------------
  const customSet2 = [
    { id: 1, name: "Sunset Glow", thumb: "hdr/custom2/thumb1.jpg", before: "hdr/custom2/before1.jpg", after: "hdr/custom2/after1.jpg" },
    { id: 2, name: "Neon Vibes", thumb: "hdr/custom2/thumb2.jpg", before: "hdr/custom2/before2.jpg", after: "hdr/custom2/after2.jpg" },
    { id: 3, name: "Vintage Film", thumb: "hdr/custom2/thumb3.jpg", before: "hdr/custom2/before3.jpg", after: "hdr/custom2/after3.jpg" },
    { id: 4, name: "Cyberpunk", thumb: "hdr/custom2/thumb4.jpg", before: "hdr/custom2/before4.jpg", after: "hdr/custom2/after4.jpg" },
  ];
  const [activeCustom2Idx, setActiveCustom2Idx] = useState(0);

  // ----------------------------------------------------
  // CAROUSEL SECTION (8 Photos, Auto-scroll)
  // ----------------------------------------------------
  const carouselData = [
    { id: 1, name: "GenErase", before: "hdr/carousel/before1.jpg", after: "hdr/carousel/after1.jpg" },
    { id: 2, name: "GenExpand", before: "hdr/carousel/before2.jpg", after: "hdr/carousel/after2.jpg" },
    { id: 3, name: "GenSwap", before: "YOUR_CAROUSEL_BEFORE_3.jpg", after: "YOUR_CAROUSEL_AFTER_3.jpg" },
    { id: 4, name: "Studio Light", before: "YOUR_CAROUSEL_BEFORE_4.jpg", after: "YOUR_CAROUSEL_AFTER_4.jpg" },
    { id: 5, name: "Neon & Glow", before: "YOUR_CAROUSEL_BEFORE_5.jpg", after: "YOUR_CAROUSEL_AFTER_5.jpg" },
    { id: 6, name: "Water Enhancer", before: "YOUR_CAROUSEL_BEFORE_6.jpg", after: "YOUR_CAROUSEL_AFTER_6.jpg" },
    { id: 7, name: "Sky Replacement", before: "YOUR_CAROUSEL_BEFORE_7.jpg", after: "YOUR_CAROUSEL_AFTER_7.jpg" },
    { id: 8, name: "Structure AI", before: "YOUR_CAROUSEL_BEFORE_8.jpg", after: "YOUR_CAROUSEL_AFTER_8.jpg" },
  ];

  const [carouselIdx, setCarouselIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setCarouselIdx((prev) => (prev + 1) % carouselData.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isHovered, carouselData.length]);

  const getVisibleCarouselItems = () => {
    const items = [];
    for (let i = 0; i < 4; i++) {
      items.push(carouselData[(carouselIdx + i) % carouselData.length]);
    }
    return items;
  };


  return (
    <div className="min-h-screen bg-[#000] text-white font-sans selection:bg-[#ffb400]/30 relative">

      {/* ========================================== */}
      {/* 🌟 100% SAME TO SAME PERFECT NAVBAR WRAPPER */}
      {/* ========================================== */}
      <div className="absolute top-[72px] left-0 right-0 w-full z-40">
        {/* Yahan se shuru hota hai aapka perfect page wala bina ek dot badle hua code */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.5 }}
          className="relative z-50 w-full max-w-[1400px] mx-auto px-5 sm:px-10 flex items-center justify-between mb-1"
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
                          <Link href="/pro/hdr" className="flex items-center text-[13px] text-[#a1a1aa] hover:text-white transition-colors py-2">
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
      </div>

      
      {/* ========================================== */}
      {/* 🌟 1. FULL-BLEED HERO SECTION (Double Exposure) */}
      {/* ========================================== */}
      <section className="relative w-full h-[100vh] min-h-[700px] flex items-center overflow-hidden pt-2" id="overview">
         {/* Background Slider taking full space */}
         <div className="absolute inset-0 z-0 pointer-events-auto">
             <AnimatePresence mode="wait">
                 <motion.div key={activeHeroIdx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="w-full h-full">
                     <BeforeAfterSlider 
                        beforeImage={heroData[activeHeroIdx].before} 
                        afterImage={heroData[activeHeroIdx].after} 
                        heightClass="h-full rounded-none" 
                        hideLabels={true}
                     />
                 </motion.div>
             </AnimatePresence>
         </div>

         {/* Dark Gradient Overlay for left text readability */}
         <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent pointer-events-none z-14" />

         {/* Content Container */}
         <div className="relative z-20 w-full max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col justify-center h-full pointer-events-none mt-9">
             <div className="max-w-3xl pointer-events-auto">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md mb-6">
                    <Sparkles size={14} className="text-amber-400" />
                    <span className="text-white text-[11px] font-bold tracking-[0.15em] uppercase">Pro Features</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-medium text-white leading-[1.1] tracking-tight mb-6">
                  Replicate studio lights <br/>in a <GradientText>few clicks</GradientText>
                </h1>
                <p className="text-lg md:text-xl text-white/65 font-light leading-relaxed mb-6 max-w-xl">
                  Recreate studio portrait lighting effects easily to elevate your photos. Experiment with Double Exposure & HDR sources for impressive portraits.
                </p>
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

         {/* Bottom 3 Thumbnails */}
         <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-30 flex gap-4 pointer-events-auto bg-black/40 backdrop-blur-md p-2 rounded-2xl ">
             {heroData.map((item, idx) => (
                 <button 
                    key={item.id} 
                    onClick={() => setActiveHeroIdx(idx)}
                    className={`w-20 h-14 md:w-24 md:h-16 rounded-xl overflow-hidden transition-all duration-300 border-2 ${idx === activeHeroIdx ? 'border-cyan-400 scale-105 ' : 'border-transparent opacity-60 hover:opacity-100'}`}
                 >
                     <img src={item.thumb} alt={`Thumb ${item.id}`} className="w-full h-full object-cover" />
                 </button>
             ))}
         </div>
      </section>

      {/* ========================================== */}
      {/* 🌟 2. VIDEO SECTION (Screenshot 2) */}
      {/* ========================================== */}
      <section className="py-24 max-w-7xl mx-auto px-6 flex flex-col items-center">
         <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Watch <GradientText>Studio Light</GradientText> in action</h2>
            <p className="text-white/60 text-lg font-light">Easily control light sources, relight portrait photos, and add unique double exposure patterns.</p>
         </div>

         <div className="relative w-full max-w-[1250px] aspect-video rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)]  group bg-[#111] flex items-center justify-center">
             <video src="YOUR_BIG_VIDEO_URL.mp4" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" poster="YOUR_VIDEO_THUMBNAIL.jpg" controls></video>
             
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="w-15 h-15 bg-amber-500 rounded-full flex items-center justify-center pl-1 shadow-[0_0_30px_rgba(251,188,5,0.4)]">
                     <PlayCircle size={32} className="text-black" fill="currentColor" />
                 </div>
             </div>
         </div>
      </section>

      {/* ========================================== */}
      {/* 🌟 3. CUSTOMIZATION SECTION 1 (Screenshot 3 & 4 Style) */}
      {/* ========================================== */}
      <section className="py-24 max-w-7xl mx-auto px-6">
         <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
             
             <div className="order-2 md:order-1">
                 <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">Turn on <GradientText>Light Customisation</GradientText></h2>
                 <p className="text-white/60 text-lg font-light leading-relaxed mb-10">
                    Customize your light source as you want — change its type, shape, color, and brightness. Try out different presets seamlessly.
                 </p>
                 
                 <div className="grid grid-cols-4 gap-3 md:gap-4 mb-6">
                     {customSet1.map((item, idx) => (
                         <button 
                            key={item.id} 
                            onClick={() => setActiveCustom1Idx(idx)}
                            className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all ${activeCustom1Idx === idx ? 'border-cyan-400 scale-105 shadow-lg shadow-cyan-500/20' : 'border-transparent opacity-60 hover:opacity-100'}`}
                         >
                             <img src={item.thumb} alt={item.name} className="w-full h-full object-cover" />
                         </button>
                     ))}
                 </div>
                 <div className="text-sm font-medium text-cyan-400 flex items-center gap-2">
                     <Sparkles size={16} /> Currently Viewing: <span className="text-white font-bold">{customSet1[activeCustom1Idx].name}</span>
                 </div>
             </div>

             <div className="order-1 md:order-2">
                 <AnimatePresence mode="wait">
                     <motion.div key={activeCustom1Idx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                         <BeforeAfterSlider 
                             beforeImage={customSet1[activeCustom1Idx].before}
                             afterImage={customSet1[activeCustom1Idx].after}
                             heightClass="h-[400px] md:h-[550px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5"
                         />
                     </motion.div>
                 </AnimatePresence>
             </div>
         </div>
      </section>

      {/* ========================================== */}
      {/* 🌟 4. CUSTOMIZATION SECTION 2 */}
      {/* ========================================== */}
      <section className="py-24 max-w-7xl mx-auto px-6">
         <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
             
             <div className="order-1">
                 <AnimatePresence mode="wait">
                     <motion.div key={activeCustom2Idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                         <BeforeAfterSlider 
                             beforeImage={customSet2[activeCustom2Idx].before}
                             afterImage={customSet2[activeCustom2Idx].after}
                             heightClass="h-[400px] md:h-[550px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5"
                         />
                     </motion.div>
                 </AnimatePresence>
             </div>

             <div className="order-2">
                 <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">Play with patterns and <GradientText>textures of light</GradientText></h2>
                 <p className="text-white/60 text-lg font-light leading-relaxed mb-10">
                    Different light sources can cast unique light patterns on your models. Recreate this effect by adding an atmospheric light pattern or texture to your portrait.
                 </p>
                 
                 <div className="grid grid-cols-4 gap-3 md:gap-4 mb-6">
                     {customSet2.map((item, idx) => (
                         <button 
                            key={item.id} 
                            onClick={() => setActiveCustom2Idx(idx)}
                            className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all ${activeCustom2Idx === idx ? 'border-purple-500 scale-105 shadow-lg shadow-purple-500/20' : 'border-transparent opacity-60 hover:opacity-100'}`}
                         >
                             <img src={item.thumb} alt={item.name} className="w-full h-full object-cover" />
                         </button>
                     ))}
                 </div>
                 <div className="text-sm font-medium text-purple-400 flex items-center gap-2">
                     <Layers size={16} /> Currently Viewing: <span className="text-white font-bold">{customSet2[activeCustom2Idx].name}</span>
                 </div>
             </div>

         </div>
      </section>

      {/* ========================================== */}
      {/* 🌟 5. CAROUSEL SECTION */}
      {/* ========================================== */}
      <section id="features" className="py-32 w-full bg-[#030303]  overflow-hidden">
         <div className="text-center mb-16 px-4">
             <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">Join the Next Evolution <br/> of <GradientText>Pixxel OS</GradientText></h2>
             <p className="text-white/60 text-lg max-w-2xl mx-auto font-light">Get ready to explore the full potential of next-gen AI-powered photo editing. Level up and step into the future of photography.</p>
             <div className="mt-8">
                <Link href="/pricing">
                  <button className="bg-gradient-to-r from-cyan-400 to-purple-500 text-black font-extrabold uppercase tracking-widest px-8 py-3.5 rounded-md text-sm transition-transform hover:-translate-y-1">
                    VIEW PLANS
                  </button>
                </Link>
             </div>
         </div>

         <div 
            className="w-full max-w-[1800px] mx-auto overflow-hidden relative px-1"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
         >
             <div className="flex gap-4 md:gap-6 transition-transform duration-700 ease-in-out">
                 {getVisibleCarouselItems().map((item, idx) => (
                     <motion.div 
                        key={item.id + "-" + idx}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="w-full md:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] flex-shrink-0 relative group"
                     >
                         <div className="w-full aspect-[3/4] md:aspect-[4/5] rounded-3xl overflow-hidden  relative">
                             <BeforeAfterSlider 
                                beforeImage={item.before}
                                afterImage={item.after}
                                heightClass="h-full "
                                hideLabels={true}
                             />

                             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex items-end p-6">
                                 <h3 className="text-white text-2xl font-bold drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                     {item.name}
                                 </h3>
                             </div>
                         </div>
                     </motion.div>
                 ))}
             </div>
             
             <div className="flex justify-center mt-10 gap-2">
                 {carouselData.map((_, i) => (
                     <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === carouselIdx ? 'w-8 bg-cyan-400' : 'w-2 bg-white/20'}`}></div>
                 ))}
             </div>
         </div>
      </section>

      {/* ========================================== */}
      {/* 🌟 6. TESTIMONIALS (BACKEND CONNECTED) */}
      {/* ========================================== */}
      <section className="py-24 max-w-7xl mx-auto px-6 relative z-20">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-16">
              <motion.h2 variants={fadeUpVariant} className="text-3xl md:text-5xl font-bold text-white mb-4">
                  The secret to creating incredible photos <br/>that leave everyone speechless
              </motion.h2>
              <motion.div variants={fadeUpVariant} className="flex items-center justify-center gap-1 text-[14px] font-semibold text-white/80 mt-6">
                Excellent 4.6 out of 5 <Star className="w-4 h-4 fill-[#00b67a] text-[#00b67a] ml-1" /> <span className="font-bold ml-1">Trustpilot</span>
              </motion.div>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <motion.div key={index} variants={fadeUpVariant} className="backdrop-blur-xl bg-[#0a0a0a] rounded-2xl lg:rounded-3xl p-6 sm:p-8 lg:p-10 border border-white/10 hover:bg-[#111] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(168,85,247,0.15)] relative group overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-t-2xl lg:rounded-t-3xl" />
                  <div className="flex gap-1 mb-4 sm:mb-6">{[...Array(testimonial.rating)].map((_, i) => (<span key={i} className="text-lg sm:text-xl text-yellow-400">★</span>))}</div>
                  {testimonial.title && (<h3 className="text-base sm:text-lg font-bold text-cyan-300 mb-2 sm:mb-3">{testimonial.title}</h3>)}
                  <p className="text-slate-300 mb-6 sm:mb-8 leading-relaxed italic font-light text-sm sm:text-base lg:text-lg z-10 relative">"{testimonial.text}"</p>
                  <div className="flex items-center gap-3 sm:gap-4 relative z-10">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm sm:text-base lg:text-lg shadow-lg flex-shrink-0">{testimonial.name.charAt(0)}</div>
                    <div className="min-w-0"><h4 className="font-bold text-white text-sm sm:text-base tracking-wide truncate">{testimonial.name}</h4><p className="text-xs sm:text-sm text-slate-400 truncate">{testimonial.role}</p></div>
                  </div>
                </motion.div>
              ))}
          </motion.div>
      </section>

      {/* ============================================================== */}
      {/* 🌟 7. FOOTER */}
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
              {['Console', 'Mechanics', 'Packages', 'Enterprise'].map(link => (<li key={link}><Link href="/" className="hover:text-cyan-400 hover:tracking-wide transition-all">{link}</Link></li>))}
            </ul>
          </div>
          <div>
            <h4 className="text-[12px] font-black text-white mb-6 uppercase tracking-[0.2em] opacity-90">Corporate</h4>
            <ul className="space-y-4 text-[14px] text-slate-500 font-medium">
              {['Leadership', 'Press Release', 'Terms of Use', 'Security Details'].map(link => (<li key={link}><Link href="/" className="hover:text-cyan-400 hover:tracking-wide transition-all">{link}</Link></li>))}
            </ul>
          </div>
          <div>
            <h4 className="text-[12px] font-black text-white mb-6 uppercase tracking-[0.2em] opacity-90">Priority Sync</h4>
            <form onSubmit={handleContactSubmit} className="space-y-3">
              <div className="flex gap-3">
                 <Input placeholder="Ident" value={contactForm.name} onChange={(e) => setContactForm(p => ({ ...p, name: e.target.value }))} className="bg-[#0a0a0a] border-white/10 text-white rounded-xl h-12 text-[14px] flex-1 focus-visible:ring-1 focus-visible:ring-cyan-500" required />
                 <Input type="email" placeholder="Terminal@mail.com" value={contactForm.email} onChange={(e) => setContactForm(p => ({ ...p, email: e.target.value }))} className="bg-[#0a0a0a] border-white/10 text-white rounded-xl h-12 text-[14px] flex-[1.5] focus-visible:ring-1 focus-visible:ring-cyan-500" required />
              </div>
              <textarea placeholder="Diagnostic data query..." value={contactForm.message} onChange={(e) => setContactForm(p => ({ ...p, message: e.target.value }))} className="w-full bg-[#0a0a0a] border border-white/10 text-white rounded-xl px-4 py-4 text-[14px] min-h-[90px] resize-none focus:outline-none focus:border-cyan-500/50 transition-colors shadow-inner custom-scrollbar" required />
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
