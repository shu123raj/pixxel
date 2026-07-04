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

export default function Header() {
  const { isLoading } = useStoreUser();
  const path = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // 🌟 NAYA STATE: Header hide karne ke liye
  const [isHidden, setIsHidden] = useState(false);

  // Scroll detection
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

  if (path.includes("/editor")) {
    return null; // Hide header completely on editor page
  }
  
  const navLinks = [
    { href: "/Pixxel", label: "Pixxel' OS" },
    { href: "/#Pixxel for Mobile", label: "Pixxel for Mobile" },
    { href: "/#Marketplace", label: "Marketplace" },
    { href: "/pixxel-os", label: "Blog" },
    { href: "/#Aperty", label: "Aperty" },
    { href: "/#More", label: "More", hasDropdown: true },
  ];

  // LOGIC: Check if we are NOT on the dashboard page
  const hiddenPages = ["/dashboard", "/sign-in", "/sign-up"];
  const showCenterLinks = !hiddenPages.some(hiddenPath => path.startsWith(hiddenPath));

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: isHidden ? -100 : 0 }} // 🌟 Yahan agar isHidden true hai, toh header upar jaakar chup jayega
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

      {/* 4. MOBILE FULLSCREEN MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm md:hidden"
            />
            
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[85vw] max-w-sm z-[101] bg-[#050505] border-l border-white/5 flex flex-col md:hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <Image
                  src="/logo-text.png"
                  alt="Pixxel Logo"
                  className="h-8 w-auto object-contain"
                  width={200}
                  height={80}
                />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-8 px-6 flex flex-col gap-6">
                {showCenterLinks && navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between text-lg text-zinc-400 font-medium hover:text-white transition-colors"
                    >
                      {link.label}
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    </Link>
                  </motion.div>
                ))}

                <Authenticated>
                  {showCenterLinks && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                      <Link
                        href="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between text-lg text-white font-medium mt-4 pt-6 border-t border-white/5"
                      >
                        <div className="flex items-center gap-3">
                          <LayoutDashboard className="w-5 h-5" />
                          Dashboard
                        </div>
                        <ChevronRight className="w-4 h-4 opacity-50" />
                      </Link>
                    </motion.div>
                  )}
                </Authenticated>
              </div>

              <Unauthenticated>
                <div className="p-6 border-t border-white/5 flex flex-col gap-4">
                  <SignInButton>
                    <button className="flex items-center justify-center gap-2 w-full text-zinc-300 hover:text-white transition-colors h-12 font-medium" onClick={() => setMobileMenuOpen(false)}>
                      <User className="w-4 h-4" /> Log In
                    </button>
                  </SignInButton>
                  
                  <SignUpButton>
                    <Button className="w-full bg-white text-black hover:bg-zinc-200 h-12 rounded-md font-semibold" onClick={() => setMobileMenuOpen(false)}>
                      Get Started
                    </Button>
                  </SignUpButton>
                </div>
              </Unauthenticated>
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
