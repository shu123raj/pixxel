"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trash2,
  Palette,
  Image as ImageIcon,
  Search,
  Loader2,
  Layers,
  Focus,
  Wand2,
  Eraser,
  Sparkles,
  Info
} from "lucide-react";
import { HexColorPicker } from "react-colorful";
import { useCanvas } from "@/context/context";
import { FabricImage, Shadow, util } from "fabric";

// API configurations
const UNSPLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
const UNSPLASH_API_URL = "https://api.unsplash.com";

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

const hexToRgba = (hex, opacity) => {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
  }
  return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
};

const uploadToCloudinary = async (base64Image) => {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error("Cloudinary credentials missing in .env file");
  }
  const formData = new FormData();
  formData.append("file", base64Image);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );
  const data = await response.json();
  if (data.secure_url) return data.secure_url;
  throw new Error(data.error?.message || "Cloudinary upload failed");
};

export function BackgroundControls({ project }) {
  const { canvasEditor, processingMessage, setProcessingMessage } = useCanvas();
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [searchQuery, setSearchQuery] = useState("");
  const [unsplashImages, setUnsplashImages] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState(null);

  const [isShadowEnabled, setIsShadowEnabled] = useState(false);
  const [shadowAngle, setShadowAngle] = useState(45);
  const [shadowDistance, setShadowDistance] = useState(15);
  const [shadowBlur, setShadowBlur] = useState(20);
  const [shadowOpacity, setShadowOpacity] = useState(50);
  const [shadowColor, setShadowColor] = useState("#000000");

  const [blurIntensity, setBlurIntensity] = useState(1000);

  // 🌟 Healing States
  const [isHealingMode, setIsHealingMode] = useState(false);
  const [healingBrushSize, setHealingBrushSize] = useState(30);
  const [healingOpacity, setHealingOpacity] = useState(100); // NAYA OPACITY STATE

  const getMainImage = () => {
    if (!canvasEditor) return null;
    const objects = canvasEditor.getObjects();
    return objects.find((obj) => obj.type === "image" || obj.type === "FabricImage") || null;
  };

  // Live shadow update
  useEffect(() => {
    const mainImage = getMainImage();
    if (!mainImage || !canvasEditor) return;

    if (!isShadowEnabled) {
      mainImage.set("shadow", null);
    } else {
      const angleRad = (shadowAngle * Math.PI) / 180;
      const offsetX = Math.cos(angleRad) * shadowDistance;
      const offsetY = Math.sin(angleRad) * shadowDistance;
      const rgbaColor = hexToRgba(shadowColor, shadowOpacity);
      mainImage.set("shadow", new Shadow({ color: rgbaColor, blur: shadowBlur, offsetX, offsetY }));
    }
    canvasEditor.requestRenderAll();
  }, [shadowAngle, shadowDistance, shadowBlur, shadowOpacity, shadowColor, isShadowEnabled, canvasEditor]);

  // ==========================================
  // ✅ UPGRADED HEALING BRUSH ENGINE (Gaussian + Opacity)
  // ==========================================
  useEffect(() => {
    if (!canvasEditor) return;

    const handlePathCreated = async (e) => {
      const path = e.path;
      const mainImage = getMainImage();

      if (!mainImage) {
        canvasEditor.remove(path);
        return;
      }

      setProcessingMessage("Applying magic heal...");

      try {
        canvasEditor.remove(path);
        canvasEditor.requestRenderAll();

        const imgEl = mainImage.getElement();
        if (!imgEl) throw new Error("Could not extract image element.");

        const imgW = mainImage.width;
        const imgH = mainImage.height;

        const imgCanvas = document.createElement("canvas");
        imgCanvas.width = imgW;
        imgCanvas.height = imgH;
        const imgCtx = imgCanvas.getContext("2d", { willReadFrequently: true });
        imgCtx.drawImage(imgEl, 0, 0, imgW, imgH);

        const maskCanvas = document.createElement("canvas");
        maskCanvas.width = imgW;
        maskCanvas.height = imgH;
        const maskCtx = maskCanvas.getContext("2d", { willReadFrequently: true });

        const imgMatrix = mainImage.calcTransformMatrix();
        const invMatrix = util.invertTransform(imgMatrix);

        const toImgCoords = (cx, cy) => {
          const pt = util.transformPoint({ x: cx, y: cy }, invMatrix);
          return { x: pt.x + imgW / 2, y: pt.y + imgH / 2 };
        };

        maskCtx.clearRect(0, 0, imgW, imgH);
        maskCtx.strokeStyle = "rgba(255,0,0,1)";
        maskCtx.lineWidth = path.strokeWidth || healingBrushSize;
        maskCtx.lineCap = "round";
        maskCtx.lineJoin = "round";
        maskCtx.beginPath();

        const pathData = path.path;
        if (pathData && pathData.length > 0) {
          for (const cmd of pathData) {
            const type = cmd[0];
            if (type === "M") maskCtx.moveTo(toImgCoords(cmd[1], cmd[2]).x, toImgCoords(cmd[1], cmd[2]).y);
            else if (type === "L") maskCtx.lineTo(toImgCoords(cmd[1], cmd[2]).x, toImgCoords(cmd[1], cmd[2]).y);
            else if (type === "Q") maskCtx.quadraticCurveTo(toImgCoords(cmd[1], cmd[2]).x, toImgCoords(cmd[1], cmd[2]).y, toImgCoords(cmd[3], cmd[4]).x, toImgCoords(cmd[3], cmd[4]).y);
            else if (type === "C") maskCtx.bezierCurveTo(toImgCoords(cmd[1], cmd[2]).x, toImgCoords(cmd[1], cmd[2]).y, toImgCoords(cmd[3], cmd[4]).x, toImgCoords(cmd[3], cmd[4]).y, toImgCoords(cmd[5], cmd[6]).x, toImgCoords(cmd[5], cmd[6]).y);
          }
          maskCtx.stroke();
        }

        const imgData = imgCtx.getImageData(0, 0, imgW, imgH);
        const maskData = maskCtx.getImageData(0, 0, imgW, imgH);

        const pixels = imgData.data;
        const mask = maskData.data;
        const w = imgW, h = imgH;

        let minX = w, minY = h, maxX = 0, maxY = 0;
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            if (mask[(y * w + x) * 4 + 3] > 10) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }

        if (maxX < minX) {
          setProcessingMessage(null);
          return;
        }

        const pad = Math.max(20, healingBrushSize);
        minX = Math.max(0, minX - pad);
        minY = Math.max(0, minY - pad);
        maxX = Math.min(w - 1, maxX + pad);
        maxY = Math.min(h - 1, maxY + pad);

        const totalPixels = w * h;
        const bufR = new Float32Array(totalPixels);
        const bufG = new Float32Array(totalPixels);
        const bufB = new Float32Array(totalPixels);
        const bufA = new Float32Array(totalPixels);
        const isMasked = new Uint8Array(totalPixels);
        const filled = new Uint8Array(totalPixels);

        for (let i = 0; i < totalPixels; i++) {
          bufR[i] = pixels[i * 4]; bufG[i] = pixels[i * 4 + 1];
          bufB[i] = pixels[i * 4 + 2]; bufA[i] = pixels[i * 4 + 3];
          if (mask[i * 4 + 3] > 10) { isMasked[i] = 1; filled[i] = 0; } 
          else { isMasked[i] = 0; filled[i] = 1; }
        }

        // 🌟 ADVANCED ALGORITHM: Gaussian Weights for smoother blending
        const gWeights = [
          [1, 2, 1],
          [2, 0, 2],
          [1, 2, 1]
        ];

        const maxIterations = 150; // High quality convergence
        for (let iter = 0; iter < maxIterations; iter++) {
          let changed = false;

          // Forward Sweep
          for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
              const idx = y * w + x;
              if (!isMasked[idx] || filled[idx]) continue;

              let r = 0, g = 0, b = 0, a = 0, count = 0;
              for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                  if (dx === 0 && dy === 0) continue;
                  const nx = x + dx, ny = y + dy;
                  if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
                  const nIdx = ny * w + nx;
                  if (filled[nIdx]) {
                    const wt = gWeights[dy + 1][dx + 1];
                    r += bufR[nIdx] * wt; g += bufG[nIdx] * wt;
                    b += bufB[nIdx] * wt; a += bufA[nIdx] * wt;
                    count += wt;
                  }
                }
              }
              if (count > 0) {
                bufR[idx] = r / count; bufG[idx] = g / count;
                bufB[idx] = b / count; bufA[idx] = a / count;
                filled[idx] = 1; changed = true;
              }
            }
          }

          // Backward Sweep
          for (let y = maxY; y >= minY; y--) {
            for (let x = maxX; x >= minX; x--) {
              const idx = y * w + x;
              if (!isMasked[idx] || filled[idx]) continue;

              let r = 0, g = 0, b = 0, a = 0, count = 0;
              for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                  if (dx === 0 && dy === 0) continue;
                  const nx = x + dx, ny = y + dy;
                  if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
                  const nIdx = ny * w + nx;
                  if (filled[nIdx]) {
                    const wt = gWeights[dy + 1][dx + 1];
                    r += bufR[nIdx] * wt; g += bufG[nIdx] * wt;
                    b += bufB[nIdx] * wt; a += bufA[nIdx] * wt;
                    count += wt;
                  }
                }
              }
              if (count > 0) {
                bufR[idx] = r / count; bufG[idx] = g / count;
                bufB[idx] = b / count; bufA[idx] = a / count;
                filled[idx] = 1; changed = true;
              }
            }
          }
          if (!changed) break;
        }

        // 🌟 APPLY OPACITY PERCENTAGE
        const opacityFactor = healingOpacity / 100;
        for (let y = minY; y <= maxY; y++) {
          for (let x = minX; x <= maxX; x++) {
            const idx = y * w + x;
            if (isMasked[idx] && filled[idx]) {
              const oR = pixels[idx * 4], oG = pixels[idx * 4 + 1], oB = pixels[idx * 4 + 2], oA = pixels[idx * 4 + 3];
              pixels[idx * 4]     = Math.round(oR * (1 - opacityFactor) + bufR[idx] * opacityFactor);
              pixels[idx * 4 + 1] = Math.round(oG * (1 - opacityFactor) + bufG[idx] * opacityFactor);
              pixels[idx * 4 + 2] = Math.round(oB * (1 - opacityFactor) + bufB[idx] * opacityFactor);
              pixels[idx * 4 + 3] = Math.round(oA * (1 - opacityFactor) + bufA[idx] * opacityFactor);
            }
          }
        }

        imgCtx.putImageData(imgData, 0, 0);

        const healedDataURL = imgCanvas.toDataURL("image/png");
        const processedImage = await FabricImage.fromURL(healedDataURL, { crossOrigin: "anonymous" });

        processedImage.set({
          left: mainImage.left, top: mainImage.top,
          scaleX: mainImage.scaleX, scaleY: mainImage.scaleY,
          angle: mainImage.angle, originX: mainImage.originX, originY: mainImage.originY,
          shadow: mainImage.shadow,
        });

        canvasEditor.remove(mainImage);
        canvasEditor.add(processedImage);
        processedImage.setCoords();
        canvasEditor.setActiveObject(processedImage);
        canvasEditor.requestRenderAll();

      } catch (error) {
        console.error("Healing Engine Error:", error);
      } finally {
        setProcessingMessage(null);
      }
    };

    if (isHealingMode) {
      canvasEditor.isDrawingMode = true;
      if (canvasEditor.freeDrawingBrush) {
        canvasEditor.freeDrawingBrush.color = `rgba(239, 68, 68, 0.5)`;
        canvasEditor.freeDrawingBrush.width = healingBrushSize;
      }
      canvasEditor.on("path:created", handlePathCreated);
    } else {
      canvasEditor.isDrawingMode = false;
    }

    return () => {
      canvasEditor.off("path:created", handlePathCreated);
      canvasEditor.isDrawingMode = false;
      canvasEditor.defaultCursor = "default";
      canvasEditor.hoverCursor = "move";
      if (canvasEditor.upperCanvasEl) canvasEditor.upperCanvasEl.style.cursor = "";
      canvasEditor.requestRenderAll();
    };
  }, [isHealingMode, canvasEditor, healingBrushSize, healingOpacity]);

  // ==========================================
  // BACKGROUND BLUR & REMOVAL (Cloudinary)
  // ==========================================
  const buildCloudinaryBlurUrl = (imageUrl, intensity) => {
    try {
      const urlObj = new URL(imageUrl);
      if (urlObj.hostname.includes("res.cloudinary.com")) {
        const parts = urlObj.pathname.split("/");
        const uploadIndex = parts.indexOf("upload");
        if (uploadIndex !== -1) {
          const versionIndex = parts.findIndex((p) => /^v\d+$/.test(p));
          let publicIdWithExt = versionIndex !== -1
            ? parts.slice(versionIndex + 1).join("/")
            : parts.slice(uploadIndex + 1).join("/");
          const publicId = publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf(".")) || publicIdWithExt;
          const overlayId = publicId.replace(/\//g, ":");
          const transformStr = `e_blur:${intensity}/l_${overlayId},e_background_removal/c_scale,w_1.0,h_1.0,fl_relative/fl_layer_apply`;
          const cleanParts = parts.filter(
            (p) => !p.includes("e_background_removal") && !p.includes("e_blur") && !p.includes("fl_layer_apply")
          );
          const newVersionIndex = cleanParts.findIndex((p) => /^v\d+$/.test(p));
          const insertIndex = newVersionIndex !== -1 ? newVersionIndex : cleanParts.length - 1;
          cleanParts.splice(insertIndex, 0, transformStr);
          urlObj.pathname = cleanParts.join("/");
          return urlObj.toString();
        }
      }
    } catch (err) {
      console.error("Blur URL failed:", err);
    }
    return imageUrl;
  };

  const handleBackgroundRemoval = async () => {
    const mainImage = getMainImage();
    if (!mainImage || !project) return;
    setProcessingMessage("Removing background with AI...");
    try {
      const currentImageUrl = project.currentImageUrl || project.originalImageUrl;
      let bgRemovedUrl = currentImageUrl;

      if (currentImageUrl.includes("ik.imagekit.io")) {
        bgRemovedUrl = `${currentImageUrl.split("?")[0]}?tr=e-bgremove`;
      } else if (currentImageUrl.includes("res.cloudinary.com")) {
        const urlObj = new URL(currentImageUrl);
        const parts = urlObj.pathname.split("/");
        const uploadIndex = parts.indexOf("upload");
        if (uploadIndex !== -1) {
          const cleanParts = parts.filter((p) => !p.includes("e_background_removal"));
          cleanParts.splice(uploadIndex + 1, 0, "e_background_removal");
          urlObj.pathname = cleanParts.join("/");
          bgRemovedUrl = urlObj.toString();
        }
      } else {
        const base64Image = mainImage.toDataURL({ format: "png" });
        const cldUrl = await uploadToCloudinary(base64Image);
        const urlObj = new URL(cldUrl);
        const parts = urlObj.pathname.split("/");
        parts.splice(parts.indexOf("upload") + 1, 0, "e_background_removal");
        bgRemovedUrl = parts.join("/");
      }

      const processedImage = await FabricImage.fromURL(bgRemovedUrl, { crossOrigin: "anonymous" });
      processedImage.set({
        left: mainImage.left, top: mainImage.top,
        scaleX: mainImage.scaleX, scaleY: mainImage.scaleY,
        angle: mainImage.angle, originX: mainImage.originX, originY: mainImage.originY,
        shadow: mainImage.shadow,
      });
      canvasEditor.remove(mainImage);
      canvasEditor.add(processedImage);
      processedImage.setCoords();
      canvasEditor.setActiveObject(processedImage);
      canvasEditor.requestRenderAll();
    } catch (error) {
      console.error("Error removing background:", error);
    } finally {
      setProcessingMessage(null);
    }
  };

  const handleBackgroundBlur = async () => {
    const mainImage = getMainImage();
    if (!mainImage || !project) return;
    setProcessingMessage("Applying AI background blur...");
    try {
      let currentImageUrl = project.currentImageUrl || project.originalImageUrl;
      if (!currentImageUrl.includes("res.cloudinary.com")) {
        const base64Image = mainImage.toDataURL({ format: "png" });
        currentImageUrl = await uploadToCloudinary(base64Image);
      }
      const blurredUrl = buildCloudinaryBlurUrl(currentImageUrl, blurIntensity);
      const processedImage = await FabricImage.fromURL(blurredUrl, { crossOrigin: "anonymous" });
      processedImage.set({
        left: mainImage.left, top: mainImage.top,
        scaleX: mainImage.scaleX, scaleY: mainImage.scaleY,
        angle: mainImage.angle, originX: mainImage.originX, originY: mainImage.originY,
        shadow: mainImage.shadow,
      });
      canvasEditor.remove(mainImage);
      canvasEditor.add(processedImage);
      processedImage.setCoords();
      canvasEditor.setActiveObject(processedImage);
      canvasEditor.requestRenderAll();
    } catch (error) {
      console.error("Error blurring background:", error);
    } finally {
      setProcessingMessage(null);
    }
  };

  const handleColorBackground = () => {
    if (!canvasEditor) return;
    canvasEditor.backgroundColor = backgroundColor;
    canvasEditor.requestRenderAll();
  };

  const handleRemoveBackground = () => {
    if (!canvasEditor) return;
    canvasEditor.backgroundColor = null;
    canvasEditor.backgroundImage = null;
    canvasEditor.requestRenderAll();
  };

  const searchUnsplashImages = async () => {
    if (!searchQuery.trim() || !UNSPLASH_ACCESS_KEY) return;
    setIsSearching(true);
    try {
      const response = await fetch(
        `${UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=12`,
        { headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` } }
      );
      if (!response.ok) throw new Error("Failed to search images");
      const data = await response.json();
      setUnsplashImages(data.results || []);
    } catch (error) {
      console.error("Error searching Unsplash:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleImageBackground = async (imageUrl, imageId) => {
    if (!canvasEditor) return;
    setSelectedImageId(imageId);
    try {
      if (UNSPLASH_ACCESS_KEY) {
        fetch(`${UNSPLASH_API_URL}/photos/${imageId}/download`, {
          headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
        }).catch(() => {});
      }
      const fabricImage = await FabricImage.fromURL(imageUrl, { crossOrigin: "anonymous" });
      const canvasWidth = project.width;
      const canvasHeight = project.height;
      const scaleX = canvasWidth / fabricImage.width;
      const scaleY = canvasHeight / fabricImage.height;
      const scale = Math.max(scaleX, scaleY);
      fabricImage.set({ scaleX: scale, scaleY: scale, originX: "center", originY: "center", left: canvasWidth / 2, top: canvasHeight / 2 });
      canvasEditor.backgroundImage = fabricImage;
      canvasEditor.requestRenderAll();
      setSelectedImageId(null);
    } catch (error) {
      console.error("Error setting background image:", error);
      setSelectedImageId(null);
    }
  };

  if (!canvasEditor) {
    return <div className="p-4"><p className="text-white/70 text-sm">Canvas not ready</p></div>;
  }

  return (
    <div className="flex flex-col h-full max-h-[75vh]">
      <div className="overflow-y-auto pr-2 custom-scrollbar pb-6 space-y-6">

        {/* Quick AI Tools */}
        <div className="space-y-4 pb-4 border-b border-white/10">
          <div>
            <h3 className="text-sm font-bold text-white mb-1 tracking-wide flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Quick AI Enhancements
            </h3>
            <p className="text-[11px] text-white/50 mb-4">
              Instantly alter the primary background using smart detection.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleBackgroundRemoval}
              disabled={processingMessage || !getMainImage()}
              className="w-full bg-[#1e2330] hover:bg-[#252a36] text-white border border-white/10 hover:border-cyan-500/50 transition-all group"
            >
              <Trash2 className="h-4 w-4 mr-2 text-red-400 group-hover:text-red-300" /> Remove BG
            </Button>

            <Button
              onClick={handleBackgroundBlur}
              disabled={processingMessage || !getMainImage()}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all"
            >
              <Focus className="h-4 w-4 mr-2" /> Blur BG
            </Button>
          </div>

          <div className="pt-3 px-2 bg-slate-800/30 rounded-xl border border-white/5 pb-4">
            <div className="flex justify-between items-center mb-3">
              <label className="text-[11px] font-medium text-white/70 uppercase tracking-widest">Blur Intensity</label>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded font-mono border border-cyan-500/30">{blurIntensity}</span>
            </div>
            <Slider value={[blurIntensity]} onValueChange={(v) => setBlurIntensity(v[0])} min={100} max={3000} step={100} className="py-1" />
          </div>
        </div>

        {/* 4-Tab Layout */}
        <Tabs defaultValue="magic" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-[#141824] p-1 rounded-xl border border-white/5">
            <TabsTrigger value="magic" className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white text-[10px] md:text-xs rounded-lg transition-all shadow-sm">
              <Wand2 className="h-3.5 w-3.5 mr-1" /> Heal
            </TabsTrigger>
            <TabsTrigger value="color" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-[10px] md:text-xs rounded-lg transition-all">
              <Palette className="h-3.5 w-3.5 mr-1 hidden sm:block" /> Color
            </TabsTrigger>
            <TabsTrigger value="image" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-[10px] md:text-xs rounded-lg transition-all">
              <ImageIcon className="h-3.5 w-3.5 mr-1 hidden sm:block" /> Image
            </TabsTrigger>
            <TabsTrigger value="shadow" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-[10px] md:text-xs rounded-lg transition-all">
              <Layers className="h-3.5 w-3.5 mr-1 hidden sm:block" /> Shadow
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: HEALING BRUSH */}
          <TabsContent value="magic" className="space-y-5 mt-6 animate-in fade-in duration-300">
            <div className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden ${isHealingMode ? "bg-purple-900/20 border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.15)]" : "bg-slate-800/40 border-white/10 hover:border-white/20"}`}>
              {isHealingMode && (
                <div className="absolute top-0 right-0 p-2">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                    <Eraser className="w-4 h-4 text-purple-400" />
                    Magic Healing
                  </h3>
                  <p className="text-[10px] text-white/50 mt-1">Rub over an object to vanish it instantly.</p>
                </div>
                <Button
                  onClick={() => setIsHealingMode(!isHealingMode)}
                  className={`h-8 px-4 text-xs font-bold transition-all rounded-full ${
                    isHealingMode
                      ? "bg-green-500 hover:bg-green-600 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {isHealingMode ? "Apply / Done" : "Enable"}
                </Button>
              </div>

              {isHealingMode && (
                <div className="space-y-5 animate-in slide-in-from-top-2 fade-in duration-200 mt-4 pt-4 border-t border-white/10">
                  <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-blue-200 leading-relaxed font-medium">
                      Draw directly on the canvas to mask a blemish or object. Release your mouse and it will heal instantly!
                    </p>
                  </div>

                  {/* Brush Size */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-medium text-white/70 uppercase tracking-wider">Brush Size</label>
                      <span className="text-[10px] font-mono text-white/50">{healingBrushSize}px</span>
                    </div>
                    <Slider value={[healingBrushSize]} onValueChange={(v) => setHealingBrushSize(v[0])} min={5} max={150} step={1} className="py-1" />
                  </div>

                  {/* 🌟 Healing Opacity */}
                  <div className="space-y-3 mt-4 border-t border-white/5 pt-4">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-medium text-white/70 uppercase tracking-wider">Healing Opacity</label>
                      <span className="text-[10px] font-mono text-white/50">{healingOpacity}%</span>
                    </div>
                    <Slider value={[healingOpacity]} onValueChange={(v) => setHealingOpacity(v[0])} min={1} max={100} step={1} className="py-1" />
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* TAB 2: COLOR */}
          <TabsContent value="color" className="space-y-5 mt-6 animate-in fade-in duration-300">
            <div className="bg-[#141824] p-4 rounded-2xl border border-white/5 space-y-5">
              <div className="rounded-xl overflow-hidden border border-white/10 p-1 bg-black/20">
                <HexColorPicker color={backgroundColor} onChange={setBackgroundColor} style={{ width: "100%", height: "150px" }} />
              </div>
              <div className="flex items-center gap-3 bg-black/30 p-2 rounded-xl border border-white/5">
                <div className="w-8 h-8 rounded-lg shadow-inner border border-white/20" style={{ backgroundColor }} />
                <Input value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="flex-1 bg-transparent border-none text-white font-mono text-sm shadow-none focus-visible:ring-0" />
              </div>
              <Button onClick={handleColorBackground} className="w-full bg-cyan-600 hover:bg-cyan-700 rounded-xl h-10">Apply Fill Color</Button>
            </div>
          </TabsContent>

          {/* TAB 3: IMAGE */}
          <TabsContent value="image" className="space-y-4 mt-6 animate-in fade-in duration-300">
            <div className="flex gap-2 bg-[#141824] p-2 rounded-2xl border border-white/5">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && searchUnsplashImages()}
                placeholder="Search high-res stock images..."
                className="flex-1 bg-transparent border-none text-white text-sm shadow-none focus-visible:ring-0"
              />
              <Button onClick={searchUnsplashImages} disabled={isSearching || !searchQuery.trim()} className="bg-cyan-600 hover:bg-cyan-700 rounded-xl">
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>
            {unsplashImages?.length > 0 && (
              <div className="grid grid-cols-2 gap-3 max-h-72 overflow-y-auto custom-scrollbar pr-1 mt-4">
                {unsplashImages.map((image) => (
                  <div key={image.id} className="relative group cursor-pointer rounded-xl overflow-hidden border border-white/10 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all" 
                   
                    onClick={() => handleImageBackground(image.urls.full, image.id)}>
                    
                    <img src={image.urls.small} alt="Background" className="w-full h-28 object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                      <span className="text-[9px] text-white/80 truncate">by {image.user.name}</span>
                    </div>
                    {selectedImageId === image.id && <div className="absolute inset-0 bg-cyan-900/60 backdrop-blur-sm flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-cyan-400" /></div>}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* TAB 4: SHADOW */}
          <TabsContent value="shadow" className="space-y-5 mt-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#141824] to-[#1e2330] rounded-2xl border border-white/5">
              <div>
                <span className="text-sm font-bold text-white block">Studio Shadow</span>
                <span className="text-[10px] text-white/50">Add depth to foreground objects</span>
              </div>
              <Button
                onClick={() => setIsShadowEnabled(!isShadowEnabled)}
                variant={isShadowEnabled ? "default" : "outline"}
                className={`rounded-full px-5 text-xs font-bold transition-all ${isShadowEnabled ? "bg-cyan-500 text-white shadow-[0_0_15px_rgba(34,211,238,0.4)]" : "bg-transparent border-white/20 text-white hover:bg-white/10"}`}
                size="sm"
              >
                {isShadowEnabled ? "ENABLED" : "DISABLED"}
              </Button>
            </div>

            {isShadowEnabled && (
              <div className="space-y-6 bg-[#141824] p-5 rounded-2xl border border-white/5 animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-4 bg-black/20 p-2 rounded-xl border border-white/5">
                  <label className="text-xs font-medium text-white/70 w-24">Tint Color</label>
                  <input type="color" value={shadowColor} onChange={(e) => setShadowColor(e.target.value)} className="w-8 h-8 rounded border-none bg-transparent cursor-pointer" />
                  <Input value={shadowColor} onChange={(e) => setShadowColor(e.target.value)} className="flex-1 bg-transparent border-none text-white text-xs shadow-none font-mono focus-visible:ring-0" />
                </div>
                <div className="space-y-5">
                  {["Angle", "Distance", "Blur", "Opacity"].map((label, idx) => {
                    const states = [
                      { val: shadowAngle, set: setShadowAngle, max: 360 },
                      { val: shadowDistance, set: setShadowDistance, max: 100 },
                      { val: shadowBlur, set: setShadowBlur, max: 100 },
                      { val: shadowOpacity, set: setShadowOpacity, max: 100 },
                    ];
                    return (
                      <div key={label} className="space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="text-[11px] font-medium text-white/70 uppercase tracking-wider">{label}</label>
                          <span className="text-[10px] bg-white/5 text-cyan-300 px-2 py-0.5 rounded border border-white/10 font-mono">
                            {states[idx].val}{label === "Angle" ? "°" : label === "Opacity" ? "%" : "px"}
                          </span>
                        </div>
                        <Slider value={[states[idx].val]} onValueChange={(v) => states[idx].set(v[0])} min={0} max={states[idx].max} step={1} className="py-1" />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <div className="pt-4 border-t border-white/5 mt-auto bg-[#0a0c10] pb-2">
        <Button onClick={handleRemoveBackground} className="w-full bg-[#1e2330] hover:bg-red-500/10 text-white/70 hover:text-red-400 border border-white/5 hover:border-red-500/30 transition-colors h-11 rounded-xl">
          <Trash2 className="h-4 w-4 mr-2" /> Reset Canvas Space
        </Button>
      </div>
    </div>
  );
}
