"use client";

import React from "react";
import {
  Crop,
  Expand,
  Sliders,
  Palette,
  Maximize2,
  Text,
  Eye,
  Sparkles,
  UserSquare2,
  Layers // <-- Layers icon import kiya
} from "lucide-react";
import { AdjustControls } from "./_tools/adjust";
import { BackgroundControls } from "./_tools/background-controls";
import { useCanvas } from "@/context/context";
import { TextControls } from "./_tools/text";
import { AIExtenderControls } from "./_tools/ai-extend";
import { ResizeControls } from "./_tools/resize";
import { AIEdit } from "./_tools/ai-edit";
import { CropContent } from "./_tools/crop";
import { DoubleExposureContent } from "./_tools/double-exposure"; // <-- Naya component import kiya
import { Button } from "@/components/ui/button";
import { usePlanAccess } from "@/hooks/use-plan-access";

const TOOL_CONFIGS = {
  resize: {
    title: "Resize",
    icon: Expand,
    description: "Change project dimensions",
    category: "basic",
  },
  crop: {
    title: "Crop",
    icon: Crop,
    description: "Crop and trim your image",
    category: "basic",
  },
  adjust: {
    title: "Adjust",
    icon: Sliders,
    description: "Brightness, contrast, and more",
    category: "basic",
  },
  text: {
    title: "Add Text",
    icon: Text,
    description: "Customize in Various Fonts",
    category: "basic",
  },
  background: {
    title: "Background AI",
    icon: Palette,
    description: "Remove or change background",
    category: "premium", 
    badge: "Pro",
  },
  ai_extender: {
    title: "AI Extender",
    icon: Maximize2,
    description: "Extend boundaries with AI",
    category: "premium",
    badge: "Pro",
  },
  ai_edit: {
    title: "AI Editing",
    icon: Eye,
    description: "Enhance image quality with AI",
    category: "premium",
    badge: "Pro",
  },
  // 👇 NAYA DOUBLE EXPOSURE CONFIG ADD KIYA
  double_exposure: {
    title: "Double Exposure",
    icon: Layers,
    description: "Blend two images perfectly",
    category: "premium",
    badge: "Pro",
  },
};

export function EditorSidebar({ project }) {
  const { activeTool } = useCanvas();
  const { isPro } = usePlanAccess();

  const toolConfig = TOOL_CONFIGS[activeTool];

  if (!toolConfig) {
    return null;
  }

  const Icon = toolConfig.icon;

  return (
    <div className="w-full md:w-80 lg:w-[340px] xl:w-96 h-full flex flex-col bg-gradient-to-b from-slate-900/90 to-slate-950/90 backdrop-blur-xl border-r border-white/5 shadow-2xl relative z-10">
      
      <div className="p-4 md:p-6 border-b border-white/5 bg-white/[0.02] relative shrink-0">
        <div className="flex items-start justify-between gap-3 md:gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1.5 md:mb-2">
              <div className="p-2 md:p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.15)] relative group">
                <Icon className="h-4 w-4 md:h-5 md:w-5 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute inset-0 bg-cyan-400/20 blur-md rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base md:text-lg font-bold text-white tracking-wide">
                    {toolConfig.title}
                  </h2>
                  {toolConfig.badge && !isPro && (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-[10px] md:text-xs font-bold text-purple-300 uppercase tracking-wider shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                      <Sparkles className="w-2.5 h-2.5" />
                      {toolConfig.badge}
                    </span>
                  )}
                </div>
                <p className="text-[10px] md:text-xs text-white/50 mt-0.5">{toolConfig.description}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-50"></div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth">
        <div className="p-4 md:p-6">
          {renderToolContent(activeTool, project)}
        </div>
      </div>

      <div className="hidden xs:block p-3 md:p-4 border-t border-white/5 bg-slate-950/80 shrink-0">
        <p className="text-[10px] md:text-xs text-white/40 text-center flex items-center justify-center gap-1.5">
          <span className="text-cyan-400">💡</span> 
          <span>Tip: Use keyboard shortcuts for a faster workflow</span>
        </p>
      </div>
    </div>
  );
}

function renderToolContent(activeTool, project) {
  switch (activeTool) {
    case "crop": return <CropContent />;
    case "resize": return <ResizeControls project={project} />;
    case "adjust": return <AdjustControls />;
    case "background": return <BackgroundControls project={project} />;
    case "ai_extender": return <AIExtenderControls project={project} />;
    case "text": return <TextControls />;
    case "ai_edit": return <AIEdit project={project} />;
    // 👇 NAYA CASE ADD KIYA DOUBLE EXPOSURE KE LIYE
    case "double_exposure": return <DoubleExposureContent />;
    default:
      return (
        <div className="flex flex-col items-center justify-center h-40 text-center animate-in fade-in zoom-in duration-300">
          <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3">
            <Sliders className="h-6 w-6 text-white/30" />
          </div>
          <p className="text-white/50 text-sm">Select a tool to start editing</p>
        </div>
      );
  }
}