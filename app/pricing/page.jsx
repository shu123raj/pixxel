"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ChevronDown, 
  ChevronUp, 
  Check, 
  X, 
  Monitor, 
  Smartphone, 
  Apple, 
  Layers, 
  Zap, 
  Sparkles, 
  ShieldCheck, 
  HelpCircle,
  ArrowRight,
  Info
} from "lucide-react";

// ==========================================
// SOCIAL ICONS (For Footer)
// ==========================================
const Github = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-6.5a5.4 5.4 0 0 0-1.5-3.8 5.3 5.3 0 0 0-.1-3.8s-1.2-.4-3.9 1.4a13.3 13.3 0 0 0-7 0C6.2 1.5 5 1.9 5 1.9a5.3 5.3 0 0 0-.1 3.8A5.4 5.4 0 0 0 3 9.5c0 5 3 6.2 6 6.5a4.8 4.8 0 0 0-1 3.2v4" /></svg>);
const Twitter = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5 2.8 12 3 12c.5.2 1 .3 1.5.3C3 11 2.5 7 3 7c.5.7 1.2 1.2 2 1.3C3 5.5 4 2 4 2c2.6 3.2 6.5 5.3 10.5 5.5.3-2.6 2.1-4.5 4.8-4.5 1.5 0 2.9.6 3.9 1.7.9-.2 1.8-.7 2.6-1.1-.3 1-1 1.8-1.8 2.4.8-.1 1.6-.3 2.3-.6-.3.9-.9 1.7-1.5 2.3z" /></svg>);
const Instagram = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>);
const Linkedin = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>);

// --- CUSTOM COMPONENTS ---

const GradientText = ({ children, className = "" }) => (
  <span className={`text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 ${className}`}>
    {children}
  </span>
);

const PricingCard = ({ plan, isMostPopular }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`relative flex flex-col rounded-[2rem] p-[1.5px] transition-all duration-500 h-fit
      ${isMostPopular ? 'bg-gradient-to-b from-amber-400 to-amber-600 scale-105 z-10 shadow-[0_20px_50px_rgba(251,188,5,0.2)]' : 'bg-white/10 hover:bg-white/20'}`}>
      
      {isMostPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[10px] font-black px-4 py-1.5 rounded-full tracking-widest uppercase">
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
          ${isMostPopular ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20' : 'bg-transparent border border-white/20 text-white hover:bg-white/5'}`}>
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

// --- DATA ---

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

const faqs = [
  { question: "What is the difference between Pixxel OS plans?", answer: "Our plans range from desktop-only to full cross-device capability with mobile access and our premium creative library." },
  { question: "Can I start editing on one device and finish on another?", answer: "Yes! With our Cross-device and Max licenses, your projects are synced across all platforms seamlessly." },
  { question: "How will I access the Generative tools or new upgrades after a year?", answer: "Perpetual licenses include core AI tools. Major new generative models may require a small upgrade fee or are included in the Max subscription." },
  { question: "What payment methods are available?", answer: "We accept all major credit cards, PayPal, Amazon Pay, and various regional payment methods." }
];

// --- MAIN PAGE COMPONENT ---

export default function PricingPage() {
  const [openFAQ, setOpenFAQ] = useState(null);

  // Footer Backend Form State (Convex)
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
    <div className="min-h-screen bg-[#000] text-slate-200 selection:bg-cyan-500/30 overflow-x-hidden pt-32">
      
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        
        {/* Header Section */}
        <div className="text-center mb-20">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black mb-6 tracking-tight"
          >
            <GradientText>Lifetime editing</GradientText> made flexible!
          </motion.h1>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-xl md:text-3xl font-bold text-white/90 mb-10"
          >
            Choose the Pixxel OS plan that works for you
          </motion.h2>
          
          <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-2 rounded-lg backdrop-blur-md">
             <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Your special 10% discount expires in</span>
             <span className="text-amber-500 font-bold text-sm">3:00</span>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32 items-start">
          {plans.map((plan, idx) => (
            <PricingCard key={idx} plan={plan} isMostPopular={idx === 1} />
          ))}
        </div>

        {/* Support Section */}
        <div className="mb-32">
          <div className="bg-gradient-to-r from-cyan-400/20 to-purple-500/20 rounded-[2.5rem] p-[1.5px]">
            <div className="bg-[#08080a] rounded-[2.4rem] py-12 px-8 flex flex-col md:flex-row items-center justify-around gap-10">
              <h2 className="text-2xl md:text-3xl font-black text-white">Reliable support, trusted by our users</h2>
              <div className="flex flex-wrap justify-center gap-8 md:gap-16">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500"><HelpCircle size={20}/></div>
                  <span className="text-sm font-bold border-b border-white/20 pb-1 cursor-pointer hover:text-white">24/7 Chat support</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-500"><Zap size={20}/></div>
                  <span className="text-sm font-bold">Technical assistance</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500"><Sparkles size={20}/></div>
                  <span className="text-sm font-bold">9/10 Satisfaction rate</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Standalone Section */}
        <div className="text-center mb-32">
          <h2 className="text-3xl font-bold text-white mb-16">Works as both a standalone or plug-in</h2>
          <div className="flex flex-wrap justify-center gap-6">
            {[
              { label: "Standalone app for macOS", icon: Apple },
              { label: "Standalone app for Windows", icon: Monitor },
              { label: "Adobe Photoshop Plugin", icon: Layers },
              { label: "Adobe Lightroom Plugin", icon: Layers },
              { label: "Photos for macOS Extension", icon: Sparkles }
            ].map((item, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-4 hover:bg-white/10 transition-all cursor-default">
                <div className="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center text-slate-400">
                  <item.icon size={20} />
                </div>
                <span className="text-xs font-bold text-slate-300 text-left max-w-[120px]">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Award Section */}
        <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-12 mb-32 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-md text-center md:text-left">
            <h2 className="text-3xl font-bold text-white mb-4">Award-winning product</h2>
            <p className="text-slate-500 text-sm md:text-base font-light leading-relaxed">
              Pixxel OS is designed to be convenient for people with different proficiency levels. Complicated multistep tasks are automated with intuitive AI-powered controls.
            </p>
          </div>
          <div className="flex gap-8 items-center flex-wrap justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-red-600 rounded-full blur-[20px] absolute opacity-20" />
              <Zap size={40} className="text-red-500 relative z-10" />
              <div className="text-[10px] font-black uppercase tracking-tighter text-center">reddot winner 2024<br/>interface design</div>
            </div>
            <div className="h-20 w-[1px] bg-white/10 hidden md:block" />
            <div className="flex gap-4">
              <div className="w-20 h-28 border border-white/20 rounded-md flex flex-col items-center justify-center p-2 text-center">
                <span className="text-[10px] font-bold">TIPA WORLD AWARDS</span>
                <span className="text-xl font-black mt-2">2024</span>
              </div>
              <div className="w-20 h-28 border border-white/20 rounded-md flex flex-col items-center justify-center p-2 text-center">
                <span className="text-[10px] font-bold">TIPA WORLD AWARDS</span>
                <span className="text-xl font-black mt-2">2023</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================
          2. FREQUENTLY ASKED QUESTIONS SECTION (From Sky Page)
          ========================================== */}
      <section className="py-24 bg-[#050505] relative overflow-hidden ">
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
              platform, pricing plans, and workflow features.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
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

      {/* ==========================================
          3. FOOTER SECTION (With Backend Logic from Sky Page)
          ========================================== */}
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

        <div className="mt-20 pt-4  flex flex-col md:flex-row items-center justify-between gap-6 text-[13px] font-medium text-slate-600">
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