"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Expand, Lock, Unlock, Monitor, Smartphone, 
  Camera, Video, RotateCw, CheckCircle2, 
  AlertCircle, Frame, Save, Keyboard, Maximize 
} from "lucide-react";
import { useCanvas } from "@/context/context";
import { useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { Rect, Line, Group } from "fabric"; 

// === 1. PRESET SIZES ===
const PRESET_CATEGORIES = [
  
  {
    category: "Social Media",
    items: [
      
      { id: "ig_post", name: "Instagram Post", width: 1080, height: 1080, icon: Camera, label: "1:1" },
      { id: "ig_story", name: "Instagram Story", width: 1080, height: 1920, icon: Smartphone, label: "9:16" },
      { id: "yt_thumb", name: "YouTube Thumbnail", width: 1280, height: 720, icon: Video, label: "16:9" },
      { id: "fb_cover", name: "Facebook Cover", width: 1640, height: 924, icon: Monitor, label: "16:9" },
    ]
  },
  {
    category: "Standard Sizes",
    items: [
      { id: "fhd", name: "Full HD Web", width: 2010, height: 1080, icon: Monitor, label: "16:9" },
      { id: "portrait", name: "Standard Portrait", width: 1080, height: 1350, icon: Smartphone, label: "4:5" },
    ]
  }
];

// === 2. PREMIUM FRAMES LIST ===
const PREMIUM_FRAMES_LIST = [
  { id: 'none', name: 'No Frame (Remove)', icon: '🚫' },
  { id: 'classic_white', name: 'White Matte', icon: '⬜' },
  { id: 'classic_black', name: 'Black Matte', icon: '⬛' },
  { id: 'polaroid', name: 'Polaroid Retro', icon: '📸' },
  { id: 'cinematic', name: 'Cinematic Bars', icon: '🎬' },
  { id: 'museum_gold', name: 'Museum Gold', icon: '🖼️' },
  { id: 'museum_silver', name: 'Museum Silver', icon: '🏛️' },
  { id: 'vogue', name: 'Magazine Cover', icon: '📰' },
  { id: 'neon_cyan', name: 'Neon Cyan', icon: '⚡' },
  { id: 'neon_magenta', name: 'Neon Magenta', icon: '🎆' },
  { id: 'cyberpunk', name: 'Cyberpunk Dual', icon: '🤖' },
  { id: 'glassmorphism', name: 'Frosted Edge', icon: '🧊' },
  { id: 'film_strip', name: 'Film Strip', icon: '🎞️' },
  { id: 'postage_stamp', name: 'Postage Stamp', icon: '✉️' },
  { id: 'art_deco', name: 'Art Deco Luxe', icon: '✨' },
  { id: 'vintage_sepia', name: 'Vintage Sepia', icon: '🟤' },
  { id: 'valentine', name: 'Valentine Pink', icon: '💖' },
  { id: 'letterbox_white', name: 'White Letterbox', icon: '🪟' },
  { id: 'pillarbox_black', name: 'Pillarbox Black', icon: '🚪' },
  { id: 'focus_grid', name: 'Focus Grid 3x3', icon: '▦' },
  { id: 'camera_viewfinder', name: 'Camera Focus', icon: '⛶' },
  { id: 'royal_gold', name: 'Royal Gold', icon: '👑' },
  { id: 'wood_rustic', name: 'Rustic Wood', icon: '🪵' },
  { id: 'neon_matrix', name: 'Neon Matrix', icon: '📟' },
  { id: 'pastel_dream', name: 'Pastel Dream', icon: '🌸' },
  { id: 'glitch_effect', name: 'RGB Glitch', icon: '👾' },
  { id: 'polaroid_black', name: 'Dark Polaroid', icon: '📷' },
  { id: 'stitching_craft', name: 'Fabric Stitch', icon: '🧵' },
  { id: 'double_matte', name: 'Double Matte', icon: '🖼️' },
  { id: 'shadow_box', name: 'Shadow Box', icon: '🔲' },
  { id: 'blueprint_tech', name: 'Blueprint', icon: '📐' },
  { id: 'grunge_edge', name: 'Grunge Edge', icon: '🎸' },
  { id: 'comic_panel', name: 'Comic Panel', icon: '💬' },
  { id: 'sunset_vibes', name: 'Sunset Vibe', icon: '🌅' },
  { id: 'minimal_brackets', name: 'Minimal Corners', icon: '⌜' },
  { id: 'vhs_retro', name: 'VHS Camcorder', icon: '📼' },
];

// ============================================================
// === HELPER: Canvas ko container ke andar perfectly fit karo
// === (ZERO gap — no padding, no margin)
// ============================================================
const fitCanvasToContainer = (canvasEditor) => {
  if (!canvasEditor) return;

  const canvasEl = canvasEditor.getElement();
  if (!canvasEl) return;

  // Logical (backstore) dimensions
  const zoom = canvasEditor.getZoom() || 1;
  const backstoreWidth  = canvasEditor.getWidth()  / zoom;
  const backstoreHeight = canvasEditor.getHeight() / zoom;

  if (!backstoreWidth || !backstoreHeight) return;

  const container = canvasEl.parentNode;
  const cw = (container && container.clientWidth  > 0) ? container.clientWidth  : window.innerWidth;
  const ch = (container && container.clientHeight > 0) ? container.clientHeight : window.innerHeight;
  if (!cw || !ch) return;

  let scale = Math.min(cw / backstoreWidth, ch / backstoreHeight);
  if (!scale || isNaN(scale) || scale <= 0) scale = 1;

  // Fabric v6 safe — NO backstoreOnly option
  try {
    canvasEditor.setDimensions({ width: backstoreWidth * scale, height: backstoreHeight * scale });
    canvasEditor.setZoom(scale);
    canvasEditor.setViewportTransform([scale, 0, 0, scale, 0, 0]);
    canvasEditor.calcOffset();
    canvasEditor.requestRenderAll();
  } catch (err) {
    console.warn('fitCanvasToContainer error:', err);
  }
};

export function ResizeControls({ project }) {
  const { canvasEditor, processingMessage, setProcessingMessage } = useCanvas();
  
  // States
  const [activeTab, setActiveTab] = useState("resize"); 
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Resize States
  const [newWidth, setNewWidth] = useState(project?.width || 800);
  const [newHeight, setNewHeight] = useState(project?.height || 600);
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState(null);

  // Frames States
  const [activeFrame, setActiveFrame] = useState("none");

  const {
    mutate: updateProject,
    data,
    isLoading,
  } = useConvexMutation(api.projects.updateProject);

  useEffect(() => {
    if (!isLoading && data && activeTab === "resize") {
      window.location.reload(); 
    }
  }, [data, isLoading, activeTab]);

  // ============================================================
  // === FIX 1: Window resize listener — canvas auto-fit karo
  // ============================================================
  useEffect(() => {
    if (!canvasEditor) return;

    const handleWindowResize = () => {
      fitCanvasToContainer(canvasEditor);
    };

    window.addEventListener("resize", handleWindowResize);

    // Fullscreen change event bhi handle karo
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      // Fullscreen transition ke baad canvas fit karo
      setTimeout(() => fitCanvasToContainer(canvasEditor), 150);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [canvasEditor]);

  // === MAGIC SYNC: FRAME FOLLOWS IMAGE EXACTLY ===
  useEffect(() => {
    if (!canvasEditor) return;

    const syncFrameWithImage = (e) => {
      const target = e.target;
      if (target && target.type === 'image' && !target.isPremiumFrame) {
        const frame = canvasEditor.getObjects().find(o => o.isPremiumFrame);
        if (frame) {
          const center = target.getCenterPoint();
          frame.set({
            left: center.x,
            top: center.y,
            angle: target.angle
          });
          frame.setCoords();
        }
      }
    };

    canvasEditor.on('object:moving', syncFrameWithImage);
    canvasEditor.on('object:rotating', syncFrameWithImage);

    return () => {
      canvasEditor.off('object:moving', syncFrameWithImage);
      canvasEditor.off('object:rotating', syncFrameWithImage);
    };
  }, [canvasEditor]);

  // === KEYBOARD SHORTCUTS LOGIC ===
  useEffect(() => {
    if (!canvasEditor) return;

    const handleKeyDown = (e) => {
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
        const activeObject = canvasEditor.getActiveObject();
        if (!activeObject) return; 

        e.preventDefault();
        e.stopPropagation();

        const step = e.shiftKey ? 10 : 1; 
        const currentLeft = parseFloat(activeObject.get('left')) || 0;
        const currentTop = parseFloat(activeObject.get('top')) || 0;

        switch (e.key) {
          case "ArrowUp":    activeObject.set("top",  currentTop  - step); break;
          case "ArrowDown":  activeObject.set("top",  currentTop  + step); break;
          case "ArrowLeft":  activeObject.set("left", currentLeft - step); break;
          case "ArrowRight": activeObject.set("left", currentLeft + step); break;
        }

        activeObject.setCoords(); 
        canvasEditor.requestRenderAll();
        canvasEditor.fire("object:modified", { target: activeObject });
      }
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [canvasEditor]);

  // === RESIZE INPUT HANDLERS ===
  const handleWidthChange = (value) => {
    const width = parseInt(value);
    if (isNaN(width)) { setNewWidth(""); return; }
    setNewWidth(width);
    if (lockAspectRatio && project) setNewHeight(Math.max(1, Math.round(width * (project.height / project.width))));
    setSelectedPreset(null);
  };

  const handleHeightChange = (value) => {
    const height = parseInt(value);
    if (isNaN(height)) { setNewHeight(""); return; }
    setNewHeight(height);
    if (lockAspectRatio && project) setNewWidth(Math.max(1, Math.round(height * (project.width / project.height))));
    setSelectedPreset(null);
  };

  // ============================================================
  // === FIX 2: full_screen preset — canvas container ka EXACT size lo
  // === Best Algorithm: canvasEditor element ke parent container se
  // === actual available width/height read karo (navbar/statusbar minus)
  // ============================================================
  const applyPreset = (preset) => {
    if (preset.id === "full_screen") {
      let finalWidth = window.innerWidth;
      let finalHeight = window.innerHeight;

      // === BEST ALGORITHM ===
      // Step 1: canvasEditor ke DOM element ka parent container dhundo
      // Yeh wahi div hai jo CanvasEditor.tsx mein containerRef hai
      if (canvasEditor) {
        const canvasEl = canvasEditor.getElement();
        if (canvasEl) {
          // Canvas ke parent chain mein jaao — actual editor container milega
          // jo sidebar ke baad wali area hai
          let container = canvasEl.parentNode;

          // Parent chain mein jaao jab tak ek meaningful sized container mile
          // (canvas ka direct parent sirf flex wrapper hota hai)
          while (container && container !== document.body) {
            const w = container.clientWidth;
            const h = container.clientHeight;

            // Agar container meaningful size ka hai (> 200px both sides)
            // toh yahi hamara actual editing area hai
            if (w > 200 && h > 200) {
              finalWidth = w;
              finalHeight = h;
              break;
            }
            container = container.parentNode;
          }
        }
      }

      // Step 2: Fallback — agar DOM se nahi mila toh
      // known UI elements ka height manually subtract karo:
      // Top navbar ~56px + Bottom statusbar ~48px = ~104px total
      if (finalWidth === window.innerWidth && finalHeight === window.innerHeight) {
        const topNavHeight = 56;   // editor top bar
        const bottomBarHeight = 48; // zoom/status bar
        finalHeight = window.innerHeight - topNavHeight - bottomBarHeight;

        // Width mein sidebar subtract karo (right panel ~320px)
        // Lekin resize panel open hai toh left side canvas area hai
        // sidebar ko ignore karo — canvas apne container mein fit hoga
      }

      // Step 3: Safety — minimum size ensure karo
      finalWidth  = Math.max(320, Math.round(finalWidth));
      finalHeight = Math.max(240, Math.round(finalHeight));

      setNewWidth(finalWidth);
      setNewHeight(finalHeight);
    } else {
      setNewWidth(preset.width);
      setNewHeight(preset.height);
    }
    setSelectedPreset(preset.id);
    setLockAspectRatio(false); 
  };

  const handleFlipDimensions = () => {
    setNewWidth(newHeight);
    setNewHeight(newWidth);
    setSelectedPreset(null);
  };

  // ============================================================
  // === FIXED handleApplyResize — Fabric v6 compatible
  // === setWidth/setHeight exist nahi karte Fabric v6 mein
  // === SOLUTION: setDimensions ek hi call mein — backstoreOnly nahi
  // ============================================================
  // ============================================================
  // === FIXED handleApplyResize — PERFECT IMAGE FIT
  // === Ye image ka original size padh kar use perfectly canvas me fit karega
  // ============================================================
  const handleApplyResize = async () => {
    if (!canvasEditor || !project) return;

    const finalWidth  = Math.max(100, isNaN(newWidth)  ? project.width  : newWidth);
    const finalHeight = Math.max(100, isNaN(newHeight) ? project.height : newHeight);

    if (finalWidth === project.width && finalHeight === project.height) return;

    setProcessingMessage("Applying New Size...");

    try {
      // --- 1. FIT IMAGE EXACTLY TO NEW CANVAS DIMENSIONS ---
      canvasEditor.getObjects().forEach(obj => {
        
        // Agar object Image hai (aur Premium frame nahi hai)
        if (["image", "Image", "FabricImage", "fabricImage"].includes(obj.type) && !obj.isPremiumFrame) {
          
          // Image ka original Aspect Ratio aur Canvas ka naya Aspect Ratio
          const imgAR = obj.width / obj.height;
          const canvasAR = finalWidth / finalHeight;
          let newScale;

          // PERFECT FIT (CONTAIN) LOGIC
          if (imgAR > canvasAR) {
            newScale = finalWidth / obj.width;  // Width ke hisab se fit karo
          } else {
            newScale = finalHeight / obj.height; // Height ke hisab se fit karo
          }

          // Image ko scale karke bilkul Canvas ke center me set karo
          obj.set({
            scaleX: newScale,
            scaleY: newScale,
            left: finalWidth / 2,
            top: finalHeight / 2,
            originX: "center",
            originY: "center",
          });
          obj.setCoords();
        } 
        // Text ya koi aur element ho toh usko bas naye canvas ke center me rakh do
        else if (["i-text", "textbox", "text"].includes(obj.type)) {
           obj.set({
             left: finalWidth / 2,
             top: finalHeight / 2,
             originX: "center",
             originY: "center",
           });
           obj.setCoords();
        }
      });

      // Agar koi premium frame laga tha, toh use remove kar do
      // Kyuki 16:9 ka frame 1:1 me ajeeb dikhega (User naye size me dobara frame laga sakta hai)
      const existingFrames = canvasEditor.getObjects().filter(o => o.isPremiumFrame);
      existingFrames.forEach(o => canvasEditor.remove(o));
      setActiveFrame("none"); // Frame state reset

      // Workspace update karo
      canvasEditor.workspaceWidth = finalWidth;
      canvasEditor.workspaceHeight = finalHeight;

      // --- 2. JSON SAVE KARO (Perfect fit hone ke baad) ---
      const savedJSON = canvasEditor.toJSON();

      // --- 3. DISPLAY SCALE UPDATE (UI ke liye) ---
      const canvasEl = canvasEditor.getElement();
      const container = canvasEl?.parentNode;
      let cw = (container && container.clientWidth  > 0) ? container.clientWidth  : window.innerWidth;
      let ch = (container && container.clientHeight > 0) ? container.clientHeight : window.innerHeight;

      let displayScale = Math.min(cw / finalWidth, ch / finalHeight);
      if (!displayScale || isNaN(displayScale) || displayScale <= 0) displayScale = 1;

      // Fabric UI update
      canvasEditor.setDimensions({
        width:  finalWidth  * displayScale,
        height: finalHeight * displayScale,
      });

      canvasEditor.setZoom(displayScale);
      canvasEditor.setViewportTransform([displayScale, 0, 0, displayScale, 0, 0]);
      canvasEditor.calcOffset();
      canvasEditor.requestRenderAll();

      // --- 4. DATABASE UPDATE ---
      await updateProject({
        projectId: project._id,
        width: finalWidth,
        height: finalHeight,
        canvasState: savedJSON,
      });

    } catch (error) {
      console.error("Resize error:", error);
    } finally {
      setProcessingMessage(null);
    }
  };
  // ============================================================
  // === FIX 4: toggleBrowserFullscreen — fullscreen ke baad canvas refit
  // ============================================================
  const toggleBrowserFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
        .then(() => {
          setIsFullscreen(true);
          // Fullscreen transition (~300ms) ke baad canvas fit karo
          setTimeout(() => fitCanvasToContainer(canvasEditor), 300);
        })
        .catch(err => console.log("Fullscreen error:", err));
    } else {
      document.exitFullscreen()
        .then(() => {
          setIsFullscreen(false);
          setTimeout(() => fitCanvasToContainer(canvasEditor), 300);
        })
        .catch(err => console.log("Exit fullscreen error:", err));
    }
  };

  // === PERFECT FRAME REPLACEMENT ===
  const applyFrameDesign = (frameId) => {
    if (!canvasEditor) return;
    setActiveFrame(frameId);

    const existingFrames = canvasEditor.getObjects().filter(o => o.isPremiumFrame);
    existingFrames.forEach(o => canvasEditor.remove(o));

    if (frameId === 'none') {
      canvasEditor.requestRenderAll();
      return;
    }

    let targetImg = canvasEditor.getActiveObject();
    
    if (!targetImg || targetImg.isPremiumFrame) {
      targetImg = canvasEditor.getObjects().find(o => o.type === 'image' && !o.isPremiumFrame);
    }

    let fw = canvasEditor.width;
    let fh = canvasEditor.height;
    let centerX = canvasEditor.width / 2;
    let centerY = canvasEditor.height / 2;
    let frameAngle = 0;

    if (targetImg) {
      fw = targetImg.getScaledWidth();
      fh = targetImg.getScaledHeight();
      const center = targetImg.getCenterPoint();
      centerX = center.x;
      centerY = center.y;
      frameAngle = targetImg.angle || 0; 
    } else if (canvasEditor.backgroundImage) {
      fw = canvasEditor.backgroundImage.getScaledWidth() || canvasEditor.width;
      fh = canvasEditor.backgroundImage.getScaledHeight() || canvasEditor.height;
    }

    const elements = [];

    const addSolidBorders = (t, b, l, r, color, opacity = 1) => {
      if (t > 0) elements.push(new Rect({ width: fw, height: t, left: 0, top: 0, fill: color, opacity, originX: 'left', originY: 'top' }));
      if (b > 0) elements.push(new Rect({ width: fw, height: b, left: 0, top: fh - b, fill: color, opacity, originX: 'left', originY: 'top' }));
      if (l > 0) elements.push(new Rect({ width: l, height: fh, left: 0, top: 0, fill: color, opacity, originX: 'left', originY: 'top' }));
      if (r > 0) elements.push(new Rect({ width: r, height: fh, left: fw - r, top: 0, fill: color, opacity, originX: 'left', originY: 'top' }));
    };

    const addStrokeBorder = (thickness, color, inset = 0, dashArray = null) => {
      elements.push(new Rect({
        width: fw - inset * 2 - thickness,
        height: fh - inset * 2 - thickness,
        left: fw / 2, top: fh / 2,
        originX: 'center', originY: 'center',
        fill: 'transparent',
        stroke: color, strokeWidth: thickness, strokeDashArray: dashArray
      }));
    };

    switch (frameId) {
      case 'classic_white': addSolidBorders(30, 30, 30, 30, '#ffffff'); break;
      case 'classic_black': addSolidBorders(30, 30, 30, 30, '#000000'); break;
      case 'polaroid': addSolidBorders(30, 120, 30, 30, '#ffffff'); break;
      case 'cinematic': addSolidBorders(fh * 0.12, fh * 0.12, 0, 0, '#000000'); break;
      case 'museum_gold':
        addSolidBorders(40, 40, 40, 40, '#111111');
        addStrokeBorder(4, '#d4af37', 35);
        break;
      case 'museum_silver':
        addSolidBorders(40, 40, 40, 40, '#f1f5f9');
        addStrokeBorder(2, '#1e293b', 35);
        break;
      case 'vogue': addSolidBorders(60, 15, 50, 50, '#dc2626'); break;
      case 'neon_cyan':
        addStrokeBorder(20, '#00ffff', 10); elements[elements.length - 1].set('opacity', 0.15);
        addStrokeBorder(10, '#00ffff', 15); elements[elements.length - 1].set('opacity', 0.4);
        addStrokeBorder(3, '#ffffff', 18);
        break;
      case 'neon_magenta':
        addStrokeBorder(20, '#ff00ff', 10); elements[elements.length - 1].set('opacity', 0.15);
        addStrokeBorder(10, '#ff00ff', 15); elements[elements.length - 1].set('opacity', 0.4);
        addStrokeBorder(3, '#ffffff', 18);
        break;
      case 'cyberpunk':
        addSolidBorders(15, 15, 15, 15, '#0f172a');
        elements.push(new Rect({ width: fw - 30, height: 4, left: fw / 2, top: 18, fill: '#00ffff', originX: 'center', originY: 'center' }));
        elements.push(new Rect({ width: 4, height: fh - 30, left: 18, top: fh / 2, fill: '#00ffff', originX: 'center', originY: 'center' }));
        elements.push(new Rect({ width: fw - 30, height: 4, left: fw / 2, top: fh - 18, fill: '#ff00ff', originX: 'center', originY: 'center' }));
        elements.push(new Rect({ width: 4, height: fh - 30, left: fw - 18, top: fh / 2, fill: '#ff00ff', originX: 'center', originY: 'center' }));
        break;
      case 'glassmorphism':
        addSolidBorders(30, 30, 30, 30, '#ffffff', 0.3);
        addStrokeBorder(2, '#ffffff', 30);
        break;
      case 'film_strip':
        addSolidBorders(50, 50, 50, 50, '#000000');
        addStrokeBorder(10, '#ffffff', 20, [15, 20]);
        break;
      case 'postage_stamp':
        addSolidBorders(30, 30, 30, 30, '#ffffff');
        addStrokeBorder(8, '#0f172a', 25, [10, 15]);
        break;
      case 'art_deco':
        addSolidBorders(25, 25, 25, 25, '#0f172a');
        addStrokeBorder(2, '#d4af37', 32);
        addStrokeBorder(1, '#d4af37', 38);
        break;
      case 'vintage_sepia': addSolidBorders(40, 40, 40, 40, '#3e2723', 0.5); break;
      case 'valentine':
        addSolidBorders(30, 30, 30, 30, '#ff4d6d');
        addStrokeBorder(2, '#ffffff', 24);
        addStrokeBorder(2, '#ffffff', 32);
        break;
      case 'letterbox_white': addSolidBorders(60, 60, 0, 0, '#ffffff'); break;
      case 'pillarbox_black': addSolidBorders(0, 0, 60, 60, '#000000'); break;
      case 'focus_grid': {
        const lOpts = { stroke: '#ffffff', strokeWidth: 2, opacity: 0.6, originX: 'left', originY: 'top' };
        elements.push(new Line([0, fh / 3, fw, fh / 3], lOpts));
        elements.push(new Line([0, fh * 2 / 3, fw, fh * 2 / 3], lOpts));
        elements.push(new Line([fw / 3, 0, fw / 3, fh], lOpts));
        elements.push(new Line([fw * 2 / 3, 0, fw * 2 / 3, fh], lOpts));
        break;
      }
      case 'camera_viewfinder': {
        const cOpts = { stroke: '#ffffff', strokeWidth: 4, originX: 'left', originY: 'top' };
        const cSize = Math.min(fw, fh) * 0.1;
        elements.push(new Line([30, 30, 30 + cSize, 30], cOpts));
        elements.push(new Line([30, 30, 30, 30 + cSize], cOpts));
        elements.push(new Line([fw - 30 - cSize, 30, fw - 30, 30], cOpts));
        elements.push(new Line([fw - 30, 30, fw - 30, 30 + cSize], cOpts));
        elements.push(new Line([30, fh - 30, 30 + cSize, fh - 30], cOpts));
        elements.push(new Line([30, fh - 30 - cSize, 30, fh - 30], cOpts));
        elements.push(new Line([fw - 30 - cSize, fh - 30, fw - 30, fh - 30], cOpts));
        elements.push(new Line([fw - 30, fh - 30 - cSize, fw - 30, fh - 30], cOpts));
        break;
      }
      case 'royal_gold':
        addSolidBorders(35, 35, 35, 35, '#1a1a1a');
        addStrokeBorder(6, '#FFD700', 15);
        addStrokeBorder(2, '#DAA520', 25);
        break;
      case 'wood_rustic':
        addSolidBorders(45, 45, 45, 45, '#5C4033');
        addStrokeBorder(4, '#3E2723', 41);
        addStrokeBorder(2, '#8D6E63', 5);
        break;
      case 'neon_matrix':
        addStrokeBorder(20, '#00FF41', 10); elements[elements.length - 1].set('opacity', 0.15);
        addStrokeBorder(10, '#00FF41', 15); elements[elements.length - 1].set('opacity', 0.4);
        addStrokeBorder(3, '#ffffff', 18);
        break;
      case 'pastel_dream':
        addSolidBorders(30, 30, 30, 30, '#FFD1DC');
        addStrokeBorder(15, '#AEC6CF', 30);
        break;
      case 'glitch_effect':
        elements.push(new Rect({ width: fw - 10, height: fh - 10, left: fw / 2 - 3, top: fh / 2 - 3, originX: 'center', originY: 'center', fill: 'transparent', stroke: '#ff003c', strokeWidth: 4 }));
        elements.push(new Rect({ width: fw - 10, height: fh - 10, left: fw / 2 + 3, top: fh / 2 + 3, originX: 'center', originY: 'center', fill: 'transparent', stroke: '#00f0ff', strokeWidth: 4 }));
        addStrokeBorder(2, '#ffffff', 5);
        break;
      case 'polaroid_black':
        addSolidBorders(30, 120, 30, 30, '#1a1a1a');
        addStrokeBorder(1, '#333333', 25);
        break;
      case 'stitching_craft':
        addSolidBorders(35, 35, 35, 35, '#E5E0D8');
        addStrokeBorder(4, '#8B5A2B', 15, [12, 8]);
        break;
      case 'double_matte':
        addSolidBorders(45, 45, 45, 45, '#ffffff');
        addStrokeBorder(20, '#F5F5DC', 45);
        addStrokeBorder(2, '#d1d1d1', 65);
        break;
      case 'shadow_box':
        addSolidBorders(40, 40, 40, 40, '#2c3e50');
        addStrokeBorder(8, '#1a252f', 40);
        addStrokeBorder(2, '#ecf0f1', 48);
        break;
      case 'blueprint_tech':
        addSolidBorders(30, 30, 30, 30, '#0F3376');
        addStrokeBorder(2, '#ffffff', 10);
        addStrokeBorder(1, '#ffffff', 20, [5, 5]);
        [[15, 15], [fw - 15, 15], [15, fh - 15], [fw - 15, fh - 15]].forEach(pos => {
          elements.push(new Rect({ width: 6, height: 6, left: pos[0], top: pos[1], originX: 'center', originY: 'center', fill: '#ffffff' }));
        });
        break;
      case 'grunge_edge':
        addStrokeBorder(4, '#000000', 5, [20, 5, 10, 10, 30, 5]);
        addStrokeBorder(2, '#000000', 8, [15, 10, 25, 5]);
        addStrokeBorder(3, '#000000', 12, [5, 15, 10, 5, 20, 10]);
        break;
      case 'comic_panel':
        addSolidBorders(20, 20, 20, 20, '#ffffff');
        addStrokeBorder(8, '#000000', 20);
        addStrokeBorder(3, '#ffffff', 28);
        break;
      case 'sunset_vibes':
        addStrokeBorder(15, '#FF512F', 0);
        addStrokeBorder(15, '#DD2476', 15);
        addStrokeBorder(15, '#FF9500', 30);
        break;
      case 'minimal_brackets': {
        const bLen = Math.min(fw, fh) * 0.15;
        const bThick = 6;
        const c = '#ffffff';
        elements.push(new Rect({ width: bLen, height: bThick, left: 20, top: 20, fill: c }));
        elements.push(new Rect({ width: bThick, height: bLen, left: 20, top: 20, fill: c }));
        elements.push(new Rect({ width: bLen, height: bThick, left: fw - 20 - bLen, top: 20, fill: c }));
        elements.push(new Rect({ width: bThick, height: bLen, left: fw - 20 - bThick, top: 20, fill: c }));
        elements.push(new Rect({ width: bLen, height: bThick, left: 20, top: fh - 20 - bThick, fill: c }));
        elements.push(new Rect({ width: bThick, height: bLen, left: 20, top: fh - 20 - bLen, fill: c }));
        elements.push(new Rect({ width: bLen, height: bThick, left: fw - 20 - bLen, top: fh - 20 - bThick, fill: c }));
        elements.push(new Rect({ width: bThick, height: bLen, left: fw - 20 - bThick, top: fh - 20 - bLen, fill: c }));
        break;
      }
      case 'vhs_retro':
        addSolidBorders(fh * 0.1, fh * 0.1, 0, 0, '#000000');
        elements.push(new Rect({ width: fw, height: 4, left: 0, top: fh * 0.85, fill: '#ffffff', opacity: 0.4, originX: 'left', originY: 'top' }));
        elements.push(new Rect({ width: 16, height: 16, left: 40, top: fh * 0.15, fill: '#ff0000', originX: 'center', originY: 'center', rx: 8, ry: 8 }));
        break;
    }

    if (elements.length > 0) {
      const frameGroup = new Group(elements, {
        isPremiumFrame: true,
        selectable: true,
        evented: true,
        left: centerX,
        top: centerY,
        originX: 'center',
        originY: 'center',
        angle: frameAngle,
        transparentCorners: false,
        cornerColor: '#06b6d4',
        cornerStrokeColor: '#ffffff',
        borderColor: '#06b6d4',
        cornerSize: 10,
        padding: 0
      });

      canvasEditor.add(frameGroup);
      canvasEditor.setActiveObject(frameGroup);
      canvasEditor.bringObjectToFront(frameGroup);
    }

    canvasEditor.requestRenderAll();
  };

  // === SMART SAVE SYSTEM ===
  const saveFrameToProject = async () => {
    if (!project || !canvasEditor) return;
    setProcessingMessage("Saving & Locking Frame...");
    try {
      const frames = canvasEditor.getObjects().filter(o => o.isPremiumFrame);
      const targetImg = canvasEditor.getObjects().find(o => o.type === 'image' && !o.isPremiumFrame);

      frames.forEach(frame => {
        frame.set({
          selectable: false,
          evented: false,
          lockMovementX: true,
          lockMovementY: true,
          lockRotation: true,
          lockScalingX: true,
          lockScalingY: true,
          hasControls: false,
          hasBorders: false
        });
      });

      if (targetImg) {
        targetImg.set({
          lockMovementX: false,
          lockMovementY: false,
          lockRotation: false,
          lockScalingX: false,
          lockScalingY: false
        });
      }

      canvasEditor.discardActiveObject();
      canvasEditor.requestRenderAll();

      const canvasState = canvasEditor.toJSON([
        'isPremiumFrame', 'selectable', 'evented',
        'lockMovementX', 'lockMovementY', 'lockRotation',
        'lockScalingX', 'lockScalingY', 'hasControls', 'hasBorders'
      ]);

      await updateProject({
        projectId: project._id,
        canvasState: canvasState,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setProcessingMessage(null);
    }
  };

  if (!canvasEditor || !project) {
    return <div className="p-4 text-white/70 text-sm">Canvas not ready</div>;
  }

  const hasChanges = newWidth !== project.width || newHeight !== project.height;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 h-full flex flex-col">
      
      {/* === TABS === */}
      <div className="flex bg-slate-800/50 p-1 rounded-xl border border-white/5">
        <button
          onClick={() => setActiveTab("resize")}
          className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === "resize" ? "bg-cyan-500 text-white shadow-lg" : "text-white/60 hover:text-white hover:bg-white/5"}`}
        >
          <Expand className="w-3.5 h-3.5" /> Resize Canvas
        </button>
        <button
          onClick={() => setActiveTab("frames")}
          className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === "frames" ? "bg-cyan-500 text-white shadow-lg" : "text-white/60 hover:text-white hover:bg-white/5"}`}
        >
          <Frame className="w-3.5 h-3.5" /> Premium Frames
        </button>
      </div>

      {/* === TAB 1: RESIZE CANVAS === */}
      {activeTab === "resize" && (
        <div className="space-y-6 flex-1 overflow-y-auto pr-1 pb-4 custom-scrollbar">

          <div className="flex bg-slate-800/50 rounded-xl p-4 border border-white/5 items-center justify-between shadow-inner">
            <div>
              <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1">Current Canvas Size</h4>
              <div className="text-lg font-bold text-white flex items-center gap-2">
                {project.width} <span className="text-white/30">×</span> {project.height} <span className="text-xs text-white/50 font-normal">px</span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={toggleBrowserFullscreen}
              className={`text-xs h-9 px-3 flex items-center gap-2 transition-all ${
                isFullscreen
                  ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30"
                  : "bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
              }`}
            >
              <Maximize className="w-3.5 h-3.5" />
              {isFullscreen ? "Exit Fullscreen" : "Go Fullscreen"}
            </Button>
          </div>

          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-xl p-5 border border-white/10 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Custom Dimensions</h3>
              <Button variant="ghost" size="sm" onClick={handleFlipDimensions} className="text-white/50 hover:text-cyan-400 hover:bg-cyan-500/10 h-7 px-2 text-xs">
                <RotateCw className="h-3.5 w-3.5 mr-1" /> Flip
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <label className="text-[10px] uppercase text-white/50 mb-1.5 block font-medium">Width (px)</label>
                <Input type="number" value={newWidth} onChange={(e) => handleWidthChange(e.target.value)} className="bg-slate-900/50 text-white border-white/10" />
              </div>
              <div className="mt-6">
                <button onClick={() => setLockAspectRatio(!lockAspectRatio)} className={`p-2 rounded-lg border ${lockAspectRatio ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400" : "bg-slate-800 text-white/40 border-white/10"}`}>
                  {lockAspectRatio ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                </button>
              </div>
              <div className="flex-1 relative">
                <label className="text-[10px] uppercase text-white/50 mb-1.5 block font-medium">Height (px)</label>
                <Input type="number" value={newHeight} onChange={(e) => handleHeightChange(e.target.value)} className="bg-slate-900/50 text-white border-white/10" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {PRESET_CATEGORIES.map((cat, idx) => (
              <div key={idx} className="space-y-2">
                <h3 className="text-xs font-semibold text-white/60 uppercase ml-1">{cat.category}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {cat.items.map((preset) => {
                    const Icon = preset.icon;
                    const isSelected = selectedPreset === preset.id;
                    return (
                      <button key={preset.id} onClick={() => applyPreset(preset)} className={`flex items-start p-3 rounded-xl border text-left transition-all ${isSelected ? "bg-cyan-500/10 border-cyan-500 shadow-inner" : "bg-slate-800/40 border-white/5 hover:bg-slate-800/80"}`}>
                        <Icon className={`w-4 h-4 mt-0.5 mr-2.5 ${isSelected ? "text-cyan-400" : "text-white/40"}`} />
                        <div>
                          <div className={`text-xs font-medium ${isSelected ? "text-cyan-300" : "text-white/80"}`}>{preset.name}</div>
                          <div className="text-[10px] text-white/40 mt-0.5">
                            {preset.width === "Auto" ? "Match Device Size" : `${preset.width} × ${preset.height}`}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 sticky bottom-0 bg-[#0f172a] pb-2 z-10 border-t border-white/5 mt-4">
            {hasChanges && (
              <div className={`mb-4 p-3 rounded-lg border flex items-start gap-3 text-sm ${(newWidth > project.width || newHeight > project.height) ? "bg-blue-500/10 border-blue-500/20 text-blue-200" : "bg-amber-500/10 border-amber-500/20 text-amber-200"}`}>
                {(newWidth > project.width || newHeight > project.height)
                  ? <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  : <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />}
                <div>
                  <span className="font-semibold block mb-0.5">New Size: {newWidth} × {newHeight} px</span>
                  <span className="text-xs opacity-80">Existing objects will maintain their original size.</span>
                </div>
              </div>
            )}
            <Button
              onClick={handleApplyResize}
              disabled={!hasChanges || !!processingMessage}
              className={`w-full h-12 font-medium shadow-lg transition-all ${hasChanges ? "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-cyan-500/25" : "bg-slate-800 text-white/30 cursor-not-allowed"}`}
            >
              <Expand className={`h-4 w-4 mr-2 ${hasChanges && !processingMessage ? "animate-pulse" : ""}`} />
              {processingMessage ? "Applying Size..." : "Apply New Canvas Size"}
            </Button>
          </div>
        </div>
      )}

      {/* === TAB 2: PREMIUM FRAMES === */}
      {activeTab === "frames" && (
        <div className="flex flex-col flex-1 h-full pb-4">

          <div className="mb-4 bg-slate-800/30 p-3 rounded-xl border border-white/5">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              Select & Move <Keyboard className="w-4 h-4 text-cyan-400" />
            </h3>
            <ul className="text-xs text-white/60 mt-2 space-y-1 ml-1 list-inside">
              <li>Press <strong className="text-white bg-slate-800 px-1 border border-white/10 rounded">Tab</strong> to select frame/image.</li>
              <li>Use <strong className="text-white bg-slate-800 px-1 border border-white/10 rounded">Arrows</strong> to nudge item.</li>
              <li>Hold <strong className="text-white bg-slate-800 px-1 border border-white/10 rounded">Shift + Arrows</strong> to move faster.</li>
            </ul>
          </div>

          <div className="grid grid-cols-3 gap-2 overflow-y-auto pr-2 pb-24 max-h-[400px] custom-scrollbar">
            {PREMIUM_FRAMES_LIST.map((frame) => {
              const isSelected = activeFrame === frame.id;
              return (
                <button
                  key={frame.id}
                  onClick={() => applyFrameDesign(frame.id)}
                  className={`flex flex-col items-center p-3 rounded-xl border transition-all duration-200 ${
                    isSelected
                      ? "bg-cyan-500/20 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                      : "bg-slate-800/40 border-white/5 hover:bg-white/10"
                  }`}
                >
                  <span className="text-2xl mb-2">{frame.icon}</span>
                  <span className={`text-[10px] font-medium text-center leading-tight ${isSelected ? "text-cyan-300" : "text-white/70"}`}>
                    {frame.name}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="absolute bottom-4 left-4 right-4 pt-4 bg-gradient-to-t from-[#0f172a] via-[#0f172a] to-transparent z-10">
            <Button
              onClick={saveFrameToProject}
              disabled={!!processingMessage}
              className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium shadow-lg shadow-indigo-500/20"
            >
              <Save className="w-4 h-4 mr-2" />
              {processingMessage ? "Saving..." : "Save Frame Layout"}
            </Button>
          </div>

        </div>
      )}

    </div>
  );
}