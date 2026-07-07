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
// SCROLL REVEAL ANIMATIONS
// ==========================================
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
};

// ==========================================
// REUSABLE BEFORE/AFTER SLIDER 
// (Supports both Dual-URLs and Single-URL with CSS Filters)
// ==========================================
const BeforeAfterSlider = ({ image, beforeImage, afterImage, beforeFilter, afterFilter = "none", heightClass = "h-[400px] md:h-[600px]", hideLabels = false }) => {
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
      <img src={afterImage || image} alt="After: product photo retouched with Pixxel AI" className="absolute inset-0 w-full h-full object-cover pointer-events-none" style={{ filter: afterFilter }} />
      
      {/* BEFORE IMAGE (Clipped Layer on Top) */}
      <img 
        src={beforeImage || image} 
        alt="Before: unedited product photo" 
        className="absolute inset-0 w-full h-full object-cover pointer-events-none" 
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`, filter: beforeFilter }} 
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
// MAIN E-COMMERCE PAGE COMPONENT
// ==========================================
export default function EcommerceEditorPage() {
  
  // Footer Form State
  const sendMessage = useMutation(api.messages?.sendMessage || (() => {}));
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openFAQ, setOpenFAQ] = useState(null);

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
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#ffb400]/30 font-sans overflow-x-hidden scroll-smooth">
      
      {/* ==========================================
          1. HERO SECTION (Screenshot 1)
      ========================================== */}
      <section className="relative w-full h-[85vh] flex flex-col items-start justify-center px-6 md:px-16 lg:px-24 overflow-hidden ">
        <div 
          className="absolute inset-0 z-0 opacity-50 pointer-events-none"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2400&auto=format&fit=crop')`, // Colorful fashion/shopping background
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/70 to-transparent z-0 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-0 pointer-events-none" />

        <motion.div 
          initial="hidden" animate="visible" variants={fadeUp} 
          className="relative z-10 max-w-2xl"
        >
          <div className="flex items-center gap-2 mb-6">
            <span className="text-[#ffb400] text-2xl">✳</span>
            <span className="text-white text-xl font-medium tracking-wide">
              luminar <span className="text-[#ffb400] font-normal text-[10px] align-super">neo</span>
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-[60px] font-bold tracking-tight leading-[1.1] mb-6">
            E-commerce <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 relative">Photo Editor</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white/80 font-light mb-10 max-w-lg leading-relaxed">
            Use e-commerce image editing to improve image quality by adjusting brightness, contrast, sharpness, and color balance. Make your products look more vibrant and attractive with Pixxel OS.
          </p>
          
         <Link href="/pricing">
                    <button
                      className="font-extrabold uppercase tracking-[0.2em] transition-all duration-300 hover:-translate-y-[2px] active:scale-95"
                      style={{
                        background: "linear-gradient(90deg, #22d3ee 0%, #a855f7 100%)",
                        color: "#000000",
                        fontSize: "12px",
                        padding: "13px 40px",
                        borderRadius: "4px",
                        boxShadow: "0 6px 28px rgba(13, 78, 88, 0.14), 0 2px 8px rgba(168,85,247,0.2)",
                        letterSpacing: "0.1em",
                      }}
                    >
                      VIEW PLANS
                    </button>
                  </Link>
        </motion.div>
      </section>

      {/* ==========================================
          2. E-COMMERCE IN ACTION (Big Center Slider) (Screenshot 2)
      ========================================== */}
      <section className="py-24 px-4 md:px-10 text-center flex flex-col items-center">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 relative">Pixxel' os</span> for E-commerce in action
          </h2>
          <p className="text-white/60 text-lg font-light max-w-2xl mx-auto">
            Enhance your e-commerce presence by making your product images more appealing and professional.
          </p>
        </motion.div>

        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} 
          className="w-full max-w-[1200px] mx-auto rounded-3xl overflow-hidden shadow-2xl border border-white/10"
        >
          {/* YAHAN ALAG ALAG URLs DAALEIN */}
          <BeforeAfterSlider 
            beforeImage="https://res.cloudinary.com/do6jlckzy/image/upload/v1783238661/pmv-chamara-RwPl7nbiXB0-unsplash_xuckg6.jpg" // Replace with transparent/raw bag URL
            afterImage="https://res.cloudinary.com/do6jlckzy/image/upload/v1783238707/pmv-chamara-RwPl7nbiXB0-unsplash_1_uhkz60.jpg" // Replace with edited bag URL
            heightClass="h-[400px] md:h-[600px] lg:h-[700px]"
          />
        </motion.div>
      </section>

      {/* ==========================================
          3. HOW TO MAXIMIZE (Shoes Slider) (Screenshot 3)
      ========================================== */}
      <section className="py-16 px-4 md:px-10">
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUp} 
          className="max-w-[1300px] mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20"
        >
          {/* Left Text */}
          <div className="w-full lg:w-[40%] flex flex-col justify-center text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl lg:text-[42px] font-bold mb-6 leading-tight">
              How to maximize your e-commerce potential with a product photo editor?
            </h2>
            <p className="text-white/60 text-base md:text-lg font-light leading-relaxed">
              You can use a product image editor to highlight important product details. Zoom in on intricate features, textures, or unique selling points to showcase the quality and value of your products.
            </p>
          </div>

          {/* Right Slider */}
          <div className="w-full lg:w-[60%] rounded-3xl overflow-hidden shadow-2xl border border-white/5">
            {/* YAHAN ALAG ALAG URLs DAALEIN */}
            <BeforeAfterSlider 
              beforeImage="https://res.cloudinary.com/do6jlckzy/image/upload/v1783239148/joseph-barrientos-4qSb_FWhHKs-unsplash_y71oop.jpg" // Replace with raw shoe URL
              afterImage="https://res.cloudinary.com/do6jlckzy/image/upload/v1783239194/joseph-barrientos-4qSb_FWhHKs-unsplash_1_hkuo3y.jpg" // Replace with edited shoe URL
              heightClass="h-[400px] md:h-[548px]"
            />
          </div>
        </motion.div>
      </section>

      {/* ==========================================
          4. WHY IS SEAMLESS... (Perfume Slider) (Screenshot 4)
      ========================================== */}
      <section className="py-16 px-4 md:px-10">
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUp} 
          className="max-w-[1300px] mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20"
        >
          {/* Left Slider (Order 2 on mobile, 1 on desktop) */}
          <div className="w-full lg:w-[60%] rounded-3xl overflow-hidden shadow-2xl border border-white/5 order-2 lg:order-1">
             {/* YAHAN ALAG ALAG URLs DAALEIN */}
            <BeforeAfterSlider 
              beforeImage="https://res.cloudinary.com/do6jlckzy/image/upload/v1783239887/pavlo-talpa-ADKsjO-uwpo-unsplash_zakxhd.jpg" // Replace with raw perfume URL
              afterImage="https://res.cloudinary.com/do6jlckzy/image/upload/v1783239955/pavlo-talpa-adksjo-uwpo-unsplash_edjily.png" // Replace with edited perfume URL
              heightClass="h-[400px] md:h-[550px]"
            />
          </div>

          {/* Right Text (Order 1 on mobile, 2 on desktop) */}
          <div className="w-full lg:w-[40%] flex flex-col justify-center text-center lg:text-left order-1 lg:order-2">
            <h2 className="text-3xl md:text-4xl lg:text-[42px] font-bold mb-6 leading-tight">
              Why is seamless e-commerce photo editing vital for your brand's success?
            </h2>
            <p className="text-white/60 text-base md:text-lg font-light leading-relaxed">
              You can use a product image editor to highlight important product details. Zoom in on intricate features, textures, or unique selling points to showcase the quality and value of your products.
            </p>
          </div>
        </motion.div>
      </section>

      {/* ==========================================
          5. HOW TO MAXIMIZE... (Headphones Slider) (Screenshot 5)
      ========================================== */}
      <section className="py-16 px-4 md:px-10 mb-10">
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUp} 
          className="max-w-[1300px] mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20"
        >
          {/* Left Text */}
          <div className="w-full lg:w-[40%] flex flex-col justify-center text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl lg:text-[42px] font-bold mb-6 leading-tight">
              How to maximize your e-commerce potential with a product photo editor?
            </h2>
            <p className="text-white/60 text-base md:text-lg font-light leading-relaxed">
              You can use a product image editor to highlight important product details. Zoom in on intricate features, textures, or unique selling points to showcase the quality and value of your products.
            </p>
          </div>

          {/* Right Slider */}
          <div className="w-full lg:w-[60%] rounded-3xl overflow-hidden shadow-2xl border border-white/5 bg-[#ec564c]">
             {/* YAHAN ALAG ALAG URLs DAALEIN */}
            <BeforeAfterSlider 
              beforeImage="https://res.cloudinary.com/do6jlckzy/image/upload/v1783240502/ervo-rocks-Zam8TvEgN5o-unsplash_md0zww.jpg" // Replace with raw headphone URL
              afterImage="https://res.cloudinary.com/do6jlckzy/image/upload/v1783240510/ervo-rocks-Zam8TvEgN5o-unsplash_1_cudype.jpg" // Replace with edited headphone URL
              heightClass="h-[400px] md:h-[550px] bg-transparent"
            />
          </div>
        </motion.div>
      </section>

      {/* ==========================================
          6. NAVIGATING THE LANDSCAPE (6 Steps) (Screenshot 6)
      ========================================== */}
      <section className="py-24 px-4 md:px-10 bg-[#020202] ">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="max-w-[1000px] mx-auto">
          
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight mb-4">
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 relative"> Navigating the landscape of</span> <br className="hidden md:block"/>
              e-commerce product photo editing
            </h2>
            <p className="text-white/70 text-lg font-light max-w-2xl mx-auto">
              Luminar Neo has lots of features you can use for product editing. <br/>
              For example, Background Removal AI easily removes the background behind your product:
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">
             {/* Left Column Steps */}
             <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 shrink-0 bg-white text-black font-bold flex items-center justify-center rounded-[4px] text-sm mt-1">1</div>
                  <p className="text-white/80 font-light text-[17px] leading-relaxed">Select an image: click the Edit tab</p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 shrink-0 bg-white text-black font-bold flex items-center justify-center rounded-[4px] text-sm mt-1">2</div>
                  <p className="text-white/80 font-light text-[17px] leading-relaxed">Layers Properties: select the Masking tab and choose Background Removal AI</p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 shrink-0 bg-white text-black font-bold flex items-center justify-center rounded-[4px] text-sm mt-1">3</div>
                  <p className="text-white/80 font-light text-[17px] leading-relaxed">Selection: Select the chosen main object or choose from additional elements found in the image.</p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 shrink-0 bg-white text-black font-bold flex items-center justify-center rounded-[4px] text-sm mt-1">4</div>
                  <p className="text-white/80 font-light text-[17px] leading-relaxed">Remove the background: Click "Remove" to initiate the Background Removal process. Luminar Neo will remove the image's background, revealing a transparent checkbox background.</p>
                </div>
             </div>

             {/* Right Column Steps */}
             <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 shrink-0 bg-white text-black font-bold flex items-center justify-center rounded-[4px] text-sm mt-1">5</div>
                  <p className="text-white/80 font-light text-[17px] leading-relaxed">Click Refinement Brush for additional finetuning: A Transition Mask will appear, highlighting Transition in a white checkerboard pattern, Object in orange, and Background in blue. Select a brush and apply it to refine each section.</p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 shrink-0 bg-white text-black font-bold flex items-center justify-center rounded-[4px] text-sm mt-1">6</div>
                  <p className="text-white/80 font-light text-[17px] leading-relaxed">The final image will appear with a transparent background. Use Layers to add a new background and move the layer to the bottom of the Layers palette. This will reveal the image on a new background.</p>
                </div>
             </div>
          </div>

        </motion.div>
      </section>

      {/* ==========================================
          7. FIND PRESETS WITH AI (Screenshot 7)
      ========================================== */}
     <section className="py-24 px-4 md:px-10 text-center flex flex-col items-center">
  <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-12">
    <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight mb-4">
      Find Presets with <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 relative">AI assistance</span>
    </h2>
    <p className="text-white/60 text-lg font-light max-w-xl mx-auto">
      AI suggests the perfect Presets for each image. <br/> For instantly stunning results.
    </p>
  </motion.div>

  <motion.div 
    initial="hidden" 
    whileInView="visible" 
    viewport={{ once: true }} 
    variants={fadeUp} 
   
    className="w-full max-w-[1300px] h-[350px] md:h-[700px] mx-auto rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative"
  >
   
    <img 
      src="https://res.cloudinary.com/do6jlckzy/image/upload/v1783241014/sharegrid-N10auyEVst8-unsplash_larfnu.jpg" 
      className="w-full h-full object-cover opacity-80" 
      alt="Pixxel AI presets demo for product photos" 
    />
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center pl-1 shadow-[0_0_30px_rgba(255,255,255,0.2)] pointer-events-auto cursor-pointer hover:bg-white/20 transition-all">
            <PlayCircle size={32} className="text-white" fill="currentColor" />
        </div>
    </div>
  </motion.div>
</section>

      {/* ==========================================
          8. PLUGIN SECTION (Screenshot 8)
      ========================================== */}
      <section className="py-32 relative overflow-hidden bg-black text-center px-4 flex flex-col items-center justify-center">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#8B5CF6]/10 blur-[120px] rounded-full pointer-events-none" />
         
         <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="relative z-10 flex flex-col items-center">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 mb-8">
              <span className="text-[#ffb400] text-2xl">✳</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-12">
              An application & plugin. <br/> For macOS & Windows
            </h2>

            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 text-sm font-medium text-white/80 mb-12">
               <span className="flex items-center gap-2"><div className="w-5 h-5 rounded-full bg-[#8B5CF6] flex items-center justify-center"><Check size={12} className="text-black stroke-[3]"/></div> High-performance image editor</span>
               <span className="flex items-center gap-2"><div className="w-5 h-5 rounded-full bg-[#8B5CF6] flex items-center justify-center"><Check size={12} className="text-black stroke-[3]"/></div> 24/7 technical support</span>
               <span className="flex items-center gap-2"><div className="w-5 h-5 rounded-full bg-[#8B5CF6] flex items-center justify-center"><Check size={12} className="text-black stroke-[3]"/></div> 30-day money back guarantee</span>
               <span className="flex items-center gap-2"><div className="w-5 h-5 rounded-full bg-[#8B5CF6] flex items-center justify-center"><Check size={12} className="text-black stroke-[3]"/></div> Join our communities</span>
            </div>

            <Link href="/pricing">
                    <button
                      className="font-extrabold uppercase tracking-[0.2em] transition-all duration-300 hover:-translate-y-[2px] active:scale-95"
                      style={{
                        background: "linear-gradient(90deg, #22d3ee 0%, #a855f7 100%)",
                        color: "#000000",
                        fontSize: "12px",
                        padding: "13px 40px",
                        borderRadius: "4px",
                        boxShadow: "0 6px 28px rgba(13, 78, 88, 0.14), 0 2px 8px rgba(168,85,247,0.2)",
                        letterSpacing: "0.1em",
                      }}
                    >
                      VIEW PLANS
                    </button>
                  </Link>
         </motion.div>
      </section>

      {/* ==========================================
          9. EXPLORE OTHER FEATURES (3-Grid Sliders) (Screenshot 9)
      ========================================== */}
      <section className="py-24 px-4 md:px-10 max-w-[1300px] mx-auto text-center flex flex-col items-center">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-4">
            Explore other features
          </h2>
          <p className="text-white/60 text-lg font-light max-w-xl mx-auto">
            Luminar Neo has plenty of other features to <br/> help you edit faster and easier.
          </p>
        </motion.div>

        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer} 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full"
        >
          {/* Feature 1: Relight AI (Brightness logic) */}
          <motion.div variants={fadeUp} className="flex flex-col text-left">
            <div className="w-full aspect-square rounded-2xl overflow-hidden mb-6 border border-white/5">
              <BeforeAfterSlider 
                image="https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?q=80&w=800&auto=format&fit=crop"
                beforeFilter="brightness(0.4) contrast(0.9)" // Darker before
                afterFilter="brightness(1.1) contrast(1.1)" // Brighter after
                heightClass="h-full"
                hideLabels={true}
              />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Relight AI</h3>
            <p className="text-white/60 text-[15px] font-light">Bring back natural light in your photos.</p>
          </motion.div>

          {/* Feature 2: Erase (Fog/Blur logic as requested) */}
          <motion.div variants={fadeUp} className="flex flex-col text-left">
            <div className="w-full aspect-square rounded-2xl overflow-hidden mb-6 border border-white/5">
              <BeforeAfterSlider 
                image="https://res.cloudinary.com/do6jlckzy/image/upload/v1783241854/rohit-tandon-9wg5jCEPBsw-unsplash_qrgvfw.jpg"
                beforeFilter="opacity(0.8) blur(3px) sepia(0.3)" // Foggy/Blurry before
                afterFilter="none" // Clear after
                heightClass="h-full"
                hideLabels={true}
              />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Erase</h3>
            <p className="text-white/60 text-[15px] font-light">Get rid of imperfections in one click.</p>
          </motion.div>

          {/* Feature 3: Skin AI (Saturation logic) */}
          <motion.div variants={fadeUp} className="flex flex-col text-left">
            <div className="w-full aspect-square rounded-2xl overflow-hidden mb-6 border border-white/5">
              <BeforeAfterSlider 
                image="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop"
                beforeFilter="saturate(0.5) contrast(0.9)" // Dull before
                afterFilter="saturate(1.3) contrast(1.1)" // Vibrant/Flawless after
                heightClass="h-full"
                hideLabels={true}
              />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Skin AI</h3>
            <p className="text-white/60 text-[15px] font-light">Create flawless portraits.</p>
          </motion.div>

        </motion.div>
      </section>

      {/* ============================================================== */}
      {/* 10. FAQ SECTION */}
      {/* ============================================================== */}
      <section className="py-24 bg-[#050505] relative overflow-hidden ">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[700px] bg-gradient-to-r from-[#8B5CF6]/5 to-[#8B5CF6]/10 blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-flex items-center px-4 py-2 rounded-full border border-white/10 bg-white/[0.02] text-xs uppercase tracking-[0.25em] text-white/60 mb-6">
              SUPPORT
            </span>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-[-0.04em]">
              Frequently Asked
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 ">
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
                  className="w-full flex items-center justify-between px-7 py-6 text-left outline-none"
                >
                  <span className="text-white font-medium text-[15px] md:text-[16px] tracking-[-0.02em]">
                    {faq.question}
                  </span>

                  <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-[#6366F1]/10 border border-[#6366F1]/20 transition-all duration-300 ${openFAQ === index ? "rotate-45" : ""}`}>
                    <span className="text-[#6366F1] text-xl font-semibold">+</span>
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
      {/* 11. FOOTER WITH BACKEND LOGIC */}
      {/* ============================================================== */}
      <footer className="py-20 relative z-20 bg-[#020202]">
       <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="grid gap-12 lg:gap-16 grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.5fr] items-start">
          
          <div>
            <div className="mb-8 font-black text-2xl tracking-tighter text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">Pixxel <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 relative"> OS.</span></div>
            <p className="text-[14px] text-slate-500/80 leading-relaxed mb-8 max-w-[280px] font-medium">Infrastructure grade image orchestration natively rendered in high definition across your visual matrix.</p>
            <form className="flex max-w-[320px] shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] rounded-[1rem] p-1 border border-white/10 bg-[#0a0a0a]" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Your work email..." className="flex-1 bg-transparent px-4 py-3 text-[14px] text-white outline-none border-none placeholder-slate-600" />
              <button type="submit" className="rounded-[0.8rem] bg-gradient-to-r from-cyan-400 to-purple-500  text-black px-6 text-[13px] font-bold shadow-md hover:bg-[#e6a200] transition-colors">Access</button>
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
                className="w-full bg-gradient-to-r from-cyan-400 to-purple-500  hover:bg-[#e6a200] text-black font-extrabold tracking-widest uppercase text-[11px] h-12 rounded-xl transition-all border border-white/10"
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