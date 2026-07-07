"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Star, PlayCircle, Apple, Monitor } from "lucide-react";

// ==========================================
// 1. SOCIAL ICONS (For Footer)
// ==========================================
const Github = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-6.5a5.4 5.4 0 0 0-1.5-3.8 5.3 5.3 0 0 0-.1-3.8s-1.2-.4-3.9 1.4a13.3 13.3 0 0 0-7 0C6.2 1.5 5 1.9 5 1.9a5.3 5.3 0 0 0-.1 3.8A5.4 5.4 0 0 0 3 9.5c0 5 3 6.2 6 6.5a4.8 4.8 0 0 0-1 3.2v4" /></svg>);
const Twitter = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5 2.8 12 3 12c.5.2 1 .3 1.5.3C3 11 2.5 7 3 7c.5.7 1.2 1.2 2 1.3C3 5.5 4 2 4 2c2.6 3.2 6.5 5.3 10.5 5.5.3-2.6 2.1-4.5 4.8-4.5 1.5 0 2.9.6 3.9 1.7.9-.2 1.8-.7 2.6-1.1-.3 1-1 1.8-1.8 2.4.8-.1 1.6-.3 2.3-.6-.3.9-.9 1.7-1.5 2.3z" /></svg>);
const Instagram = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>);
const Linkedin = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>);

// ==========================================
// 2A. SLIDER COMPONENT: DUAL URL (FOR HERO SECTION)
// ==========================================
const BeforeAfterDualURL = ({ beforeImage, afterImage, heightClass = "h-screen", showLabels = false }) => {
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
      className={`relative w-full overflow-hidden cursor-ew-resize select-none bg-black ${heightClass}`}
      onMouseMove={handleMove}
      onTouchMove={handleMove}
    >
      <img src={afterImage} alt="After: family photo enhanced with Pixxel AI" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
      <img src={beforeImage} alt="Before: unedited family photo" className="absolute inset-0 w-full h-full object-cover pointer-events-none" style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }} />

      {showLabels && (
        <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full flex justify-between px-12 z-20 pointer-events-none drop-shadow-md">
          <span className="text-white text-[10px] font-bold tracking-[0.15em] opacity-70 uppercase">BEFORE</span>
          <span className="text-white text-[10px] font-bold tracking-[0.15em] opacity-70 uppercase">AFTER</span>
        </div>
      )}

      <div 
        className="absolute top-0 bottom-0 w-[1px] bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10 pointer-events-none flex items-center justify-center"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
      ></div>
    </div>
  );
};

// ==========================================
// 2B. SLIDER COMPONENT: CSS FILTER (FOR REST OF PAGE)
// ==========================================
const BeforeAfterFilter = ({ image, beforeFilter, afterFilter = "none", heightClass = "h-[400px] md:h-[550px]", hideLabels = false }) => {
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
      {!hideLabels && (
        <div className="absolute top-6 left-0 w-full flex justify-between px-8 z-20 pointer-events-none drop-shadow-md">
          <span className="text-white text-[10px] font-bold tracking-[0.15em] opacity-80 uppercase">BEFORE</span>
          <span className="text-white text-[10px] font-bold tracking-[0.15em] opacity-80 uppercase">AFTER</span>
        </div>
      )}
      <img src={image} alt="After: family photo enhanced with Pixxel AI" className="absolute inset-0 w-full h-full object-cover pointer-events-none" style={{ filter: afterFilter }} />
      <img src={image} alt="Before: unedited family photo" className="absolute inset-0 w-full h-full object-cover pointer-events-none" style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`, filter: beforeFilter }} />
      <div className="absolute top-0 bottom-0 w-[1.5px] bg-white shadow-[0_0_15px_rgba(0,0,0,0.8)] z-10 pointer-events-none flex items-center justify-center" style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}></div>
    </div>
  );
};

// ==========================================
// 3. MAIN PAGE: FAMILY PHOTO EDITOR
// ==========================================
export default function FamilyEditor() {
  
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

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 selection:bg-[#ffb400]/30 font-sans">
      
      {/* ========================================== */}
      {/* 1. HERO SECTION (Full Screen with DUAL URLs) */}
      {/* ========================================== */}
      <section className="relative h-screen w-full flex flex-col justify-center items-start px-6 md:px-24 border-b border-white/5 overflow-hidden">
        
        {/* Full-Screen Dual Slider */}
        <div className="absolute inset-0 z-0 pointer-events-auto">
           <BeforeAfterDualURL 
               beforeImage="https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=2400&auto=format&fit=crop&sat=0.6&bri=0.9" // <--- YAHAN APNA 'BEFORE' URL DAALEIN
               afterImage="https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=2400&auto=format&fit=crop"    // <--- YAHAN APNA 'AFTER' URL DAALEIN
               heightClass="h-full"
               showLabels={false}
           />
           {/* Dark Overlays for Text Legibility */}
           <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent pointer-events-none"></div>
           <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90 pointer-events-none"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-2xl mt-20 pointer-events-none">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 mb-8">
             
            <span className="text-4xl font-medium tracking-tight text-white">Pixxel <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 relative">'OS</span></span>
          </motion.div>
          
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-6xl lg:text-[60px] font-bold text-white leading-[1.1] tracking-tight mb-8">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 relative">Family Photo</span> Editing That Honors Every Detail
          </motion.h1>
          
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg md:text-xl text-white/80 font-light leading-relaxed mb-10 max-w-xl">
            With the Luminar Neo family photo editor, bring out the natural glow in your family pictures by gently balancing tones, softening shadows, and adding just enough warmth to make the moment feel alive again.
          </motion.p>
          
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
        </div>
      </section>

      {/* ========================================== */}
      {/* 2. AWARDS SECTION */}
      {/* ========================================== */}
      <section className="bg-black py-10 border-b border-white/5 relative z-20">
          <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-center gap-12 md:gap-24 opacity-80">
              <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xs">RedDot</div>
                  <span className="text-xs text-white/60 font-medium text-center">reddot winner 2022<br/>interface design</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                  <div className="text-3xl font-bold text-white flex items-center gap-2">
                      <span className="text-[#ffb400]">🌿</span> 4.7 <span className="text-[#ffb400]">🌿</span>
                  </div>
                  <div className="flex text-[#ffb400] text-xs">★★★★★</div>
                  <span className="text-xs text-white/60 font-medium">Trustpilot<br/>Reviews</span>
              </div>
              <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center text-center"><div className="text-xl text-white font-bold tracking-widest border border-white/20 p-2 rounded-full w-12 h-12 flex items-center justify-center">TIPA</div><span className="text-[10px] mt-2">WORLD<br/>AWARDS</span></div>
                  <div className="flex flex-col items-center text-center"><div className="text-xl text-white font-bold tracking-widest border border-white/20 p-2 rounded-full w-12 h-12 flex items-center justify-center">TIPA</div><span className="text-[10px] mt-2">WORLD<br/>AWARDS</span></div>
                  <div className="flex flex-col items-center text-center"><div className="text-xl text-white font-bold tracking-widest border border-white/20 p-2 rounded-full w-12 h-12 flex items-center justify-center">TIPA</div><span className="text-[10px] mt-2">WORLD<br/>AWARDS</span></div>
              </div>
          </div>
      </section>

      {/* ========================================== */}
      {/* 3. FAMILY FEATURES (Alternating Layout) */}
      {/* ========================================== */}
      <section className="py-24 max-w-7xl mx-auto px-6 space-y-32">
        
        {/* Feature 1: Warmth & Enhance */}
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="order-2 md:order-1">
            <BeforeAfterFilter 
              heightClass="h-[400px] md:h-[550px]"
              image="https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=1000&auto=format&fit=crop" 
              beforeFilter="brightness(0.8) sepia(0.3) blur(0.5px)" 
            />
          </div>
          <div className="space-y-6 order-1 md:order-2">
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">Family Photo Editing Software For Pictures Full Of Warmth</h2>
            <p className="text-white/60 text-lg font-light leading-relaxed">
              Some moments just feel golden. Family picture editing makes them even better. With tools like EnhanceAI and Warmth, you can gently lift natural tones and soften harsh light. To bring focus to what matters most, Bokeh AI adds a subtle, natural blur to the background.
            </p>
          </div>
        </div>

        {/* Feature 2: Face/Skin AI */}
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">Make Sure No Laugh Ever Fades When You Edit Family Photos</h2>
            <p className="text-white/60 text-lg font-light leading-relaxed">
              Every smile tells a story worth saving. Face AI and Skin AI enhance portraits naturally, making faces look fresh without losing their personality. Structure AI adds clarity to clothes, hands, and background details. And with the Erase tool, you can easily remove distractions (like that one random sock on the floor :)
            </p>
          </div>
          <div className="w-full">
             <BeforeAfterFilter 
                heightClass="h-[400px] md:h-[550px]"
                image="https://images.unsplash.com/photo-1542037104843-d34e622421f1?q=80&w=1000&auto=format&fit=crop" 
                beforeFilter="contrast(0.8) saturate(0.7) brightness(0.9)" 
             />
          </div>
        </div>

        {/* Feature 3: Old Photo Restore */}
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="order-2 md:order-1">
            <BeforeAfterFilter 
              heightClass="h-[400px] md:h-[550px]"
              image="https://images.unsplash.com/photo-1581452932906-8d6ec4e8c564?q=80&w=1000&auto=format&fit=crop" 
              beforeFilter="sepia(0.6) contrast(0.7) blur(1px)" 
              afterFilter="saturate(1.2) contrast(1.1)"
            />
          </div>
          <div className="space-y-6 order-1 md:order-2">
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">Family Picture Editing Bringing Yesterday's Smiles Into Focus</h2>
            <p className="text-white/60 text-lg font-light leading-relaxed">
              Old snapshots and blurry moments still hold magic—they just need a little love and the right family photo editing software. Use Denoise to reduce grain, Details to sharpen soft edges, and Supercontrast to breathe depth back into faded shots. CropAI and RelightAI help you gently reframe the moment and make it feel alive again.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 4. HOW TO EDIT (Video Mockup Section) */}
      {/* ========================================== */}
      <section className="py-24 bg-[#0a0a0a] border-y border-white/5">
        <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16 max-w-3xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">How To Edit Family Photos Using <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 relative">Pixxel 'OS?</span></h2>
                <p className="text-white/60 text-lg font-light leading-relaxed">
                    Luminar Neo lets you softly shape light, color, and detail so your favorite moments feel as warm as you remember them. Watch the video below to see how beautifully simple the process of editing family photos can be.
                </p>
            </div>
            
            <div className="w-full rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-[#111] relative">
                <div className="w-full h-10 bg-[#1a1a1a] border-b border-white/5 flex items-center px-4 gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                    </div>
                    <div className="mx-auto flex gap-4 text-[10px] text-white/50 font-medium">
                        <span className="px-3 py-1">Catalog</span>
                        <span className="px-3 py-1">Presets</span>
                        <span className="bg-white/10 px-3 py-1 rounded text-white">Edit</span>
                    </div>
                </div>
                <div className="relative w-full aspect-video">
                    <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1600&auto=format&fit=crop" className="w-full h-full object-cover" alt="Pixxel family photo editor interface mockup" />
                    
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center hover:bg-black/30 transition-colors cursor-pointer group">
                        <div className="w-20 h-20 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <PlayCircle className="w-10 h-10 text-white ml-1" strokeWidth={1.5} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 5. APP CTA */}
      {/* ========================================== */}
            {/* ========================================== */}
      {/* 7. APP & PLUGIN CTA */}
      {/* ========================================== */}
      <section className="relative py-32 overflow-hidden  bg-[#050505]">
        {/* Golden spotlight background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-r from-cyan-400/20 to-purple-500/20 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto px-6 flex flex-col items-center text-center relative z-10">
          
          <div className="w-32 h-32 bg-[#0a0a0a] rounded-[32px] border border-white/10 flex items-center justify-center mb-8 shadow-2xl">
              <span className="text-white text-7xl leading-none">✱</span>
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

     {/* ========================================== */}
      {/* 6. OTHER USE CASES (Grid of 6) */}
      {/* ========================================== */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Other Use Cases</h2>
          <p className="text-white/60 text-lg font-light">Luminar Neo has plenty of other use cases to help you edit faster and easier</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Card 1 */}
          <div className="bg-[#0a0a0a] p-5 rounded-3xl border border-white/5 hover:border-white/10 transition-colors">
            <BeforeAfterFilter 
              heightClass="h-[220px] mb-6 rounded-xl"
              image="https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=600&auto=format&fit=crop" 
              beforeFilter="contrast(0.9) brightness(0.9)" 
            />
            <h4 className="text-xl font-bold mb-3 text-white">Newborn Photography</h4>
            <p className="text-white/50 text-sm font-light leading-relaxed">Transform your baby's precious moments into timeless memories!</p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#0a0a0a] p-5 rounded-3xl border border-white/5 hover:border-white/10 transition-colors">
            <BeforeAfterFilter 
              heightClass="h-[220px] mb-6 rounded-xl"
              image="https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=600&auto=format&fit=crop" 
              beforeFilter="saturate(0.7) brightness(0.9)" 
            />
            <h4 className="text-xl font-bold mb-3 text-white">Wedding Photography</h4>
            <p className="text-white/50 text-sm font-light leading-relaxed">Transform your captures into unforgettable memories with our wedding photo editing software.</p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#0a0a0a] p-5 rounded-3xl border border-white/5 hover:border-white/10 transition-colors">
            <BeforeAfterFilter 
              heightClass="h-[220px] mb-6 rounded-xl"
              image="https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=600&auto=format&fit=crop" 
              beforeFilter="brightness(0.8) contrast(0.8) saturate(0.8)" 
            />
            <h4 className="text-xl font-bold mb-3 text-white">Editor for Beginners</h4>
            <p className="text-white/50 text-sm font-light leading-relaxed">Make your photos pop effortlessly—transform them in just a few clicks with Luminar Neo.</p>
          </div>

          {/* Card 4 */}
          <div className="bg-[#0a0a0a] p-5 rounded-3xl border border-white/5 hover:border-white/10 transition-colors">
            <BeforeAfterFilter 
              heightClass="h-[220px] mb-6 rounded-xl"
              image="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=600&auto=format&fit=crop" 
              beforeFilter="sepia(0.2) contrast(0.8)" 
            />
            <h4 className="text-xl font-bold mb-3 text-white">Real Estate Photography</h4>
            <p className="text-white/50 text-sm font-light leading-relaxed">Create stunning property visuals in seconds with AI-powered real estate photo tools that work for you.</p>
          </div>

          {/* Card 5 */}
          <div className="bg-[#0a0a0a] p-5 rounded-3xl border border-white/5 hover:border-white/10 transition-colors">
            <BeforeAfterFilter 
              heightClass="h-[220px] mb-6 rounded-xl"
              image="https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?q=80&w=600&auto=format&fit=crop" 
              beforeFilter="contrast(0.8) brightness(0.8) saturate(0.9)" 
            />
            <h4 className="text-xl font-bold mb-3 text-white">Luminar AI</h4>
            <p className="text-white/50 text-sm font-light leading-relaxed">Unlock the full potential of your photos — try our AI photo editor today and transform your images.</p>
          </div>

          {/* Card 6 */}
          <div className="bg-[#0a0a0a] p-5 rounded-3xl border border-white/5 hover:border-white/10 transition-colors">
            <BeforeAfterFilter 
              heightClass="h-[220px] mb-6 rounded-xl"
              image="https://images.unsplash.com/photo-1551698618-1dfe5d97d256?q=80&w=600&auto=format&fit=crop" 
              beforeFilter="grayscale(0.3) brightness(0.9)" 
            />
            <h4 className="text-xl font-bold mb-3 text-white">Sport Photography</h4>
            <p className="text-white/50 text-sm font-light leading-relaxed">Bring your sports shots to life in Luminar Neo—refine colors, sharpen details, and highlight the energy.</p>
          </div>

        </div>
      </section>

      {/* ============================================================== */}
      {/* FOOTER WITH BACKEND LOGIC */}
      {/* ============================================================== */}
      <footer className="py-20 relative z-20 border-t border-white/[0.05] bg-[#020202]">
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
                 <Input placeholder="Ident" value={contactForm.name} onChange={(e) => setContactForm(p => ({ ...p, name: e.target.value }))} className="bg-[#0a0a0a] border-white/10 text-white rounded-xl h-12 text-[14px] flex-1 focus-visible:ring-1 focus-visible:ring-[#ffb400]" required />
                 <Input type="email" placeholder="Terminal@mail.com" value={contactForm.email} onChange={(e) => setContactForm(p => ({ ...p, email: e.target.value }))} className="bg-[#0a0a0a] border-white/10 text-white rounded-xl h-12 text-[14px] flex-[1.5] focus-visible:ring-1 focus-visible:ring-[#ffb400]" required />
              </div>
              <textarea placeholder="Diagnostic data query..." value={contactForm.message} onChange={(e) => setContactForm(p => ({ ...p, message: e.target.value }))} className="w-full bg-[#0a0a0a] border border-white/10 text-white rounded-xl px-4 py-4 text-[14px] min-h-[90px] resize-none focus:outline-none focus:border-[#ffb400]/50 transition-colors shadow-inner custom-scrollbar" required />
              <Button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-cyan-400 to-purple-500 relative hover:bg-[#ffc433] text-black font-extrabold tracking-widest uppercase text-[11px] h-12 rounded-xl transition-all shadow-[inset_0_2px_5px_rgba(255,255,255,0.05)] border-[1px] border-white/10">{isSubmitting ? "TRANSMITTING..." : "OPEN TICKET PROTOCOL"}</Button>
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