"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Sun, CloudFog, Image as ImageIcon, Zap, ShieldCheck, 
  Settings2, Star, Check, PlayCircle, MessageSquare, Sparkles, ChevronDown 
} from "lucide-react";

// ==========================================
// SOCIAL ICONS (For Footer)
// ==========================================
const Github = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-6.5a5.4 5.4 0 0 0-1.5-3.8 5.3 5.3 0 0 0-.1-3.8s-1.2-.4-3.9 1.4a13.3 13.3 0 0 0-7 0C6.2 1.5 5 1.9 5 1.9a5.3 5.3 0 0 0-.1 3.8A5.4 5.4 0 0 0 3 9.5c0 5 3 6.2 6 6.5a4.8 4.8 0 0 0-1 3.2v4" /></svg>);
const Twitter = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5 2.8 12 3 12c.5.2 1 .3 1.5.3C3 11 2.5 7 3 7c.5.7 1.2 1.2 2 1.3C3 5.5 4 2 4 2c2.6 3.2 6.5 5.3 10.5 5.5.3-2.6 2.1-4.5 4.8-4.5 1.5 0 2.9.6 3.9 1.7.9-.2 1.8-.7 2.6-1.1-.3 1-1 1.8-1.8 2.4.8-.1 1.6-.3 2.3-.6-.3.9-.9 1.7-1.5 2.3z" /></svg>);
const Instagram = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>);
const Linkedin = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>);

// ==========================================
// REUSABLE BEFORE/AFTER SLIDER
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
      className={`relative w-full overflow-hidden select-none bg-[#111] ${heightClass}`}
      onMouseMove={handleMove}
      onTouchMove={handleMove}
    >
      {!hideLabels && (
        <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full flex justify-between px-8 z-20 pointer-events-none drop-shadow-md">
          <span className="text-white text-[10px] font-bold tracking-[0.15em] opacity-80 uppercase drop-shadow-lg">BEFORE</span>
          <span className="text-white text-[10px] font-bold tracking-[0.15em] opacity-80 uppercase drop-shadow-lg">AFTER</span>
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
        className="absolute top-0 bottom-0 w-[1px] bg-white/70 shadow-[0_0_15px_rgba(0,0,0,0.8)] z-10 pointer-events-none flex items-center justify-center cursor-ew-resize"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
      >
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
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#ffb400]/30 font-sans overflow-x-hidden">
      
      {/* ==========================================
          1. HERO SECTION (Blackish Camera Theme)
      ========================================== */}
      <section className="relative w-full h-[90vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden ">
        {/* Background Image (Dark Photography Vibe) */}
        <div 
          className="absolute inset-0 z-0 opacity-40"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=2400&auto=format&fit=crop')`, 
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent z-0" />

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <h1 className="text-5xl md:text-6xl lg:text-[40px] font-bold tracking-tight leading-[1.1] mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 relative">AI-Photo Editor</span> – explore the <br/>
            power of AI to  your <br/>
            images with precision and ease.
          </h1>
          <p className="text-lg md:text-xl text-white/70 font-light mb-10 max-w-2xl">
            Luminar Neo – your easy, AI-powered photo editing software for macOS & Windows. Use as standalone or plugin.
          </p>
          
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
          
          <div className="mt-6 text-sm font-bold tracking-widest text-white/80 flex items-center gap-2">
            01<span className="text-white/40">d</span> : 18<span className="text-white/40">h</span> : 42<span className="text-white/40">m</span> : 04<span className="text-white/40">s</span>
          </div>
        </div>
      </section>

      {/* ==========================================
          HEADER TITLE
      ========================================== */}
      <section className="py-20 text-center px-4">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
         <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 relative">Exclusive tool.</span> Endless possibilities. <br/> In one AI editor.
        </h2>
      </section>

      {/* ==========================================
          2. TRANSFORM THE SKY (Thumbnails + Slider)
      ========================================== */}
      <section className="py-10 px-4 md:px-10">
        <div className="max-w-[1400px] mx-auto bg-[#0a0a0c] rounded-[2rem]  flex flex-col md:flex-row overflow-hidden shadow-2xl h-auto md:h-[600px]">
          
          {/* Left Text & Thumbnails */}
          <div className="w-full md:w-[40%] p-10 md:p-14 flex flex-col justify-center">
            <h2 className="text-4xl font-bold mb-6 leading-tight">
              Transform the sky <br/> from ordinary to <br/> stunning
            </h2>
            <p className="text-white/60 text-lg font-light leading-relaxed mb-10">
              Seamlessly replace the sky in your photo and add realistic sky reflections with the power of artificial intelligence. Sky AI analyzes your image, identifies the sky, and replaces it in a click.
            </p>
            
            {/* Dark Box for Thumbnails */}
            <div className="bg-[#151518] p-5 rounded-2xl border border-white/5 w-fit">
              <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-white/90">
                <CloudFog size={16} /> Sky<sup className="text-white/50 text-[10px]">AI</sup>
              </div>
              <div className="flex gap-3">
                {skyData.map((sky, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveSky(idx)}
                    className={`w-20 h-20 rounded-xl overflow-hidden  transition-all duration-300 ${activeSky === idx ? 'border-[#ffb400] scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={sky.thumb} alt={`Sky ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Before/After Slider */}
          <div className="w-full md:w-[60%] h-[400px] md:h-full relative">
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

        </div>
      </section>

      {/* ==========================================
          3. ADJUST A DOZEN CONTROLS (Accent AI)
      ========================================== */}
      <section className="py-10 px-4 md:px-10">
        <div className="max-w-[1400px] mx-auto bg-[#0a0a0c] rounded-[2rem] border border-white/5 flex flex-col md:flex-row overflow-hidden shadow-2xl h-auto md:h-[600px]">
          
          {/* Left Large Image with Dynamic CSS Filter */}
          <div className="w-full md:w-[55%] h-[400px] md:h-full overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1542224566-6e85f2e6772f?q=80&w=1600&auto=format&fit=crop" 
              alt="Mountain Lake" 
              className="w-full h-full object-cover transition-all duration-75"
              style={{ filter: `brightness(${0.5 + accentValue/100}) contrast(${0.8 + accentValue/100}) saturate(${0.5 + accentValue/50})` }}
            />
          </div>

          {/* Right Controls */}
          <div className="w-full md:w-[45%] p-10 md:p-16 flex flex-col justify-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Adjust up to a <br/> dozen controls <br/> with one slider
            </h2>
            <p className="text-white/60 text-lg font-light leading-relaxed mb-12">
              Achieve naturally beautiful results with Accent AI, an intelligent tool that substitutes more than a dozen controls including Shadows, Highlights, Contrast, Tone, Saturation, Exposure, and Details.
            </p>
            
            {/* Slider UI */}
            <div className="bg-[#151518] p-6 rounded-2xl border border-white/5">
              <div className="flex justify-between items-center mb-4 text-sm font-semibold">
                <div className="flex items-center gap-2"><Sun size={16} /> Accent<sup className="text-white/50 text-[10px]">AI</sup></div>
                <span className="text-white/70">{accentValue}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={accentValue} 
                onChange={(e) => setAccentValue(Number(e.target.value))}
                className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#ffb400]"
              />
            </div>
          </div>

        </div>
      </section>

      {/* ==========================================
          4. ADD UNIQUE MOOD (Atmosphere AI - Fog)
      ========================================== */}
      <section className="py-10 px-4 md:px-10">
        <div className="max-w-[1400px] mx-auto bg-[#0a0a0c] rounded-[2rem] border border-white/5 flex flex-col md:flex-row overflow-hidden shadow-2xl h-auto md:h-[600px]">
          
          {/* Left Controls */}
          <div className="w-full md:w-[45%] p-10 md:p-16 flex flex-col justify-center order-2 md:order-1">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Effortlessly add a <br/> unique mood
            </h2>
            <p className="text-white/60 text-lg font-light leading-relaxed mb-12">
              Place fog, mist, or haze in your image with Atmosphere AI, which uses content-aware masking for realistic results. No manual masking required — Luminar Neo handles the complex work for you.
            </p>
            
            {/* Slider UI */}
            <div className="bg-[#151518] p-6 rounded-2xl border border-white/5">
              <div className="flex justify-between items-center mb-4 text-sm font-semibold">
                <div className="flex items-center gap-2"><CloudFog size={16} /> Fog</div>
                <span className="text-white/70">{fogValue}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={fogValue} 
                onChange={(e) => setFogValue(Number(e.target.value))}
                className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#ffb400]"
              />
            </div>
          </div>

          {/* Right Image with Dynamic Fog Overlay */}
          <div className="w-full md:w-[55%] h-[400px] md:h-full relative overflow-hidden order-1 md:order-2">
            <img 
              src="https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?q=80&w=1600&auto=format&fit=crop" 
              alt="City Buildings" 
              className="w-full h-full object-cover"
            />
            {/* MAGIC: White fog overlay based on slider value */}
            <div 
              className="absolute inset-0 bg-white transition-opacity duration-75 pointer-events-none"
              style={{ opacity: fogValue / 100 * 0.6 }} // Max 60% opacity for realism
            />
          </div>

        </div>
      </section>

      {/* ==========================================
          5. UNLOCK STUNNING EDITS (Laptop Mockup)
      ========================================== */}
      <section className="py-24 px-4 md:px-10">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-1 text-[13px] font-semibold text-white/80 mb-4">
            Excellent 4.6 out of 5 <Star className="w-4 h-4 fill-[#00b67a] text-[#00b67a] ml-1" /> <span className="font-bold ml-1">Trustpilot</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight"><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 relative">Unlock Stuning</span> edits this spring</h2>
        </div>

        <div className="max-w-[1200px] mx-auto p-10 md:p-16 flex flex-col md:flex-row items-center gap-12 shadow-2xl">
          
          {/* Laptop Image */}
          <div className="w-full md:w-1/2">
            <img 
              src="https://res.cloudinary.com/do6jlckzy/image/upload/v1783188627/ChatGPT_Image_Jul_4_2026_11_34_40_PM-Photoroom_nq1awp.png" 
              alt="Laptop Editor Mockup" 
              className="w-full rounded-lg shadow-2xl"
              style={{ filter: "brightness(0.8) contrast(1.2)" }} 
            />
            <div className="mt-6 text-center text-sm text-white/60">
              Works as <span className="text-white font-bold">macOS</span> & <span className="text-white font-bold">Windows</span> app and Photoshop, Lightroom, Photos plugin
            </div>
          </div>

          {/* Features List */}
          <div className="w-full md:w-1/2 space-y-8">
            {[
              { icon: Sparkles, text: "24+ AI-based tools" },
              { icon: Settings2, text: "100+ precise features" },
              { icon: ImageIcon, text: "Full privacy with on-device editing" },
              { icon: Star, text: "Award-winning, intuitive interface" },
              { icon: ShieldCheck, text: "30 days money back guarantee" },
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-5 text-xl font-medium text-white/90">
                <div className="w-10 h-10 rounded-xl border border-white/20 flex items-center justify-center bg-white/5">
                  <feature.icon className="w-5 h-5 text-white/80" />
                </div>
                {feature.text}
              </div>
            ))}
          </div>

        </div>
        
        {/* CTA Button below mockup */}
        <div className="flex flex-col items-center mt-12">
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
          <div className="mt-4 text-sm font-bold tracking-widest text-white/80">
            01d : 18h : 41m : 06s
          </div>
        </div>
      </section>

      {/* ==========================================
          6. RELIGHT AI (Brightness/Contrast Before After)
      ========================================== */}
      <section className="py-10 px-4 md:px-10">
        <div className="max-w-[1400px] mx-auto relative rounded-[2rem] overflow-hidden shadow-2xl h-[500px] md:h-[700px]">
          <BeforeAfterSlider 
            beforeImage="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1600&auto=format&fit=crop&brightness=0.4" // Dark before
            afterImage="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1600&auto=format&fit=crop" // Bright after
            heightClass="h-full"
          />
          
          <div className="absolute bottom-10 left-10 max-w-sm z-30 pointer-events-none">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg"><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 relative">Color the Lights</span></h2>
            <p className="text-white/80 text-lg font-light leading-relaxed drop-shadow-md">
              Fix backlit photos with the Relight AI tool. It builds a 3D map of an image so you can easily adjust lighting and exposure based on depth.
            </p>
          </div>
        </div>
      </section>

      {/* ==========================================
          7. PORTRAIT BOKEH AI (Blur Before After)
      ========================================== */}
      <section className="py-10 px-4 md:px-10">
        <div className="max-w-[1400px] mx-auto relative rounded-[2rem] overflow-hidden shadow-2xl h-[500px] md:h-[700px]">
          <BeforeAfterSlider 
            beforeImage="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=1600&auto=format&fit=crop" // Normal focus
            afterImage="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=1600&auto=format&fit=crop&blur=50" // Blurred background (Simulation)
            heightClass="h-full"
          />
          
          <div className="absolute bottom-10 right-10 max-w-sm z-30 pointer-events-none text-right">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg"><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 relative">Create Atmospheric Portraits</span> that Amaze</h2>
            <p className="text-white/80 text-lg font-light leading-relaxed drop-shadow-md">
              Simulate the effect of an out-of-focus background behind your subject without needing expensive lenses with the Portrait Bokeh AI tool.
            </p>
          </div>
        </div>
      </section>

      {/* ==========================================
          8. COLOR/SATURATION (Before After)
      ========================================== */}
      <section className="py-10 px-4 md:px-10 mb-20">
        <div className="max-w-[1400px] mx-auto relative rounded-[2rem] overflow-hidden shadow-2xl h-[500px] md:h-[700px]">
          <BeforeAfterSlider 
            beforeImage="https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?q=80&w=1600&auto=format&fit=crop&sepia=1" // Dull/Sepia before
            afterImage="https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?q=80&w=1600&auto=format&fit=crop&saturate=2" // Vibrant after
            heightClass="h-full"
          />
          
          <div className="absolute top-10 left-10 max-w-md z-30 pointer-events-none">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">Make colors pop instantly</h2>
            <p className="text-white/80 text-lg font-light leading-relaxed drop-shadow-md">
              Enhance dull colors and bring your photos to life. Our intelligent color grading AI knows exactly which tones to boost without oversaturating skin tones.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 9. FAQ SECTION (Imported from Sky Page) */}
      {/* ============================================================== */}
      <section className="py-24 bg-[#050505] relative overflow-hidden border-t border-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[700px] bg-gradient-to-r from-[#ffb400]/5 to-[#ffb400]/10 blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-flex items-center px-4 py-2 rounded-full border border-white/10 bg-white/[0.02] text-xs uppercase tracking-[0.25em] text-white/60 mb-6">
              SUPPORT
            </span>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-[-0.04em]">
              Frequently Asked
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#ffb400] to-orange-500">
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 relative">Questions</span>
              </span>
            </h2>

            <p className="mt-6 text-white/50 text-[15px] max-w-2xl mx-auto leading-7">
              Everything you need to know about our AI-powered photo editing
              platform, image enhancement tools, and workflow features.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: "What image formats are supported?",
                answer: "Our platform supports JPG, JPEG, PNG, WebP, AVIF, and other widely used image formats for seamless editing.",
              },
              {
                question: "Can AI remove blur from photos?",
                answer: "Yes. Our advanced AI models can sharpen blurry images, recover lost details, and improve overall image clarity.",
              },
              {
                question: "Does the editor improve low-resolution images?",
                answer: "Absolutely. AI upscaling enhances image resolution while preserving textures and natural details.",
              },
              {
                question: "Can I remove unwanted objects from photos?",
                answer: "Yes. AI object removal can erase people, objects, distractions, and background elements with realistic results.",
              },
              {
                question: "Is batch editing available?",
                answer: "Yes. Process multiple images simultaneously to save time and maintain consistent editing across projects.",
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="group rounded-3xl border border-white/10 bg-[#0a0a0a] backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-[#111]"
              >
                <button
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                  className="w-full flex items-center justify-between px-7 py-6 text-left"
                >
                  <span className="text-white font-medium text-[15px] md:text-[16px] tracking-[-0.02em]">
                    {faq.question}
                  </span>

                  <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-[#ffb400]/10 border border-[#ffb400]/20 transition-all duration-300 ${openFAQ === index ? "rotate-45" : ""}`}>
                    <span className="text-[#ffb400] text-xl font-semibold">+</span>
                  </div>
                </button>

                <div className={`overflow-hidden transition-all duration-300 ${openFAQ === index ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
                  <p className="px-7 pb-6 text-[14px] leading-7 text-white/60">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 10. FOOTER WITH BACKEND LOGIC (Imported from Sky Page) */}
      {/* ============================================================== */}
      <footer className="py-20 relative z-20 bg-[#020202]">
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
                className="w-full bg-gradient-to-r from-cyan-400 to-purple-500 hover:brightness-110 text-black font-extrabold tracking-widest uppercase text-[11px] h-12 rounded-xl transition-all border border-white/10"
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