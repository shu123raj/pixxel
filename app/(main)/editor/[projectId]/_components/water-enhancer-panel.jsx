"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { Droplets, RotateCcw, Sparkles, X, Zap } from "lucide-react";
import { toast } from "sonner";

const DEFAULTS = {
  amount: 65,
  contrast: 18,
  bluish: 24,
  greenish: 8,
  brightness: 8,
  originalTone: 70,
};

const clamp01 = (value) => Math.max(0, Math.min(1, value));
const clamp255 = (value) => Math.max(0, Math.min(255, Math.round(value)));
const smoothstep = (edge0, edge1, value) => {
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

function getFabricModule(module) {
  return module.fabric || module;
}

function useCanvas2dFilterBackend(fab) {
  if (!fab) return;
  if (fab.config) fab.config.enableGLFiltering = false;
  if (typeof fab.setFilterBackend === "function" && fab.Canvas2dFilterBackend) {
    fab.setFilterBackend(new fab.Canvas2dFilterBackend());
  }
}

function isFabricImageObject(object) {
  return ["image", "Image", "FabricImage", "fabricImage"].includes(object?.type) || typeof object?.applyFilters === "function";
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }

  return [h, s, l];
}

function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360;
  h /= 360;
  if (s === 0) {
    const v = clamp255(l * 255);
    return [v, v, v];
  }

  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    clamp255(hue2rgb(p, q, h + 1 / 3) * 255),
    clamp255(hue2rgb(p, q, h) * 255),
    clamp255(hue2rgb(p, q, h - 1 / 3) * 255),
  ];
}

function hueBandScore(hue, start, end, feather) {
  if (start <= end) {
    return smoothstep(start - feather, start + feather, hue) * (1 - smoothstep(end - feather, end + feather, hue));
  }

  const wrappedHue = hue < start ? hue + 360 : hue;
  return smoothstep(start - feather, start + feather, wrappedHue) * (1 - smoothstep(end + 360 - feather, end + 360 + feather, wrappedHue));
}

function buildWaterMask(data, width, height, sensitivity) {
  const pixelCount = width * height;
  const rawMask = new Float32Array(pixelCount);
  const softMask = new Float32Array(pixelCount);
  const sensitivityBoost = 0.78 + sensitivity * 0.44;

  for (let p = 0; p < pixelCount; p += 1) {
    const i = p * 4;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const [h, s, l] = rgbToHsl(r, g, b);

    const cyanBlue = hueBandScore(h, 165, 235, 24);
    const tealGreen = hueBandScore(h, 120, 176, 26) * 0.8;
    const deepBlue = hueBandScore(h, 205, 255, 20) * 0.7;
    const hueScore = Math.max(cyanBlue, tealGreen, deepBlue);

    const saturationScore = smoothstep(0.055, 0.2, s) * (1 - smoothstep(0.82, 1, s) * 0.35);
    const luminanceScore = smoothstep(0.08, 0.28, l) * (1 - smoothstep(0.88, 1, l) * 0.55);
    const coolDominance = clamp01(((b + g) / 2 - r + 18) / 92);
    const blueGreenBalance = 1 - Math.min(1, Math.abs(b - g) / 150) * 0.28;

    const warmReject = hueBandScore(h, 0, 70, 22) + hueBandScore(h, 285, 360, 20);
    const foliageReject = h >= 82 && h <= 126 && g > b + 28 ? 0.45 : 0;
    const neutralReject = s < 0.045 ? 0.6 : 0;

    let score = hueScore * saturationScore * luminanceScore * coolDominance * blueGreenBalance * sensitivityBoost;
    score *= 1 - Math.min(0.78, warmReject * 0.65 + foliageReject + neutralReject);
    rawMask[p] = clamp01(score);
  }

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let sum = 0;
      let weight = 0;
      for (let oy = -1; oy <= 1; oy += 1) {
        const yy = y + oy;
        if (yy < 0 || yy >= height) continue;
        for (let ox = -1; ox <= 1; ox += 1) {
          const xx = x + ox;
          if (xx < 0 || xx >= width) continue;
          const w = ox === 0 && oy === 0 ? 4 : ox === 0 || oy === 0 ? 2 : 1;
          sum += rawMask[yy * width + xx] * w;
          weight += w;
        }
      }
      softMask[y * width + x] = smoothstep(0.12, 0.46, sum / weight);
    }
  }

  return softMask;
}

export function registerWaterEnhancerFilter(fab) {
  useCanvas2dFilterBackend(fab);
  if (fab.filters?.WaterEnhancer) return fab.filters.WaterEnhancer;
  const BaseFilter = fab.filters?.BaseFilter || fab.Image?.filters?.BaseFilter;
  if (!BaseFilter) return null;

  class WaterEnhancerFilter extends BaseFilter {
    constructor(options = {}) {
      super(options);
      this.amount = options.amount ?? DEFAULTS.amount;
      this.contrast = options.contrast ?? DEFAULTS.contrast;
      this.bluish = options.bluish ?? DEFAULTS.bluish;
      this.greenish = options.greenish ?? DEFAULTS.greenish;
      this.brightness = options.brightness ?? DEFAULTS.brightness;
      this.originalTone = options.originalTone ?? DEFAULTS.originalTone;
    }

    applyTo2d(options) {
      const imageData = options.imageData || options;
      const data = imageData.data;
      const width = imageData.width || options.sourceWidth || options.destinationWidth;
      const height = imageData.height || options.sourceHeight || options.destinationHeight;
      if (!width || !height) return;

      const original = new Uint8ClampedArray(data);
      const amount = clamp01((this.amount ?? DEFAULTS.amount) / 100);
      const originalTone = clamp01((this.originalTone ?? DEFAULTS.originalTone) / 100);
      const mask = buildWaterMask(original, width, height, amount);
      const contrastFactor = 1 + ((this.contrast ?? 0) / 100) * 0.72;
      const brightnessLift = ((this.brightness ?? 0) / 100) * 46;
      const blueShift = ((this.bluish ?? 0) / 100) * 42;
      const greenShift = ((this.greenish ?? 0) / 100) * 36;

      for (let p = 0; p < mask.length; p += 1) {
        const water = mask[p] * amount;
        if (water < 0.015) continue;

        const i = p * 4;
        const r0 = original[i];
        const g0 = original[i + 1];
        const b0 = original[i + 2];
        const [h, s, l] = rgbToHsl(r0, g0, b0);

        const targetHue = b0 >= g0 ? 207 : 178;
        const coolHue = targetHue + ((this.bluish ?? 0) - (this.greenish ?? 0)) * 0.18;
        const hueBlend = water * (1 - originalTone * 0.78) * 0.38;
        const satBoost = water * (0.16 + Math.abs((this.bluish ?? 0) + (this.greenish ?? 0)) / 900);
        const lumLift = (brightnessLift / 255) * water;

        let nextH = h + ((((coolHue - h + 540) % 360) - 180) * hueBlend);
        let nextS = clamp01(s + (1 - s) * satBoost);
        let nextL = clamp01(l + lumLift);
        let [r, g, b] = hslToRgb(nextH, nextS, nextL);

        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        r = (r - lum) * contrastFactor + lum;
        g = (g - lum) * contrastFactor + lum + greenShift * water;
        b = (b - lum) * contrastFactor + lum + blueShift * water;
        r -= (blueShift + greenShift) * water * 0.16;

        const preserve = originalTone * 0.36;
        r = r * (1 - preserve) + r0 * preserve;
        g = g * (1 - preserve) + g0 * preserve;
        b = b * (1 - preserve) + b0 * preserve;

        data[i] = clamp255(r0 + (r - r0) * water);
        data[i + 1] = clamp255(g0 + (g - g0) * water);
        data[i + 2] = clamp255(b0 + (b - b0) * water);
      }
    }

    toObject() {
      return {
        ...super.toObject(),
        amount: this.amount,
        contrast: this.contrast,
        bluish: this.bluish,
        greenish: this.greenish,
        brightness: this.brightness,
        originalTone: this.originalTone,
      };
    }

    static fromObject(object, callback) {
      const instance = new WaterEnhancerFilter(object);
      if (callback) callback(instance);
      return instance;
    }
  }

  WaterEnhancerFilter.type = "WaterEnhancer";
  if (!fab.filters) fab.filters = {};
  fab.filters.WaterEnhancer = WaterEnhancerFilter;
  if (fab.classRegistry?.setClass) fab.classRegistry.setClass(WaterEnhancerFilter, "WaterEnhancer");
  return WaterEnhancerFilter;
}

function RangeControl({ label, value, min, max, accent, suffix = "", onChange, onCommit }) {
  const percent = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-white/45">{label}</span>
        <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[11px] text-white/75">
          {value > 0 && min < 0 ? "+" : ""}{value}{suffix}
        </span>
      </div>
      <div className="relative flex h-5 items-center">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full" style={{ width: `${percent}%`, background: `linear-gradient(90deg, ${accent}88, ${accent})` }} />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          onMouseUp={onCommit}
          onTouchEnd={onCommit}
          className="absolute inset-0 h-5 w-full cursor-grab opacity-0 active:cursor-grabbing"
        />
        <div
          className="pointer-events-none absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-lg"
          style={{ left: `${percent}%`, background: accent, boxShadow: `0 0 12px ${accent}99` }}
        />
      </div>
    </div>
  );
}

export function WaterEnhancerPanel({ canvasEditor, onClose }) {
  const [values, setValues] = useState(DEFAULTS);
  const filterRef = useRef(null);
  const accent = useMemo(() => {
    if (values.greenish > values.bluish) return "#34d399";
    if (values.bluish > 38) return "#38bdf8";
    return "#22d3ee";
  }, [values.bluish, values.greenish]);

  const getActiveImage = useCallback(() => {
    if (!canvasEditor) return null;
    const active = canvasEditor.getActiveObject();
    if (isFabricImageObject(active)) return active;
    return canvasEditor.getObjects().find(isFabricImageObject) || null;
  }, [canvasEditor]);

  const applyWaterEnhance = useCallback(async (nextValues, shouldCommit = false) => {
    const imageObject = getActiveImage();
    if (!imageObject) {
      toast.error("Select or add an image first");
      return;
    }

    const module = await import("fabric");
    const fab = getFabricModule(module);
    const FilterClass = registerWaterEnhancerFilter(fab);
    if (!FilterClass) {
      toast.error("Water enhancer is not available");
      return;
    }

    const existing = imageObject.filters?.find((filter) => filter?.type === "WaterEnhancer");
    if (!filterRef.current || !imageObject.filters?.includes(filterRef.current)) {
      filterRef.current = existing || new FilterClass();
    }

    Object.assign(filterRef.current, nextValues);

    const remainingFilters = (imageObject.filters || []).filter((filter) => filter?.type !== "WaterEnhancer");
    imageObject.filters = nextValues.amount > 0 ? [...remainingFilters, filterRef.current] : remainingFilters;
    if (nextValues.amount === 0) filterRef.current = null;

    imageObject.dirty = true;
    imageObject.applyFilters();
    imageObject.setCoords();
    canvasEditor.requestRenderAll();

    if (shouldCommit) {
      canvasEditor.fire("object:modified", { target: imageObject });
      toast.success("Water enhance applied");
    }
  }, [canvasEditor, getActiveImage]);

  const updateValue = (key, nextValue, shouldCommit = false) => {
    const nextValues = { ...values, [key]: nextValue };
    setValues(nextValues);
    applyWaterEnhance(nextValues, shouldCommit);
  };

  const resetEnhance = () => {
    setValues({ ...DEFAULTS, amount: 0 });
    applyWaterEnhance({ ...DEFAULTS, amount: 0 }, true);
  };

  return (
    <div className="absolute left-4 top-4 z-50 flex max-h-[76vh] w-[330px] flex-col overflow-hidden rounded-2xl border border-cyan-400/20 bg-slate-950/92 shadow-[0_24px_80px_rgba(8,145,178,0.24)] backdrop-blur-2xl sm:left-auto sm:right-6 sm:top-6 sm:w-[370px]">
      <div className="flex items-center justify-between border-b border-white/10 bg-cyan-400/[0.04] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-cyan-300/30 bg-cyan-300/10 p-2 shadow-[0_0_18px_rgba(34,211,238,0.18)]">
            <Droplets className="h-4 w-4 text-cyan-300" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-wide text-white">Water Enhancer</h3>
            <p className="text-[11px] text-white/40">Smart water mask with natural color lock</p>
          </div>
        </div>
        <button onClick={onClose} className="rounded-lg p-1.5 text-white/40 transition hover:bg-white/10 hover:text-white" title="Close">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-4 no-scrollbar">
        <div className="grid grid-cols-3 gap-2">
          <button onClick={() => { const next = { ...DEFAULTS, amount: 62, bluish: 32, greenish: 0, brightness: 10, originalTone: 72 }; setValues(next); applyWaterEnhance(next, true); }} className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-bold text-cyan-100 transition hover:bg-cyan-300/15">Aqua</button>
          <button onClick={() => { const next = { ...DEFAULTS, amount: 58, bluish: 8, greenish: 34, brightness: 6, originalTone: 76 }; setValues(next); applyWaterEnhance(next, true); }} className="rounded-xl border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-xs font-bold text-emerald-100 transition hover:bg-emerald-300/15">Lagoon</button>
          <button onClick={() => { const next = { ...DEFAULTS, amount: 76, contrast: 28, bluish: 42, greenish: 10, brightness: 14, originalTone: 62 }; setValues(next); applyWaterEnhance(next, true); }} className="rounded-xl border border-sky-300/20 bg-sky-300/10 px-3 py-2 text-xs font-bold text-sky-100 transition hover:bg-sky-300/15">Deep</button>
        </div>

        <div className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
          <RangeControl label="Amount" value={values.amount} min={0} max={100} accent={accent} suffix="%" onChange={(v) => updateValue("amount", v)} onCommit={() => applyWaterEnhance(values, true)} />
          <RangeControl label="Contrast" value={values.contrast} min={-50} max={70} accent={accent} onChange={(v) => updateValue("contrast", v)} onCommit={() => applyWaterEnhance(values, true)} />
          <RangeControl label="Bluish" value={values.bluish} min={-40} max={80} accent="#38bdf8" onChange={(v) => updateValue("bluish", v)} onCommit={() => applyWaterEnhance(values, true)} />
          <RangeControl label="Greenish" value={values.greenish} min={-40} max={80} accent="#34d399" onChange={(v) => updateValue("greenish", v)} onCommit={() => applyWaterEnhance(values, true)} />
          <RangeControl label="Brightness" value={values.brightness} min={-45} max={60} accent={accent} onChange={(v) => updateValue("brightness", v)} onCommit={() => applyWaterEnhance(values, true)} />
          <RangeControl label="Original Color" value={values.originalTone} min={0} max={100} accent="#a7f3d0" suffix="%" onChange={(v) => updateValue("originalTone", v)} onCommit={() => applyWaterEnhance(values, true)} />
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-cyan-300/15 bg-cyan-300/[0.06] px-3 py-2 text-[11px] text-cyan-50/55">
          <Zap className="h-3.5 w-3.5 text-cyan-300" />
          <span>Mask targets cyan, blue, teal and reflective green water while rejecting warm skin/land tones.</span>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-white/10 bg-black/20 px-4 py-3">
        <button onClick={resetEnhance} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-white/55 transition hover:bg-white/10 hover:text-white">
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
        <button onClick={() => applyWaterEnhance(values, true)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-slate-950 transition" style={{ background: accent }}>
          <Sparkles className="h-3.5 w-3.5" />
          Apply
        </button>
      </div>
    </div>
  );
}