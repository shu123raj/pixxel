"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Footer Backend Dependencies
import { useMutation, useQuery } from "convex/react"; // 👈 useQuery yahan add kiya gaya hai
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Custom SVG Icons for Footer
const Github = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-6.5a5.4 5.4 0 0 0-1.5-3.8 5.3 5.3 0 0 0-.1-3.8s-1.2-.4-3.9 1.4a13.3 13.3 0 0 0-7 0C6.2 1.5 5 1.9 5 1.9a5.3 5.3 0 0 0-.1 3.8A5.4 5.4 0 0 0 3 9.5c0 5 3 6.2 6 6.5a4.8 4.8 0 0 0-1 3.2v4" /></svg>);
const Twitter = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5 2.8 12 3 12c.5.2 1 .3 1.5.3C3 11 2.5 7 3 7c.5.7 1.2 1.2 2 1.3C3 5.5 4 2 4 2c2.6 3.2 6.5 5.3 10.5 5.5.3-2.6 2.1-4.5 4.8-4.5 1.5 0 2.9.6 3.9 1.7.9-.2 1.8-.7 2.6-1.1-.3 1-1 1.8-1.8 2.4.8-.1 1.6-.3 2.3-.6-.3.9-.9 1.7-1.5 2.3z" /></svg>);
const Instagram = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>);
const Linkedin = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>);


// ==========================================
// 1. HERO SLIDER DATA
// ==========================================
const heroSlides = [
  {
    id: 1,
    title: "Get Pixxel across all your devices or stay with full desktop power",
    laptopImg: "device.png",
    
  },
  {
    id: 2,
    title: "Edit seamlessly with AI tools designed for professional creators",
    laptopImg: "device1.png",
  },
  {
    id: 3,
    title: "Sync your workflow anywhere, anytime with Pixxel cloud engine",
    laptopImg: "device2.png",
    
  },
];

// ==========================================
// MEDIA QUOTES DATA
// ==========================================
const mediaQuotes = [
  {
    id: 1,
    logo: "COMPSMAG",
    text: "The photo editing software known as Pixxel OS is another programme that I have found to be quite useful. Because it offers sophisticated editing features tailored to my requirements, it has become my platform of choice for taking my photographs to the next level."
  },
  {
    id: 2,
    logo: "Macworld",
    text: "Pixxel OS isn't just an alternative; it's a neatly designed interface that uses advanced AI to make complex editing tasks simple. A must-have for anyone looking to experiment with different aesthetics effortlessly."
  },
  {
    id: 3,
    logo: "TechRadar",
    text: "With its incredible AI sky replacement and portrait enhancement tools, Pixxel OS is redefining what's possible in desktop and mobile photo editing. It is fast, intuitive, and remarkably powerful."
  },
  {
    id: 4,
    logo: "TechRadar",
    text: "With its incredible AI sky replacement and portrait enhancement tools, Pixxel OS is redefining what's possible in desktop and mobile photo editing. It is fast, intuitive, and remarkably powerful."
  },
  {
    id: 5,
    logo: "TechRadar",
    text: "With its incredible AI sky replacement and portrait enhancement tools, Pixxel OS is redefining what's possible in desktop and mobile photo editing. It is fast, intuitive, and remarkably powerful."
  },
  {
    id: 6,
    logo: "TechRadar",
    text: "With its incredible AI sky replacement and portrait enhancement tools, Pixxel OS is redefining what's possible in desktop and mobile photo editing. It is fast, intuitive, and remarkably powerful."
  }
];

export default function PixxelOSPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentQuote, setCurrentQuote] = useState(0);
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);

  // ==========================================
  // REAL-TIME REVIEWS (CONVEX BACKEND) 🌟
  // ==========================================
  // Limit 2 rakha hai taaki aapka original 2-column design bilkul kharab na ho
  const latestReviews = useQuery(api.reviews.getLatestReviews, { limit: 2 }) || [];
  
  const fallbackTestimonials = [
    { name: "Joseph Shiloh", role: "8 hours ago", title: "I had a product question", text: "I had a product question, which was answered the next day. The explanation was...", rating: 5 },
    { name: "Ratan Das", role: "11 hours ago", title: "Thanks to Pixxel and the team", text: "I have been using Pixxel OS for close to last 6 months. It's a great product a...", rating: 5 },
  ];
  
  // Data map kar rahe hain taaki agar backend mein review aaye, toh wo show ho jaye
  const testimonials = latestReviews.length > 0 
    ? latestReviews.map((review) => ({ 
        name: review.userName || "Anonymous", 
        role: "Recently", 
        title: review.title || "Amazing Experience", 
        text: review.comment, 
        rating: review.rating || 5 
      })) 
    : fallbackTestimonials;


  // Footer Backend State
  const sendMessage = useMutation(api.messages.sendMessage);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-scroll logic for Media Quotes (Every 4 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % mediaQuotes.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

  // Handle Contact Form Submit (Footer)
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) { toast.error("Please fill in all fields"); return; }
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
    <div className="min-h-screen bg-[#020104] text-white selection:bg-cyan-500/30 overflow-x-hidden relative font-sans">
      
      {/* ==========================================
          GLOWING BACKGROUND EFFECT
      ========================================== */}
      <div className="absolute top-0 left-0 right-0 h-[1000px] pointer-events-none z-0"
        style={{
          background: `radial-gradient(ellipse 70% 60% at 50% 42%, rgba(246, 244, 252, 0.06) 22%, rgba(212, 212, 212, 0.15) 35%, transparent 60%)`
        }}
      />
      <div className="absolute top-0 left-0 right-0 h-[1000px] pointer-events-none z-0"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse 100% 70% at 50% 0%, black 30%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 100% 70% at 50% 0%, black 30%, transparent 100%)",
        }}
      />
      <div className="absolute top-0 left-0 right-0 h-[800px] pointer-events-none overflow-hidden z-0">
        <div style={{ position:"absolute", top:"-5%", left:"50%", transform:"translateX(-50%)", width:"800px", height:"420px", background:"radial-gradient(ellipse at top, rgba(34,211,238,0.13) 0%, rgba(168,85,247,0.07) 55%, transparent 75%)" }} />
        <div style={{ position:"absolute", top:"8%", left:"-5%", width:"500px", height:"400px", background:"radial-gradient(ellipse, rgba(168,85,247,0.07) 0%, transparent 70%)" }} />
      </div>

      {/* ==========================================
          1. HEADER SECTION (Hero Slider)
      ========================================== */}
      <section className="relative w-full max-w-[1400px] mx-auto px-4 sm:px-12 mb-28 z-10 pt-32">
        <div className="text-center mb-10">
          
          <h1 className="text-3xl md:text-[42px] font-bold text-white tracking-tight drop-shadow-md">
            Edit photos effortlessly with <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 relative">AI-powered software</span>
          </h1>
        </div>

        <div className="relative flex items-center justify-center">
          {/* Left Arrow */}
          <button onClick={prevSlide} className="absolute left-[-20px] md:left-[-40px] z-20 w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:bg-white/10 hover:text-white transition-all">
            <ChevronLeft size={20} />
          </button>

          {/* MAIN GLASSMORPHISM CARD */}
          <div className="relative w-full h-[550px] bg-[#0a0a0a]/70 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden shadow-[0_0_80px_rgba(255,255,255,0.03)] flex flex-col lg:flex-row">
            
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
                className="w-full h-full flex flex-col lg:flex-row items-center"
              >
                {/* TEXT CONTENT (Left Side) */}
                <div className="w-full lg:w-[40%] p-10 lg:p-14 z-20 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="text-amber-500 text-2xl">✳</span>
                    <span className="text-white text-xl font-medium tracking-wide">
                      pixxel <span className="text-amber-500 font-normal">OS</span>
                    </span>
                  </div>
                  <h2 className="text-3xl lg:text-4xl font-bold leading-[1.2] mb-10">
                    {heroSlides[currentSlide].title}
                  </h2>
                  <div className="flex items-center gap-4">
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
                    <button className="bg-transparent border border-white/30 text-white px-7 py-3 rounded text-[13px] font-bold tracking-widest uppercase hover:bg-white/10 transition-colors">
                      Explore App
                    </button>
                  </div>
                </div>

                {/* IMAGES COMPOSITION (Right Side) */}
                <div className="relative w-full lg:w-[60%] h-full min-h-[300px]">
                  <div className="absolute right-13 top-1/2 -translate-y-1/2 w-[85%] lg:w-[70%] aspect-ratio ">
                    <img src={heroSlides[currentSlide].laptopImg} alt="Pixxel OS AI photo editor interface on laptop" className="w-full h-full object-cover opacity-90" />
                  </div>
                  
                </div>
              </motion.div>
            </AnimatePresence>

          </div>

          {/* Right Arrow */}
          <button onClick={nextSlide} className="absolute right-[-20px] md:right-[-40px] z-20 w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:bg-white/10 hover:text-white transition-all">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Bottom Trusted Logos */}
        <div className="mt-12 flex flex-col md:flex-row justify-between items-center px-4 md:px-10  pt-8">
           <div className="flex items-center gap-6 mb-6 md:mb-0">
             <div className="flex -space-x-4">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" className="w-12 h-12 rounded-full border-2 border-black" alt="User" />
                <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop" className="w-12 h-12 rounded-full border-2 border-black" alt="User" />
                <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop" className="w-12 h-12 rounded-full border-2 border-black" alt="User" />
             </div>
             <div>
               <p className="text-xl font-bold text-white">Trusted by over a million</p>
               <p className="text-[#a1a1aa] text-sm">photographers and organizations</p>
             </div>
           </div>
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 bg-[#0a0a0a] p-3 rounded-lg border border-white/10">
                 <Star className="text-red-500 fill-red-500 w-6 h-6" />
                 <span className="text-xs font-bold uppercase text-white/80 w-24">Red Dot Winner Interface Design</span>
              </div>
              <div>
               <p className="text-xl font-bold text-white">Award-winning software</p>
               <p className="text-[#a1a1aa] text-sm">with intuitive AI-powered controls</p>
             </div>
           </div>
        </div>
      </section>

      {/* ==========================================
          2. OUR PRODUCTS SECTION
      ========================================== */}
      <section className="w-full max-w-[1200px] mx-auto px-4 py-20  relative z-10 bg-[#020104]">
        <div className="text-center mb-14">
          <p className="text-[10px] text-zinc-500 font-black tracking-[0.2em] uppercase mb-4">Our Products</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">Amazing apps to Photography software</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-8 flex flex-col hover:border-white/20 transition-all duration-300">
            <span className="text-amber-500 text-4xl mb-6">✳</span>
            <h3 className="text-2xl font-bold text-white mb-3">Pixxel OS</h3>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-white text-sm font-medium">Excellent</span>
              <span className="text-zinc-400 text-sm">4.6 out of 5</span>
              <span className="flex text-green-500 text-sm items-center gap-1"><Star className="w-3 h-3 fill-green-500"/> Trustpilot</span>
            </div>
            <p className="text-[#a1a1aa] text-[15px] font-light leading-relaxed mb-10 flex-1">
              Pixxel OS is easy-to-use photo editing software that empowers photography lovers.
            </p>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-3 w-full">
              <Link href="/pricing" className="flex-1">
                <button
                  className="w-full font-extrabold uppercase tracking-[0.1em] transition-all duration-300  active:scale-95"
                  style={{
                    background: "linear-gradient(90deg, #22d3ee 0%, #a855f7 100%)",
                    color: "#000000",
                    fontSize: "11px",
                    padding: "13px 20px",
                    borderRadius: "4px",
                    boxShadow:
                      "0 6px 28px rgba(13, 78, 88, 0.14), 0 2px 8px rgba(168,85,247,0.2)",
                    letterSpacing: "0.1em",
                  }}
                >
                  VIEW PLANS
                </button>
              </Link>

              <button className="flex-1 bg-transparent border border-white/30 text-white px-2 py-3 rounded text-[11px] font-bold tracking-widest uppercase hover:bg-white/10 transition-colors">
                Explore App
              </button>
            </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-8 flex flex-col hover:border-white/20 transition-all duration-300">
            <span className="text-cyan-400 text-4xl mb-6">✶</span>
            <h3 className="text-2xl font-bold text-white mb-3">Aperty</h3>
            <p className="text-white text-sm mb-6">Next-gen AI retouching software, just released</p>
            <p className="text-[#a1a1aa] text-[15px] font-light leading-relaxed mb-10 flex-1">
              Aperty is the ideal photo editing solution for professional portrait photographers seeking to streamline their workflow.
            </p>
            <div className="flex items-center gap-3 w-full">
          <Link href="/pricing" className="flex-1">
            <button
              className="w-full font-extrabold uppercase tracking-[0.1em] transition-all duration-300  active:scale-95"
              style={{
                background: "linear-gradient(90deg, #22d3ee 0%, #a855f7 100%)",
                color: "#000000",
                fontSize: "11px",
                padding: "13px 20px",
                borderRadius: "4px",
                boxShadow:
                  "0 6px 28px rgba(13, 78, 88, 0.14), 0 2px 8px rgba(168,85,247,0.2)",
                letterSpacing: "0.1em",
              }}
            >
              VIEW PLANS
            </button>
          </Link>

          <button className="flex-1 bg-transparent border border-white/30 text-white px-2 py-3 rounded text-[11px] font-bold tracking-widest uppercase hover:bg-white/10 transition-colors">
            Explore App
          </button>
        </div>
          </div>

          {/* Card 3 */}
          <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-8 flex flex-col hover:border-white/20 transition-all duration-300">
            <span className="text-amber-500 text-4xl mb-6">✳</span>
            <h3 className="text-2xl font-bold text-white mb-3">Pixxel Mobile</h3>
            <div className="flex items-center gap-2 mb-6 text-sm text-zinc-400">
              <span>4.8 out of 5 | Apple Store | Play Store</span>
            </div>
            <p className="text-[#a1a1aa] text-[15px] font-light leading-relaxed mb-10 flex-1">
              Say hello to endless editing power with Pixxel for Mobile — edit photos on your iPhone, iPad, Android, or ChromeOS with just a few taps.
            </p>
            <div className="flex items-center gap-3">
              <Link href="/pricing" className="flex-1">
                <button
                  className="w-full font-extrabold uppercase tracking-[0.1em] transition-all duration-300  active:scale-95"
                  style={{
                    background: "linear-gradient(90deg, #22d3ee 0%, #a855f7 100%)",
                    color: "#000000",
                    fontSize: "11px",
                    padding: "13px 20px",
                    borderRadius: "4px",
                    boxShadow:
                      "0 6px 28px rgba(13, 78, 88, 0.14), 0 2px 8px rgba(168,85,247,0.2)",
                    letterSpacing: "0.1em",
                  }}
                >
                  VIEW PLANS
                </button>
              </Link>

              <button className="flex-1 bg-transparent border border-white/30 text-white px-2 py-3 rounded text-[11px] font-bold tracking-widest uppercase hover:bg-white/10 transition-colors">
                Explore App
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          3. MARKETPLACE SECTION
      ========================================== */}
      <section className="w-full max-w-[1200px] mx-auto px-4 py-20  relative z-10 bg-[#020104]">
        <div className="text-center mb-12">
          <p className="text-[10px] text-zinc-500 font-black tracking-[0.2em] uppercase mb-4">Marketplace</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">800+ editing add-ons to <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 relative">Inspire Your Creativity</span></h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {[
            { img: "https://images.unsplash.com/photo-1542224566-6e85f2e6772f?q=80&w=600&auto=format&fit=crop", title: "Forest Photography Masterclass", tag: "Course", author: "Max Rive" },
            { img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop", title: "Landscape Photography: from Gear to Editing", tag: "Course", author: "Armand Sarlangue" },
            { img: "https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=600&auto=format&fit=crop", title: "The Ultimate Guide for Beginners in Photo editing", tag: "Course", author: "Team Skylum" },
            { img: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=600&auto=format&fit=crop", title: "The Pixxel OS Handbook", tag: "E-book", author: "Nicole S. Young" }
          ].map((item, idx) => (
            <div key={idx} className="relative aspect-[4/5] rounded-2xl overflow-hidden group cursor-pointer border border-white/10">
               <div className="absolute inset-0 bg-black/20 z-10 transition-all duration-300 group-hover:bg-black/0"></div>
               <img src={item.img} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-20"></div>
               <div className="absolute bottom-0 left-0 p-6 z-30">
                  <h4 className="text-white font-bold text-[15px] mb-3 leading-snug">{item.title}</h4>
                  <div className="flex items-center gap-2">
                    <span className="bg-white/20 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">{item.tag}</span>
                    <span className="text-zinc-400 text-[11px]">by {item.author}</span>
                  </div>
               </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          <Link href="/pricing">
          <button
            className="font-extrabold uppercase tracking-[0.2em] transition-all duration-300 hover:-translate-y-[2px] active:scale-95"
            style={{
              background: "linear-gradient(90deg, #22d3ee 0%, #a855f7 100%)",
              color: "#000000",
              fontSize: "12px",
              padding: "12px 80px",
              borderRadius: "4px",
              boxShadow: "0 6px 28px rgba(13, 78, 88, 0.14), 0 2px 8px rgba(168,85,247,0.2)",
              letterSpacing: "0.1em",
            }}
          >
            VisitMarketplace
          </button>
        </Link>
        </div>
      </section>

      {/* ==========================================
          4. WHAT THE MEDIA IS SAYING
      ========================================== */}
      <section className="w-full py-24  bg-[#030303] overflow-hidden relative z-10">
        <div className="text-center mb-12">
          <p className="text-[10px] text-zinc-500 font-black tracking-[0.2em] uppercase mb-4">Quotes</p>
          <h4 className="text-3xl md:text-4xl font-bold text-white">What the media is<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 relative"> saying About us</span></h4>
        </div>

        <div className="relative w-full max-w-[900px] mx-auto h-[350px] flex items-center justify-center">
           <AnimatePresence mode="wait">
             <motion.div
               key={currentQuote}
               initial={{ opacity: 0, x: 50 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -50 }}
               transition={{ duration: 0.6, ease: "easeInOut" }}
               className="absolute w-full px-6"
             >
               <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-10 md:p-14 shadow-2xl relative">
                  <div className="flex justify-between items-center mb-8">
                     <h3 className="text-2xl font-black tracking-tight text-white">{mediaQuotes[currentQuote].logo}</h3>
                     <button className="w-8 h-8 rounded bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                       <ArrowUpRight size={16} className="text-white"/>
                     </button>
                  </div>
                  <p className="text-lg md:text-xl font-light text-[#a1a1aa] leading-relaxed">
                    "{mediaQuotes[currentQuote].text}"
                  </p>
               </div>
             </motion.div>
           </AnimatePresence>
        </div>

        <div className="flex justify-center items-center gap-2 mt-4">
          {mediaQuotes.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentQuote(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentQuote ? 'w-8 bg-white' : 'w-2 bg-white/20'}`}
            />
          ))}
        </div>
      </section>

      {/* ==========================================
          5. FEEDBACK SECTION (WITH CONVEX REVIEWS) 🌟
      ========================================== */}
      <section className="w-full max-w-[1200px] mx-auto px-4 py-24  relative z-10 bg-[#020104]">
        <div className="text-center mb-16">
          <p className="text-[10px] text-zinc-500 font-black tracking-[0.2em] uppercase mb-4">Feedback</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">Trusted by <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 relative">Our users</span></h2>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
           
           {/* Trustpilot Score Block (Stays exactly the same) */}
           <div className="flex flex-col items-center">
             <h3 className="text-xl font-bold mb-2">Excellent</h3>
             <div className="flex gap-1 mb-2">
                {[1,2,3,4,5].map(i => <div key={i} className="w-8 h-8 bg-green-500 flex items-center justify-center text-white font-bold">★</div>)}
             </div>
             <p className="text-xs text-zinc-400 mb-1">Based on <span className="underline cursor-pointer">6,591 reviews</span></p>
             <div className="flex items-center gap-1 font-bold text-lg"><Star className="fill-green-500 text-green-500 w-5 h-5"/> Trustpilot</div>
           </div>

           {/* 🌟 Dynamic Mapping of Reviews from Backend 🌟 */}
           {testimonials.map((testimonial, idx) => (
             <div key={idx} className="flex-1 bg-transparent border-l border-white/10 pl-6">
                <div className="flex gap-1 mb-3 text-green-500 text-sm">
                  {[...Array(testimonial.rating)].map((_, i) => <span key={i}>★</span>)}
                </div>
                <h4 className="font-bold text-white mb-2 line-clamp-1">{testimonial.title}</h4>
                <p className="text-[#a1a1aa] text-sm mb-4 leading-relaxed line-clamp-3">
                  {testimonial.text}
                </p>
                <p className="text-xs text-zinc-500">
                  <strong className="text-white/80">{testimonial.name}</strong>, {testimonial.role}
                </p>
             </div>
           ))}

        </div>
      </section>

      {/* ==========================================
          6. COMPANY STATS (BENTO BOX) 
      ========================================== */}
      <section className="w-full py-28 bg-[#000000] relative z-10 overflow-hidden flex justify-center">
        
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-r from-cyan-400/20 to-purple-500/20 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="w-full max-w-[1100px] px-4 relative z-10">
          
          <div className="text-center mb-16">
            <p className="text-[10px] text-zinc-500 font-bold tracking-[0.25em] uppercase mb-4">
              Our Company
            </p>
            <h2 className="text-3xl md:text-[38px] font-semibold text-white tracking-tight">
              Pixxel numbers that matter
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 md:gap-5">
            
            <div className="col-span-1 md:col-span-3 bg-[#0d0d0d] rounded-[24px] p-10 lg:p-14 flex flex-col justify-center items-start text-left h-[280px] hover:bg-[#121212] transition-colors duration-300">
              <h3 className="text-[85px] lg:text-[110px] font-bold text-white leading-[1] mb-2 tracking-tighter">
                12
              </h3>
              <p className="text-white/90 text-[16px] lg:text-[17px] font-medium leading-snug">
                successfully launched photo-<br/>editing products
              </p>
            </div>
            
            <div className="col-span-1 md:col-span-3 bg-[#0d0d0d] rounded-[24px] p-10 lg:p-14 flex flex-col justify-center items-start text-left h-[280px] hover:bg-[#121212] transition-colors duration-300">
              <h3 className="text-[85px] lg:text-[110px] font-bold text-white leading-[1] mb-2 tracking-tighter">
                100+
              </h3>
              <p className="text-white/90 text-[16px] lg:text-[17px] font-medium leading-snug">
                professionals in the team united<br/>by common goals
              </p>
            </div>
            
            <div className="col-span-1 md:col-span-2 bg-[#0d0d0d] rounded-[24px] p-8 lg:p-10 flex flex-col justify-center items-start text-left h-[240px] hover:bg-[#121212] transition-colors duration-300">
              <h3 className="text-[75px] lg:text-[90px] font-bold text-white leading-[1] mb-2 tracking-tighter">
                16
              </h3>
              <p className="text-white/90 text-[16px] font-medium">
                years in business
              </p>
            </div>
            
            <div className="col-span-1 md:col-span-2 bg-[#0d0d0d] rounded-[24px] p-8 lg:p-10 flex flex-col justify-center items-start text-left h-[240px] hover:bg-[#121212] transition-colors duration-300">
              <h3 className="text-[75px] lg:text-[90px] font-bold text-white leading-[1] mb-2 tracking-tighter">
                200+
              </h3>
              <p className="text-white/90 text-[16px] font-medium">
                markets trust us
              </p>
            </div>
            
            <div className="col-span-1 md:col-span-2 bg-[#0d0d0d] rounded-[24px] p-8 lg:p-10 flex flex-col justify-center items-start text-left h-[240px] hover:bg-[#121212] transition-colors duration-300">
              <h3 className="text-[75px] lg:text-[90px] font-bold text-white leading-[1] mb-2 tracking-tighter">
                1M+
              </h3>
              <p className="text-white/90 text-[16px] font-medium">
                customers
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ==========================================
          7. LATEST NEWS AND UPDATES
      ========================================== */}
      <section className="w-full max-w-[1200px] mx-auto px-4 py-24  relative z-10 bg-[#050505]">
        <div className="text-center mb-14">
          <p className="text-[10px] text-zinc-500 font-black tracking-[0.2em] uppercase mb-4">Latest News and Updates</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">Explore our recent <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 relative">Innovations and Advances</span></h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
           <div className="lg:col-span-2 relative aspect-[4/3] lg:aspect-auto lg:h-[500px] rounded-3xl overflow-hidden group border border-white/10 cursor-pointer">
              <img src="glowing.jpg" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="News 1" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 w-full p-8 flex items-end justify-between z-20">
                 <h3 className="text-2xl md:text-3xl font-bold text-white max-w-lg leading-tight">
                   Pixxel introduces an Effortless Portrait Toolkit and New Universal Bokeh AI
                 </h3>
                 <button className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-black hover:bg-gray-200 transition-colors shrink-0">
                   <ArrowUpRight size={24} />
                 </button>
              </div>
           </div>
           <div className="lg:col-span-1 flex flex-col gap-6 h-[500px]">
              <div className="flex-1 relative rounded-3xl overflow-hidden group border border-white/10 cursor-pointer">
                 <img src="device3.jpg" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="News 2" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20"></div>
                 <div className="absolute inset-0 p-8 flex flex-col justify-end z-20">
                    <h3 className="text-4xl font-bold text-white mb-2">Best of<br/>2025</h3>
                    <div className="flex items-end justify-between w-full">
                       <p className="text-white text-sm font-medium w-[70%]">Best Cross-device App That Works Seamlessly</p>
                       <button className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-black hover:bg-gray-200 transition-colors">
                         <ArrowUpRight size={20} />
                       </button>
                    </div>
                 </div>
              </div>
              <div className="flex-1 relative rounded-3xl overflow-hidden group border border-white/10 cursor-pointer bg-[#0a0a0a]">
                 <img src="device4.jpg" className="w-full h-full object-cover opacity-50 transition-transform duration-700 group-hover:scale-105" alt="News 3" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                 <div className="absolute inset-0 p-8 flex flex-col items-center justify-center z-20 text-center">
                    <span className="text-amber-500 mb-2">✳ pixxel</span>
                    <p className="text-white text-sm font-medium mb-6">Pixxel is now available on Android and ChromeOS</p>
                 </div>
                 <div className="absolute bottom-6 left-8 right-6 flex items-end justify-between z-20">
                     <p className="text-white text-sm font-bold w-[70%] leading-snug">Skylum Partners with Google to Expand Pixxel Photo Editing to Android and ChromeOS</p>
                     <button className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-black hover:bg-gray-200 transition-colors">
                       <ArrowUpRight size={20} />
                     </button>
                 </div>
              </div>
           </div>
        </div>

        <div className="flex justify-center">
          <Link href="/pricing">
          <button
            className="font-extrabold uppercase tracking-[0.2em] transition-all duration-300 hover:-translate-y-[2px] active:scale-95"
            style={{
              background: "linear-gradient(90deg, #22d3ee 0%, #a855f7 100%)",
              color: "#000000",
              fontSize: "12px",
              padding: "12px 80px",
              borderRadius: "4px",
              boxShadow: "0 6px 28px rgba(13, 78, 88, 0.14), 0 2px 8px rgba(168,85,247,0.2)",
              letterSpacing: "0.1em",
            }}
          >
            View All News
          </button>
        </Link>
        </div>
      </section>

      {/* ==========================================
          8. BACKEND CONNECTED FOOTER 
      ========================================== */}
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
                 <Input placeholder="Ident" value={contactForm.name} onChange={(e) => setContactForm(p => ({ ...p, name: e.target.value }))} className="bg-[#0a0a0a] border-white/10 text-white rounded-xl h-12 text-[14px] flex-1 focus-visible:ring-1 focus-visible:ring-amber-500" required />
                 <Input type="email" placeholder="Terminal@mail.com" value={contactForm.email} onChange={(e) => setContactForm(p => ({ ...p, email: e.target.value }))} className="bg-[#0a0a0a] border-white/10 text-white rounded-xl h-12 text-[14px] flex-[1.5] focus-visible:ring-1 focus-visible:ring-amber-500" required />
              </div>
              <textarea placeholder="Diagnostic data query..." value={contactForm.message} onChange={(e) => setContactForm(p => ({ ...p, message: e.target.value }))} className="w-full bg-[#0a0a0a] border border-white/10 text-white rounded-xl px-4 py-4 text-[14px] min-h-[90px] resize-none focus:outline-none focus:border-amber-500/50 transition-colors shadow-inner custom-scrollbar" required />
              <Button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-cyan-400 to-purple-500 hover:bg-amber-500 text-white hover:text-black font-extrabold tracking-widest uppercase text-[11px] h-12 rounded-xl transition-all shadow-[inset_0_2px_5px_rgba(255,255,255,0.05)] border-[1px] border-white/10">{isSubmitting ? "TRANSMITTING..." : "OPEN TICKET PROTOCOL"}</Button>
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