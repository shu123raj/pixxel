"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, Sparkles } from "lucide-react";

// ==========================================
// 1. SOCIAL ICONS (From your original code)
// ==========================================
const Github = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-6.5a5.4 5.4 0 0 0-1.5-3.8 5.3 5.3 0 0 0-.1-3.8s-1.2-.4-3.9 1.4a13.3 13.3 0 0 0-7 0C6.2 1.5 5 1.9 5 1.9a5.3 5.3 0 0 0-.1 3.8A5.4 5.4 0 0 0 3 9.5c0 5 3 6.2 6 6.5a4.8 4.8 0 0 0-1 3.2v4" /></svg>);
const Twitter = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5 2.8 12 3 12c.5.2 1 .3 1.5.3C3 11 2.5 7 3 7c.5.7 1.2 1.2 2 1.3C3 5.5 4 2 4 2c2.6 3.2 6.5 5.3 10.5 5.5.3-2.6 2.1-4.5 4.8-4.5 1.5 0 2.9.6 3.9 1.7.9-.2 1.8-.7 2.6-1.1-.3 1-1 1.8-1.8 2.4.8-.1 1.6-.3 2.3-.6-.3.9-.9 1.7-1.5 2.3z" /></svg>);
const Instagram = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>);
const Linkedin = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>);


// ==========================================
// 2. REUSABLE BEFORE/AFTER SLIDER
// ==========================================
const BeforeAfterSlider = ({ beforeImage, afterImage, heightClass = "h-[400px] md:h-[600px]" }) => {
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
      className={`relative w-full rounded-[1.5rem] overflow-hidden cursor-ew-resize select-none bg-zinc-900 shadow-2xl border border-white/5 ${heightClass}`}
      onMouseMove={handleMove}
      onTouchMove={handleMove}
    >
      <div className="absolute top-4 left-0 w-full flex justify-between px-6 z-20 pointer-events-none">
        <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold tracking-[0.2em] px-3 py-1.5 rounded-full border border-white/10">BEFORE</span>
        <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold tracking-[0.2em] px-3 py-1.5 rounded-full border border-white/10">AFTER</span>
      </div>

      <img src={afterImage} alt="After" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
      <img src={beforeImage} alt="Before" className="absolute inset-0 w-full h-full object-cover pointer-events-none" style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }} />

      <div 
        className="absolute top-0 bottom-0 w-0.5 bg-white/70 shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10 pointer-events-none flex items-center justify-center"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
      >
        <div className="absolute w-8 h-12 bg-white/30 backdrop-blur-md border border-white/60 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110">
            <div className="flex gap-1">
                <div className="w-0 h-0 border-y-[4px] border-y-transparent border-r-[5px] border-r-white"></div>
                <div className="w-0 h-0 border-y-[4px] border-y-transparent border-l-[5px] border-l-white"></div>
            </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. MAIN PAGE COMPONENT (Premium Content + Backend Footer)
// ==========================================
export default function PremiumEditorFeatures() {
  // --- BACKEND LOGIC FOR FOOTER (From your original code) ---
  const sendMessage = useMutation(api.messages.sendMessage);
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
      await sendMessage(contactForm);
      toast.success("Message sent successfully!");
      setContactForm({ name: "", email: "", message: "" });
    } catch (error) { 
      toast.error("Failed to send message."); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  return (
    <div className="min-h-screen bg-[#000] text-slate-200 selection:bg-cyan-500/30 overflow-x-hidden relative">
      
      {/* --- PREMUIM NAVBAR --- */}
      

      {/* --- HERO SECTION --- */}
      <section 
        className="relative h-screen flex flex-col justify-center items-center text-center px-4 pt-20"
        style={{
          // Set your main hero image background here
          backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.23), #000000), url('bokeh.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-cyan-300 text-[11px] font-bold tracking-[0.2em] uppercase mb-6 backdrop-blur-md">
            <Sparkles size={14} className="text-amber-400 animate-pulse" /> Cinematic Experience
        </motion.div>
        
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-6xl lg:text-[60px] font-bold text-white leading-[1.1] tracking-tight mb-8">
          Add Bokeh to a Photo <br className="hidden md:block"/> For a <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Cinematic Blur</span>
        </motion.h1>
        
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg md:text-xl text-slate-300 max-w-2xl mb-10 font-light leading-relaxed">
          Transform your images with the powerful bokeh camera effect. Instantly create depth and atmosphere with natural-looking background blur.
        </motion.p>
        
        <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} 
          className="font-extrabold uppercase tracking-[0.2em] transition-all duration-300 hover:-translate-y-[2px] active:scale-95 text-black rounded-lg"
          style={{ background: "linear-gradient(90deg, #22d3ee 0%, #a855f7 100%)", fontSize: "13px", padding: "15px 45px", boxShadow: "0 6px 28px rgba(34,211,238,0.28)" }}>
          VIEW PLANS
        </motion.button>
      </section>

      {/* --- CONTENT SECTION --- */}
      <main className="max-w-7xl mx-auto px-6 py-24 space-y-32">

        {/* Big Preview */}
        <section className="text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-white">Bokeh Blur that Matches Professional Cameras</h2>
          <p className="text-slate-400 text-lg max-w-3xl mx-auto mb-12 font-light">
            Achieve authentic, high-quality results with a bokeh blur effect that mimics real lens behavior. Advanced AI analyzes your image and applies realistic blur.
          </p>
          <BeforeAfterSlider 
            beforeImage="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1200&auto=format&fit=crop&blur=50" 
            afterImage="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1200&auto=format&fit=crop"
          />
        </section>

        {/* Steps */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">Simple Steps to Add Bokeh Effects</h2>
            <p className="text-slate-400 text-lg font-light">Get started quickly with an intuitive workflow inside the editor:</p>
            <ul className="space-y-4 text-slate-300 text-lg font-light">
              <li className="flex items-start gap-3"><span className="text-[#22d3ee] font-bold">1.</span> Open your image in the editor.</li>
              <li className="flex items-start gap-3"><span className="text-[#22d3ee] font-bold">2.</span> Select the Bokeh AI tool from the editing panel.</li>
              <li className="flex items-start gap-3"><span className="text-[#22d3ee] font-bold">3.</span> Adjust the effect and instantly see your results. No complex masks.</li>
            </ul>
          </div>
          <BeforeAfterSlider 
            heightClass="h-[350px] md:h-[500px]"
            beforeImage="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1000&auto=format&fit=crop&blur=40" 
            afterImage="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1000&auto=format&fit=crop"
          />
        </section>

        {/* Control Details */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
             <BeforeAfterSlider 
              heightClass="h-[350px] md:h-[500px]"
              beforeImage="https://images.unsplash.com/photo-1507666405895-422eee7d517f?q=80&w=1000&auto=format&fit=crop&blur=30" 
              afterImage="https://images.unsplash.com/photo-1507666405895-422eee7d517f?q=80&w=1000&auto=format&fit=crop"
            />
          </div>
          <div className="space-y-6 order-1 md:order-2">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight text-white">Control Every Detail: Intensity, Shape, and Color</h2>
            <p className="text-slate-400 text-lg font-light">Take full control of your soft bokeh effect and make it uniquely yours.</p>
            <ul className="space-y-4 text-slate-300 font-light">
              <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-[#a855f7] rounded-full"></div> Adjust blur intensity to increase or reduce depth</li>
              <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-[#a855f7] rounded-full"></div> Modify brightness and color for artistic lighting</li>
              <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-[#a855f7] rounded-full"></div> Refine edges for a more natural transition</li>
            </ul>
          </div>
        </section>

      </main>


      {/* ============================================================== */}
      {/* 4. FOOTER WITH BACKEND LOGIC (Copied exactly from your code) */}
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
                 <Input 
                    placeholder="Ident" 
                    value={contactForm.name} 
                    onChange={(e) => setContactForm(p => ({ ...p, name: e.target.value }))} 
                    className="bg-[#0a0a0a] border-white/10 text-white rounded-xl h-12 text-[14px] flex-1 focus-visible:ring-1 focus-visible:ring-cyan-500" 
                    required 
                 />
                 <Input 
                    type="email" 
                    placeholder="Terminal@mail.com" 
                    value={contactForm.email} 
                    onChange={(e) => setContactForm(p => ({ ...p, email: e.target.value }))} 
                    className="bg-[#0a0a0a] border-white/10 text-white rounded-xl h-12 text-[14px] flex-[1.5] focus-visible:ring-1 focus-visible:ring-cyan-500" 
                    required 
                 />
              </div>
              <textarea 
                placeholder="Diagnostic data query..." 
                value={contactForm.message} 
                onChange={(e) => setContactForm(p => ({ ...p, message: e.target.value }))} 
                className="w-full bg-[#0a0a0a] border border-white/10 text-white rounded-xl px-4 py-4 text-[14px] min-h-[90px] resize-none focus:outline-none focus:border-cyan-500/50 transition-colors shadow-inner custom-scrollbar" 
                required 
              />
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full bg-gradient-to-r from-cyan-400 to-purple-500 hover:brightness-110 text-black font-extrabold tracking-widest uppercase text-[11px] h-12 rounded-xl transition-all shadow-[inset_0_2px_5px_rgba(255,255,255,0.05)] border-[1px] border-white/10"
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