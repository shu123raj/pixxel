"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

// ==========================================
// 1. FEATURES DATA
// ==========================================
const featuresData = [
  {
    id: 0,
    icon: "🤖",
    title: "AI BACKGROUND EDITING",
    description:
      "Automatically remove, replace, or modify image backgrounds using advanced AI segmentation technology that accurately detects subjects, edges, hair, and complex objects.",
  },
  {
    id: 1,
    icon: "🪄",
    title: "AI CONTENT EDITOR",
    description:
      "Edit images using text prompts. Remove unwanted objects, replace elements, or generate new content with AI-powered inpainting that matches lighting and perspective.",
  },
  {
    id: 2,
    icon: "📏",
    title: "AI IMAGE EXTENDER",
    description:
      "Expand images beyond their original boundaries using AI outpainting technology. Seamlessly generate realistic content that blends naturally with the existing image.",
  },
  {
    id: 3,
    icon: "⬆️",
    title: "AI UPSCALER",
    description:
      "Increase image resolution up to 4x while preserving sharpness and details. Perfect for restoring low-resolution photos and preparing images for high-quality printing.",
  },
  {
    id: 4,
    icon: "🖼️",
    title: "DOUBLE EXPOSURE",
    description:
      "Blend two images creatively using advanced layer composition techniques. Create artistic visuals with professional-quality double exposure effects.",
  },
  {
    id: 5,
    icon: "🌄",
    title: "TWILIGHT ENHANCE",
    description:
      "Transform dull landscapes and evening photographs with intelligent sky enhancement, dynamic lighting adjustments, and cinematic color improvements.",
  },
  {
    id: 6,
    icon: "💧",
    title: "WATER ENHANCER",
    description:
      "Enhance water reflections, rivers, lakes, and ocean scenes using AI-powered color correction and texture enhancement for vibrant and realistic results.",
  },
  {
    id: 7,
    icon: "📂",
    title: "BATCH EDITOR",
    description:
      "Process multiple images simultaneously with consistent edits and AI enhancements. Save time by applying transformations across entire image collections.",
  },
  {
    id: 8,
    icon: "✂️",
    title: "SMART CROP & RESIZE",
    description:
      "Interactive cropping with intelligent aspect ratio controls and precision resizing tools. Optimize images for social media, web, print, and professional content creation while preserving image quality.",
  },
  {
    id: 9,
    icon: "🎨",
    title: "COLOR & LIGHT ENHANCEMENT",
    description:
      "Professional brightness, contrast, saturation, shadows, highlights, and color grading controls. AI-assisted enhancement automatically improves image quality with a single click.",
  },
];

// ==========================================
// 2. MAIN FEATURES SECTION COMPONENT
// ==========================================
export default function FeaturesSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-play interval logic (Har 3 second mein slide change)
  useEffect(() => {
    if (isHovered) return; // Agar user card padh raha hai toh slider pause ho jayega

    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % featuresData.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isHovered]);

  return (
    // 👇 Yahan py-12 md:py-16 kar diya hai gap kam karne ke liye aur min-h-[80vh] hata diya hai
    <section className="relative py-12 md:py-16 bg-black overflow-hidden flex flex-col items-center justify-center" id="features">
      
      {/* 🌟 Halka Sa Ambient Glow (Background) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[800px] h-[300px] bg-cyan-500/[0.04] blur-[100px] rounded-full pointer-events-none" />

      {/* Header Section (Matching the screenshot typography) */}
      <div className="text-center relative z-10 mb-10 px-4">
        <motion.h4 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-[10px] font-bold tracking-[0.25em] text-gray-500 uppercase mb-3"
        >
          Features
        </motion.h4>
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-5xl font-bold text-white tracking-tight"
        >
          Powerful AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">capabilities</span>{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">for creators</span>
        </motion.h2>
      </div>

      {/* Feature Card (Exactly like the screenshot) */}
      <div 
        className="relative z-10 w-full max-w-3xl px-4"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="bg-[#0a0a0c]  rounded-2xl p-8 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.6)] min-h-[280px] flex flex-col justify-center transition-all duration-300 hover:border-white/10 hover:shadow-[0_20px_60px_rgba(34,211,238,0.1)]">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full"
            >
              {/* Card Top: Feature Name & Arrow Icon */}
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider flex items-center gap-3">
                  <span className="text-2xl md:text-3xl">{featuresData[activeIndex].icon}</span>
                  {featuresData[activeIndex].title}
                </h3>
                <button className="w-9 h-9 rounded-md bg-white/[0.03] border border-white/5 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all cursor-pointer shadow-sm">
                  <ArrowUpRight size={18} />
                </button>
              </div>

              {/* Card Body: Feature Description */}
              <p className="text-base md:text-lg text-gray-400 font-light leading-[1.8] md:leading-relaxed">
                {featuresData[activeIndex].description}
              </p>
            </motion.div>
          </AnimatePresence>

        </div>

        {/* Pagination Dots (Exactly matching the screenshot) */}
        <div className="flex justify-center items-center gap-2 mt-8">
          {featuresData.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`transition-all duration-300 rounded-full ${
                activeIndex === idx 
                  ? "w-8 h-1.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" 
                  : "w-1.5 h-1.5 bg-white/20 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
      
    </section>
  );
}