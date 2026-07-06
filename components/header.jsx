"use client";

import React, { useState, useEffect } from "react";
import { LayoutDashboard, Menu, X, ChevronRight, ChevronDown, User } from "lucide-react";
import Link from "next/link";
// Original Auth Buttons Restored
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs"; 
import { useStoreUser } from "@/hooks/use-store-user";
import { Authenticated, Unauthenticated } from "convex/react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "framer-motion";

// 🌟 MOBILE MENU GROUPS (Naye Navbar se add kiya gaya for Mobile View)
const mobileNavGroups = [
  {
    title: "Features",
    links: [
      { label: "Bokeh AI", href: "/bokeh", badge: "NEW" },
      { label: "Sky AI", href: "/sky" },
      { label: "Face AI", href: "/face", badge: "NEW" },
      { label: "Structure AI", href: "/features/structure" },
      { label: "Skin AI", href: "/skin", badge: "NEW" },
      { label: "Enhance AI", href: "/features/enhance" },
      { label: "GenErase", href: "/features/erase" },
    ],
  },
  {
    title: "Use Cases",
    links: [
      { label: "Landscape Photography", href: "/landscape" },
      { label: "Wildlife Photography", href: "/wildlife" },
      { label: "Family Photography", href: "/family" },
      { label: "E-Com Photography", href: "/ecommerce" },
    ],
  },
  {
    title: "Pro Tools",
    links: [
      { label: "Upscale AI", href: "/pro/upscale" },
      { label: "Background Removal", href: "/background" },
      { label: "HDR Merge", href: "/hdr" },
    ],
  },
];

export default function Header() {
  const { isLoading } = useStoreUser();
  const path = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // 🌟 NAYA STATE: Header hide karne ke liye
  const [isHidden, setIsHidden] = useState(false);

  // Scroll detection (Aapka original logic)
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      // 1. Agar thoda sa scroll kiya toh Glass effect add karo
      setIsScrolled(scrollY > 20);

      // 2. 🌟 Agar 2 sections (approx window height ka 1.4x ya 140vh) se zyada scroll kiya toh Header HIDE kardo
      const firstSectionThreshold = Math.max(420, window.innerHeight * 0.82);
      setIsHidden(scrollY > firstSectionThreshold);
    };
    
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 🌟 Mobile menu open hone par background scroll lock karein
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  if (path.includes("/editor")) {
    return null; // Hide header completely on editor page
  }
  
  // Desktop Nav Links (Aapka original)
  const navLinks = [
    { href: "/Pixxel", label: "Pixxel' OS" },
    { href: "/#Pixxel for Mobile", label: "Pixxel for Mobile" },
    { href: "/#Marketplace", label: "Marketplace" },
    { href: "/pixxel-os", label: "Blog" },
    { href: "/demo", label: "Aperty" },
    { href: "/#More", label: "More", hasDropdown: true },
  ];

  // LOGIC: Check if we are NOT on the dashboard page
  const hiddenPages = ["/dashboard", "/sign-in", "/sign-up"];
  const showCenterLinks = !hiddenPages.some(hiddenPath => path.startsWith(hiddenPath));

  return (
    <>
      {/* ========================================== */}
      {/* 🌟 DESKTOP HEADER (BINA KISI CHANGE KE 100% SAME) */}
      {/* ========================================== */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: isHidden ? -100 : 0 }} 
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-colors duration-300 ${
          isScrolled
            ? "bg-[#050505]/100 backdrop-blur-xl "
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="w-full px-6 sm:px-8 h-[60px] relative flex items-center justify-between">
          
          {/* 1. LEFT: LOGO */}
          <div className="flex-1 flex justify-start">
            <Link href="/" className="flex-shrink-0 flex items-center gap-2 group">
              <div className="relative transition-transform duration-300 ">
                <Image
                  src="/logo-text.png"
                  alt="Pixxel Logo"
                  className="h-30 sm:h-32 w-auto object-contain"
                  width={200}
                  height={80}
                  priority
                />
              </div>
            </Link>
          </div>

          {/* 2. CENTER: DESKTOP NAVIGATION */}
          {showCenterLinks && (
            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <nav className="flex items-center gap-7 lg:gap-9">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group flex items-center gap-1.5 text-[15px] font-normal text-[#a1a1aa] hover:text-white transition-colors duration-200 tracking-wide"
                  >
                    {link.label}
                    {link.hasDropdown && (
                      <ChevronDown className="w-3.5 h-3.5 opacity-80 group-hover:opacity-100 transition-opacity" />
                    )}
                  </Link>
                ))}
              </nav>
            </div>
          )}

          {/* 3. RIGHT: AUTH ACTIONS & DASHBOARD BUTTON */}
          <div className="flex-1 flex justify-end items-center gap-4">
            <Authenticated>
              {showCenterLinks && (
                <Link href="/dashboard" className="hidden sm:block mr-2">
                  <Button variant="ghost" className="text-[15px] font-medium text-zinc-300 hover:text-white hover:bg-white/5 rounded-md h-9">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
              )}

              <div className="relative hover:scale-105 transition-transform duration-300">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8 rounded-full border border-white/20",
                      userButtonPopoverCard: "shadow-2xl backdrop-blur-2xl bg-[#0a0a0a]/95 border border-white/10 text-white",
                      userPreviewMainIdentifier: "font-semibold text-white",
                      userPreviewSecondaryIdentifier: "text-zinc-400",
                    },
                  }}
                  afterSignOutUrl="/"
                />
              </div>
            </Authenticated>

            <Unauthenticated>
              <SignInButton>
                <button className="hidden sm:flex items-center gap-1 text-[15px] font-medium text-[#a1a1aa] hover:text-white transition-colors duration-200 px-1">
                  <User className="w-4 h-4" />
                  Log In
                </button>
              </SignInButton>

              <div className="hidden sm:block w-[1px] h-4 bg-white/20 mx-2"></div>

              <SignUpButton>
                <Button className="hidden sm:flex bg-white text-black hover:bg-zinc-200 rounded text-[15px] font-semibold h-8 px-5 transition-all duration-200">
                  Get Started
                </Button>
              </SignUpButton>
            </Unauthenticated>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-zinc-300 hover:text-white transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>

        </div>

        {/* Dynamic Top Loading Bar */}
        {isLoading && (
          <div className="absolute bottom-0 left-0 w-full h-[1px] overflow-hidden">
            <div className="h-full bg-white/40 w-1/3 animate-[loading_1.5s_ease-in-out_infinite]" 
                 style={{ animationName: 'progress' }} />
          </div>
        )}
      </motion.header>

      {/* ========================================== */}
      {/* 🌟 4. MOBILE FULLSCREEN MENU (NAYA PREMIUM DESIGN) */}
      {/* ========================================== */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              key="mobile-menu-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm md:hidden"
            />
            
            <motion.div
              key="mobile-menu-drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
              className="fixed top-0 right-0 bottom-0 w-[min(360px,88vw)] max-w-sm z-[101] bg-[#0a0a0f] border-l border-white/10 shadow-[-30px_0_80px_rgba(0,0,0,0.8)] flex flex-col md:hidden"
              role="dialog"
              aria-label="Navigation menu"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/[0.07]">
                <span className="font-black text-xl tracking-tighter text-white">
                  Pixxel <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">OS.</span>
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center w-9 h-9 rounded-xl border border-white/10 bg-white/5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white active:scale-95"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Links */}
              <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-6 overscroll-contain">
                <div className="flex flex-col gap-2 mb-8">
                  {showCenterLinks && navLinks.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between rounded-xl px-4 py-3.5 text-[15px] font-semibold text-white bg-white/[0.03] border border-white/[0.05] transition-colors hover:bg-white/[0.08]"
                    >
                      {item.label}
                      <ChevronRight size={15} className="text-slate-500" />
                    </Link>
                  ))}
                </div>

                {/* Render Mega Menu Groups for Mobile */}
                {mobileNavGroups.map((group) => (
                  <div key={group.title} className="mb-6">
                    <h4 className="text-[10px] text-zinc-500 font-bold tracking-[0.18em] uppercase border-b border-white/10 pb-2.5 mb-2 px-1">
                      {group.title}
                    </h4>
                    <div className="flex flex-col">
                      {group.links.map((link) => (
                        <Link
                          key={link.label}
                          href={link.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center rounded-lg px-3 py-3 text-[14px] text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white"
                        >
                          {link.label}
                          {link.badge && (
                            <span className="ml-2 px-1.5 py-[2px] text-black text-[9px] font-black rounded-sm bg-gradient-to-r from-cyan-400 to-purple-500">
                              {link.badge}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Drawer Footer: Auth Actions (Aapka Clerk Login) */}
              <div className="px-5 py-4 border-t border-white/[0.07] bg-[#0c0c12] flex flex-col gap-3">
                <Authenticated>
                  {showCenterLinks && (
                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white h-12 rounded-lg font-medium transition-colors border border-white/5">
                        <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
                      </Button>
                    </Link>
                  )}
                </Authenticated>

                <Unauthenticated>
                  <SignInButton>
                    <button className="flex items-center justify-center gap-2 w-full text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-colors h-11 rounded-lg font-medium" onClick={() => setMobileMenuOpen(false)}>
                      <User className="w-4 h-4" /> Log In
                    </button>
                  </SignInButton>
                  
                  <SignUpButton>
                    <Button className="w-full bg-white text-black hover:bg-zinc-200 h-11 rounded-lg font-bold transition-all" onClick={() => setMobileMenuOpen(false)}>
                      Get Started for Free
                    </Button>
                  </SignUpButton>
                </Unauthenticated>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}} />
    </>
  );
}