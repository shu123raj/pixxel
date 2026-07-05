"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Sun, CloudFog, Image as ImageIcon, Zap, ShieldCheck, 
  Settings2, Star, Check, PlayCircle, Sparkles, ChevronDown 
} from "lucide-react";

// ==========================================
// SOCIAL ICONS (For Footer)
// ==========================================
const Github = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-6.5a5.4 5.4 0 0 0-1.5-3.8 5.3 5.3 0 0 0-.1-3.8s-1.2-.4-3.9 1.4a13.3 13.3 0 0 0-7 0C6.2 1.5 5 1.9 5 1.9a5.3 5.3 0 0 0-.1 3.8A5.4 5.4 0 0 0 3 9.5c0 5 3 6.2 6 6.5a4.8 4.8 0 0 0-1 3.2v4" /></svg>);
const Twitter = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5 2.8 12 3 12c.5.2 1 .3 1.5.3C3 11 2.5 7 3 7c.5.7 1.2 1.2 2 1.3C3 5.5 4 2 4 2c2.6 3.2 6.5 5.3 10.5 5.5.3-2.6 2.1-4.5 4.8-4.5 1.5 0 2.9.6 3.9 1.7.9-.2 1.8-.7 2.6-1.1-.3 1-1 1.8-1.8 2.4.8-.1 1.6-.3 2.3-.6-.3.9-.9 1.7-1.5 2.3z" /></svg>);
const Instagram = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>);
const Linkedin = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>);

// ==========================================
// SCROLL REVEAL ANIMATIONS
// ==========================================
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
};

// ==========================================
// REUSABLE BEFORE/AFTER SLIDER
// ==========================================
const BeforeAfterSlider = ({ beforeImage, afterImage, heightClass = "h-[300px] sm:h-[400px] md:h-[600px]", hideLabels = false }) => {
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
      className={`relative w-full overflow-hidden select-none bg-[#111] ${heightClass}`}
      onMouseMove={handleMove}
      onTouchMove={handleMove}
    >
      {!hideLabels && (
        <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full flex justify-between px-4 sm:px-8 z-20 pointer-events-none drop-shadow-md">
          <span className="text-white text-[9px] sm:text-[10px] font-bold tracking-[0.15em] opacity-80 uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">BEFORE</span>
          <span className="text-white text-[9px] sm:text-[10px] font-bold tracking-[0.15em] opacity-80 uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">AFTER</span>
        </div>
      )}

      {/* AFTER IMAGE (Base Layer) */}
      <img src={afterImage} alt="After" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
      
      {/* BEFORE IMAGE (Clipped Layer on Top) */}
      <img 
        src={beforeImage} 
        alt="Before" 
        className="absolute inset-0 w-full h-full object-cover pointer-events-none" 
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }} 
      />

      {/* SLIDER HANDLE */}
      <div 
        className="absolute top-0 bottom-0 w-[2px] sm:w-[1.5px] bg-white/80 shadow-[0_0_15px_rgba(0,0,0,0.9)] z-10 pointer-events-none flex items-center justify-center cursor-ew-resize"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
      >
        <div className="w-5 h-7 sm:w-6 sm:h-8 rounded-sm bg-white/90 backdrop-blur flex items-center justify-center shadow-lg border border-black/10 pointer-events-auto">
            <div className="w-0.5 h-3 sm:h-4 border-x border-gray-400"></div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// MAIN PAGE COMPONENT
// ==========================================
export default function EditorLandingPage() {
  
  // State for Section 2 (Sky Transform)
  const [activeSky, setActiveSky] = useState(0);
  const skyData = [
    {
      thumb: "https://images.unsplash.com/photo-1502481851512-e9e2529bfbf9?q=80&w=200&h=200&fit=crop", 
      before: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop&sepia=1&brightness=0.7", 
      after: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop", 
    },
    {
      thumb: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=200&h=200&fit=crop", 
      before: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?q=80&w=1200&auto=format&fit=crop&grayscale=1",
      after: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?q=80&w=1200&auto=format&fit=crop",
    },
    {
      thumb: "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?q=80&w=200&h=200&fit=crop", 
      before: "https://images.unsplash.com/photo-1513224502586-d1e602410265?q=80&w=1200&auto=format&fit=crop&brightness=0.5",
      after: "https://images.unsplash.com/photo-1513224502586-d1e602410265?q=80&w=1200&auto=format&fit=crop",
    }
  ];

  // States for Interactive Sliders (Section 3 & 4)
  const [accentValue, setAccentValue] = useState(98);
  const [fogValue, setFogValue] = useState(100);

  // States for Backend-connected Footer & FAQ
  const [openFAQ, setOpenFAQ] = useState(null);
  const sendMessage = useMutation(api.messages?.sendMessage || (() => {}));
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) { 
      toast.error("Please fill in all fields"); 
      return; 
    }
    setIsSubmitting(true);
    try {
      if(api.messages?.sendMessage) await sendMessage(contactForm);
      toast.success("Message sent successfully!");
      setContactForm({ name: "", email: "", message: "" });
    } catch (error) { 
      toast.error("Failed to send message."); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  return (
    // 'scroll-smooth' applied for smooth anchor navigation and scrolling
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#ffb400]/30 font-sans overflow-x-hidden scroll-smooth">
      
      {/* ==========================================
          1. HERO SECTION (Blackish Camera Theme)
      ========================================== */}
      <section className="relative w-full h-auto min-h-[90vh] py-20 flex flex-col items-center justify-center text-center px-4 overflow-hidden border-b border-white/5">
        <div 
          className="absolute inset-0 z-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=2400&auto=format&fit=crop')`, 
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent z-0 pointer-events-none" />

        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={fadeUp} 
          className="relative z-10 max-w-4xl mx-auto flex flex-col items-center"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[40px] font-bold tracking-tight leading-[1.15] mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 relative">AI-Photo Editor</span> – explore the <br className="hidden sm:block"/>
            power of AI to transform your <br className="hidden sm:block"/>
            images with precision and ease.
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white/70 font-light mb-10 max-w-2xl px-4">
            Luminar Neo – your easy, AI-powered photo editing software for macOS & Windows. Use as standalone or plugin.
          </p>
          
          <Link href="/pricing" className="w-full sm:w-auto px-6 sm:px-0">
            <button
              className="w-full sm:w-auto font-extrabold uppercase tracking-[0.2em] transition-all duration-300 hover:-translate-y-[2px] active:scale-95 bg-gradient-to-r from-cyan-400 to-purple-500 text-black text-[12px] sm:text-[13px] px-10 py-4 sm:px-24 sm:py-5 rounded-lg shadow-[0_6px_28px_rgba(13,78,88,0.14),0_2px_8px_rgba(168,85,247,0.2)]"
            >
              VIEW PLANS
            </button>
          </Link>
          
          <div className="mt-8 text-xs sm:text-sm font-bold tracking-widest text-white/80 flex items-center gap-2">
            01<span className="text-white/40">d</span> : 18<span className="text-white/40">h</span> : 42<span className="text-white/40">m</span> : 04<span className="text-white/40">s</span>
          </div>
        </motion.div>
      </section>

      {/* ==========================================
          HEADER TITLE
      ========================================== */}
      <section className="py-16 sm:py-20 text-center px-4">
        <motion.h2 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: "-50px" }} 
          variants={fadeUp} 
          className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight"
        >
         <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 relative">Exclusive tools.</span> Endless possibilities. <br className="hidden sm:block"/> In one AI editor.
        </motion.h2>
      </section>

      {/* ==========================================
          2. TRANSFORM THE SKY (Thumbnails + Slider)
      ========================================== */}
      <section className="py-10 px-4 md:px-10">
        <motion.div 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: "-50px" }} 
          variants={fadeUp} 
          className="max-w-[1400px] mx-auto bg-[#0a0a0c] rounded-[1.5rem] sm:rounded-[2rem] flex flex-col lg:flex-row overflow-hidden shadow-2xl h-auto lg:h-[600px] border border-white/5"
        >
          
          {/* Left Text & Thumbnails */}
          <div className="w-full lg:w-[40%] p-8 sm:p-10 lg:p-14 flex flex-col justify-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6 leading-tight">
              Transform the sky <br className="hidden sm:block"/> from ordinary to <br className="hidden sm:block"/> stunning
            </h2>
            <p className="text-white/60 text-base sm:text-lg font-light leading-relaxed mb-8 sm:mb-10">
              Seamlessly replace the sky in your photo and add realistic sky reflections with the power of artificial intelligence. Sky AI analyzes your image, identifies the sky, and replaces it in a click.
            </p>
            
            {/* Dark Box for Thumbnails */}
            <div className="bg-[#151518] p-4 sm:p-5 rounded-2xl border border-white/5 w-fit">
              <div className="flex items-center gap-2 mb-3 sm:mb-4 text-xs sm:text-sm font-semibold text-white/90">
                <CloudFog size={16} /> Sky<sup className="text-white/50 text-[10px]">AI</sup>
              </div>
              <div className="flex gap-2 sm:gap-3">
                {skyData.map((sky, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveSky(idx)}
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden transition-all duration-300 border-2 ${activeSky === idx ? 'border-[#ffb400] scale-105 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={sky.thumb} alt={`Sky ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Before/After Slider */}
          <div className="w-full lg:w-[60%] h-[350px] sm:h-[450px] lg:h-full relative border-t lg:border-t-0 lg:border-l border-white/5">
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeSky} 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                transition={{ duration: 0.4 }}
                className="w-full h-full"
              >
                <BeforeAfterSlider 
                  beforeImage={skyData[activeSky].before} 
                  afterImage={skyData[activeSky].after} 
                  heightClass="h-full"
                />
              </motion.div>
            </AnimatePresence>
          </div>

        </motion.div>
      </section>

      {/* ==========================================
          3. ADJUST A DOZEN CONTROLS (Accent AI)
      ========================================== */}
      <section className="py-10 px-4 md:px-10">
        <motion.div 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: "-50px" }} 
          variants={fadeUp} 
          className="max-w-[1400px] mx-auto bg-[#0a0a0c] rounded-[1.5rem] sm:rounded-[2rem] border border-white/5 flex flex-col lg:flex-row overflow-hidden shadow-2xl h-auto lg:h-[600px]"
        >
          
          {/* Left Large Image with Dynamic CSS Filter */}
          <div className="w-full lg:w-[55%] h-[350px] sm:h-[450px] lg:h-full overflow-hidden border-b lg:border-b-0 lg:border-r border-white/5">
            <img 
              src="https://images.unsplash.com/photo-1542224566-6e85f2e6772f?q=80&w=1600&auto=format&fit=crop" 
              alt="Mountain Lake" 
              className="w-full h-full object-cover transition-all duration-75"
              style={{ filter: `brightness(${0.5 + accentValue/100}) contrast(${0.8 + accentValue/100}) saturate(${0.5 + accentValue/50})` }}
            />
          </div>

          {/* Right Controls */}
          <div className="w-full lg:w-[45%] p-8 sm:p-10 lg:p-16 flex flex-col justify-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
              Adjust up to a <br className="hidden sm:block"/> dozen controls <br className="hidden sm:block"/> with one slider
            </h2>
            <p className="text-white/60 text-base sm:text-lg font-light leading-relaxed mb-8 sm:mb-12">
              Achieve naturally beautiful results with Accent AI, an intelligent tool that substitutes more than a dozen controls including Shadows, Highlights, Contrast, Tone, Saturation, Exposure, and Details.
            </p>
            
            {/* Slider UI */}
            <div className="bg-[#151518] p-5 sm:p-6 rounded-2xl border border-white/5">
              <div className="flex justify-between items-center mb-4 text-xs sm:text-sm font-semibold">
                <div className="flex items-center gap-2"><Sun size={16} /> Accent<sup className="text-white/50 text-[10px]">AI</sup></div>
                <span className="text-white/70">{accentValue}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={accentValue} 
                onChange={(e) => setAccentValue(Number(e.target.value))}
                className="w-full h-1.5 sm:h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#ffb400]"
              />
            </div>
          </div>

        </motion.div>
      </section>

      {/* ==========================================
          4. ADD UNIQUE MOOD (Atmosphere AI - Fog)
      ========================================== */}
      <section className="py-10 px-4 md:px-10">
        <motion.div 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: "-50px" }} 
          variants={fadeUp} 
          className="max-w-[1400px] mx-auto bg-[#0a0a0c] rounded-[1.5rem] sm:rounded-[2rem] border border-white/5 flex flex-col lg:flex-row overflow-hidden shadow-2xl h-auto lg:h-[600px]"
        >
          
          {/* Left Controls */}
          <div className="w-full lg:w-[45%] p-8 sm:p-10 lg:p-16 flex flex-col justify-center order-2 lg:order-1">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
              Effortlessly add a <br className="hidden sm:block"/> unique mood
            </h2>
            <p className="text-white/60 text-base sm:text-lg font-light leading-relaxed mb-8 sm:mb-12">
              Place fog, mist, or haze in your image with Atmosphere AI, which uses content-aware masking for realistic results. No manual masking required — Luminar Neo handles the complex work for you.
            </p>
            
            {/* Slider UI */}
            <div className="bg-[#151518] p-5 sm:p-6 rounded-2xl border border-white/5">
              <div className="flex justify-between items-center mb-4 text-xs sm:text-sm font-semibold">
                <div className="flex items-center gap-2"><CloudFog size={16} /> Fog</div>
                <span className="text-white/70">{fogValue}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={fogValue} 
                onChange={(e) => setFogValue(Number(e.target.value))}
                className="w-full h-1.5 sm:h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#ffb400]"
              />
            </div>
          </div>

          {/* Right Image with Dynamic Fog Overlay */}
          <div className="w-full lg:w-[55%] h-[350px] sm:h-[450px] lg:h-full relative overflow-hidden order-1 lg:order-2 border-b lg:border-b-0 lg:border-l border-white/5">
            <img 
              src="https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?q=80&w=1600&auto=format&fit=crop" 
              alt="City Buildings" 
              className="w-full h-full object-cover"
            />
            {/* Dynamic White fog overlay based on slider value */}
            <div 
              className="absolute inset-0 bg-white transition-opacity duration-75 pointer-events-none"
              style={{ opacity: fogValue / 100 * 0.6 }} 
            />
          </div>

        </motion.div>
      </section>

      {/* ==========================================
          5. UNLOCK STUNNING EDITS (Laptop Mockup)
      ========================================== */}
      <section className="py-16 sm:py-24 px-4 md:px-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-10 sm:mb-12">
          <div className="flex items-center justify-center gap-1 text-[12px] sm:text-[13px] font-semibold text-white/80 mb-4">
            Excellent 4.6 out of 5 <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-[#00b67a] text-[#00b67a] ml-1" /> <span className="font-bold ml-1">Trustpilot</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 relative">Unlock Stunning</span> edits this spring
          </h2>
        </motion.div>

        <motion.div 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: "-50px" }} 
          variants={fadeUp} 
          className="max-w-[1200px] mx-auto bg-gradient-to-br from-[#3d2a0b] via-[#1a1104] to-[#0a0a0c] rounded-[1.5rem] sm:rounded-[2rem] border border-[#ffb400]/20 p-8 sm:p-10 md:p-16 flex flex-col md:flex-row items-center gap-10 md:gap-12 shadow-2xl"
        >
          {/* Laptop Image */}
          <div className="w-full md:w-1/2">
            <img 
              src="https://res.cloudinary.com/do6jlckzy/image/upload/v1783188627/ChatGPT_Image_Jul_4_2026_11_34_40_PM-Photoroom_nq1awp.png" 
              alt="Laptop Editor Mockup" 
              className="w-full rounded-lg drop-shadow-2xl hover:scale-105 transition-transform duration-500"
              style={{ filter: "brightness(0.9) contrast(1.1)" }} 
            />
            <div className="mt-6 text-center text-xs sm:text-sm text-white/60 px-4">
              Works as <span className="text-white font-bold">macOS</span> & <span className="text-white font-bold">Windows</span> app and Photoshop, Lightroom, Photos plugin
            </div>
          </div>

          {/* Features List */}
          <div className="w-full md:w-1/2 space-y-6 sm:space-y-8">
            {[
              { icon: Sparkles, text: "24+ AI-based tools" },
              { icon: Settings2, text: "100+ precise features" },
              { icon: ImageIcon, text: "Full privacy with on-device editing" },
              { icon: Star, text: "Award-winning, intuitive interface" },
              { icon: ShieldCheck, text: "30 days money back guarantee" },
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-4 sm:gap-5 text-lg sm:text-xl font-medium text-white/90">
                <div className="w-10 h-10 shrink-0 rounded-xl border border-white/20 flex items-center justify-center bg-white/5 shadow-sm">
                  <feature.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white/80" />
                </div>
                {feature.text}
              </div>
            ))}
          </div>
        </motion.div>
        
        {/* CTA Button below mockup */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="flex flex-col items-center mt-10 sm:mt-12 px-4">
         <Link href="/pricing" className="w-full sm:w-auto">
          <button
            className="w-full sm:w-auto font-extrabold uppercase tracking-[0.2em] transition-all duration-300 hover:-translate-y-[2px] active:scale-95 text-black"
            style={{
              background: "linear-gradient(90deg, #22d3ee 0%, #a855f7 100%)",
              fontSize: "12px",
              padding: "16px 80px",
              borderRadius: "8px",
              boxShadow: "0 6px 28px rgba(13, 78, 88, 0.14), 0 2px 8px rgba(168,85,247,0.2)",
            }}
          >
            VIEW PLANS
          </button>
        </Link>
          <div className="mt-5 text-xs sm:text-sm font-bold tracking-widest text-white/80">
            01d : 18h : 41m : 06s
          </div>
        </motion.div>
      </section>

      {/* ==========================================
          6. RELIGHT AI (Brightness/Contrast Before After)
      ========================================== */}
      <section className="py-10 px-4 md:px-10">
        <motion.div 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: "-50px" }} 
          variants={fadeUp} 
          className="max-w-[1400px] mx-auto relative rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden shadow-2xl h-[400px] sm:h-[500px] md:h-[700px] border border-white/5"
        >
          <BeforeAfterSlider 
            beforeImage="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1600&auto=format&fit=crop&brightness=0.4" 
            afterImage="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1600&auto=format&fit=crop" 
            heightClass="h-full"
          />
          
          <div className="absolute bottom-8 sm:bottom-10 left-6 sm:left-10 max-w-xs sm:max-w-sm z-30 pointer-events-none pr-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 drop-shadow-lg"><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 relative">Color the Lights</span></h2>
            <p className="text-white/90 text-sm sm:text-base md:text-lg font-light leading-relaxed drop-shadow-md">
              Fix backlit photos with the Relight AI tool. It builds a 3D map of an image so you can easily adjust lighting and exposure based on depth.
            </p>
          </div>
        </motion.div>
      </section>

      {/* ==========================================
          7. PORTRAIT BOKEH AI (Blur Before After)
      ========================================== */}
      <section className="py-10 px-4 md:px-10">
        <motion.div 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: "-50px" }} 
          variants={fadeUp} 
          className="max-w-[1400px] mx-auto relative rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden shadow-2xl h-[400px] sm:h-[500px] md:h-[700px] border border-white/5"
        >
          <BeforeAfterSlider 
            beforeImage="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=1600&auto=format&fit=crop" 
            afterImage="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=1600&auto=format&fit=crop&blur=50" 
            heightClass="h-full"
          />
          
          <div className="absolute bottom-8 sm:bottom-10 right-6 sm:right-10 max-w-xs sm:max-w-sm z-30 pointer-events-none text-right pl-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 drop-shadow-lg"><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 relative">Create Atmospheric Portraits</span> that Amaze</h2>
            <p className="text-white/90 text-sm sm:text-base md:text-lg font-light leading-relaxed drop-shadow-md">
              Simulate the effect of an out-of-focus background behind your subject without needing expensive lenses with the Portrait Bokeh AI tool.
            </p>
          </div>
        </motion.div>
      </section>

      {/* ==========================================
          8. COLOR/SATURATION (Before After)
      ========================================== */}
      <section className="py-10 px-4 md:px-10 mb-10 sm:mb-20">
        <motion.div 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: "-50px" }} 
          variants={fadeUp} 
          className="max-w-[1400px] mx-auto relative rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden shadow-2xl h-[400px] sm:h-[500px] md:h-[700px] border border-white/5"
        >
          <BeforeAfterSlider 
            beforeImage="https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?q=80&w=1600&auto=format&fit=crop&sepia=1" 
            afterImage="https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?q=80&w=1600&auto=format&fit=crop&saturate=2" 
            heightClass="h-full"
          />
          
          <div className="absolute top-8 sm:top-10 left-6 sm:left-10 max-w-xs sm:max-w-md z-30 pointer-events-none pr-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 drop-shadow-lg">Make colors pop instantly</h2>
            <p className="text-white/90 text-sm sm:text-base md:text-lg font-light leading-relaxed drop-shadow-md">
              Enhance dull colors and bring your photos to life. Our intelligent color grading AI knows exactly which tones to boost without oversaturating skin tones.
            </p>
          </div>
        </motion.div>
      </section>

      {/* ============================================================== */}
      {/* 9. FAQ SECTION (From Backend/Sky Page) */}
      {/* ============================================================== */}
      <section className="py-20 sm:py-24 bg-[#050505] relative overflow-hidden border-t border-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] md:w-[900px] h-[500px] md:h-[700px] bg-gradient-to-r from-[#ffb400]/5 to-[#ffb400]/10 blur-[100px] md:blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-12 sm:mb-16">
            <span className="inline-flex items-center px-4 py-2 rounded-full border border-white/10 bg-white/[0.02] text-[10px] sm:text-xs uppercase tracking-[0.25em] text-white/60 mb-4 sm:mb-6">
              SUPPORT
            </span>

            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-[-0.04em]">
              Frequently Asked <br className="hidden sm:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffb400] to-orange-500">
               Questions
              </span>
            </h2>

            <p className="mt-4 sm:mt-6 text-white/50 text-sm sm:text-[15px] max-w-2xl mx-auto leading-relaxed px-2">
              Everything you need to know about our AI-powered photo editing platform, image enhancement tools, and workflow features.
            </p>
          </motion.div>

          <div className="space-y-3 sm:space-y-4">
            {[
              { question: "What image formats are supported?", answer: "Our platform supports JPG, JPEG, PNG, WebP, AVIF, and other widely used image formats for seamless editing." },
              { question: "Can AI remove blur from photos?", answer: "Yes. Our advanced AI models can sharpen blurry images, recover lost details, and improve overall image clarity." },
              { question: "Does the editor improve low-resolution images?", answer: "Absolutely. AI upscaling enhances image resolution while preserving textures and natural details." },
              { question: "Can I remove unwanted objects from photos?", answer: "Yes. AI object removal can erase people, objects, distractions, and background elements with realistic results." },
              { question: "Is batch editing available?", answer: "Yes. Process multiple images simultaneously to save time and maintain consistent editing across projects." },
            ].map((faq, index) => (
              <motion.div
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                key={index}
                className="group rounded-2xl sm:rounded-3xl border border-white/10 bg-[#0a0a0a] backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-[#111]"
              >
                <button
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                  className="w-full flex items-center justify-between px-5 sm:px-7 py-5 sm:py-6 text-left outline-none"
                >
                  <span className="text-white font-medium text-sm sm:text-[15px] md:text-[16px] tracking-tight pr-4">
                    {faq.question}
                  </span>
                  <div className={`shrink-0 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#ffb400]/10 border border-[#ffb400]/20 transition-transform duration-300 ${openFAQ === index ? "rotate-45" : ""}`}>
                    <span className="text-[#ffb400] text-lg sm:text-xl font-semibold">+</span>
                  </div>
                </button>

                <div className={`overflow-hidden transition-all duration-300 ${openFAQ === index ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
                  <p className="px-5 sm:px-7 pb-5 sm:pb-6 text-xs sm:text-[14px] leading-relaxed text-white/60">
                    {faq.answer}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 10. FOOTER WITH BACKEND LOGIC */}
      {/* ============================================================== */}
      <footer className="py-16 sm:py-20 relative z-20 bg-[#020202]">
       <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="grid gap-10 sm:gap-12 lg:gap-16 grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.5fr] items-start">
          
          <div>
            <div className="mb-6 sm:mb-8 font-black text-2xl tracking-tighter text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">Pixxel <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 relative"> OS.</span></div>
            <p className="text-[13px] sm:text-[14px] text-slate-500/80 leading-relaxed mb-6 sm:mb-8 max-w-full sm:max-w-[280px] font-medium">Infrastructure grade image orchestration natively rendered in high definition across your visual matrix.</p>
            <form className="flex w-full max-w-[320px] shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] rounded-[1rem] p-1 border border-white/10 bg-[#0a0a0a]" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Your work email..." className="flex-1 w-full bg-transparent px-4 py-3 text-[13px] sm:text-[14px] text-white outline-none border-none placeholder-slate-600" />
              <button type="submit" className="shrink-0 rounded-[0.8rem] bg-gradient-to-r from-cyan-400 to-purple-500 text-black px-4 sm:px-6 text-[12px] sm:text-[13px] font-bold shadow-md hover:opacity-90 transition-opacity">Access</button>
            </form>
          </div>

          <div>
            <h4 className="text-[11px] sm:text-[12px] font-black text-white mb-5 sm:mb-6 uppercase tracking-[0.2em] opacity-90">Sitemap</h4>
            <ul className="space-y-3 sm:space-y-4 text-[13px] sm:text-[14px] text-slate-500 font-medium">
              {['Console', 'Mechanics', 'Packages', 'Enterprise'].map(link => (<li key={link}><Link href="/" className="hover:text-[#ffb400] hover:tracking-wide transition-all">{link}</Link></li>))}
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] sm:text-[12px] font-black text-white mb-5 sm:mb-6 uppercase tracking-[0.2em] opacity-90">Corporate</h4>
            <ul className="space-y-3 sm:space-y-4 text-[13px] sm:text-[14px] text-slate-500 font-medium">
              {['Leadership', 'Press Release', 'Terms of Use', 'Security Details'].map(link => (<li key={link}><Link href="/" className="hover:text-[#ffb400] hover:tracking-wide transition-all">{link}</Link></li>))}
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] sm:text-[12px] font-black text-white mb-5 sm:mb-6 uppercase tracking-[0.2em] opacity-90">Priority Sync</h4>
            <form onSubmit={handleContactSubmit} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                 <Input 
                    placeholder="Ident" 
                    value={contactForm.name} 
                    onChange={(e) => setContactForm(p => ({ ...p, name: e.target.value }))} 
                    className="bg-[#0a0a0a] border-white/10 text-white rounded-xl h-11 sm:h-12 text-[13px] sm:text-[14px] flex-1 focus-visible:ring-1 focus-visible:ring-[#ffb400]" 
                    required 
                 />
                 <Input 
                    type="email" 
                    placeholder="Terminal@mail.com" 
                    value={contactForm.email} 
                    onChange={(e) => setContactForm(p => ({ ...p, email: e.target.value }))} 
                    className="bg-[#0a0a0a] border-white/10 text-white rounded-xl h-11 sm:h-12 text-[13px] sm:text-[14px] flex-[1.5] focus-visible:ring-1 focus-visible:ring-[#ffb400]" 
                    required 
                 />
              </div>
              <textarea 
                placeholder="Diagnostic data query..." 
                value={contactForm.message} 
                onChange={(e) => setContactForm(p => ({ ...p, message: e.target.value }))} 
                className="w-full bg-[#0a0a0a] border border-white/10 text-white rounded-xl px-4 py-3 sm:py-4 text-[13px] sm:text-[14px] min-h-[80px] sm:min-h-[90px] resize-none focus:outline-none focus:border-[#ffb400]/50 transition-colors shadow-inner custom-scrollbar" 
                required 
              />
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full bg-gradient-to-r from-cyan-400 to-purple-500 hover:opacity-90 text-black font-extrabold tracking-widest uppercase text-[10px] sm:text-[11px] h-11 sm:h-12 rounded-xl transition-all border border-white/10"
              >
                {isSubmitting ? "TRANSMITTING..." : "OPEN TICKET PROTOCOL"}
              </Button>
            </form>
          </div>

        </div>

        <div className="mt-16 sm:mt-20 pt-6 sm:pt-8 border-t border-white/[0.05] flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 text-[12px] sm:text-[13px] font-medium text-slate-600 text-center md:text-left">
          <p>Operational Runtime: © {new Date().getFullYear()} Pixxel LLC. Hosted Securely.</p>
          <div className="flex items-center gap-3 sm:gap-4">
             {[<Twitter key="1"/>, <Instagram key="2"/>, <Linkedin key="3"/>, <Github key="4"/>].map((icon, idx) => (
                <div key={idx} className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-[#0a0a0a] hover:bg-slate-200 hover:text-black border border-white/10 hover:scale-110 cursor-pointer transition-all duration-300 *:w-4 *:h-4">
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