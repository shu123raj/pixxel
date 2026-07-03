"use client";

import React, { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { 
  RotateCcw, 
  Sun, 
  ThermometerSun, 
  Contrast, 
  Palette, 
  Sparkles, 
  Activity, 
  Droplets, 
  Image as ImageIcon,
  Aperture,
  Wand2,
  Droplet,
  Settings2
} from "lucide-react";
import { filters } from "fabric"; 
import { useCanvas } from "@/context/context";

// ==========================================
// 1. FILTER CONFIGURATIONS & MATH
// ==========================================
const FILTER_CONFIGS =[
  {
    key: "exposure", label: "Exposure", icon: Aperture, min: -100, max: 100, step: 1, defaultValue: 0,
    filterClass: filters.Gamma,
    getOptions: (value) => {
      let g = value > 0 ? 1 - (value / 100) * 0.8 : 1 + (Math.abs(value) / 100) * 1.5; 
      return { gamma:[g, g, g] };
    },
    extractValue: (filter) => {
      if (!filter.gamma) return 0;
      const g = filter.gamma[0];
      if (g < 1) return Math.round(((1 - g) / 0.8) * 100);
      if (g > 1) return -Math.round(((g - 1) / 1.5) * 100);
      return 0;
    }
  },
  {
    key: "temperature", label: "Temperature", icon: ThermometerSun, min: -100, max: 100, step: 1, defaultValue: 0,
    filterClass: filters.BlendColor,
    getOptions: (value) => ({
      color: value > 0 ? '#ffb347' : '#77b5fe', 
      mode: 'tint', alpha: Math.abs(value) / 200 
    }),
    extractValue: (filter) => {
      if (!filter.color) return 0;
      const sign = filter.color === '#ffb347' ? 1 : -1;
      return Math.round(filter.alpha * 200) * sign;
    }
  },
  { key: "brightness", label: "Brightness", icon: Sun, min: -100, max: 100, step: 1, defaultValue: 0, filterClass: filters.Brightness, valueKey: "brightness", transform: (v) => v / 100, extractValue: (f) => Math.round(f.brightness * 100) },
  { key: "contrast", label: "Contrast", icon: Contrast, min: -100, max: 100, step: 1, defaultValue: 0, filterClass: filters.Contrast, valueKey: "contrast", transform: (v) => v / 100, extractValue: (f) => Math.round(f.contrast * 100) },
  { key: "saturation", label: "Saturation", icon: Palette, min: -100, max: 100, step: 1, defaultValue: 0, filterClass: filters.Saturation, valueKey: "saturation", transform: (v) => v / 100, extractValue: (f) => Math.round(f.saturation * 100) },
  { key: "vibrance", label: "Vibrance", icon: Sparkles, min: -100, max: 100, step: 1, defaultValue: 0, filterClass: filters.Vibrance, valueKey: "vibrance", transform: (v) => v / 100, extractValue: (f) => Math.round(f.vibrance * 100) },
  {
    key: "sharpen", label: "Sharpen", icon: Activity, min: 0, max: 100, step: 1, defaultValue: 0,
    filterClass: filters.Convolute,
    getOptions: (value) => {
      const s = value / 100;
      return { matrix:[ 0, -s, 0, -s, 1+4*s, -s, 0, -s, 0 ] };
    },
    extractValue: (filter) => {
      if (filter.matrix && filter.matrix.length === 9) {
        const s = (filter.matrix[4] - 1) / 4;
        return Math.round(s * 100);
      }
      return 0;
    }
  },
  { key: "blur", label: "Blur", icon: Droplets, min: 0, max: 100, step: 1, defaultValue: 0, filterClass: filters.Blur, valueKey: "blur", transform: (v) => v / 100, extractValue: (f) => Math.round(f.blur * 100) },
  { key: "noise", label: "Noise", icon: Wand2, min: 0, max: 100, step: 1, defaultValue: 0, filterClass: filters.Noise, valueKey: "noise", transform: (v) => v * 5, extractValue: (f) => Math.round(f.noise / 5) },
  { key: "removeColor", label: "Remove Color", icon: Droplet, min: -100, max: 100, step: 1, defaultValue: 0, filterClass: filters.RemoveColor, valueKey: "threshold", transform: (v) => v, extractValue: (f) => f.threshold }
];

const DEFAULT_VALUES = FILTER_CONFIGS.reduce((acc, config) => {
  acc[config.key] = config.defaultValue;
  return acc;
}, {});

// ==========================================
// 2. ONE-CLICK PRESET FILTERS
// ==========================================
const PRESETS =[
  { id: "original", label: "Original", gradient: "from-gray-400 to-gray-600", values: {} },
  { id: "cinematic", label: "Cinematic", gradient: "from-cyan-900 to-blue-900", values: { contrast: 25, saturation: -15, temperature: -20, exposure: -10, vibrance: 15 } },
  { id: "vintage", label: "Vintage", gradient: "from-amber-600 to-orange-900", values: { temperature: 35, contrast: -10, saturation: -25, noise: 15, exposure: 10 } },
  { id: "bw", label: "B&W", gradient: "from-slate-800 to-slate-950", values: { saturation: -100, contrast: 15, exposure: 5 } },
  { id: "vivid", label: "Vivid", gradient: "from-pink-500 to-rose-600", values: { saturation: 30, vibrance: 40, contrast: 10 } },
  { id: "cool", label: "Cool Breeze", gradient: "from-cyan-400 to-blue-500", values: { temperature: -40, vibrance: 15, brightness: 5 } },
  { id: "warm", label: "Golden Hour", gradient: "from-yellow-400 to-orange-500", values: { temperature: 30, saturation: 15, contrast: 5, exposure: 5, vibrance: 20 } },
  { id: "matte", label: "Matte Fade", gradient: "from-slate-500 to-slate-400", values: { contrast: -30, exposure: 15, saturation: -10 } },
];


export function AdjustControls() {
  const [filterValues, setFilterValues] = useState(DEFAULT_VALUES);
  const [activePreset, setActivePreset] = useState("original");
  const { canvasEditor } = useCanvas();

  // 🚀 FIXED: Safe Fabric.js Setup without triggering ES6 "Extensible" Error
  useEffect(() => {
    import("fabric").then((fabricModule) => {
      try {
        // For Fabric v6: Global settings exist inside the 'config' object
        if (fabricModule.config) {
          fabricModule.config.enableGLFiltering = false;
          fabricModule.config.textureSize = 8192;
        } 
        // For Fabric v5: Settings are on the 'default' export
        else if (fabricModule.default) {
          fabricModule.default.enableGLFiltering = false;
          fabricModule.default.textureSize = 8192;
        }

        // Failsafe for global namespace if available
        if (typeof window !== "undefined" && window.fabric) {
          window.fabric.enableGLFiltering = false;
          window.fabric.textureSize = 8192;
        }
      } catch (error) {
        console.warn("Fabric settings config safely skipped:", error);
      }
    }).catch(() => {});
  }, []);

  const getActiveImage = () => {
    if (!canvasEditor) return null;
    const activeObject = canvasEditor.getActiveObject();
    if (activeObject && activeObject.type === "image") return activeObject;
    const objects = canvasEditor.getObjects();
    return objects.find((obj) => obj.type === "image") || null;
  };

  const applyFilters = (newValues) => {
    const imageObject = getActiveImage();
    if (!imageObject) return;

    try {
      const filtersToApply = [];

      FILTER_CONFIGS.forEach((config) => {
        const value = newValues[config.key];
        if (value !== config.defaultValue) {
          if (config.getOptions) {
            filtersToApply.push(new config.filterClass(config.getOptions(value)));
          } else {
            const transformedValue = config.transform ? config.transform(value) : value;
            filtersToApply.push(
              new config.filterClass({ [config.valueKey]: transformedValue })
            );
          }
        }
      });

      // Directly update and apply filters
      imageObject.filters = filtersToApply;
      imageObject.applyFilters();
      
      // Update coordinates to fix borders / cutting issues
      imageObject.setCoords();
      imageObject.set({ dirty: true }); 
      canvasEditor.requestRenderAll();

    } catch (error) {
      console.error("Error applying filters:", error);
    }
  };

  const handleValueChange = (filterKey, value) => {
    const newValues = {
      ...filterValues,
      [filterKey]: Array.isArray(value) ? value[0] : value,
    };
    setFilterValues(newValues);
    setActivePreset("custom"); 
    applyFilters(newValues);
  };

  const applyPreset = (preset) => {
    setActivePreset(preset.id);
    const newValues = { ...DEFAULT_VALUES, ...preset.values };
    setFilterValues(newValues);
    applyFilters(newValues);
  };

  const resetFilters = () => {
    setActivePreset("original");
    setFilterValues(DEFAULT_VALUES);
    applyFilters(DEFAULT_VALUES);
  };

  const extractFilterValues = (imageObject) => {
    if (!imageObject?.filters?.length) return DEFAULT_VALUES;
    const extractedValues = { ...DEFAULT_VALUES };

    imageObject.filters.forEach((filter) => {
      const config = FILTER_CONFIGS.find((c) => c.filterClass.name === filter.constructor.name);
      if (config) {
        if (config.extractValue) {
          extractedValues[config.key] = config.extractValue(filter);
        } else {
          extractedValues[config.key] = filter[config.valueKey];
        }
      }
    });
    return extractedValues;
  };

  useEffect(() => {
    const imageObject = getActiveImage();
    if (imageObject?.filters) {
      const existingValues = extractFilterValues(imageObject);
      setFilterValues(existingValues);
      
      const isOriginal = Object.keys(DEFAULT_VALUES).every(k => existingValues[k] === DEFAULT_VALUES[k]);
      if(isOriginal) setActivePreset("original");
      else setActivePreset("custom");
    }
  }, [canvasEditor]);

  // Empty State
  if (!canvasEditor || !getActiveImage()) {
    return (
      <div className="flex flex-col items-center justify-center h-48 sm:h-64 text-center p-6 bg-slate-900/30 rounded-2xl border border-white/5 border-dashed m-4">
        <div className="w-12 h-12 mb-3 bg-white/5 rounded-full flex items-center justify-center">
          <ImageIcon className="h-6 w-6 text-white/40" />
        </div>
        <h4 className="text-white font-medium mb-1">No Image Selected</h4>
        <p className="text-white/40 text-xs">Select an image to apply filters</p>
      </div>
    );
  }

  const isAnyFilterActive = Object.keys(filterValues).some((key) => filterValues[key] !== DEFAULT_VALUES[key]);

  return (
    <div className="flex flex-col h-full relative">
      
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 flex justify-between items-center pb-4 mb-4 border-b border-white/5 bg-slate-900/50 backdrop-blur-md px-2 pt-2">
        <div className="flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white tracking-wide">Filters & Adjust</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          disabled={!isAnyFilterActive}
          className={`h-8 px-3 text-xs transition-all duration-300 rounded-lg ${
            isAnyFilterActive ? "text-red-400 hover:text-red-300 hover:bg-red-500/10" : "text-white/30 cursor-not-allowed"
          }`}
        >
          <RotateCcw className={`h-3.5 w-3.5 mr-1.5 ${isAnyFilterActive ? 'animate-spin-once' : ''}`} />
          Reset All
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-10 space-y-8">
        
        {/* =======================
            SECTION 1: PRESETS
        ======================= */}
        <div>
          <div className="flex items-center gap-2 mb-3 px-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">One-Click Presets</span>
          </div>
          
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-3 px-1 snap-x">
            {PRESETS.map((preset) => {
              const isActive = activePreset === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  className="flex flex-col items-center gap-2 shrink-0 snap-start group"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${preset.gradient} flex items-center justify-center transition-all duration-300 ${
                    isActive 
                      ? "ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#0a0c10] shadow-[0_0_15px_rgba(34,211,238,0.4)] scale-105" 
                      : "opacity-80 hover:opacity-100 hover:scale-105"
                  }`}>
                    {isActive && <CheckIcon className="w-5 h-5 text-white shadow-sm" />}
                  </div>
                  <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'}`}>
                    {preset.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* =======================
            SECTION 2: SLIDERS
        ======================= */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4 px-1">
            <Settings2 className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Manual Adjustments</span>
          </div>

          {FILTER_CONFIGS.map((config) => {
            const currentValue = filterValues[config.key] !== undefined ? filterValues[config.key] : config.defaultValue;
            const isActive = currentValue !== config.defaultValue;
            const Icon = config.icon;

            return (
              <div 
                key={config.key} 
                className={`p-3 rounded-xl transition-all duration-300 border ${
                  isActive ? "bg-blue-500/5 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.05)]" : "bg-white/5 border-transparent hover:bg-white/10"
                }`}
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-white/50'}`} />
                    <label className={`text-xs font-medium tracking-wide ${isActive ? 'text-blue-100' : 'text-white/70'}`}>
                      {config.label}
                    </label>
                  </div>
                  
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                    isActive ? "bg-blue-500/20 text-blue-300" : "bg-black/30 text-white/40"
                  }`}>
                    {currentValue > 0 && config.min < 0 ? "+" : ""}{currentValue}
                  </span>
                </div>

                <Slider
                  value={[currentValue]}
                  onValueChange={(value) => handleValueChange(config.key, value)}
                  min={config.min}
                  max={config.max}
                  step={config.step}
                  className={`w-full cursor-grab active:cursor-grabbing ${isActive ? '[&_.relative]:bg-blue-500' : ''}`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const CheckIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);