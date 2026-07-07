"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Sparkles } from "lucide-react";

// ==========================================
// 1. SOCIAL ICONS (For Footer)
// ==========================================
const Github = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-6.5a5.4 5.4 0 0 0-1.5-3.8 5.3 5.3 0 0 0-.1-3.8s-1.2-.4-3.9 1.4a13.3 13.3 0 0 0-7 0C6.2 1.5 5 1.9 5 1.9a5.3 5.3 0 0 0-.1 3.8A5.4 5.4 0 0 0 3 9.5c0 5 3 6.2 6 6.5a4.8 4.8 0 0 0-1 3.2v4" /></svg>);
const Twitter = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5 2.8 12 3 12c.5.2 1 .3 1.5.3C3 11 2.5 7 3 7c.5.7 1.2 1.2 2 1.3C3 5.5 4 2 4 2c2.6 3.2 6.5 5.3 10.5 5.5.3-2.6 2.1-4.5 4.8-4.5 1.5 0 2.9.6 3.9 1.7.9-.2 1.8-.7 2.6-1.1-.3 1-1 1.8-1.8 2.4.8-.1 1.6-.3 2.3-.6-.3.9-.9 1.7-1.5 2.3z" /></svg>);
const Instagram = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>);
const Linkedin = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>);

// ==========================================
// 2. REUSABLE BEFORE/AFTER SLIDER (With dynamic Filters)
// ==========================================
const BeforeAfterSlider = ({ image, beforeFilter, afterFilter = "none", heightClass = "h-[400px] md:h-[600px]" }) => {
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
      className={`relative w-full rounded-[1rem] overflow-hidden cursor-ew-resize select-none bg-zinc-900 border border-white/5 ${heightClass}`}
      onMouseMove={handleMove}
      onTouchMove={handleMove}
    >
      {/* Top Center Labels just like Luminar Neo */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20 pointer-events-none drop-shadow-md">
        <span className="text-white text-[10px] font-bold tracking-[0.1em] opacity-80 uppercase">BEFORE</span>
        <div className="w-[1px] h-3 bg-white/50"></div>
        <span className="text-white text-[10px] font-bold tracking-[0.1em] opacity-80 uppercase">AFTER</span>
      </div>

      {/* AFTER IMAGE (Base) */}
      <img src={image} alt="After: portrait retouched with Pixxel AI face editor" className="absolute inset-0 w-full h-full object-cover pointer-events-none" style={{ filter: afterFilter }} />
      
      {/* BEFORE IMAGE (Clipped on top) */}
      <img src={image} alt="Before: unedited portrait photo" className="absolute inset-0 w-full h-full object-cover pointer-events-none" style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`, filter: beforeFilter }} />

      {/* SLIDER HANDLE */}
      <div 
        className="absolute top-0 bottom-0 w-[1px] bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10 pointer-events-none flex items-center justify-center"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
      >
        {/* Subtle grabber */}
        <div className="absolute w-1.5 h-10 bg-white rounded-full shadow-lg"></div>
      </div>
    </div>
  );
};


// ==========================================
// 3. MAIN PAGE: FACE AI EDITOR
// ==========================================
export default function FaceAIEditor() {
  
  // Footer Backend Logic
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
    <div className="min-h-screen bg-[#000] text-slate-200 selection:bg-[#ffb400]/30 overflow-x-hidden font-sans">
      
      {/* --- HERO SECTION --- */}
      <section 
        className="relative h-screen flex flex-col justify-center items-center text-center px-4 pt-20 "
        style={{
          backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.43) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.8) 100%), linear-gradient(to bottom, rgba(0,0,0,0.3), #000000), url('face1.jpg')`, // Beauty portrait background
          backgroundSize: 'cover',
          backgroundPosition: 'center 20%'
        }}
      >
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 mb-6">
          <span className="text-[#ffb400] text-4xl leading-none"></span> 
          <span className="text-3xl font-medium tracking-tight text-white">Pixxel <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 relative">'OS</span></span>
        </motion.div>
        
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-6xl lg:text-[60px] font-bold text-white leading-[1.1] tracking-tight mb-8">
          Glow Up With Face <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 relative">AI Editor</span>
        </motion.h1>
        
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg md:text-xl text-slate-200 max-w-3xl mx-auto mb-10 font-light leading-relaxed drop-shadow-md">
          Enhance skin, remove imperfections, and refine facial features in seconds. No overediting, no hassle—with Luminar Face AI Editor, your portraits just look right.
        </motion.p>
        
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
      </section>


      {/* --- HOW TO USE SECTION --- */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">How to Use Face <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 relative">AI-Editor</span></h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto font-light">
            Face AI Editor detects facial features automatically, letting you enhance and refine portraits in just a few steps.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-10 mb-20">
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded bg-gradient-to-r from-cyan-400 to-purple-500 text-black font-bold flex items-center justify-center shrink-0">1</div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Open your photo</h3>
              <p className="text-slate-400 font-light leading-relaxed">Start by opening the image you want to edit in Luminar Neo, then go to Face AI Editor.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded bg-gradient-to-r from-cyan-400 to-purple-500 text-black font-bold flex items-center justify-center shrink-0">2</div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Enhance facial features</h3>
              <p className="text-slate-400 font-light leading-relaxed">Shape and enhance key facial features in just a few simple adjustments.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded bg-gradient-to-r from-cyan-400 to-purple-500 text-black font-bold flex items-center justify-center shrink-0">3</div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Refine the details</h3>
              <p className="text-slate-400 font-light leading-relaxed">Fine-tune smaller details to give your portrait a clean, polished look.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded bg-gradient-to-r from-cyan-400 to-purple-500 text-black font-bold flex items-center justify-center shrink-0">4</div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Enjoy the result</h3>
              <p className="text-slate-400 font-light leading-relaxed">Your portrait comes together naturally. Save it or keep refining the moment with other tools in Luminar Neo.</p>
            </div>
          </div>
        </div>

        {/* Software UI Mockup Image (Static for aesthetic) */}
        <div className="w-full aspect-[16/9] md:aspect-ratio rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-zinc-900 relative">
            <img src="face2.jpg" alt="Pixxel AI face retouching editor interface" className="w-full h-full object-cover opacity-60" />
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="px-6 py-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-sm font-semibold tracking-widest text-white/80">PIXXEL OS INTERFACE PREVIEW</div>
            </div>
        </div>
      </section>


      {/* --- WHERE FACE AI FITS SECTION --- */}
      <section className="py-24 max-w-7xl mx-auto px-6 space-y-32">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white">Where Face <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 relative">AI Editor fits</span></h2>
        </div>

        {/* Block 1 */}
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">Portrait & lifestyle photographers</h2>
            <p className="text-slate-400 text-lg font-light leading-relaxed">
              Great portraits shouldn't get stuck in editing. Skip time-consuming retouching and enhance faces faster with AI while keeping skin natural and true to life.
            </p>
          </div>
          <BeforeAfterSlider 
            heightClass="h-[400px] md:h-[550px]"
            image="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1000&auto=format&fit=crop" 
            beforeFilter="contrast(0.85) saturate(0.8) brightness(0.9) blur(0.5px)" // Simulates dull unedited skin
          />
        </div>

        {/* Block 2 */}
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="space-y-6 order-1 md:order-2">
            <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">Content creators & bloggers</h2>
            <p className="text-slate-400 text-lg font-light leading-relaxed">
              When your visuals are part of your story, they need to feel consistent. Refine portraits for articles, covers, and social content in one flow without switching between tools.
            </p>
          </div>
          <div className="order-2 md:order-1">
             <BeforeAfterSlider 
              heightClass="h-[400px] md:h-[550px]"
              image="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop" 
              beforeFilter="contrast(0.9) saturate(0.7) sepia(10%) brightness(0.95)"
            />
          </div>
        </div>

        {/* Block 3 */}
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">Everyday users & personal photos</h2>
            <p className="text-slate-400 text-lg font-light leading-relaxed">
              Some moments are too good to leave unedited. Enhance photos of friends, family, or travel memories in seconds, just enough to make them feel like they did in real life.
            </p>
          </div>
          <BeforeAfterSlider 
            heightClass="h-[400px] md:h-[550px]"
            image="https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1000&auto=format&fit=crop" 
            beforeFilter="brightness(0.85) contrast(0.95)"
          />
        </div>
      </section>


      {/* --- EXPLORE OTHER FEATURES GRID --- */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 relative">AI-powered Features</span></h2>
          <p className="text-slate-400 text-lg font-light">Luminar Neo has plenty of other features to help you edit faster and easier</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Card 1 */}
          <div className="bg-[#111] p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
            <BeforeAfterSlider 
              heightClass="h-[220px] mb-6"
              image="https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=600&auto=format&fit=crop" 
              beforeFilter="contrast(1.2) brightness(1.1)" // Simulating oily/shine
            />
            <div className="absolute top-[240px] left-8 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-md border border-white/10 text-white text-xs font-semibold">
               Face Shine Removal <span className="text-[#ffb400]">NEW!</span>
            </div>
            <h4 className="text-xl font-bold mb-3 text-white mt-10">Face Shine Removal</h4>
            <p className="text-slate-400 text-sm font-light leading-relaxed">Remove unwanted gloss and oil shine from faces while preserving natural skin texture.</p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#111] p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
            <BeforeAfterSlider 
              heightClass="h-[220px] mb-6"
              image="https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=600&auto=format&fit=crop" 
              beforeFilter="contrast(0.8) blur(0.5px)" 
            />
            <div className="absolute top-[240px] left-1/2 -translate-x-1/2 md:left-8 md:translate-x-0 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-md border border-white/10 text-white text-xs font-semibold">
               👱‍♀️ Beauty Filter
            </div>
            <h4 className="text-xl font-bold mb-3 text-white mt-10">Beauty Filter</h4>
            <p className="text-slate-400 text-sm font-light leading-relaxed">Perfect every shot in seconds—try our beauty filter and make your photos look their absolute best with zero effort.</p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#111] p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
            <BeforeAfterSlider 
              heightClass="h-[220px] mb-6"
              image="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop" 
              beforeFilter="scale(1.05)" // Zoom in slightly to simulate wider face before
            />
             <div className="absolute top-[240px] right-8 md:left-8 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-md border border-white/10 text-white text-xs font-semibold">
               🖼️ Skinny Face
            </div>
            <h4 className="text-xl font-bold mb-3 text-white mt-10">Skinny Face</h4>
            <p className="text-slate-400 text-sm font-light leading-relaxed">Discover Luminar Neo's Slim Face feature and revolutionize your photos with just a slide! Try it now!</p>
          </div>

          {/* Card 4 */}
          <div className="bg-[#111] p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
            <BeforeAfterSlider 
              heightClass="h-[220px] mb-6"
              image="https://images.unsplash.com/photo-1604004555489-723a93d6ce74?q=80&w=600&auto=format&fit=crop" 
              beforeFilter="sepia(0.4) saturate(1.5)" // Simulate yellow teeth
            />
             <div className="absolute mt-[-45px] left-8 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-md border border-white/10 text-white text-xs font-semibold">
               👄 Whiten Teeth
            </div>
            <h4 className="text-xl font-bold mb-3 text-white">Whiten Teeth</h4>
            <p className="text-slate-400 text-sm font-light leading-relaxed">Get that perfect Hollywood smile instantly without any complex masking.</p>
          </div>

          {/* Card 5 */}
          <div className="bg-[#111] p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
            <BeforeAfterSlider 
              heightClass="h-[220px] mb-6"
              image="https://images.unsplash.com/photo-1580618672591-eb180b1a973f?q=80&w=600&auto=format&fit=crop" 
              beforeFilter="hue-rotate(90deg)" // Change hair color dramatically
            />
            <div className="absolute mt-[-45px] left-8 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-md border border-white/10 text-white text-xs font-semibold">
               👩‍🦰 AI Hair Color Change
            </div>
            <h4 className="text-xl font-bold mb-3 text-white">AI Hair Color Change</h4>
            <p className="text-slate-400 text-sm font-light leading-relaxed">Experiment with stunning new hair colors effortlessly using advanced AI detection.</p>
          </div>

          {/* Card 6 */}
          <div className="bg-[#111] p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
            <BeforeAfterSlider 
              heightClass="h-[220px] mb-6"
              image="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop" 
              beforeFilter="contrast(0.8) brightness(0.9)" 
            />
            <div className="absolute mt-[-45px] left-8 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-md border border-white/10 text-white text-xs font-semibold">
               ✨ AI Portrait Enhancer
            </div>
            <h4 className="text-xl font-bold mb-3 text-white">AI Portrait Enhancer</h4>
            <p className="text-slate-400 text-sm font-light leading-relaxed">A complete overhaul for your portraits bringing professional studio lighting to your fingertips.</p>
          </div>

        </div>
      </section>


      {/* --- CTA SECTION (GOLDEN GLOW) --- */}
      <section className="relative py-32 overflow-hidden  ">
        {/* Golden glow backgrounds */}
        <div className="absolute top-0 left-1/4 w-[120px] h-[180px] bg-gradient-to-r from-cyan-400 to-purple-500 blur-[150px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center relative z-10">
          <div>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
              An application & plugin <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 relative">For macOS and Windows</span>
            </h2>
            <ul className="space-y-5 text-lg font-medium text-white/90">
              <li className="flex items-center gap-3"><div className="w-5 h-5 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center"><Check size={14} className="text-black stroke-[3]"/></div> High-performance AI editor</li>
              <li className="flex items-center gap-3"><div className="w-5 h-5 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center"><Check size={14} className="text-black stroke-[3]"/></div> 24/7 technical support</li>
              <li className="flex items-center gap-3"><div className="w-5 h-5 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center"><Check size={14} className="text-black stroke-[3]"/></div> 30-day money back guarantee</li>
              <li className="flex items-center gap-3"><div className="w-5 h-5 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center"><Check size={14} className="text-black stroke-[3]"/></div> Join our communities</li>
            </ul>
          </div>

          <div className="flex justify-center md:justify-end">
  {/* 1. Main Card Container (Added 'relative' and 'overflow-hidden') */}
  <div className="relative w-full max-w-[400px] aspect-[3/4] border border-[#ffb400]/40 rounded-xl flex flex-col items-center justify-center shadow-[0_0_50px_rgba(255,180,0,0.15)] overflow-hidden group">
     
     {/* 2. FULL CARD BACKGROUND IMAGE */}
     <div className="absolute inset-0 z-0">
       <img 
         src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=600&auto=format&fit=crop" /* <-- YAHAN APNI CARD BACKGROUND IMAGE DAALEIN */
         alt="Card Background" 
         className="w-full h-full object-cover opacity-70 group-hover:scale-110 transition-transform duration-700" 
       />
       {/* Ek dark gradient overlay taaki text aur button clearly dikhe */}
       <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/40"></div>
     </div>

     {/* 3. CARD CONTENT (Added 'relative z-10' and 'p-10' to keep it above the image) */}
     <div className="relative z-10 flex flex-col items-center justify-center w-full h-full p-10">
       
       {/* Small Logo Box */}
       <div className="w-40 h-24  flex items-center justify-center mb-1  overflow-hidden relative">
         <img 
           src="/logo-text.png" /* <-- YAHAN APNE CHHOTE LOGO KA PATH DAALEIN */
           alt="Pixxel OS Icon" 
           className="w-full h-full object-contain p-2" 
         />
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

     </div>
  </div>
</div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* FOOTER WITH BACKEND LOGIC (Same as Homepage) */}
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
                className="rounded-[0.5rem] bg-gradient-to-r from-cyan-400 to-purple-500 text-black px-19 text-[11px] font-bold shadow-md hover:brightness-110 transition-colors"
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