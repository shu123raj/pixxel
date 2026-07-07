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
  Check, PlayCircle, Apple, LayoutGrid, ChevronDown, ChevronRight, Star, 
  ChevronUp, X, Smartphone, Layers, Zap, ShieldCheck, Info, Monitor 
} from "lucide-react";

// ==========================================
// SOCIAL ICONS (For Footer)
// ==========================================
const Github = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-6.5a5.4 5.4 0 0 0-1.5-3.8 5.3 5.3 0 0 0-.1-3.8s-1.2-.4-3.9 1.4a13.3 13.3 0 0 0-7 0C6.2 1.5 5 1.9 5 1.9a5.3 5.3 0 0 0-.1 3.8A5.4 5.4 0 0 0 3 9.5c0 5 3 6.2 6 6.5a4.8 4.8 0 0 0-1 3.2v4" /></svg>);
const Twitter = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5 2.8 12 3 12c.5.2 1 .3 1.5.3C3 11 2.5 7 3 7c.5.7 1.2 1.2 2 1.3C3 5.5 4 2 4 2c2.6 3.2 6.5 5.3 10.5 5.5.3-2.6 2.1-4.5 4.8-4.5 1.5 0 2.9.6 3.9 1.7.9-.2 1.8-.7 2.6-1.1-.3 1-1 1.8-1.8 2.4.8-.1 1.6-.3 2.3-.6-.3.9-.9 1.7-1.5 2.3z" /></svg>);
const Instagram = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>);
const Linkedin = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>);

// ==========================================
// REUSABLE BEFORE/AFTER SLIDER (Updated for separate before/after URLs)
// ==========================================
const BeforeAfterSlider = ({ image, beforeImage, afterImage, beforeFilter, afterFilter = "none", heightClass = "h-[400px] md:h-[550px]", hideLabels = false }) => {
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
      className={`relative w-full overflow-hidden cursor-ew-resize select-none bg-[#111] ${heightClass}`}
      onMouseMove={handleMove}
      onTouchMove={handleMove}
    >
      {!hideLabels && (
        <div className="absolute top-6 left-0 w-full flex justify-between px-8 z-20 pointer-events-none drop-shadow-md">
          <span className="text-white text-[10px] font-bold tracking-[0.15em] opacity-80 uppercase">BEFORE</span>
          <span className="text-white text-[10px] font-bold tracking-[0.15em] opacity-80 uppercase">AFTER</span>
        </div>
      )}

      {/* AFTER IMAGE (Base Layer) */}
      <img src={afterImage || image} alt="After: sky replaced with Pixxel AI sky replacement" className="absolute inset-0 w-full h-full object-cover pointer-events-none" style={{ filter: afterFilter }} />
      
      {/* BEFORE IMAGE (Clipped Layer on Top) */}
      <img src={beforeImage || image} alt="Before: photo with dull overcast sky" className="absolute inset-0 w-full h-full object-cover pointer-events-none" style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`, filter: beforeFilter }} />

      {/* SLIDER HANDLE */}
      <div 
        className="absolute top-0 bottom-0 w-[1px] bg-white/70 shadow-[0_0_15px_rgba(0,0,0,0.8)] z-10 pointer-events-none flex items-center justify-center"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
      >
        <div className="w-5 h-6 rounded-sm bg-white/90 backdrop-blur flex items-center justify-center shadow-lg border border-black/10">
            <div className="w-0.5 h-3 border-x border-gray-400"></div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// REUSABLE BUTTON COMPONENT (Updated to support alignment)
// ==========================================
const ViewPlansButton = ({ align = "start" }) => (
    <div className={`flex flex-col ${align === "center" ? "items-center text-center" : "items-start"}`}>
        <Link href="/pricing">
            <button className="flex items-center gap-3 bg-gradient-to-r from-cyan-400 to-purple-500  text-black font-bold uppercase tracking-wide text-xs px-8 py-3.5 rounded-lg transition-transform hover:-translate-y-1 active:scale-95 shadow-lg">
                VIEW PLANS
                <div className="flex items-center gap-1.5 ml-1">
                    <Apple size={16} className="fill-black" />
                    <LayoutGrid size={14} className="fill-black" />
                </div>
            </button>
        </Link>
        <div className="flex items-center gap-1.5 mt-2 text-[11px] text-white/80 font-medium">
            Excellent 4.6 out of 5 <Star size={12} className="fill-[#00b67a] text-[#00b67a]" /> 
            <span className="font-bold">Trustpilot</span>
        </div>
    </div>
);

// ==========================================
// NEW PRICING COMPONENTS
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

const plans = [
  {
    title: "Perpetual",
    subtitle: "Desktop License",
    price: "4999.00",
    platforms: [Monitor, Apple],
    features: [
      { text: "30 days money back guarantee", included: true },
      { text: "Desktop for Windows/MacOS", included: true },
      { text: "Pixxel OS Video Course", included: true },
      { text: "Mobile App for iOS/Android", included: false },
      { text: "Creative Library Access", included: false },
    ]
  },
  {
    title: "Cross-device",
    subtitle: "Perpetual License",
    price: "6499.00",
    platforms: [Monitor, Apple, Smartphone, Layers],
    features: [
      { text: "30 days money back guarantee", included: true },
      { text: "Desktop for Windows/MacOS", included: true },
      { text: "Pixxel OS Video Course", included: true },
      { text: "Mobile App for iOS/Android", included: true },
      { text: "Creative Library Access", included: false },
    ]
  },
  {
    title: "Perpetual",
    subtitle: "Max License",
    price: "6999.00",
    platforms: [Monitor, Apple, Smartphone, Layers, Zap],
    features: [
      { text: "30 days money back guarantee", included: true },
      { text: "Desktop for Windows/MacOS", included: true },
      { text: "Pixxel OS Video Course", included: true },
      { text: "Mobile App for iOS/Android", included: true },
      { text: "Creative Library Access", included: true, info: true },
    ]
  }
];

// ==========================================
// MAIN PAGE COMPONENT
// ==========================================
export default function SkyReplacementPage() {
  
  // 1st Section State
  const [activeSky, setActiveSky] = useState(0);
  const heroSkies = [
      "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?q=80&w=2400&auto=format&fit=crop", 
      "https://images.unsplash.com/photo-1513224502586-d1e602410265?q=80&w=2400&auto=format&fit=crop", 
      "https://images.unsplash.com/photo-1502481851512-e9e2529bfbf9?q=80&w=2400&auto=format&fit=crop", 
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2400&auto=format&fit=crop", 
      "https://images.unsplash.com/photo-1528818955841-a7f1425131b5?q=80&w=2400&auto=format&fit=crop", 
      "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?q=80&w=2400&auto=format&fit=crop"  
  ];

  // 2nd Section State
  const [activeTransform, setActiveTransform] = useState(0);
  const transformImages = [
      "https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?q=80&w=1600&auto=format&fit=crop&sepia=1&brightness=0.8", 
      "https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?q=80&w=1600&auto=format&fit=crop", 
      "https://images.unsplash.com/photo-1531189446059-d830b42db7bd?q=80&w=1600&auto=format&fit=crop", 
      "https://images.unsplash.com/photo-1513628253939-010e64ac66cd?q=80&w=1600&auto=format&fit=crop"  
  ];

  // 3rd Section State
  const [activeStep, setActiveStep] = useState(1);
  const stepVideos = {
      1: "https://www.w3schools.com/html/mov_bbb.mp4",
      2: "https://www.w3schools.com/html/mov_bbb.mp4",
      3: "https://www.w3schools.com/html/mov_bbb.mp4",
      4: "https://www.w3schools.com/html/mov_bbb.mp4",
  };

  // 5th Section State
  const [activeUseCase, setActiveUseCase] = useState(0);

  // Footer Form State
  const sendMessage = useMutation(api.messages?.sendMessage || (() => {}));
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openFAQ, setOpenFAQ] = useState(null);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) { toast.error("Please fill in all fields"); return; }
    setIsSubmitting(true);
    try {
      if(api.messages?.sendMessage) await sendMessage(contactForm);
      toast.success("Message sent successfully!");
      setContactForm({ name: "", email: "", message: "" });
    } catch (error) { toast.error("Failed to send message."); } finally { setIsSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#ffb400]/30 font-sans overflow-x-hidden">
      
      {/* ==========================================
          1. HERO SECTION
          ========================================== */}
      <section className="relative h-screen w-full flex flex-col justify-center items-start px-6 md:px-16 lg:px-24 overflow-hidden bg-black">
        {/* Dynamic Background Image */}
        <AnimatePresence mode="wait">
            <motion.div 
                key={activeSky}
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0.8 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    backgroundImage: `url(${heroSkies[activeSky]})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60"></div>
            </motion.div>
        </AnimatePresence>

        <div className="relative z-10 w-full flex flex-col lg:flex-row justify-between items-center mt-20 gap-10 max-w-[1500px] mx-auto">
            
            {/* Left Content (Text) */}
            <div className="max-w-xl w-full lg:ml-32 md:ml-16">
                <h1 className="text-5xl md:text-6xl lg:text-[64px] font-bold text-white leading-[1.1] tracking-tight mb-6">
                    Sky Replacement <br/>
                    <span className="relative inline-block">
                        with One Click
                        <span className="absolute bottom-1 left-0 w-full h-[4px] bg-[#ffb400] rounded-full"></span>
                    </span>
                </h1>
                <p className="text-lg md:text-xl text-white/90 font-light leading-relaxed mb-10 max-w-md">
                    Seamlessly replace the sky with the power of AI.
                </p>
                <ViewPlansButton />
            </div>

            {/* Right Interactive Box (Sky AI) */}
            <div className="relative lg:mr-44 md:mr-10">
                {/* Try it! Arrow */}
                <div className="absolute -left-20 top-4 -rotate-12 flex flex-col items-end hidden md:flex">
                    <span className="text-2xl font-bold font-serif mb-0 tracking-wide drop-shadow-md">Try it!</span>
                    <svg width="60" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg">
                        <path d="M10 10 Q 50 80 90 50" stroke="white" strokeWidth="3" fill="none" />
                        <path d="M75 40 L 90 50 L 80 65" stroke="white" strokeWidth="3" fill="none" strokeLinejoin="round" />
                    </svg>
                </div>

                <div className="bg-[#2a4643]/95 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-2xl w-[260px]">
                    <div className="flex items-center gap-2 mb-3 text-sm font-semibold">
                        <div className="w-4 h-3 bg-white rounded-[3px] relative before:absolute before:w-1.5 before:h-1.5 before:-top-1 before:left-1 before:bg-white before:rounded-full"></div>
                        Sky<sup className="text-[#ffb400] ml-0.5 text-[10px]">AI</sup>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {heroSkies.map((sky, idx) => (
                            <button 
                                key={idx}
                                onClick={() => setActiveSky(idx)}
                                className={`w-full aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all duration-300 ${activeSky === idx ? 'border-[#ffb400] scale-105 shadow-md' : 'border-transparent hover:border-white/40 opacity-80 hover:opacity-100'}`}
                            >
                                <img src={sky} alt={`Sky ${idx+1}`} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </section>


      {/* ==========================================
          2. TRANSFORM YOUR PHOTOS
          ========================================== */}
      <section className="py-24 bg-black relative z-20">
          <div className="max-w-6xl mx-auto px-6 text-center">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Transform Your Photos Instantly with AI Sky <br/> Replacement!</h2>
              <p className="text-white/70 text-lg font-light leading-relaxed max-w-3xl mx-auto mb-12">
                  Watch as our AI effortlessly swaps dull skies with stunning vistas, instantly elevating the mood and atmosphere of your photos. Say goodbye to dull days and hello to limitless possibilities!
              </p>

              <div className="flex flex-wrap justify-center gap-0 mb-10 bg-transparent border border-white/20 rounded-xl p-1 max-w-2xl mx-auto divide-x divide-white/20">
                  {['Original', 'Blue Sky', 'Sunset', 'Starry Night'].map((tab, idx) => (
                      <button 
                          key={idx}
                          onClick={() => setActiveTransform(idx)}
                          className={`flex-1 py-3 px-4 text-sm font-medium transition-all duration-300 ${activeTransform === idx ? 'text-white' : 'text-white/50 hover:text-white'}`}
                      >
                          {tab}
                      </button>
                  ))}
              </div>

              <div className="w-full rounded-2xl overflow-hidden shadow-2xl relative aspect-[16/9] md:aspect-[21/9]">
                  <AnimatePresence mode="wait">
                      <motion.img 
                          key={activeTransform}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          src={transformImages[activeTransform]}
                          alt="Sky replacement before and after transformation example"
                          className="w-full h-full object-cover"
                      />
                  </AnimatePresence>
              </div>
          </div>
      </section>

      {/* ==========================================
          3. HOW TO CHANGE SKY
          ========================================== */}
      <section className="py-24 bg-[#0a0a0a] border-t border-white/5 relative z-20">
          <div className="max-w-[1400px] mx-auto px-6">
              
              <div className="text-center mb-16">
                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">How To Change Sky in Photos?</h2>
                  <p className="text-white/60 text-lg font-light leading-relaxed max-w-3xl mx-auto">
                      With Luminar Neo's Sky Replacement AI, changing the sky in your photo is fast, fun, and completely automatic — no need for masks or complex editing.
                  </p>
              </div>

              <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
                  
                  {/* Left Steps */}
                  <div className="w-full lg:w-[30%] flex flex-col gap-6">
                      {[
                          { id: 1, title: "1. Open your image in Luminar Neo", desc: "Choose any photo with an overexposed, dull, or empty sky." },
                          { id: 2, title: "2. Choose a new sky from the built-in collection", desc: "Pick from a wide variety of skies" },
                          { id: 3, title: "3. Watch the AI do the work", desc: "Just click and watch the magic happen — replace the sky in the photo in seconds!" },
                          { id: 4, title: "4. Fine-tune with sky edit tools", desc: "The smart sky edit panel gives you full creative control." },
                          { id: 5, title: "5. Enjoy results", desc: "See the stunning before and after difference." }
                      ].map((s) => (
                          <div 
                            key={s.id} 
                            onClick={() => setActiveStep(s.id)}
                            className={`pl-5 cursor-pointer border-l-2 transition-all duration-300 ${activeStep === s.id ? 'border-[#ffb400]' : 'border-transparent opacity-50 hover:opacity-100'}`}
                          >
                              <h4 className="text-lg md:text-xl font-bold text-white mb-2">{s.title}</h4>
                              {activeStep === s.id && (
                                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-white/60 text-sm leading-relaxed">
                                      {s.desc}
                                  </motion.p>
                              )}
                          </div>
                      ))}
                  </div>

                  {/* Right Display Area */}
                  <div className="w-full lg:w-[70%] bg-[#111] rounded-2xl p-1 border border-white/10 shadow-2xl">
                      <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-black flex items-center justify-center">
                          {activeStep === 5 ? (
                              <BeforeAfterSlider 
                                  heightClass="h-full w-full absolute inset-0"
                                  /* YAHAN APNA BEFORE/AFTER IMAGE URL DAALEIN (Step 5 ke liye) */
                                  beforeImage="device44.jpg" 
                                  afterImage="device55.jpg" 
                              />
                          ) : (
                              <video 
                                  key={`video-${activeStep}`}
                                  src={stepVideos[activeStep]} 
                                  className="w-full h-full object-cover"
                                  autoPlay muted loop playsInline
                              />
                          )}
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* ==========================================
          4. UNLOCK THE POWER CTA
          ========================================== */}
      <section className="py-24 bg-black relative z-20 px-6">
          <div className="max-w-6xl mx-auto  rounded-[2rem] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 overflow-hidden relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_50%)]"></div>
              
              <div className="relative z-10 w-full md:w-1/2">
                  <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-10">
                      Unlock the power <br/> of Sky <sup className="text-xl">AI</sup> <br/> Replacement
                  </h2>
                  <ViewPlansButton />
              </div>

              <div className="relative z-10 w-full md:w-1/2 flex justify-end">
                  <div className="w-full max-w-lg">
                      <img src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80" alt="Pixxel AI sky editor on laptop screen" className="w-full drop-shadow-2xl rounded-lg" style={{ filter: 'brightness(0.8) contrast(1.2)' }} />
                      
                  </div>
              </div>
          </div>
      </section>

      {/* ==========================================
          5. WHY DO YOU NEED A SKY REPLACEMENT TOOL
          ========================================== */}
      <section className="py-24 bg-black px-6">
          <div className="max-w-[1300px] mx-auto relative rounded-3xl overflow-hidden h-[600px] md:h-[650px] shadow-2xl">
              
              {/* Background Slider across the inner container */}
              <BeforeAfterSlider 
                  heightClass="h-full w-full absolute inset-0"
                  image="device44.jpg" 
                  beforeFilter="brightness(0.6) saturate(0.5) contrast(0.8)" 
                  hideLabels={true}
              />

              {/* Frosted Glass Overlay Panel */}
              <div className="absolute left-6 md:left-12 top-10 bottom-10 w-full max-w-[420px] bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 md:p-10 flex flex-col justify-center pointer-events-auto">
                  
                  <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4">Why Do You Need a Sky Replacement Tool?</h2>
                  <p className="text-white/70 text-sm font-light leading-relaxed mb-6">
                      Sometimes the perfect photo needs a better sky. So, how Luminar Neo's sky replacement software adds value across different photo types:
                  </p>

                  <div className="space-y-1 mb-8 overflow-y-auto pr-2 custom-scrollbar">
                      {['For Portraits', 'For Real Estate', 'For E-Commerce', 'For Social Media'].map((item, idx) => (
                          <div key={idx} className="border-b border-white/10 last:border-0 pb-1">
                              <button 
                                  onClick={() => setActiveUseCase(idx)}
                                  className="w-full flex items-center justify-between py-4 text-left font-bold text-lg hover:text-[#ffb400] transition-colors"
                              >
                                  {item}
                                  {activeUseCase === idx ? <ChevronDown size={20} /> : <ChevronRight size={20} className="opacity-50"/>}
                              </button>
                              {activeUseCase === idx && (
                                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-white/60 text-sm leading-relaxed pb-3">
                                      {idx === 0 && "Make your outdoor portraits pop by adding depth, light, or drama. A better sky brings out the best in your subject."}
                                      {idx === 1 && "Enhance property appeal instantly by swapping gloomy skies with bright, sunny ones. Sell faster with better visuals."}
                                      {idx === 2 && "Keep product backgrounds consistent and striking, making your catalogs stand out."}
                                      {idx === 3 && "Grab attention in the feed with awe-inspiring skies that guarantee more engagement."}
                                  </motion.div>
                              )}
                          </div>
                      ))}
                  </div>

                  <Link href="/pricing">
                      <button className="w-full flex items-center justify-center gap-3 bg-[#ffb400] text-black font-bold uppercase tracking-wide text-xs px-8 py-4 rounded-lg transition-transform hover:brightness-110">
                          VIEW PLANS
                          <div className="flex items-center gap-1.5 ml-1">
                              <Apple size={16} className="fill-black" />
                              <LayoutGrid size={14} className="fill-black" />
                          </div>
                      </button>
                  </Link>
              </div>
          </div>
      </section>

      {/* ==========================================
          6. ULTIMATE EDITOR IN ACTION
          ========================================== */}
      <section className="py-24 bg-black text-center px-6 ">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-16">Your Ultimate Sky Replacement Editor in Action</h2>
          
          <div className="max-w-5xl mx-auto relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(255,180,0,0.1)]">
              <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2000&auto=format&fit=crop" alt="AI sky replacement editing in action" className="w-full aspect-video object-cover" style={{ filter: 'brightness(0.7)' }}/>
              
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group cursor-pointer hover:bg-black/10 transition-colors">
                  <div className="w-20 h-20 bg-[#ffb400] rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                      <PlayCircle className="w-10 h-10 text-black ml-1" fill="currentColor" stroke="none" />
                  </div>
              </div>

              <div className="absolute top-6 left-6 flex flex-col gap-4">
                  <div className="w-14 h-16 border border-[#ffb400]/50 rounded-md bg-black/80 backdrop-blur flex items-center justify-center flex-col text-white">
                      <span className="text-[10px] font-bold tracking-widest text-[#ffb400]">TIPA</span>
                      <span className="text-[8px] leading-tight text-center">WORLD<br/>AWARDS</span>
                  </div>
                  <div className="flex items-center gap-2 bg-black/80 backdrop-blur px-3 py-2 rounded-md border border-white/10">
                      <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-[8px] font-bold">RedDot</div>
                      <span className="text-[10px] text-white/80 leading-tight">reddot winner 2022<br/>interface design</span>
                  </div>
              </div>
          </div>
      </section>

      {/* ==========================================
          7. STANDALONE OR PLUGIN
          ========================================== */}
      <section className="py-24 bg-[#050505] text-center px-6 border-b border-white/5">
          {/* Button Centered Here using align="center" prop */}
          <ViewPlansButton align="center" />
          
          <div className="mt-20">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-16">Works as both a standalone or plug-in</h2>
              <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 max-w-5xl mx-auto">
                  <div className="flex items-center gap-4 text-left">
                      <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center"><Apple size={24} className="text-white/60"/></div>
                      <span className="text-sm font-bold text-white/90">Standalone<br/>app for<br/>macOS</span>
                  </div>
                  <div className="flex items-center gap-4 text-left">
                      <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center"><LayoutGrid size={24} className="text-white/60"/></div>
                      <span className="text-sm font-bold text-white/90">Standalone<br/>app for<br/>Windows</span>
                  </div>
                  <div className="flex items-center gap-4 text-left">
                      <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-400 font-bold text-xl">Ps</div>
                      <span className="text-sm font-bold text-white/90">Adobe<br/>Photoshop®<br/>Plugin</span>
                  </div>
                  <div className="flex items-center gap-4 text-left">
                      <div className="w-12 h-12 bg-teal-600/20 rounded-xl flex items-center justify-center text-teal-400 font-bold text-xl">Lr</div>
                      <span className="text-sm font-bold text-white/90">Adobe<br/>Lightroom®<br/>Classic Plugin</span>
                  </div>
                  <div className="flex items-center gap-4 text-left">
                      <div className="w-12 h-12 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">✿</div>
                      <span className="text-sm font-bold text-white/90">Photos® for<br/>macOS<br/>Extension</span>
                  </div>
              </div>
          </div>
      </section>

      {/* ==========================================
          8. NEW PRICING SECTION
          ========================================== */}
      <section className="py-24 bg-[#050505] max-w-7xl mx-auto px-6 text-center border-b border-white/5">
          <h2 className="text-3xl font-bold text-[#6D93F8] mb-2">Lifetime editing <span className="text-white">made flexible!</span></h2>
          <h3 className="text-4xl font-bold text-white mb-16">Choose the plan that works for you</h3>

          <div className="grid md:grid-cols-3 gap-8 text-left mb-16 items-start">
            {plans.map((plan, idx) => (
              <PricingCard key={idx} plan={plan} isMostPopular={idx === 1} />
            ))}
          </div>

          <div className="border border-[#6D93F8]/30 bg-[#0a0a0a] rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-white">Reliable support, trusted by our users</h3>
              <div className="flex items-center gap-6 text-sm font-medium">
                  <div className="flex items-center gap-2"><span className="text-[#ffb400]">💬</span> 24/7 Chat support</div>
                  <div className="flex items-center gap-2"><span className="text-[#ffb400]">⚙️</span> Technical assistance</div>
              </div>
          </div>
      </section>

      {/* ============================================================== */}
      {/* PROVIDED FAQ SECTION */}
      {/* ============================================================== */}
      <section className="py-24 bg-[#050505] relative overflow-hidden border-b border-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[700px] bg-gradient-to-r from-[#ffb400]/5 to-[#ffb400]/10 blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-flex items-center px-4 py-2 rounded-full border border-white/10 bg-white/[0.02] text-xs uppercase tracking-[0.25em] text-white/60 mb-6">
              SUPPORT
            </span>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-[-0.04em]">
              Frequently Asked
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#ffb400] to-orange-500">
                Questions
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
      {/* PROVIDED FOOTER WITH BACKEND LOGIC */}
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