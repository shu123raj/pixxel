"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { RotateCcw, Sparkles, SunMedium, X, Zap } from "lucide-react";
import { toast } from "sonner";

const PRESETS = [
  { id: "golden", label: "Golden", accent: "#f59e0b", shadow: [42, 23, 8], mid: [244, 146, 55], highlight: [255, 221, 140], saturation: 0.12, contrast: 0.07 },
  { id: "blush", label: "Blush", accent: "#fb7185", shadow: [46, 20, 30], mid: [239, 104, 128], highlight: [255, 202, 200], saturation: 0.1, contrast: 0.045 },
  { id: "emerald", label: "Emerald", accent: "#34d399", shadow: [8, 43, 36], mid: [44, 180, 136], highlight: [186, 255, 219], saturation: 0.08, contrast: 0.055 },
  { id: "mauve", label: "Mauve", accent: "#c084fc", shadow: [36, 24, 55], mid: [154, 112, 192], highlight: [230, 205, 255], saturation: 0.075, contrast: 0.05 },
  { id: "blue", label: "Blue", accent: "#60a5fa", shadow: [10, 28, 62], mid: [66, 133, 220], highlight: [191, 226, 255], saturation: 0.09, contrast: 0.06 },
];

const DEFAULT_AMOUNT = 55;
const DEFAULT_EXPOSURE = 0;
const clamp01 = (value) => Math.max(0, Math.min(1, value));
const clamp255 = (value) => Math.max(0, Math.min(255, Math.round(value)));
const smoothstep = (edge0, edge1, value) => {
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

function getFabricModule(module) {
  return module.fabric || module;
}

function isFabricImageObject(object) {
  return ["image", "Image", "FabricImage", "fabricImage"].includes(object?.type) || typeof object?.applyFilters === "function";
}

function useCanvas2dFilterBackend(fab) {
  if (!fab) return;
  if (fab.config) fab.config.enableGLFiltering = false;
  if (typeof fab.setFilterBackend === "function" && fab.Canvas2dFilterBackend) {
    fab.setFilterBackend(new fab.Canvas2dFilterBackend());
  }
}

export function registerTwilightEnhanceFilter(fab) {
  useCanvas2dFilterBackend(fab);
  if (fab.filters?.TwilightEnhance) return fab.filters.TwilightEnhance;
  const BaseFilter = fab.filters?.BaseFilter || fab.Image?.filters?.BaseFilter;
  if (!BaseFilter) return null;

  class TwilightEnhanceFilter extends BaseFilter {
    constructor(options = {}) {
      super(options);
      this.preset = options.preset || PRESETS[0];
      this.amount = options.amount ?? DEFAULT_AMOUNT;
      this.exposure = options.exposure ?? DEFAULT_EXPOSURE;
    }

    applyTo2d(options) {
      const imageData = options.imageData || options;
      const data = imageData.data;
      const preset = this.preset || PRESETS[0];
      const amount = clamp01((this.amount ?? DEFAULT_AMOUNT) / 100);
      const exposureStops = ((this.exposure ?? DEFAULT_EXPOSURE) / 100) * 1.6;
      const exposureGain = Math.pow(2, exposureStops);

      for (let i = 0; i < data.length; i += 4) {
        const r0 = data[i];
        const g0 = data[i + 1];
        const b0 = data[i + 2];
        let r = clamp255(r0 * exposureGain);
        let g = clamp255(g0 * exposureGain);
        let b = clamp255(b0 * exposureGain);

        const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
        const shadowW = 1 - smoothstep(0.12, 0.58, lum);
        const highlightW = smoothstep(0.42, 0.94, lum);
        const midW = 1 - Math.abs(lum - 0.5) * 2;
        const toneStrength = amount * (0.22 + 0.18 * (1 - Math.abs(lum - 0.5)));

        const tr = preset.shadow[0] * shadowW + preset.mid[0] * midW * 0.45 + preset.highlight[0] * highlightW;
        const tg = preset.shadow[1] * shadowW + preset.mid[1] * midW * 0.45 + preset.highlight[1] * highlightW;
        const tb = preset.shadow[2] * shadowW + preset.mid[2] * midW * 0.45 + preset.highlight[2] * highlightW;
        const tw = shadowW + midW * 0.45 + highlightW || 1;

        r = r + ((tr / tw) - r) * toneStrength;
        g = g + ((tg / tw) - g) * toneStrength;
        b = b + ((tb / tw) - b) * toneStrength;

        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        const satBoost = 1 + preset.saturation * amount;
        r = gray + (r - gray) * satBoost;
        g = gray + (g - gray) * satBoost;
        b = gray + (b - gray) * satBoost;

        const contrast = 1 + preset.contrast * amount;
        r = (r - 128) * contrast + 128;
        g = (g - 128) * contrast + 128;
        b = (b - 128) * contrast + 128;

        const highlightProtect = smoothstep(0.75, 1, lum) * amount * 0.18;
        r = r * (1 - highlightProtect) + r0 * highlightProtect;
        g = g * (1 - highlightProtect) + g0 * highlightProtect;
        b = b * (1 - highlightProtect) + b0 * highlightProtect;

        data[i] = clamp255(r0 + (r - r0) * amount);
        data[i + 1] = clamp255(g0 + (g - g0) * amount);
        data[i + 2] = clamp255(b0 + (b - b0) * amount);
      }
    }

    toObject() {
      return { ...super.toObject(), preset: this.preset, amount: this.amount, exposure: this.exposure };
    }

    static fromObject(object, callback) {
      const instance = new TwilightEnhanceFilter(object);
      if (callback) callback(instance);
      return instance;
    }
  }

  TwilightEnhanceFilter.type = "TwilightEnhance";
  if (!fab.filters) fab.filters = {};
  fab.filters.TwilightEnhance = TwilightEnhanceFilter;
  if (fab.classRegistry?.setClass) fab.classRegistry.setClass(TwilightEnhanceFilter, "TwilightEnhance");
  return TwilightEnhanceFilter;
}

function RangeControl({ label, value, min, max, accent, suffix = "", onChange, onCommit }) {
  const percent = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-white/45">{label}</span>
        <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[11px] text-white/75">{value > 0 && min < 0 ? "+" : ""}{value}{suffix}</span>
      </div>
      <div className="relative flex h-5 items-center">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full" style={{ width: `${percent}%`, background: `linear-gradient(90deg, ${accent}88, ${accent})` }} />
        </div>
        <input type="range" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} onMouseUp={onCommit} onTouchEnd={onCommit} className="absolute inset-0 h-5 w-full cursor-grab opacity-0 active:cursor-grabbing" />
        <div className="pointer-events-none absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-lg" style={{ left: `${percent}%`, background: accent, boxShadow: `0 0 12px ${accent}99` }} />
      </div>
    </div>
  );
}

export function TwilightEnhancePanel({ canvasEditor, onClose }) {
  const [presetId, setPresetId] = useState("golden");
  const [amount, setAmount] = useState(DEFAULT_AMOUNT);
  const [exposure, setExposure] = useState(DEFAULT_EXPOSURE);
  const filterRef = useRef(null);
  const activePreset = useMemo(() => PRESETS.find((preset) => preset.id === presetId) || PRESETS[0], [presetId]);

  const getActiveImage = useCallback(() => {
    if (!canvasEditor) return null;
    const active = canvasEditor.getActiveObject();
    if (isFabricImageObject(active)) return active;
    return canvasEditor.getObjects().find(isFabricImageObject) || null;
  }, [canvasEditor]);

  const applyEnhance = useCallback(async (nextPreset, nextAmount, nextExposure, shouldCommit = false) => {
    const imageObject = getActiveImage();
    if (!imageObject) {
      toast.error("Select or add an image first");
      return;
    }

    const module = await import("fabric");
    const fab = getFabricModule(module);
    useCanvas2dFilterBackend(fab);
    const FilterClass = registerTwilightEnhanceFilter(fab);
    if (!FilterClass) {
      toast.error("Twilight filter is not available");
      return;
    }

    if (!filterRef.current) {
      const existing = imageObject.filters?.find((filter) => filter?.type === "TwilightEnhance");
      filterRef.current = existing || new FilterClass();
    }

    filterRef.current.preset = nextPreset;
    filterRef.current.amount = nextAmount;
    filterRef.current.exposure = nextExposure;

    const remainingFilters = (imageObject.filters || []).filter((filter) => filter?.type !== "TwilightEnhance");
    imageObject.filters = nextAmount > 0 || nextExposure !== 0 ? [...remainingFilters, filterRef.current] : remainingFilters;
    if (nextAmount === 0 && nextExposure === 0) filterRef.current = null;

    imageObject.dirty = true;
    imageObject.applyFilters();
    imageObject.setCoords();
    canvasEditor.requestRenderAll();

    if (shouldCommit) {
      canvasEditor.fire("object:modified", { target: imageObject });
      toast.success("Twilight enhance applied");
    }
  }, [canvasEditor, getActiveImage]);

  const updatePreset = (preset) => {
    setPresetId(preset.id);
    applyEnhance(preset, amount, exposure, true);
  };

  const resetEnhance = () => {
    setPresetId("golden");
    setAmount(0);
    setExposure(0);
    applyEnhance(PRESETS[0], 0, 0, true);
  };

  return (
    <div className="absolute left-4 top-4 z-50 flex max-h-[72vh] w-[320px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950/90 shadow-[0_24px_70px_rgba(0,0,0,0.55)] backdrop-blur-2xl sm:left-auto sm:right-6 sm:top-6 sm:w-[360px]">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-2 shadow-[0_0_18px_rgba(245,158,11,0.18)]"><SunMedium className="h-4 w-4 text-amber-300" /></div>
          <div><h3 className="text-sm font-bold tracking-wide text-white">Twilight Enhance</h3><p className="text-[11px] text-white/40">Split-tone grade with exposure control</p></div>
        </div>
        <button onClick={onClose} className="rounded-lg p-1.5 text-white/40 transition hover:bg-white/10 hover:text-white" title="Close"><X className="h-4 w-4" /></button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-4 no-scrollbar">
        <div className="grid grid-cols-5 gap-2">
          {PRESETS.map((preset) => {
            const isActive = preset.id === presetId;
            return (
              <button key={preset.id} onClick={() => updatePreset(preset)} className={`group flex flex-col items-center gap-1.5 rounded-xl border p-2 transition ${isActive ? "border-white/30 bg-white/10" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.07]"}`} title={preset.label}>
                <span className="h-7 w-7 rounded-full border border-white/20 shadow-lg transition group-hover:scale-105" style={{ background: `linear-gradient(135deg, rgb(${preset.shadow.join(",")}), ${preset.accent}, rgb(${preset.highlight.join(",")}))` }} />
                <span className="max-w-full truncate text-[10px] font-semibold text-white/65">{preset.label}</span>
              </button>
            );
          })}
        </div>

        <div className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
          <RangeControl label="Amount" value={amount} min={0} max={100} accent={activePreset.accent} suffix="%" onChange={(nextValue) => { setAmount(nextValue); applyEnhance(activePreset, nextValue, exposure); }} onCommit={() => applyEnhance(activePreset, amount, exposure, true)} />
          <RangeControl label="Exposure" value={exposure} min={-100} max={100} accent={activePreset.accent} onChange={(nextValue) => { setExposure(nextValue); applyEnhance(activePreset, amount, nextValue); }} onCommit={() => applyEnhance(activePreset, amount, exposure, true)} />
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-[11px] text-white/45"><Zap className="h-3.5 w-3.5 text-amber-300" /><span>Luminance-aware color grading preserves bright highlights.</span></div>
      </div>

      <div className="flex items-center justify-between border-t border-white/10 bg-black/20 px-4 py-3">
        <button onClick={resetEnhance} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-white/55 transition hover:bg-white/10 hover:text-white"><RotateCcw className="h-3.5 w-3.5" />Reset</button>
        <button onClick={() => applyEnhance(activePreset, amount, exposure, true)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-white transition" style={{ background: activePreset.accent }}><Sparkles className="h-3.5 w-3.5" />Apply</button>
      </div>
    </div>
  );
}
