"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { useConvexQuery } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { 
  Loader2, 
  Monitor, 
  Keyboard, 
  MessageSquare, 
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Sparkles,
  Info,
  X,
  Menu,
  Download,      
  Share2,        
  Link2,         
  Image as ImageIcon,
  Columns,           
  ArrowLeftRight,
  Layers,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  ChevronUp,
  ChevronDown,
  Type,
  Square,
  Undo2,
  Redo2,
  Palette,        
  RotateCcw,      
  Sliders,        
  Zap,            
  SunMedium,
  Droplets,
  Images // ✨ ADDED IMAGES ICON FOR BATCH
} from "lucide-react";
import { EditorTopBar } from "./_components/editor-topbar";
import { EditorSidebar } from "./_components/editor-sidebar";
import CanvasEditor from "./_components/canvas";
import ReviewSection from "./_components/review-section";
import { BatchEditorPanel } from "./_components/batch-editor-panel";
import { TwilightEnhancePanel } from "./_components/twilight-enhance-panel";
import { WaterEnhancerPanel } from "./_components/water-enhancer-panel";
import { CanvasContext } from "@/context/context";
import { UpgradeModal } from "@/components/upgrade-modal";
import { usePlanAccess } from "@/hooks/use-plan-access";
import { RingLoader } from "react-spinners";
import { toast } from "sonner";

// =====================================
// CUSTOM SOCIAL SVG ICONS (Brand Icons)
// =====================================
const WhatsAppIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className || "w-5 h-5"}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const FacebookIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className || "w-5 h-5"}>
    <path d="M12 2.04c-5.5 0-10 4.48-10 10.02c0 5.01 3.66 9.15 8.44 9.9v-7.03H7.9v-2.87h2.54V9.89c0-2.5 1.49-3.89 3.77-3.89c1.1 0 2.25.19 2.25.19v2.46h-1.27c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.87h-2.33v7.03C18.34 21.17 22 17.03 22 12.06c0-5.54-4.5-10.02-10-10.02z"/>
  </svg>
);

const InstagramIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className || "w-5 h-5"}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const TwitterIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className || "w-5 h-5"}>
     <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
  </svg>
);

// ============================================================
// SELECTIVE COLOR — HSL GAUSSIAN ALGORITHM (Standalone)
// ============================================================
const COLOR_CHANNELS = [
  { id: "reds",     label: "Reds",     centerHue: 0,   color: "#ef4444", gradFrom: "#dc2626", gradTo: "#f87171" },
  { id: "oranges",  label: "Oranges",  centerHue: 30,  color: "#f97316", gradFrom: "#ea580c", gradTo: "#fb923c" },
  { id: "yellows",  label: "Yellows",  centerHue: 60,  color: "#eab308", gradFrom: "#ca8a04", gradTo: "#facc15" },
  { id: "greens",   label: "Greens",   centerHue: 120, color: "#22c55e", gradFrom: "#16a34a", gradTo: "#4ade80" },
  { id: "cyans",    label: "Cyans",    centerHue: 180, color: "#06b6d4", gradFrom: "#0891b2", gradTo: "#22d3ee" },
  { id: "blues",    label: "Blues",    centerHue: 220, color: "#3b82f6", gradFrom: "#2563eb", gradTo: "#60a5fa" },
  { id: "purples",  label: "Purples",  centerHue: 280, color: "#a855f7", gradFrom: "#9333ea", gradTo: "#c084fc" },
  { id: "magentas", label: "Magentas", centerHue: 320, color: "#ec4899", gradFrom: "#db2777", gradTo: "#f472b6" },
];

const CHANNEL_PARAM_DEFAULTS = { hue: 0, saturation: 0, luminance: 0 };
const DEFAULT_CHANNEL_VALUES = COLOR_CHANNELS.reduce((acc, ch) => {
  acc[ch.id] = { ...CHANNEL_PARAM_DEFAULTS };
  return acc;
}, {});

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s;
  const l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      default: h = ((r - g) / d + 4) / 6;
    }
  }
  return [h * 360, s, l];
}

function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360;
  h /= 360;
  if (s === 0) { const v = Math.round(l * 255); return [v, v, v]; }
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h + 1/3) * 255),
    Math.round(hue2rgb(p, q, h)       * 255),
    Math.round(hue2rgb(p, q, h - 1/3) * 255),
  ];
}

function gaussianWeight(hue, centerHue, sigma) {
  let diff = hue - centerHue;
  if (diff >  180) diff -= 360;
  if (diff < -180) diff += 360;
  return Math.exp(-(diff * diff) / (2 * sigma * sigma));
}

function initSelectiveColorFilter(fab) {
  if (fab.filters?.SelectiveColor) return;

  const BaseFilter = fab.filters?.BaseFilter || fab.Image?.filters?.BaseFilter;
  if (!BaseFilter) {
    console.error("Fabric BaseFilter missing.");
    return; 
  }

  class SelectiveColorFilter extends BaseFilter {
    constructor(options = {}) {
      super(options); 
      this.channelValues = options.channelValues || {};
      this.softness = options.softness || 40;
    }

    applyTo2d(options) {
      const imageData = options.imageData || options; 
      const data = imageData.data;
      const sigma = 35 + (this.softness / 100) * 85;

      const activeChannels = COLOR_CHANNELS.map((ch) => ({
        centerHue: ch.centerHue,
        hue: this.channelValues[ch.id]?.hue ?? 0,
        sat: this.channelValues[ch.id]?.saturation ?? 0,
        lum: this.channelValues[ch.id]?.luminance ?? 0,
      })).filter(c => c.hue !== 0 || c.sat !== 0 || c.lum !== 0);

      if (activeChannels.length === 0) return;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const [h, s, l] = rgbToHsl(r, g, b);
        
        if (s < 0.01) continue; 
        let satFalloff = Math.min(1, Math.max(0, (s - 0.02) / 0.10)); 
        
        let totalWeight = 0, dHue = 0, dSat = 0, dLum = 0;
        
        for (const ch of activeChannels) {
          const w = gaussianWeight(h, ch.centerHue, sigma);
          if (w < 0.005) continue;
          
          totalWeight += w;
          dHue += ch.hue * w;
          dSat += ch.sat * w;
          dLum += ch.lum * w;
        }
        
        if (totalWeight === 0) continue;
        
        if (totalWeight > 1) {
          dHue /= totalWeight;
          dSat /= totalWeight;
          dLum /= totalWeight;
        }
        
        const wt = Math.min(totalWeight, 1) * satFalloff;
        const newH = h + (dHue * 0.5) * wt; 
        
        let satShift = (dSat / 100) * wt * 0.60; 
        let newS = s + (satShift > 0 ? (1 - s) * satShift : s * satShift);
        
        let lumShift = (dLum / 100) * wt * 0.50; 
        let newL = l + (lumShift > 0 ? (1 - l) * lumShift : l * lumShift);
        
        newS = Math.max(0, Math.min(1, newS));
        newL = Math.max(0, Math.min(1, newL));
        
        const [nr, ng, nb] = hslToRgb(newH, newS, newL);
        data[i] = nr; data[i + 1] = ng; data[i + 2] = nb;
      }
    }

    toObject() {
      return {
        ...super.toObject(),
        channelValues: this.channelValues,
        softness: this.softness
      };
    }

    static fromObject(object, callback) {
      const instance = new SelectiveColorFilter(object);
      if (callback) callback(instance);
      return instance;
    }
  }

  SelectiveColorFilter.type = "SelectiveColor"; 

  if (!fab.filters) fab.filters = {};
  fab.filters.SelectiveColor = SelectiveColorFilter;

  if (fab.classRegistry && typeof fab.classRegistry.setClass === 'function') {
    fab.classRegistry.setClass(SelectiveColorFilter, 'SelectiveColor');
  }
}

// ============================================================
// SELECTIVE COLOR SUB-COMPONENTS
// ============================================================
const ParamSlider = ({ label, value, min, max, color, onChange }) => {
  const [localValue, setLocalValue] = useState(value);
  useEffect(() => { setLocalValue(value); }, [value]);
  const isActive = localValue !== 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-slate-400 font-medium tracking-wide">{label}</span>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded"
          style={{ background: isActive ? `${color}22` : "rgba(0,0,0,0.3)", color: isActive ? color : "rgba(255,255,255,0.3)" }}>
          {localValue > 0 ? "+" : ""}{localValue}
        </span>
      </div>
      <div className="relative h-5 flex items-center">
        <div className="h-1 w-full rounded-full bg-white/10 relative overflow-hidden">
          <div className="absolute h-full rounded-full transition-all duration-150"
            style={{
              background: `linear-gradient(90deg, ${color}88, ${color})`,
              left:  localValue >= 0 ? "50%" : `${50 + (localValue / Math.abs(min)) * 50}%`,
              width: `${Math.abs(localValue) / (max - min) * 100 * 2}%`,
              maxWidth: "50%",
            }} />
        </div>
        <input
          type="range"
          value={localValue}
          onChange={(e) => setLocalValue(Number(e.target.value))}
          onMouseUp={(e) => onChange(Number(e.target.value))}
          onTouchEnd={(e) => onChange(Number(e.target.value))}
          min={min} max={max} step={1}
          className="absolute inset-0 opacity-0 cursor-grab active:cursor-grabbing w-full"
        />
        <div className="absolute w-3.5 h-3.5 rounded-full border-2 border-white shadow-lg -translate-y-1/2 -translate-x-1/2 pointer-events-none transition-all duration-150 top-1/2"
          style={{
            left: `${((localValue - min) / (max - min)) * 100}%`,
            background: color,
            boxShadow: isActive ? `0 0 8px ${color}88` : undefined,
          }} />
      </div>
    </div>
  );
};

const ColorWheelIndicator = ({ channelValues }) => {
  const cx = 60, cy = 60, r = 46;
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" className="flex-shrink-0">
      <defs>
        <radialGradient id="scWheelBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      {COLOR_CHANNELS.map((ch) => {
        const segAngle = 360 / COLOR_CHANNELS.length;
        const startAngle = (ch.centerHue - segAngle / 2 - 90) * (Math.PI / 180);
        const endAngle   = (ch.centerHue + segAngle / 2 - 90) * (Math.PI / 180);
        const x1 = cx + r * Math.cos(startAngle), y1 = cy + r * Math.sin(startAngle);
        const x2 = cx + r * Math.cos(endAngle),   y2 = cy + r * Math.sin(endAngle);
        const vals = channelValues[ch.id];
        const isActive = vals.hue !== 0 || vals.saturation !== 0 || vals.luminance !== 0;
        return (
          <path key={ch.id}
            d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
            fill={ch.color} opacity={isActive ? 0.55 : 0.15} stroke="none" />
        );
      })}
      <circle cx={cx} cy={cy} r={20} fill="#0a0c10" />
      <circle cx={cx} cy={cy} r={20} fill="url(#scWheelBg)" />
      {COLOR_CHANNELS.map((ch) => {
        const vals = channelValues[ch.id];
        const isActive = vals.hue !== 0 || vals.saturation !== 0 || vals.luminance !== 0;
        if (!isActive) return null;
        const shiftedHue = ch.centerHue + vals.hue;
        const angle = (shiftedHue - 90) * (Math.PI / 180);
        const dotR = 26;
        const dx = cx + dotR * Math.cos(angle), dy = cy + dotR * Math.sin(angle);
        return (
          <g key={ch.id}>
            <circle cx={dx} cy={dy} r={5} fill={ch.color} opacity={0.9}
              style={{ filter: `drop-shadow(0 0 4px ${ch.color})` }} />
            <circle cx={dx} cy={dy} r={8} fill={ch.color} opacity={0.2} />
          </g>
        );
      })}
    </svg>
  );
};

const ChannelCard = ({ channel, values, onChange, onReset }) => {
  const [expanded, setExpanded] = useState(false);
  const isModified = values.hue !== 0 || values.saturation !== 0 || values.luminance !== 0;
  return (
    <div className="rounded-xl border transition-all duration-300 overflow-hidden"
      style={{
        background: isModified
          ? `linear-gradient(135deg, ${channel.color}0d 0%, #0a0c1099 100%)`
          : "rgba(255,255,255,0.03)",
        borderColor: isModified ? `${channel.color}44` : "rgba(255,255,255,0.08)",
        boxShadow: isModified ? `0 0 20px ${channel.color}1a` : "none",
      }}>
      <div
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center gap-3 px-3 py-2.5 group cursor-pointer"
        role="button"
        tabIndex={0}
      >
        <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
          style={{
            background: `linear-gradient(135deg, ${channel.gradFrom}, ${channel.gradTo})`,
            boxShadow: isModified ? `0 0 12px ${channel.color}66` : "none",
          }}>
          {isModified && <div className="w-2 h-2 bg-white rounded-full shadow-sm" />}
        </div>
        <div className="flex-1 text-left">
          <span className="text-xs font-semibold tracking-wide"
            style={{ color: isModified ? channel.color : "rgba(255,255,255,0.75)" }}>
            {channel.label}
          </span>
          {isModified && (
            <div className="flex gap-1.5 mt-0.5 flex-wrap">
              {values.hue !== 0 && (
                <span className="text-[9px] px-1 rounded" style={{ background: `${channel.color}22`, color: channel.color }}>
                  H{values.hue > 0 ? "+" : ""}{values.hue}°
                </span>
              )}
              {values.saturation !== 0 && (
                <span className="text-[9px] px-1 rounded" style={{ background: `${channel.color}22`, color: channel.color }}>
                  S{values.saturation > 0 ? "+" : ""}{values.saturation}
                </span>
              )}
              {values.luminance !== 0 && (
                <span className="text-[9px] px-1 rounded" style={{ background: `${channel.color}22`, color: channel.color }}>
                  L{values.luminance > 0 ? "+" : ""}{values.luminance}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isModified && (
            <button onClick={(e) => { e.stopPropagation(); onReset(); }}
              className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors" title="Reset channel">
              <RotateCcw className="w-3 h-3 text-white/40 hover:text-white/70" />
            </button>
          )}
          {expanded ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
        </div>
      </div>
      {expanded && (
        <div className="px-3 pb-3 pt-1 space-y-4 border-t border-white/5">
          <ParamSlider label="Hue Shift" value={values.hue} min={-180} max={180} color={channel.color}
            onChange={(v) => onChange({ ...values, hue: v })} />
          <ParamSlider label="Saturation" value={values.saturation} min={-100} max={100} color={channel.color}
            onChange={(v) => onChange({ ...values, saturation: v })} />
          <ParamSlider label="Luminance" value={values.luminance} min={-100} max={100} color={channel.color}
            onChange={(v) => onChange({ ...values, luminance: v })} />
        </div>
      )}
    </div>
  );
};

function FloatingSelectiveColorPanel({ canvasEditor, onClose }) {
  const [channelValues, setChannelValues] = useState(DEFAULT_CHANNEL_VALUES);
  const [softness, setSoftness] = useState(40);
  const filterRef = useRef(null);

  const getActiveImage = useCallback(() => {
    if (!canvasEditor) return null;
    const active = canvasEditor.getActiveObject();
    if (active?.type === "image") return active;
    return canvasEditor.getObjects().find((o) => o.type === "image") || null;
  }, [canvasEditor]);

  const applyToCanvas = useCallback(async (newChannelValues, newSoftness) => {
    const imageObject = getActiveImage();
    if (!imageObject) return;

    try {
      let fab;
      if (typeof window !== "undefined" && window.fabric) {
        fab = window.fabric;
      } else {
        const module = await import("fabric");
        fab = module.fabric || module.default || module;
      }

      if (fab.config) { fab.config.enableGLFiltering = false; }
      if (fab.enableGLFiltering !== undefined) { fab.enableGLFiltering = false; }

      initSelectiveColorFilter(fab);

      const FilterClass = fab.Image?.filters?.SelectiveColor || fab.filters?.SelectiveColor;
      if (!FilterClass) return;

      const newFilter = new FilterClass({
        channelValues: newChannelValues,
        softness: newSoftness
      });

      imageObject.filters = (imageObject.filters || []).filter(
        (f) => f.type !== "SelectiveColor"
      );
      
      imageObject.filters.push(newFilter);
      imageObject.applyFilters();
      imageObject.setCoords();
      imageObject.set({ dirty: true });
      canvasEditor.requestRenderAll();
      
    } catch (err) {
      console.error("SelectiveColor filter error:", err);
    }
  }, [canvasEditor, getActiveImage]);

  const handleChannelChange = (channelId, newVals) => {
    const updated = { ...channelValues, [channelId]: newVals };
    setChannelValues(updated);
    applyToCanvas(updated, softness);
  };

  const handleChannelReset = (channelId) => {
    const updated = { ...channelValues, [channelId]: { ...CHANNEL_PARAM_DEFAULTS } };
    setChannelValues(updated);
    applyToCanvas(updated, softness);
  };

  const handleSoftnessChange = (v) => {
    setSoftness(v);
    applyToCanvas(channelValues, v);
  };

  const resetAll = () => {
    setChannelValues(DEFAULT_CHANNEL_VALUES);
    applyToCanvas(DEFAULT_CHANNEL_VALUES, softness);
  };

  const anyModified = COLOR_CHANNELS.some((ch) => {
    const v = channelValues[ch.id];
    return v.hue !== 0 || v.saturation !== 0 || v.luminance !== 0;
  });

  const modifiedCount = COLOR_CHANNELS.filter((ch) => {
    const v = channelValues[ch.id];
    return v.hue !== 0 || v.saturation !== 0 || v.luminance !== 0;
  }).length;

  const hasImage = !!getActiveImage();

  return (
    <div className="absolute bottom-14 right-4 z-[9999] w-[300px] max-h-[75vh] flex flex-col rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-200"
      style={{
        background: "rgba(10, 12, 16, 0.85)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.08)",
      }}
    >
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-white/[0.07]"
        style={{ background: "rgba(255,255,255,0.03)" }}>
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg"
            style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.3), rgba(99,102,241,0.3))", border: "1px solid rgba(168,85,247,0.4)" }}>
            <Palette className="w-3.5 h-3.5 text-violet-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide">Selective Color</h3>
            {modifiedCount > 0 && (
              <span className="text-[9px] text-violet-400 font-mono">{modifiedCount} channel{modifiedCount > 1 ? "s" : ""} active</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {anyModified && (
            <button
              onClick={resetAll}
              className="p-1.5 rounded-lg text-white/40 hover:text-violet-400 hover:bg-violet-500/10 transition-all"
              title="Reset all channels"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!hasImage ? (
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-white/30" />
          </div>
          <p className="text-white/40 text-xs">Select an image on canvas to use selective color</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-3 space-y-3"
          style={{ scrollbarWidth: "none" }}>

          <div className="flex items-center gap-3 p-3 rounded-xl"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <ColorWheelIndicator channelValues={channelValues} />
            <div className="flex-1 space-y-1">
              <p className="text-[11px] text-white/70 font-medium">Per-Channel Editing</p>
              <p className="text-[10px] text-white/35 leading-relaxed">
                Adjust Hue, Saturation & Luminance per color range.
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <Zap className="w-3 h-3 text-violet-400" />
                <span className="text-[10px] text-violet-300">Gaussian HSL blend</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl space-y-2"
            style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.15)" }}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <Sliders className="w-3 h-3 text-violet-400" />
                <span className="text-[10px] text-violet-200 font-medium">Range Softness</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                style={{ background: "rgba(168,85,247,0.2)", color: "#c084fc" }}>{softness}</span>
            </div>
            <input
              type="range"
              value={softness}
              onChange={(e) => handleSoftnessChange(Number(e.target.value))}
              min={5} max={100} step={1}
              className="w-full cursor-grab active:cursor-grabbing"
              style={{ accentColor: "#a855f7" }}
            />
            <div className="flex justify-between">
              <span className="text-[9px] text-white/25">Precise</span>
              <span className="text-[9px] text-white/25">Broad</span>
            </div>
          </div>

          <div className="space-y-1.5">
            {COLOR_CHANNELS.map((ch) => (
              <ChannelCard
                key={ch.id}
                channel={ch}
                values={channelValues[ch.id]}
                onChange={(v) => handleChannelChange(ch.id, v)}
                onReset={() => handleChannelReset(ch.id)}
              />
            ))}
          </div>

        </div>
      )}
    </div>
  );
}

// ============================================================
// UNDO/REDO HISTORY HOOK
// ============================================================
const MAX_HISTORY = 50;
function useCanvasHistory(canvasEditor) {
  const undoStack = useRef([]);
  const redoStack = useRef([]);
  const isApplyingHistory = useRef(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const syncButtonStates = useCallback(() => {
    setCanUndo(undoStack.current.length > 1);
    setCanRedo(redoStack.current.length > 0);
  }, []);

  const captureState = useCallback(() => {
    if (!canvasEditor || isApplyingHistory.current) return;
    const currentState = JSON.stringify(canvasEditor.toJSON([
      'id', 'name', 'selectable', 'evented',
      'lockMovementX', 'lockMovementY', 'lockRotation',
      'lockScalingX', 'lockScalingY', 'visible'
    ]));
    const lastState = undoStack.current[undoStack.current.length - 1];
    if (lastState === currentState) return;
    undoStack.current.push(currentState);
    if (undoStack.current.length > MAX_HISTORY) { undoStack.current.shift(); }
    redoStack.current = [];
    syncButtonStates();
  }, [canvasEditor, syncButtonStates]);

  const undo = useCallback(async () => {
    if (!canvasEditor || undoStack.current.length <= 1) return;
    isApplyingHistory.current = true;
    const currentState = undoStack.current.pop();
    redoStack.current.push(currentState);
    const previousState = undoStack.current[undoStack.current.length - 1];
    await new Promise((resolve) => {
      canvasEditor.loadFromJSON(JSON.parse(previousState), () => {
        canvasEditor.requestRenderAll();
        resolve();
      });
    });
    isApplyingHistory.current = false;
    syncButtonStates();
  }, [canvasEditor, syncButtonStates]);

  const redo = useCallback(async () => {
    if (!canvasEditor || redoStack.current.length === 0) return;
    isApplyingHistory.current = true;
    const nextState = redoStack.current.pop();
    undoStack.current.push(nextState);
    await new Promise((resolve) => {
      canvasEditor.loadFromJSON(JSON.parse(nextState), () => {
        canvasEditor.requestRenderAll();
        resolve();
      });
    });
    isApplyingHistory.current = false;
    syncButtonStates();
  }, [canvasEditor, syncButtonStates]);

  useEffect(() => {
    if (!canvasEditor) return;
    const initTimer = setTimeout(() => { captureState(); }, 300);
    const TRACKED_EVENTS = [
      'object:added', 'object:removed', 'object:modified',
      'object:scaled', 'object:rotated', 'object:moved', 'object:skewed',
      'text:changed', 'path:created', 'erasing:end',
    ];
    const handleChange = () => { setTimeout(() => captureState(), 50); };
    TRACKED_EVENTS.forEach(event => canvasEditor.on(event, handleChange));
    return () => {
      clearTimeout(initTimer);
      TRACKED_EVENTS.forEach(event => canvasEditor.off(event, handleChange));
    };
  }, [canvasEditor, captureState]);

  return { undo, redo, canUndo, canRedo, captureState };
}

// ============================================================
// MAIN EXPORT — EditorPage
// ============================================================
export default function EditorPage() {
  const params = useParams();
  const projectId = params.projectId;
  const [canvasEditor, setCanvasEditor] = useState(null);
  const [processingMessage, setProcessingMessage] = useState(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isSaved, setIsSaved] = useState(true);
  const [lastSavedTime, setLastSavedTime] = useState(null);
  
  const [isReviewOpen, setIsReviewOpen] = useState(false); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLayersOpen, setIsLayersOpen] = useState(false);
  // ✨ NEW: Batch Editor Toggle state
  const [isBatchOpen, setIsBatchOpen] = useState(false); 
  const [activeTool, setActiveTool] = useState("resize");

  const [showExportModal, setShowExportModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [restrictedTool, setRestrictedTool] = useState(null);
  
  const [isSelectiveColorOpen, setIsSelectiveColorOpen] = useState(false);
  const [isTwilightEnhanceOpen, setIsTwilightEnhanceOpen] = useState(false);
  const [isWaterEnhancerOpen, setIsWaterEnhancerOpen] = useState(false);

  const [isComparing, setIsComparing] = useState(false);
  const [compareSliderPos, setCompareSliderPos] = useState(50);
  const [compareEditedImage, setCompareEditedImage] = useState("");
  const [originalImage, setOriginalImage] = useState("");

  const [canvasObjects, setCanvasObjects] = useState([]);
  const [activeObjectId, setActiveObjectId] = useState(null);
  const [layerUpdateTrigger, setLayerUpdateTrigger] = useState(0);

  const { hasAccess } = usePlanAccess();
  const { undo, redo, canUndo, canRedo, captureState } = useCanvasHistory(canvasEditor);

  const {
    data: project,
    isLoading,
    error,
  } = useConvexQuery(api.projects.getProject, { projectId });

  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 50); 
    return () => clearTimeout(timer);
  }, [isSidebarOpen]);

  const togglePremiumPanel = (toolId, toggle) => {
    if (!hasAccess(toolId)) {
      setRestrictedTool(toolId);
      setShowUpgradeModal(true);
      return;
    }

    toggle();
  };

  const resetCanvasInteractionState = useCallback(() => {
    if (!canvasEditor) return;

    try {
      const activeObject = canvasEditor.getActiveObject();
      if (activeObject && typeof activeObject.exitEditing === "function") {
        activeObject.exitEditing();
      }

      canvasEditor.isDrawingMode = false;
      canvasEditor.selection = true;
      canvasEditor.skipTargetFind = false;
      canvasEditor.defaultCursor = "default";
      canvasEditor.hoverCursor = "move";
      canvasEditor.moveCursor = "move";

      if (canvasEditor.upperCanvasEl) canvasEditor.upperCanvasEl.style.cursor = "";
      if (canvasEditor.lowerCanvasEl) canvasEditor.lowerCanvasEl.style.cursor = "";

      const objects = canvasEditor.getObjects();
      objects.forEach((obj) => {
        if (obj.isCropRectangle || obj._pixxelTransientToolObject) {
          canvasEditor.remove(obj);
          return;
        }

        if (obj._pixxelOriginalInteractionProps) {
          obj.set(obj._pixxelOriginalInteractionProps);
          delete obj._pixxelOriginalInteractionProps;
        }

        if (obj._pixxelDoubleExposureOriginalFilters) {
          obj.filters = [...obj._pixxelDoubleExposureOriginalFilters];
          if (typeof obj.applyFilters === "function") obj.applyFilters();
          delete obj._pixxelDoubleExposureOriginalFilters;
        }

        if (obj.selectable !== false) {
          obj.set({
            evented: true,
            lockMovementX: false,
            lockMovementY: false,
            lockRotation: false,
            lockScalingX: false,
            lockScalingY: false,
          });
        }

        if (typeof obj.setCoords === "function") obj.setCoords();
      });

      canvasEditor.discardActiveObject();
      canvasEditor.calcOffset();
      canvasEditor.requestRenderAll();
    } catch (error) {
      console.error("Error resetting editor tool state:", error);
    }
  }, [canvasEditor]);

  const handleEditorToolChange = useCallback((toolId) => {
    if (toolId === activeTool) return;

    if (processingMessage) {
      toast.info("Please wait for the current edit to finish.");
      return;
    }

    resetCanvasInteractionState();
    setIsSelectiveColorOpen(false);
    setIsTwilightEnhanceOpen(false);
    setIsWaterEnhancerOpen(false);
    setActiveTool(toolId);
  }, [activeTool, processingMessage, resetCanvasInteractionState]);

  // LAYER PANEL SYNC LOGIC
  useEffect(() => {
    if (!canvasEditor) return;
    const updateLayersState = () => {
      const objects = canvasEditor.getObjects().map((obj, index) => {
        if (!obj.id) obj.id = `layer_${Date.now()}_${index}`; 
        return obj;
      });
      setCanvasObjects([...objects].reverse());
      const activeObj = canvasEditor.getActiveObject();
      setActiveObjectId(activeObj ? activeObj.id : null);
    };
    canvasEditor.on('object:added', updateLayersState);
    canvasEditor.on('object:removed', updateLayersState);
    canvasEditor.on('object:modified', updateLayersState);
    canvasEditor.on('selection:created', updateLayersState);
    canvasEditor.on('selection:updated', updateLayersState);
    canvasEditor.on('selection:cleared', updateLayersState);
    updateLayersState(); 
    return () => {
      canvasEditor.off('object:added', updateLayersState);
      canvasEditor.off('object:removed', updateLayersState);
      canvasEditor.off('object:modified', updateLayersState);
      canvasEditor.off('selection:created', updateLayersState);
      canvasEditor.off('selection:updated', updateLayersState);
      canvasEditor.off('selection:cleared', updateLayersState);
    };
  }, [canvasEditor, layerUpdateTrigger]);

  const toggleLayerVisibility = (obj) => {
    obj.set('visible', !obj.visible);
    canvasEditor.discardActiveObject(); 
    canvasEditor.requestRenderAll();
    setTimeout(() => captureState(), 50);
    setLayerUpdateTrigger(prev => prev + 1);
  };

  const toggleLayerLock = (obj) => {
    const isLocked = !obj.selectable;
    obj.set({
      selectable: isLocked, evented: isLocked,
      lockMovementX: !isLocked, lockMovementY: !isLocked,
      lockRotation: !isLocked, lockScalingX: !isLocked, lockScalingY: !isLocked
    });
    canvasEditor.discardActiveObject();
    canvasEditor.requestRenderAll();
    setLayerUpdateTrigger(prev => prev + 1);
  };

  const selectLayer = (obj) => {
    if (obj.selectable === false) return; 
    canvasEditor.setActiveObject(obj);
    canvasEditor.requestRenderAll();
  };

  const moveLayerUp = (obj) => {
    if (!canvasEditor) return;
    const objects = canvasEditor.getObjects();
    const currentIndex = objects.indexOf(obj);
    if (currentIndex < objects.length - 1) {
      if (typeof canvasEditor.bringObjectForward === 'function') { canvasEditor.bringObjectForward(obj); }
      else if (typeof canvasEditor.bringForward === 'function') { canvasEditor.bringForward(obj); }
      else if (typeof canvasEditor.moveObjectTo === 'function') { canvasEditor.moveObjectTo(obj, currentIndex + 1); }
      else if (typeof obj.bringForward === 'function') { obj.bringForward(); }
    }
    canvasEditor.requestRenderAll();
    setTimeout(() => captureState(), 50);
    setLayerUpdateTrigger(prev => prev + 1);
  };

  const moveLayerDown = (obj) => {
    if (!canvasEditor) return;
    const objects = canvasEditor.getObjects();
    const currentIndex = objects.indexOf(obj);
    if (currentIndex > 0) {
      if (typeof canvasEditor.sendObjectBackwards === 'function') { canvasEditor.sendObjectBackwards(obj); }
      else if (typeof canvasEditor.sendBackwards === 'function') { canvasEditor.sendBackwards(obj); }
      else if (typeof canvasEditor.moveObjectTo === 'function') { canvasEditor.moveObjectTo(obj, currentIndex - 1); }
      else if (typeof obj.sendBackwards === 'function') { obj.sendBackwards(); }
    }
    canvasEditor.requestRenderAll();
    setTimeout(() => captureState(), 50);
    setLayerUpdateTrigger(prev => prev + 1);
  };

  const deleteLayer = (obj) => {
    canvasEditor.remove(obj);
    canvasEditor.requestRenderAll();
    setLayerUpdateTrigger(prev => prev + 1);
  };

  const getLayerIcon = (type) => {
    if (type === 'i-text' || type === 'textbox' || type === 'text') return <Type className="w-3.5 h-3.5 text-cyan-400" />;
    if (type === 'image' || type === 'FabricImage') return <ImageIcon className="w-3.5 h-3.5 text-purple-400" />;
    return <Square className="w-3.5 h-3.5 text-amber-400" />;
  };

  // KEYBOARD SHORTCUTS
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "?") {
        e.preventDefault();
        setShowShortcuts(prev => !prev);
        return;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "b" || e.key === "B")) {
        e.preventDefault();
        setIsReviewOpen(prev => !prev);
        return;
      }
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === "z") {
        e.preventDefault();
        e.stopPropagation();
        undo();
        return;
      }
      if (
        ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "z" || e.key === "Z")) ||
        ((e.ctrlKey || e.metaKey) && (e.key === "y" || e.key === "Y"))
      ) {
        e.preventDefault();
        e.stopPropagation();
        redo();
        return;
      }
      if (!canvasEditor || isComparing) return; 
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (e.key === "Tab") {
        e.preventDefault(); 
        e.stopPropagation();
        const objects = canvasEditor.getObjects().filter(o => o.selectable !== false);
        if (objects.length === 0) return;
        const currentActive = canvasEditor.getActiveObject();
        const currentIndex = objects.indexOf(currentActive);
        const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % objects.length;
        canvasEditor.discardActiveObject();
        canvasEditor.setActiveObject(objects[nextIndex]);
        canvasEditor.requestRenderAll();
        return;
      }
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        const step = e.shiftKey ? 10 : 1;
        const allObjects = canvasEditor.getObjects();
        let imageObject = canvasEditor.getObjects().find(obj => obj.type === 'image');
        if (!imageObject) { imageObject = canvasEditor.getObjects().find(obj => obj.constructor && (obj.constructor.name === 'FabricImage' || obj.constructor.name === 'Image')); }
        if (!imageObject && allObjects.length > 0) { imageObject = allObjects.find(obj => obj.getSrc && typeof obj.getSrc === 'function'); }
        if (!imageObject && allObjects.length > 0) { imageObject = allObjects.find(obj => obj.selectable !== false); }
        if (imageObject) {
          const currentLeft = imageObject.left || 0;
          const currentTop = imageObject.top || 0;
          switch (e.key) {
            case "ArrowLeft": imageObject.set({ left: currentLeft - step }); break;
            case "ArrowRight": imageObject.set({ left: currentLeft + step }); break;
            case "ArrowUp": imageObject.set({ top: currentTop - step }); break;
            case "ArrowDown": imageObject.set({ top: currentTop + step }); break;
          }
          imageObject.setCoords();
          imageObject.dirty = true;
          canvasEditor.requestRenderAll();
          canvasEditor.fire("object:modified", { target: imageObject }); 
        } else {
          const activeObject = canvasEditor.getActiveObject();
          if (!activeObject) return;
          const currentLeft = activeObject.left || 0;
          const currentTop = activeObject.top || 0;
          switch (e.key) {
            case "ArrowUp": activeObject.set({ top: currentTop - step }); break;
            case "ArrowDown": activeObject.set({ top: currentTop + step }); break;
            case "ArrowLeft": activeObject.set({ left: currentLeft - step }); break;
            case "ArrowRight": activeObject.set({ left: currentLeft + step }); break;
          }
          activeObject.setCoords();
          activeObject.dirty = true;
          canvasEditor.requestRenderAll();
          canvasEditor.fire("object:modified", { target: activeObject }); 
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [canvasEditor, isComparing, undo, redo]);

  // ULTRA-HD BLOB EXPORT
  const handleDownload = (format) => {
    if (!canvasEditor) return;
    setProcessingMessage("Rendering Ultra-HD Image...");
    setTimeout(() => {
      
      try {
        const exportCanvas = canvasEditor.toCanvasElement(2.5); 
        const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
        exportCanvas.toBlob((blob) => {
          if (!blob) throw new Error("Failed to generate image file");
          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.download = `Pixxel_Pro_Edit_${Date.now()}.${format}`;
          link.href = blobUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);
          setShowExportModal(false);
          setProcessingMessage(null);
          toast.success("Ultra-HD Image Downloaded Successfully! 🎉");
        }, mimeType, 1.0);
      } catch (error) {
        console.error("Export Error:", error);
        setProcessingMessage(null);
        toast.error("Download failed. Image is too large for the browser.");
      }
    }, 300);
  };

  const handleSocialShare = async (platform) => {
    if (!canvasEditor) return;
    setProcessingMessage("Preparing Ultra-HD Share...");
    setTimeout(() => {
      try {
        const exportCanvas = canvasEditor.toCanvasElement(2);
        exportCanvas.toBlob(async (blob) => {
          if (!blob) throw new Error("Blob failed");
          const file = new File([blob], "pixxel_premium_edit.png", { type: "image/png" });
          setProcessingMessage(null);
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({ title: 'My Premium Edit', text: 'Check out this High-Res image I just edited on Pixxel!', files: [file] });
          } else {
            toast.info("Direct share not supported here. Downloading image instead...");
            handleDownload('png');
          }
        }, 'image/png', 1.0);
      } catch (error) {
        console.error("Share Error:", error);
        setProcessingMessage(null);
        toast.error("Failed to share image.");
      }
    }, 300);
  };

  const copyProjectLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Project Link Copied to Clipboard!");
  };

  const toggleCompareMode = () => {
    if (isComparing) { setIsComparing(false); return; }
    if (!canvasEditor) return;
    let origImg = project?.originalImageUrl || project?.originalImage || project?.imageUrl || project?.image || project?.url;
    if (!origImg) {
      const bg = canvasEditor.backgroundImage;
      if (bg && bg.getSrc) origImg = bg.getSrc();
      else {
        const objects = canvasEditor.getObjects();
        const imgObj = objects.find(obj => obj.type === 'image' || obj.type === 'FabricImage');
        if (imgObj && imgObj.getSrc) origImg = imgObj.getSrc();
      }
    }
    setOriginalImage(origImg || "");
    setCompareEditedImage(canvasEditor.toDataURL({ format: 'png', quality: 1, multiplier: 1 }));
    setCompareSliderPos(50);
    setIsComparing(true);
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-[#030712] flex items-center justify-center overflow-hidden relative p-4">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[500px] h-[300px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="flex flex-col items-center gap-6 md:gap-8 relative z-10 animate-in fade-in zoom-in duration-700">
          <div className="relative flex items-center justify-center p-6 md:p-8">
            <div className="absolute inset-0 border border-cyan-500/30 rounded-full animate-[spin_4s_linear_infinite]" />
            <div className="absolute inset-4 border border-blue-500/30 rounded-full animate-[spin_3s_linear_infinite_reverse]" />
            <RingLoader color="#22d3ee" size={60} className="md:w-[70px] md:h-[70px]" />
          </div>
          <div className="text-center space-y-2 md:space-y-3">
            <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-cyan-400" />
              Initializing Workspace
            </h2>
            <p className="text-white/40 text-xs md:text-sm tracking-widest uppercase font-medium">Setting up environment...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="h-screen w-full bg-[#030712] flex items-center justify-center p-4 md:p-6 relative">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5 pointer-events-none" />
        <div className="text-center max-w-sm md:max-w-md w-full bg-slate-900/50 p-8 md:p-10 rounded-3xl border border-white/5 backdrop-blur-xl shadow-2xl relative z-10">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5 md:mb-6 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
            <Monitor className="h-8 w-8 md:h-10 md:w-10 text-red-400" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 md:mb-3 tracking-tight">Project Unavailable</h1>
          <p className="text-white/60 text-sm md:text-lg leading-relaxed">
            The workspace you're looking for doesn't exist or you lack required permissions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <CanvasContext.Provider
      value={{
        canvasEditor, setCanvasEditor, activeTool, onToolChange: handleEditorToolChange,
        processingMessage, setProcessingMessage, zoomLevel, setZoomLevel,
        isSaved, setIsSaved, lastSavedTime, setLastSavedTime,
        showExportModal, setShowExportModal 
      }}
    >
      {processingMessage && (
        <div className="fixed inset-0 bg-[#030712]/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4 transition-all">
          <div className="rounded-3xl p-6 md:p-10 flex flex-col items-center gap-5 md:gap-6 bg-slate-900/90 border border-white/10 shadow-[0_0_100px_rgba(34,211,238,0.2)] animate-in zoom-in-95 duration-200 text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-xl animate-pulse" />
              <RingLoader color="#22d3ee" size={50} />
            </div>
            <div className="space-y-2">
              <p className="text-white font-semibold text-lg md:text-xl tracking-tight">{processingMessage}</p>
              <p className="text-cyan-400/70 text-xs md:text-sm flex items-center justify-center gap-2">
                <Info className="w-4 h-4" /> Please don't switch tabs
              </p>
            </div>
          </div>
        </div>
      )}

      {showExportModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-[#030712]/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowExportModal(false)} />
          <div className="relative w-full max-w-[420px] bg-slate-900/95 border border-white/20 rounded-3xl shadow-[0_0_80px_rgba(34,211,238,0.15)] overflow-hidden flex flex-col animate-in zoom-in-95 fade-in duration-200">
            <div className="px-6 py-5 border-b border-white/10 bg-slate-800/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl border border-cyan-500/30">
                  <Share2 className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-wide">Export Image</h2>
                  <p className="text-white/40 text-[11px] mt-0.5">Download or share your masterpiece</p>
                </div>
              </div>
              <button onClick={() => setShowExportModal(false)} className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-7 bg-gradient-to-b from-transparent to-[#030712]/80">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-white/60 uppercase tracking-widest">Save to Device</h3>
                  <span className="text-[10px] text-cyan-400 font-medium bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">High Quality 2x</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => handleDownload('png')} className="group relative overflow-hidden flex flex-col items-center justify-center gap-2 p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/50 rounded-2xl transition-all">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <ImageIcon className="w-6 h-6 text-cyan-400 mb-1" />
                    <div className="text-center">
                      <span className="block text-sm font-medium text-white">PNG</span>
                      <span className="block text-[10px] text-white/40 mt-0.5">Best Quality</span>
                    </div>
                  </button>
                  <button onClick={() => handleDownload('jpeg')} className="group relative overflow-hidden flex flex-col items-center justify-center gap-2 p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/50 rounded-2xl transition-all">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Download className="w-6 h-6 text-blue-400 mb-1" />
                    <div className="text-center">
                      <span className="block text-sm font-medium text-white">JPG</span>
                      <span className="block text-[10px] text-white/40 mt-0.5">Smaller Size</span>
                    </div>
                  </button>
                </div>
              </div>
              <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <div>
                <h3 className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-4">Share to Socials</h3>
                <div className="flex items-center justify-between px-2">
                  <button onClick={() => handleSocialShare('whatsapp')} className="group flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-[#25D366]/10 border border-[#25D366]/20 flex items-center justify-center group-hover:bg-[#25D366] group-hover:shadow-[0_0_15px_rgba(37,211,102,0.4)] transition-all duration-300">
                      <WhatsAppIcon className="w-5 h-5 text-[#25D366] group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-[10px] font-medium text-white/60 group-hover:text-white">WhatsApp</span>
                  </button>
                  <button onClick={() => handleSocialShare('facebook')} className="group flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-[#1877F2]/10 border border-[#1877F2]/20 flex items-center justify-center group-hover:bg-[#1877F2] group-hover:shadow-[0_0_15px_rgba(24,119,242,0.4)] transition-all duration-300">
                      <FacebookIcon className="w-5 h-5 text-[#1877F2] group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-[10px] font-medium text-white/60 group-hover:text-white">Facebook</span>
                  </button>
                  <button onClick={() => handleSocialShare('instagram')} className="group flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-[#E1306C]/10 border border-[#E1306C]/20 flex items-center justify-center group-hover:bg-gradient-to-tr from-[#F56040] via-[#E1306C] to-[#833AB4] group-hover:shadow-[0_0_15px_rgba(225,48,108,0.4)] transition-all duration-300 border-none relative">
                      <div className="absolute inset-[1px] rounded-full bg-[#1e2330] group-hover:bg-transparent transition-colors z-0" />
                      <InstagramIcon className="w-5 h-5 text-[#E1306C] group-hover:text-white transition-colors relative z-10" />
                    </div>
                    <span className="text-[10px] font-medium text-white/60 group-hover:text-white">Instagram</span>
                  </button>
                  <button onClick={() => handleSocialShare('twitter')} className="group flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all duration-300">
                      <TwitterIcon className="w-5 h-5 text-white/80 group-hover:text-black transition-colors" />
                    </div>
                    <span className="text-[10px] font-medium text-white/60 group-hover:text-white">Twitter</span>
                  </button>
                </div>
                <button onClick={copyProjectLink} className="w-full mt-5 flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors group">
                  <Link2 className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
                  <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">Copy Link to Editor</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showShortcuts && (
        <div className="fixed inset-0 bg-[#030712]/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-200">
          <div className="rounded-3xl bg-slate-900/95 border border-white/10 shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-5 md:px-8 py-4 md:py-6 border-b border-white/5 flex items-center justify-between bg-slate-800/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/10 rounded-xl border border-cyan-500/20 hidden sm:block">
                  <Keyboard className="h-5 w-5 md:h-6 md:w-6 text-cyan-400" />
                </div>
                <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">Keyboard Shortcuts</h2>
              </div>
              <button onClick={() => setShowShortcuts(false)} className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 md:p-8 overflow-y-auto no-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 md:gap-y-4">
                {[
                  { keys: "Ctrl + Z", action: "Undo last action" },
                  { keys: "Ctrl + Shift + Z", action: "Redo action" },
                  { keys: "Ctrl + Y", action: "Redo (alternate)" },
                  { keys: "Ctrl + S", action: "Force save project" },
                  { keys: "Del / Backspace", action: "Remove selected" },
                  { keys: "Ctrl + A", action: "Select all elements" },
                  { keys: "Ctrl + B", action: "Toggle review panel" },
                  { keys: "Arrow Keys", action: "Nudge selected (1px)" },
                  { keys: "Shift + Arrow", action: "Nudge selected (10px)" },
                  { keys: "Tab", action: "Cycle through objects" },
                  { keys: "Ctrl + T", action: "Dashboard page" },
                ].map((shortcut, i) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.02] transition-colors group">
                    <span className="text-white/70 text-sm md:text-base group-hover:text-white transition-colors">{shortcut.action}</span>
                    <kbd className="px-2 md:px-3 py-1 md:py-1.5 bg-slate-950 border border-white/10 rounded-lg text-cyan-300 font-mono text-[10px] md:text-xs shadow-inner shadow-black/50">
                      {shortcut.keys}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {isReviewOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-[#030712]/70 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsReviewOpen(false)} />
          <div className="relative w-full max-w-[500px] h-[85vh] sm:h-[80vh] flex flex-col bg-slate-900/95 border border-white/20 rounded-3xl shadow-[0_0_80px_rgba(34,211,238,0.15)] overflow-hidden animate-in zoom-in-95 fade-in duration-200">
            <div className="p-5 md:p-6 border-b border-white/10 bg-slate-800/60 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl border border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.15)]">
                  <MessageSquare className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-wide">Reviews & Feedback</h2>
                  <p className="text-white/40 text-[11px] md:text-xs mt-0.5">Collaborate with your team in real-time</p>
                </div>
              </div>
              <button onClick={() => setIsReviewOpen(false)} className="p-2 text-white/40 hover:text-white hover:bg-red-500/20 hover:text-red-400 rounded-xl transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-6 no-scrollbar bg-gradient-to-b from-transparent to-[#030712]/80">
              <ReviewSection projectId={projectId} />
            </div>
          </div>
        </div>
      )}

      <div className="flex h-[100dvh] w-full flex-col bg-[#0a0c10] text-slate-200 overflow-hidden font-sans relative">
        
        <div className={`shrink-0 border-b border-white/5 bg-[#0a0c10] relative z-40 ${isSidebarOpen ? 'block' : 'hidden'}`}>
          <div className="min-w-max md:min-w-0">
            <EditorTopBar project={project} />
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden relative">
          
          {isSidebarOpen && (
            <div className="lg:hidden absolute inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setIsSidebarOpen(false)} />
          )}

          <div 
            className={`
              h-full z-50 flex-shrink-0 transition-none
              ${isSidebarOpen 
                ? 'w-[340px] sm:w-[400px] absolute lg:relative left-0 top-0 bg-slate-900/95 border-r border-white/5 backdrop-blur-xl shadow-2xl lg:shadow-[10px_0_20px_rgba(0,0,0,0.2)]' 
                : 'w-0 relative hidden lg:block'}
            `}
          >
            <div className={`
              w-[340px] sm:w-[400px] h-full transition-none
              ${isSidebarOpen ? 'flex flex-col' : 'hidden'}
              overflow-y-auto overflow-x-hidden no-scrollbar
            `}>
              <EditorSidebar project={project} />
            </div>
          </div>

          <div className="flex-1 relative overflow-hidden bg-[#0d1117] flex flex-col shadow-inner w-full">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] md:bg-[size:40px_40px] pointer-events-none" />
            
            <CanvasEditor key={project?._id} project={project} activeTool={activeTool} />
            {/* ✨ CHANGE: Batch Editor ki state yahan props ke through bheji gayi hai */}
            <BatchEditorPanel project={project} isOpen={isBatchOpen} setIsOpen={setIsBatchOpen} />

            {isComparing && (
              <div className="absolute inset-0 z-30 bg-[#0d1117]/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200">
                <button 
                  onClick={() => setIsComparing(false)} 
                  className="absolute top-4 right-4 z-50 p-2.5 bg-black/60 hover:bg-red-500/80 text-white rounded-full transition-all backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="relative inline-block max-w-full max-h-full select-none group shadow-[0_0_40px_rgba(168,85,247,0.15)] rounded-2xl overflow-hidden ring-1 ring-white/10 bg-black/20">
                  <img src={compareEditedImage} alt="Layout" className="block max-w-full max-h-[75vh] w-auto h-auto opacity-0 pointer-events-none object-contain" />
                  <img src={compareEditedImage} alt="After" className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
                  <img src={originalImage} alt="Before" className="absolute inset-0 w-full h-full object-contain pointer-events-none" style={{ clipPath: `inset(0 ${100 - compareSliderPos}% 0 0)` }} />
                  <div className={`absolute top-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full text-white text-[10px] md:text-xs font-bold uppercase tracking-widest border border-white/10 transition-opacity z-10 pointer-events-none ${compareSliderPos > 10 ? 'opacity-100' : 'opacity-0'}`}>Before</div>
                  <div className={`absolute top-4 right-4 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full text-white text-[10px] md:text-xs font-bold uppercase tracking-widest border border-white/10 transition-opacity z-10 pointer-events-none ${compareSliderPos < 90 ? 'opacity-100' : 'opacity-0'}`}>After</div>
                  <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.8)] pointer-events-none z-10 flex items-center justify-center" style={{ left: `${compareSliderPos}%` }}>
                    <div className="w-8 h-8 -ml-4 bg-white rounded-full flex items-center justify-center shadow-xl border border-slate-200 text-slate-900 group-hover:scale-110 transition-transform duration-200">
                      <ArrowLeftRight className="w-4 h-4" />
                    </div>
                  </div>
                  <input type="range" min="0" max="100" value={compareSliderPos} onChange={(e) => setCompareSliderPos(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20 m-0" />
                </div>
              </div>
            )}

            {!isComparing && (
              <div className="absolute bottom-4 md:bottom-6 right-4 md:right-6 flex items-center gap-2 md:gap-3 bg-slate-900/90 border border-white/10 rounded-xl md:rounded-2xl px-3 md:px-4 py-1.5 md:py-2 backdrop-blur-xl shadow-2xl z-20">
                <div className="flex items-center gap-2 border-r border-white/10 pr-2 md:pr-4">
                  <span className="hidden sm:inline text-white/50 text-[10px] md:text-xs font-medium uppercase tracking-wider">Zoom</span>
                  <span className="text-cyan-400 font-bold text-xs md:text-sm">{zoomLevel}%</span>
                </div>
                <button 
                  onClick={() => setZoomLevel(100)} 
                  className="text-white/50 hover:text-white text-[10px] md:text-xs font-medium transition-colors"
                >
                  Fit
                </button>
              </div>
            )}

            {isLayersOpen && (
              <div className="absolute top-4 right-4 md:top-6 md:right-6 z-50 w-[260px] sm:w-[280px] max-h-[70vh] flex flex-col bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-right-4 duration-200">
                <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-white/[0.02] shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-md border border-cyan-500/30">
                       <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                    <h3 className="text-sm font-bold text-white tracking-wide">Layers Panel</h3>
                  </div>
                  <button onClick={() => setIsLayersOpen(false)} className="p-1 text-white/40 hover:text-white hover:bg-white/10 rounded-md transition-all">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1.5 no-scrollbar bg-gradient-to-b from-transparent to-black/20">
                  {canvasObjects.length === 0 ? (
                    <div className="py-8 flex flex-col items-center justify-center text-white/30 text-xs gap-3">
                      <Layers className="w-8 h-8 opacity-20" />
                      <p>No layers in canvas</p>
                    </div>
                  ) : (
                    canvasObjects.map((obj, i) => {
                      const isActive = activeObjectId === obj.id;
                      const isLocked = !obj.selectable;
                      const isVisible = obj.visible !== false; 
                      return (
                        <div 
                          key={obj.id || i}
                          onClick={() => selectLayer(obj)}
                          className={`
                            group relative flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all duration-200 animate-in fade-in slide-in-from-right-4
                            ${isActive 
                              ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.15)]' 
                              : 'bg-white/[0.02] border border-white/5 hover:bg-white/[0.06] hover:border-white/20'
                            }
                          `}
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <button 
                              onClick={(e) => { e.stopPropagation(); toggleLayerVisibility(obj); }}
                              className={`p-1 rounded-md transition-colors ${isVisible ? 'text-white/60 hover:text-white hover:bg-white/10' : 'text-white/20 hover:text-white/40'}`}
                            >
                              {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                            </button>
                            <div className={`p-1.5 rounded-lg border ${isActive ? 'bg-black/40 border-white/10' : 'bg-black/20 border-white/5'}`}>
                              {getLayerIcon(obj.type)}
                            </div>
                            <span className={`text-[11px] font-medium truncate max-w-[80px] ${isActive ? 'text-white' : 'text-white/70'} ${!isVisible && 'opacity-50 line-through'}`}>
                              {obj.name || obj.type.charAt(0).toUpperCase() + obj.type.slice(1)}
                            </span>
                          </div>
                          <div className={`flex items-center transition-opacity ${isActive || isLocked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                            <button 
                              onClick={(e) => { e.stopPropagation(); toggleLayerLock(obj); }}
                              className={`p-1.5 rounded-md transition-colors ${isLocked ? 'text-red-400 hover:bg-red-400/20' : 'text-white/40 hover:text-white hover:bg-white/10'}`}
                            >
                              {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                            </button>
                            <div className="flex flex-col mx-0.5">
                              <button onClick={(e) => { e.stopPropagation(); moveLayerUp(obj); }} disabled={i === 0} className="text-white/30 hover:text-white hover:bg-white/10 rounded-sm disabled:opacity-30 disabled:hover:bg-transparent">
                                <ChevronUp className="w-3 h-3" />
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); moveLayerDown(obj); }} disabled={i === canvasObjects.length - 1} className="text-white/30 hover:text-white hover:bg-white/10 rounded-sm disabled:opacity-30 disabled:hover:bg-transparent">
                                <ChevronDown className="w-3 h-3" />
                              </button>
                            </div>
                            <button 
                              onClick={(e) => { e.stopPropagation(); deleteLayer(obj); }}
                              className="p-1.5 text-white/30 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {isSelectiveColorOpen && (
              <FloatingSelectiveColorPanel
                canvasEditor={canvasEditor}
                onClose={() => setIsSelectiveColorOpen(false)}
              />
            )}

            {isTwilightEnhanceOpen && (
              <TwilightEnhancePanel
                canvasEditor={canvasEditor}
                onClose={() => setIsTwilightEnhanceOpen(false)}
              />
            )}

            {isWaterEnhancerOpen && (
              <WaterEnhancerPanel
                canvasEditor={canvasEditor}
                onClose={() => setIsWaterEnhancerOpen(false)}
              />
            )}

          </div>
        </div>

        <div className="shrink-0 h-12 md:h-10 border-t border-white/5 bg-[#030712] flex items-center justify-between px-3 md:px-4 z-40 relative">
          <div className="flex items-center gap-2 md:gap-4">
            
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-all ${isSidebarOpen ? 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.1)]' : 'text-white/60 hover:text-white bg-white/5 hover:bg-white/10'}`}
            >
              {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
              <span className="font-medium hidden xs:inline">Tools</span>
            </button>

            <button 
              onClick={() => setIsLayersOpen(!isLayersOpen)}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-all ${isLayersOpen ? 'bg-purple-500/20 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.1)]' : 'text-white/60 hover:text-white bg-white/5 hover:bg-white/10'}`}
            >
              <Layers className="w-4 h-4" />
            </button>

            {/* ✨ CHANGE: NAYA BATCH EDITOR BUTTON */}
            <button 
              onClick={() => togglePremiumPanel("batch_editor", () => setIsBatchOpen(!isBatchOpen))}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-all ${isBatchOpen ? 'bg-lime-500/20 text-lime-400 shadow-[0_0_10px_rgba(163,230,53,0.1)]' : 'text-white/60 hover:text-white bg-white/5 hover:bg-white/10'}`}
              title="Toggle Batch Editor"
            >
              <Images className="w-4 h-4" />
              <span className="font-medium hidden sm:inline">Batch</span>
            </button>

            <button
              onClick={() => togglePremiumPanel("selective_color", () => setIsSelectiveColorOpen(!isSelectiveColorOpen))}
              title="Selective Color"
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-all relative
                ${isSelectiveColorOpen
                  ? 'bg-violet-500/20 text-violet-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                  : 'text-white/60 hover:text-white bg-white/5 hover:bg-white/10'
                }`}
            >
              <Palette className="w-4 h-4" />
              <span className="font-medium hidden sm:inline">Colors</span>
              {isSelectiveColorOpen && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-violet-400 shadow-[0_0_6px_rgba(168,85,247,0.8)]" />
              )}
            </button>

            <button
              onClick={() => togglePremiumPanel("twilight_enhance", () => setIsTwilightEnhanceOpen(!isTwilightEnhanceOpen))}
              title="Twilight Enhance"
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-all relative
                ${isTwilightEnhanceOpen
                  ? 'bg-amber-500/20 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.22)]'
                  : 'text-white/60 hover:text-white bg-white/5 hover:bg-white/10'
                }`}
            >
              <SunMedium className="w-4 h-4" />
              <span className="font-medium hidden sm:inline">Twilight</span>
              {isTwilightEnhanceOpen && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-300 shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
              )}
            </button>

            <button
              onClick={() => togglePremiumPanel("water_enhancer", () => setIsWaterEnhancerOpen(!isWaterEnhancerOpen))}
              title="Water Enhancer"
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-all relative
                ${isWaterEnhancerOpen
                  ? 'bg-cyan-500/20 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.24)]'
                  : 'text-white/60 hover:text-white bg-white/5 hover:bg-white/10'
                }`}
            >
              <Droplets className="w-4 h-4" />
              <span className="font-medium hidden sm:inline">Water</span>
              {isWaterEnhancerOpen && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_6px_rgba(34,211,238,0.85)]" />
              )}
            </button>
            
            <button
              onClick={undo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-all
                ${canUndo 
                  ? 'text-white/70 hover:text-white bg-white/5 hover:bg-white/10 hover:shadow-[0_0_10px_rgba(255,255,255,0.05)] cursor-pointer' 
                  : 'text-white/20 bg-white/[0.02] cursor-not-allowed opacity-50'
                }`}
            >
              <Undo2 className="w-4 h-4" />
            </button>

            <button
              onClick={redo}
              disabled={!canRedo}
              title="Redo (Ctrl+Shift+Z)"
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-all
                ${canRedo 
                  ? 'text-white/70 hover:text-white bg-white/5 hover:bg-white/10 hover:shadow-[0_0_10px_rgba(255,255,255,0.05)] cursor-pointer' 
                  : 'text-white/20 bg-white/[0.02] cursor-not-allowed opacity-50'
                }`}
            >
              <Redo2 className="w-4 h-4" />
            </button>

            <div className="hidden xs:flex items-center gap-2 cursor-default" title={isSaved ? "Everything is synced" : "Saving changes..."}>
              <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${isSaved ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" : "bg-yellow-400 animate-pulse"}`}></div>
              <span className="text-[10px] md:text-xs font-medium text-white/60">{isSaved ? "Saved" : "Saving..."}</span>
            </div>
            
            {lastSavedTime && (
              <span className="text-[10px] md:text-xs text-white/30 font-mono hidden lg:block">
                Update: {lastSavedTime}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <span className="hidden sm:inline text-[10px] md:text-xs text-white/40 font-mono bg-white/5 px-2 py-0.5 rounded-md">
              {project.width} x {project.height}px
            </span>
            
            <button onClick={() => setShowShortcuts(true)} className="hidden sm:flex hover:text-cyan-400 transition-colors items-center gap-1.5 text-xs text-white/50 hover:bg-white/5 px-2 py-1 rounded-md">
              <Keyboard className="h-3.5 w-3.5" /> 
              <span>Shortcuts</span>
            </button>

            <div className="hidden sm:block h-4 w-px bg-white/10 mx-1"></div>
            
            <button 
              onClick={toggleCompareMode} 
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border ${isComparing ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]' : 'text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border-transparent'} transition-all`}
              title="Compare Before & After"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="font-medium hidden md:inline">{isComparing ? 'Exit Compare' : 'Compare'}</span>
            </button>

            <button 
              onClick={() => setIsReviewOpen(!isReviewOpen)} 
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border ${isReviewOpen ? 'bg-pink-500/20 text-pink-400 border-pink-500/30 shadow-[0_0_10px_rgba(236,72,153,0.2)]' : 'text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border-transparent'} transition-all`}
              title="Toggle Reviews Modal (Ctrl+B)"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="font-medium hidden lg:inline">Feedback</span>
            </button>
          </div>
        </div>

        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          restrictedTool={restrictedTool}
          reason="This is a Pro editing feature. Upgrade to Pro for unlimited projects, unlimited exports, batch editing, and all AI enhancement tools."
        />
      </div>
    </CanvasContext.Provider>
  );
}
