"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Layers,
  CheckCheck,
  X,
  Sparkles,
  Contrast,
  SlidersHorizontal,
  Image as ImageIcon,
  Crown,
  Info,
  Upload,
  Eraser,
  RotateCcw,
  Brush,
  Search // Added Search Icon
} from "lucide-react";
import { useCanvas } from "@/context/context";
import { FabricImage, filters, Point, util } from "fabric";

// Premium Overlay Presets
const PREMIUM_PRESETS = [
  { id: "city", name: "Urban City", url: "https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=800&auto=format&fit=crop", thumb: "https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=100&auto=format&fit=crop" },
  { id: "forest", name: "Misty Forest", url: "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=800&auto=format&fit=crop", thumb: "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=100&auto=format&fit=crop" },
  { id: "galaxy", name: "Deep Space", url: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=800&auto=format&fit=crop", thumb: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=100&auto=format&fit=crop" },
  { id: "mountains", name: "Snow Peaks", url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop", thumb: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=100&auto=format&fit=crop" },
  { id: "sunset", name: "Golden Sky", url: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=800&auto=format&fit=crop", thumb: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=100&auto=format&fit=crop" },
];

const BLEND_MODES = [
  { id: "screen", label: "Screen" },
  { id: "lighten", label: "Lighten" },
  { id: "overlay", label: "Overlay" },
  { id: "multiply", label: "Multiply" },
];

const getSafeBounds = (obj) => {
  if (!obj) return { left: 0, top: 0, width: 0, height: 0 };

  const bounds = typeof obj.getBoundingRect === "function" ? obj.getBoundingRect() : null;

  return {
    left: bounds?.left ?? obj.left ?? 0,
    top: bounds?.top ?? obj.top ?? 0,
    width: bounds?.width ?? (obj.width * (obj.scaleX || 1)) ?? 0,
    height: bounds?.height ?? (obj.height * (obj.scaleY || 1)) ?? 0,
  };
};

const loadImageElement = (url) => {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const isDataUrl = url.startsWith("data:");

    if (!isDataUrl) {
      img.crossOrigin = "anonymous";
    }

    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
};

const createEditableOverlayCanvas = async (url) => {
  const imageElement = await loadImageElement(url);
  let width = imageElement.naturalWidth || imageElement.width || 1;
  let height = imageElement.naturalHeight || imageElement.height || 1;

  // 🚀 SPEED & MEMORY FIX: Force large images into a safe WebGL/Canvas dimension boundary
  const MAX_DIM = 2048;
  if (width > MAX_DIM || height > MAX_DIM) {
    const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const editCanvas = document.createElement("canvas");
  editCanvas.width = width;
  editCanvas.height = height;

  const ctx = editCanvas.getContext("2d");
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(imageElement, 0, 0, width, height);

  return { editCanvas, imageElement, width, height };
};

export function DoubleExposureContent() {
  const { canvasEditor } = useCanvas();
  const fileInputRef = useRef(null);

  const editableOverlayCanvasRef = useRef(null);
  const originalOverlayElementRef = useRef(null);
  const eraserDrawingRef = useRef(false);
  const lastEraserPointRef = useRef(null);
  const eraserStrokeMaskCanvasRef = useRef(null);
  const eraserStrokeBaseSnapshotRef = useRef(null);
  const previousCanvasSelectionRef = useRef(true);
  const isApplyingRef = useRef(false);
  const isReplacingOverlayRef = useRef(false);
  const modeStateRef = useRef({
    isActive: false,
    selectedImage: null,
    overlayImage: null,
    originalProps: null,
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [originalProps, setOriginalProps] = useState(null);

  const [isDoubleExposureMode, setIsDoubleExposureMode] = useState(false);
  const [overlayImage, setOverlayImage] = useState(null);
  const [activePreset, setActivePreset] = useState(null);

  const [blendMode, setBlendMode] = useState("screen");
  const [opacity, setOpacity] = useState(0.7);
  const [isGrayscale, setIsGrayscale] = useState(false);
  const [isLoadingPreset, setIsLoadingPreset] = useState(false);

  const [isEraserActive, setIsEraserActive] = useState(false);
  const [eraserSize, setEraserSize] = useState(45);
  const [eraserOpacity, setEraserOpacity] = useState(0.65);

  // --- NEW STATES FOR UNSPLASH SEARCH ---
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    modeStateRef.current = {
      isActive: isDoubleExposureMode,
      selectedImage,
      overlayImage,
      originalProps,
    };
  }, [isDoubleExposureMode, selectedImage, overlayImage, originalProps]);

  // --- NEW FUNCTION: UNSPLASH SEARCH (Direct API Call) ---
  const handleSearchUnsplash = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const accessKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
      
      const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&orientation=landscape&per_page=15`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Client-ID ${accessKey}`
        }
      });
      
      const data = await response.json();
      const results = data.results || [];
      setSearchResults(results);
    } catch (error) {
      console.error("Error fetching HD overlays from Unsplash:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const getActiveImage = useCallback(() => {
    if (!canvasEditor) return null;

    const activeObject = canvasEditor.getActiveObject();

    if (
      activeObject &&
      (activeObject.type === "image" ||
        activeObject.type === "Image" ||
        activeObject.type === "fabricImage")
    ) {
      return activeObject;
    }

    const objects = canvasEditor.getObjects();

    return (
      objects.find(
        (obj) =>
          obj.type === "image" ||
          obj.type === "Image" ||
          obj.type === "fabricImage"
      ) || null
    );
  }, [canvasEditor]);

  const getCanvasPointer = useCallback((event) => {
    if (!canvasEditor || !event) return null;

    if (typeof canvasEditor.getPointer === "function") {
      return canvasEditor.getPointer(event);
    }

    if (typeof canvasEditor.getScenePoint === "function") {
      const point = canvasEditor.getScenePoint(event);
      return { x: point.x, y: point.y };
    }

    if (typeof canvasEditor.getViewportPoint === "function") {
      const point = canvasEditor.getViewportPoint(event);
      return { x: point.x, y: point.y };
    }

    const canvasElement = canvasEditor.upperCanvasEl || canvasEditor.lowerCanvasEl;

    if (!canvasElement) return null;

    const rect = canvasElement.getBoundingClientRect();
    const touch = event.touches?.[0] || event.changedTouches?.[0];
    const clientX = event.clientX ?? touch?.clientX ?? 0;
    const clientY = event.clientY ?? touch?.clientY ?? 0;

    const zoom = typeof canvasEditor.getZoom === "function" ? canvasEditor.getZoom() : 1;
    const viewportTransform = canvasEditor.viewportTransform || [1, 0, 0, 1, 0, 0];

    return {
      x: (clientX - rect.left - viewportTransform[4]) / zoom,
      y: (clientY - rect.top - viewportTransform[5]) / zoom,
    };
  }, [canvasEditor]);

  const getOverlayPixelPoint = useCallback((pointer, image) => {
    if (!pointer || !image || !image.width || !image.height) return null;

    const matrix = image.calcTransformMatrix();
    const invertedMatrix = util.invertTransform(matrix);
    const localPoint = util.transformPoint(new Point(pointer.x, pointer.y), invertedMatrix);

    const pixelX = localPoint.x + image.width / 2;
    const pixelY = localPoint.y + image.height / 2;

    if (pixelX < 0 || pixelY < 0 || pixelX > image.width || pixelY > image.height) {
      return null;
    }

    return { x: pixelX, y: pixelY };
  }, []);

  const getOverlayPixelBrushSize = useCallback(() => {
    if (!overlayImage) return eraserSize;

    const scaleX = Math.abs(overlayImage.scaleX || 1);
    const scaleY = Math.abs(overlayImage.scaleY || 1);
    const displayScale = Math.max(0.01, (scaleX + scaleY) / 2);

    return Math.max(1, eraserSize / displayScale);
  }, [overlayImage, eraserSize]);

  const getEraseStrength = useCallback(() => {
    return Math.max(0.05, Math.min(1, Number(eraserOpacity) || 0.65));
  }, [eraserOpacity]);

  const refreshOverlayImage = useCallback(() => {
    const editCanvas = editableOverlayCanvasRef.current;

    if (!editCanvas || !overlayImage || !canvasEditor) return;

    if (typeof overlayImage.setElement === "function") {
      overlayImage.setElement(editCanvas);
    } else {
      overlayImage._element = editCanvas;
      overlayImage._originalElement = editCanvas;
    }

    overlayImage.set({
      dirty: true,
      objectCaching: false,
      noScaleCache: false,
    });
    overlayImage.setCoords?.();

    if (overlayImage.clipPath) {
      overlayImage.clipPath.dirty = true;
      overlayImage.clipPath.objectCaching = false;
      overlayImage.clipPath.setCoords?.();
    }

    canvasEditor.renderAll();
  }, [canvasEditor, overlayImage]);

  const getStrokeMaskCanvas = useCallback((editCanvas) => {
    let maskCanvas = eraserStrokeMaskCanvasRef.current;

    if (!maskCanvas || maskCanvas.width !== editCanvas.width || maskCanvas.height !== editCanvas.height) {
      maskCanvas = document.createElement("canvas");
      maskCanvas.width = editCanvas.width;
      maskCanvas.height = editCanvas.height;
      eraserStrokeMaskCanvasRef.current = maskCanvas;
    }

    return maskCanvas;
  }, []);

  const renderEraserStrokePreview = useCallback(() => {
    const editCanvas = editableOverlayCanvasRef.current;
    const baseSnapshot = eraserStrokeBaseSnapshotRef.current;
    const maskCanvas = eraserStrokeMaskCanvasRef.current;

    if (!editCanvas || !baseSnapshot || !maskCanvas) return;

    const ctx = editCanvas.getContext("2d");

    ctx.putImageData(baseSnapshot, 0, 0);

    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.globalAlpha = getEraseStrength();
    ctx.drawImage(maskCanvas, 0, 0);
    ctx.restore();

    refreshOverlayImage();
  }, [getEraseStrength, refreshOverlayImage]);

  const beginEraserStroke = useCallback((point) => {
    const editCanvas = editableOverlayCanvasRef.current;

    if (!editCanvas || !overlayImage || !point) return false;

    const ctx = editCanvas.getContext("2d");
    eraserStrokeBaseSnapshotRef.current = ctx.getImageData(0, 0, editCanvas.width, editCanvas.height);

    const maskCanvas = getStrokeMaskCanvas(editCanvas);
    const maskCtx = maskCanvas.getContext("2d");
    maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);

    return true;
  }, [getStrokeMaskCanvas, overlayImage]);

  const paintEraserMaskLine = useCallback((fromPoint, toPoint) => {
    const editCanvas = editableOverlayCanvasRef.current;

    if (!editCanvas || !fromPoint || !toPoint) return;

    const maskCanvas = getStrokeMaskCanvas(editCanvas);
    const maskCtx = maskCanvas.getContext("2d");
    const brushSize = getOverlayPixelBrushSize();

    maskCtx.save();
    maskCtx.globalCompositeOperation = "source-over";
    maskCtx.globalAlpha = 1;
    maskCtx.strokeStyle = "#000";
    maskCtx.lineCap = "round";
    maskCtx.lineJoin = "round";
    maskCtx.lineWidth = brushSize;
    maskCtx.beginPath();
    maskCtx.moveTo(fromPoint.x, fromPoint.y);
    maskCtx.lineTo(toPoint.x, toPoint.y);
    maskCtx.stroke();
    maskCtx.restore();

    renderEraserStrokePreview();
  }, [getOverlayPixelBrushSize, getStrokeMaskCanvas, renderEraserStrokePreview]);

  const paintEraserMaskDot = useCallback((point) => {
    const editCanvas = editableOverlayCanvasRef.current;

    if (!editCanvas || !point) return;

    const maskCanvas = getStrokeMaskCanvas(editCanvas);
    const maskCtx = maskCanvas.getContext("2d");
    const brushSize = getOverlayPixelBrushSize();

    maskCtx.save();
    maskCtx.globalCompositeOperation = "source-over";
    maskCtx.globalAlpha = 1;
    maskCtx.fillStyle = "#000";
    maskCtx.beginPath();
    maskCtx.arc(point.x, point.y, brushSize / 2, 0, Math.PI * 2);
    maskCtx.fill();
    maskCtx.restore();

    renderEraserStrokePreview();
  }, [getOverlayPixelBrushSize, getStrokeMaskCanvas, renderEraserStrokePreview]);

  const endEraserStroke = useCallback(() => {
    eraserDrawingRef.current = false;
    lastEraserPointRef.current = null;
    eraserStrokeBaseSnapshotRef.current = null;

    const maskCanvas = eraserStrokeMaskCanvasRef.current;
    if (maskCanvas) {
      maskCanvas.getContext("2d")?.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    }
  }, []);

  const resetOverlayErase = useCallback(() => {
    const editCanvas = editableOverlayCanvasRef.current;
    const originalElement = originalOverlayElementRef.current;

    if (!editCanvas || !originalElement || !overlayImage || !canvasEditor) return;

    const ctx = editCanvas.getContext("2d");

    ctx.clearRect(0, 0, editCanvas.width, editCanvas.height);
    ctx.drawImage(originalElement, 0, 0, editCanvas.width, editCanvas.height);

    endEraserStroke();
    setIsEraserActive(false);
    refreshOverlayImage();
    overlayImage.set({
      selectable: true,
      evented: true,
      dirty: true,
      objectCaching: false,
    });
    canvasEditor.setActiveObject(overlayImage);
    canvasEditor.requestRenderAll();
  }, [canvasEditor, overlayImage, refreshOverlayImage]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const target = e.target;
      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target?.isContentEditable;

      if (isTyping) return;

      if (isDoubleExposureMode) {
        if (e.key === "Enter" && !isEraserActive) {
          applyDoubleExposure();
        }

        if (e.key === "Escape") {
          if (isEraserActive) {
            setIsEraserActive(false);
          } else {
            cancelDoubleExposure();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDoubleExposureMode, overlayImage, selectedImage, isEraserActive]);

  useEffect(() => {
    return () => {
      const state = modeStateRef.current;

      if (!canvasEditor || !state.isActive) return;

      try {
        if (state.overlayImage && canvasEditor.getObjects().includes(state.overlayImage)) {
          canvasEditor.remove(state.overlayImage);
        }

        if (state.selectedImage && canvasEditor.getObjects().includes(state.selectedImage)) {
          const original = state.originalProps || state.selectedImage._pixxelOriginalInteractionProps;

          if (original?.filters) {
            state.selectedImage.filters = [...original.filters];
            state.selectedImage.applyFilters?.();
          } else if (state.selectedImage._pixxelDoubleExposureOriginalFilters) {
            state.selectedImage.filters = [...state.selectedImage._pixxelDoubleExposureOriginalFilters];
            state.selectedImage.applyFilters?.();
          }

          state.selectedImage.set({
            selectable: original?.selectable ?? true,
            evented: original?.evented ?? true,
          });

          delete state.selectedImage._pixxelOriginalInteractionProps;
          delete state.selectedImage._pixxelDoubleExposureOriginalFilters;
          state.selectedImage.setCoords?.();
        }

        canvasEditor.isDrawingMode = false;
        canvasEditor.selection = true;
        canvasEditor.skipTargetFind = false;
        canvasEditor.defaultCursor = "default";
        canvasEditor.hoverCursor = "move";
        canvasEditor.moveCursor = "move";

        if (canvasEditor.upperCanvasEl) canvasEditor.upperCanvasEl.style.cursor = "";
        if (canvasEditor.lowerCanvasEl) canvasEditor.lowerCanvasEl.style.cursor = "";

        canvasEditor.discardActiveObject();
        canvasEditor.requestRenderAll();
      } catch (error) {
        console.error("Double Exposure cleanup failed:", error);
      }
    };
  }, [canvasEditor]);

  useEffect(() => {
    if (!canvasEditor || !overlayImage || !isEraserActive) return;

    previousCanvasSelectionRef.current = canvasEditor.selection;
    canvasEditor.selection = false;
    canvasEditor.defaultCursor = "crosshair";
    canvasEditor.hoverCursor = "crosshair";

    overlayImage.set({
      selectable: false,
      evented: false,
      objectCaching: false,
    });

    const handleMouseDown = (opt) => {
      const pointer = getCanvasPointer(opt.e);

      if (!pointer) return;

      const point = getOverlayPixelPoint(pointer, overlayImage);

      if (!point) return;
      if (!beginEraserStroke(point)) return;

      eraserDrawingRef.current = true;
      lastEraserPointRef.current = point;
      paintEraserMaskDot(point);
    };

    const handleMouseMove = (opt) => {
      if (!eraserDrawingRef.current) return;

      const pointer = getCanvasPointer(opt.e);

      if (!pointer) return;

      const nextPoint = getOverlayPixelPoint(pointer, overlayImage);
      const previousPoint = lastEraserPointRef.current;

      if (!nextPoint || !previousPoint) {
        lastEraserPointRef.current = nextPoint;
        return;
      }

      paintEraserMaskLine(previousPoint, nextPoint);
      lastEraserPointRef.current = nextPoint;
    };

    const handleMouseUp = () => {
      endEraserStroke();
    };

    canvasEditor.on("mouse:down", handleMouseDown);
    canvasEditor.on("mouse:move", handleMouseMove);
    canvasEditor.on("mouse:up", handleMouseUp);
    canvasEditor.on("mouse:out", handleMouseUp);

    canvasEditor.requestRenderAll();

    return () => {
      canvasEditor.off("mouse:down", handleMouseDown);
      canvasEditor.off("mouse:move", handleMouseMove);
      canvasEditor.off("mouse:up", handleMouseUp);
      canvasEditor.off("mouse:out", handleMouseUp);

      endEraserStroke();

      canvasEditor.selection = previousCanvasSelectionRef.current;
      canvasEditor.defaultCursor = "default";
      canvasEditor.hoverCursor = "move";

      if (overlayImage && canvasEditor.getObjects().includes(overlayImage)) {
        overlayImage.set({
          selectable: true,
          evented: true,
          objectCaching: false,
        });
        canvasEditor.setActiveObject(overlayImage);
      }

      canvasEditor.requestRenderAll();
    };
  }, [
    canvasEditor,
    overlayImage,
    isEraserActive,
    eraserSize,
    eraserOpacity,
    getCanvasPointer,
    getOverlayPixelPoint,
    beginEraserStroke,
    paintEraserMaskDot,
    paintEraserMaskLine,
    endEraserStroke
  ]);

  const initializeMode = (image) => {
    if (!image || isDoubleExposureMode) return;

    const original = {
      selectable: image.selectable,
      evented: image.evented,
      filters: [...(image.filters || [])],
    };

    image._pixxelOriginalInteractionProps = {
      selectable: original.selectable,
      evented: original.evented,
      lockMovementX: image.lockMovementX,
      lockMovementY: image.lockMovementY,
      lockRotation: image.lockRotation,
      lockScalingX: image.lockScalingX,
      lockScalingY: image.lockScalingY,
    };
    image._pixxelDoubleExposureOriginalFilters = [...original.filters];

    setOriginalProps(original);
    setSelectedImage(image);
    setIsDoubleExposureMode(true);

    setBlendMode("screen");
    setOpacity(0.7);
    setIsGrayscale(false);
    setIsEraserActive(false);
    setEraserSize(45);
    setEraserOpacity(0.65);

    image.set({ selectable: false, evented: false });
    canvasEditor.discardActiveObject();
    canvasEditor.requestRenderAll();
  };

  const handleCustomUpload = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (event) => {
      const dataUrl = event.target.result;
      applyPreset({ id: "custom", url: dataUrl, name: "Custom" });
    };

    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const applyPreset = async (preset) => {
    if (!selectedImage || !canvasEditor) return;

    setIsLoadingPreset(true);
    setActivePreset(preset.id);
    setIsEraserActive(false);

    if (overlayImage) {
      isReplacingOverlayRef.current = true;
      canvasEditor.remove(overlayImage);
      setOverlayImage(null);
    }

    editableOverlayCanvasRef.current = null;
    originalOverlayElementRef.current = null;

    try {
      const { editCanvas, imageElement, width, height } = await createEditableOverlayCanvas(preset.url);

      editableOverlayCanvasRef.current = editCanvas;
      originalOverlayElementRef.current = imageElement;

      const img = new FabricImage(editCanvas);
      const baseBounds = getSafeBounds(selectedImage);

      const scaleX = baseBounds.width / width;
      const scaleY = baseBounds.height / height;
      const scale = Math.max(scaleX, scaleY);

      img.set({
        left: baseBounds.left + baseBounds.width / 2,
        top: baseBounds.top + baseBounds.height / 2,
        originX: "center",
        originY: "center",
        scaleX: scale,
        scaleY: scale,
        opacity: opacity,
        globalCompositeOperation: blendMode,
        selectable: true,
        evented: true,
        objectCaching: false,
        noScaleCache: false,
        name: "doubleExposureOverlay",
        _pixxelTransientToolObject: true,
      });

      const clipMask = await selectedImage.clone();

      clipMask.set({
        absolutePositioned: true,
        objectCaching: false,
      });

      if (clipMask.filters) {
        clipMask.filters = [];
        clipMask.applyFilters();
      }

      img.set({ clipPath: clipMask });

      const imageIndex = canvasEditor.getObjects().indexOf(selectedImage);

      if (canvasEditor.insertAt) {
        canvasEditor.insertAt(imageIndex + 1, img);
      } else {
        canvasEditor.add(img);
        canvasEditor.moveObjectTo ? canvasEditor.moveObjectTo(img, imageIndex + 1) : img.bringToFront();
      }

      setOverlayImage(img);
      canvasEditor.setActiveObject(img);
      canvasEditor.requestRenderAll();
    } catch (error) {
      console.error("Failed to load overlay:", error);
    } finally {
      isReplacingOverlayRef.current = false;
      setIsLoadingPreset(false);
    }
  };

  useEffect(() => {
    if (overlayImage && canvasEditor) {
      overlayImage.set({
        opacity,
        globalCompositeOperation: blendMode,
        objectCaching: false,
      });
      canvasEditor.requestRenderAll();
    }
  }, [opacity, blendMode, overlayImage, canvasEditor]);

  useEffect(() => {
    if (selectedImage && canvasEditor && originalProps) {
      if (isGrayscale) {
        const bwFilter = new filters.Grayscale();
        selectedImage.filters = [...originalProps.filters, bwFilter];
      } else {
        selectedImage.filters = [...originalProps.filters];
      }

      selectedImage.applyFilters();
      canvasEditor.requestRenderAll();
    }
  }, [isGrayscale, selectedImage, canvasEditor, originalProps]);

  const applyDoubleExposure = async () => {
    if (!selectedImage || !overlayImage) return;

    try {
      isApplyingRef.current = true;
      setIsEraserActive(false);
      canvasEditor.discardActiveObject();

      const allObjs = canvasEditor.getObjects();
      const hiddenObjs = allObjs.filter((o) => o !== selectedImage && o !== overlayImage);

      hiddenObjs.forEach((o) => o.set("visible", false));

      const originalBg = canvasEditor.backgroundColor;
      canvasEditor.backgroundColor = null;

      const originalVpt = canvasEditor.viewportTransform ? [...canvasEditor.viewportTransform] : null;

      if (originalVpt) {
        canvasEditor.setViewportTransform([1, 0, 0, 1, 0, 0]);
      }

      canvasEditor.renderAll();

      const bounds = getSafeBounds(selectedImage);

      const pixelRatio = canvasEditor.getRetinaScaling
        ? canvasEditor.getRetinaScaling()
        : window.devicePixelRatio || 1;

      const dataUrl = canvasEditor.toDataURL({
        left: Math.floor(bounds.left),
        top: Math.floor(bounds.top),
        width: Math.max(1, Math.ceil(bounds.width)),
        height: Math.max(1, Math.ceil(bounds.height)),
        format: "png",
        multiplier: pixelRatio,
      });

      if (originalVpt) {
        canvasEditor.setViewportTransform(originalVpt);
      }

      canvasEditor.backgroundColor = originalBg;
      hiddenObjs.forEach((o) => o.set("visible", true));

      const mergedImage = await FabricImage.fromURL(dataUrl);

      mergedImage.set({
        left: Math.floor(bounds.left),
        top: Math.floor(bounds.top),
        originX: "left",
        originY: "top",
        scaleX: 1 / pixelRatio,
        scaleY: 1 / pixelRatio,
        name: "mergedDoubleExposure",
        selectable: true,
        evented: true,
      });

      canvasEditor.remove(selectedImage);
      canvasEditor.remove(overlayImage);
      delete selectedImage._pixxelOriginalInteractionProps;
      delete selectedImage._pixxelDoubleExposureOriginalFilters;

      canvasEditor.add(mergedImage);
      canvasEditor.setActiveObject(mergedImage);

      exitMode();
    } catch (error) {
      console.error("Error applying Double Exposure:", error);
      cancelDoubleExposure();
    } finally {
      isApplyingRef.current = false;
    }
  };

  const cancelDoubleExposure = () => {
    setIsEraserActive(false);

    if (overlayImage) {
      canvasEditor.remove(overlayImage);
    }

    if (selectedImage && originalProps) {
      selectedImage.filters = [...originalProps.filters];
      selectedImage.applyFilters();

      selectedImage.set({
        selectable: originalProps.selectable,
        evented: originalProps.evented,
      });

      delete selectedImage._pixxelOriginalInteractionProps;
      delete selectedImage._pixxelDoubleExposureOriginalFilters;
      selectedImage.setCoords?.();
      canvasEditor.setActiveObject(selectedImage);
    }

    exitMode();
  };

  const exitMode = () => {
    setIsDoubleExposureMode(false);
    setOverlayImage(null);
    setSelectedImage(null);
    setActivePreset(null);
    setOriginalProps(null);
    setIsEraserActive(false);
    setSearchQuery("");
    setSearchResults([]);

    editableOverlayCanvasRef.current = null;
    originalOverlayElementRef.current = null;
    eraserDrawingRef.current = false;
    lastEraserPointRef.current = null;
    eraserStrokeBaseSnapshotRef.current = null;
    if (eraserStrokeMaskCanvasRef.current) {
      const maskCanvas = eraserStrokeMaskCanvasRef.current;
      maskCanvas.getContext("2d")?.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    }

    if (canvasEditor) {
      canvasEditor.isDrawingMode = false;
      canvasEditor.selection = true;
      canvasEditor.skipTargetFind = false;
      canvasEditor.defaultCursor = "default";
      canvasEditor.hoverCursor = "move";
      canvasEditor.moveCursor = "move";
      if (canvasEditor.upperCanvasEl) canvasEditor.upperCanvasEl.style.cursor = "";
      if (canvasEditor.lowerCanvasEl) canvasEditor.lowerCanvasEl.style.cursor = "";
      canvasEditor.requestRenderAll();
    }
  };

  useEffect(() => {
    if (!canvasEditor || !isDoubleExposureMode) return;

    const syncAfterCanvasReset = () => {
      const state = modeStateRef.current;
      if (!state.isActive || isApplyingRef.current || isReplacingOverlayRef.current) return;

      const objects = canvasEditor.getObjects();
      const selectedStillExists = state.selectedImage && objects.includes(state.selectedImage);
      const overlayStillExists = state.overlayImage && objects.includes(state.overlayImage);

      if (!selectedStillExists || (state.overlayImage && !overlayStillExists)) {
        exitMode();
      }
    };

    canvasEditor.on("object:removed", syncAfterCanvasReset);
    canvasEditor.on("canvas:cleared", syncAfterCanvasReset);

    return () => {
      canvasEditor.off("object:removed", syncAfterCanvasReset);
      canvasEditor.off("canvas:cleared", syncAfterCanvasReset);
    };
  }, [canvasEditor, isDoubleExposureMode]);

  if (!canvasEditor) {
    return <div className="p-4 text-white/70 text-sm">Canvas not ready</div>;
  }

  const activeImage = getActiveImage();

  if (!activeImage && !isDoubleExposureMode) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-500/20 to-pink-500/20 border border-amber-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.15)]">
          <Layers className="h-6 w-6 text-amber-400" />
        </div>
        <p className="text-white/70 text-sm">Select an image on the canvas to apply premium effects</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleCustomUpload}
        accept="image/*"
        className="hidden"
      />

      {!isDoubleExposureMode && activeImage && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-pink-500/10 border border-amber-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-50 group-hover:opacity-100 transition-opacity">
              <Crown className="w-8 h-8 text-amber-400/20" />
            </div>

            <h3 className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-pink-500 mb-1">
              Double Exposure{" "}
              <span className="bg-gradient-to-r from-amber-500 to-pink-500 text-white text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider ml-2 align-middle font-black shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                Pro
              </span>
            </h3>

            <p className="text-xs text-white/60 mb-4 pr-6">
              Blend two images perfectly to create stunning, professional-grade artwork in one click.
            </p>

            <Button
              onClick={() => initializeMode(activeImage)}
              className="w-full bg-gradient-to-r from-amber-500 to-pink-600 hover:from-amber-400 hover:to-pink-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.3)] border-0 transition-all hover:scale-[1.02]"
            >
              <Sparkles className="h-4 w-4 mr-2" /> Start Magic
            </Button>
          </div>
        </div>
      )}

      {isDoubleExposureMode && (
        <>
          <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 shadow-inner shadow-amber-500/5">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
              <p className="text-amber-400 text-sm font-semibold tracking-wide">Double Exposure Edit</p>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-white/80 uppercase tracking-widest mb-3 flex items-center">
              <ImageIcon className="w-3.5 h-3.5 mr-2 text-amber-400" /> Choose Overlay
            </h3>

            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar snap-x items-center">
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex-shrink-0 w-20 h-24 rounded-xl overflow-hidden snap-center transition-all duration-300 flex flex-col items-center justify-center bg-slate-800/40 border border-dashed border-amber-500/40 hover:bg-slate-700/60 hover:border-amber-400 group ${
                  activePreset === "custom" ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-[#0a0c10]" : ""
                }`}
              >
                <Upload className="w-5 h-5 text-amber-400/80 mb-1 group-hover:scale-110 group-hover:text-amber-400 transition-all" />
                <span className="text-[10px] font-semibold text-amber-400/80 group-hover:text-amber-400">
                  Upload
                </span>
              </button>

              {PREMIUM_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  disabled={isLoadingPreset}
                  className={`relative flex-shrink-0 w-20 h-24 rounded-xl overflow-hidden snap-center transition-all duration-300 ${
                    activePreset === preset.id
                      ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-[#0a0c10] scale-105 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                      : "border border-white/10 opacity-70 hover:opacity-100 hover:border-white/30"
                  }`}
                >
                  <img src={preset.thumb} alt={preset.name} className="w-full h-full object-cover" />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-center pb-2">
                    <span className="text-[10px] font-medium text-white shadow-black drop-shadow-md">
                      {preset.name}
                    </span>
                  </div>

                  {isLoadingPreset && activePreset === preset.id && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                      <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* --- UNSPLASH SEARCH --- */}
            <div className="pt-4 mt-2">
              <h3 className="text-xs font-semibold text-white/80 uppercase tracking-widest mb-2 flex items-center">
                <Search className="w-3.5 h-3.5 mr-2 text-amber-400" /> Search HD Overlays
              </h3>
              
              <form onSubmit={handleSearchUnsplash} className="flex gap-2 mb-3">
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="E.g., Dark Forest, Cyberpunk, Clouds..."
                  className="flex-1 bg-slate-800/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-amber-500/50 transition-colors"
                />
                <Button 
                  type="submit" 
                  disabled={isSearching} 
                  className="h-auto py-2 px-4 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30 rounded-lg text-xs transition-all"
                >
                  {isSearching ? (
                    <div className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Search"
                  )}
                </Button>
              </form>

              {/* Unsplash Search Results */}
              {searchResults.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar snap-x items-center">
                  {searchResults.map((img) => (
                    <button
                      key={img.id}
                      // 🚀 100% SPEED FIX: urls.regular use kiya hai
                      onClick={() => applyPreset({
                        id: img.id,
                        url: img.urls.regular, 
                        name: img.alt_description || "Search Result"
                      })}
                      disabled={isLoadingPreset}
                      className={`relative flex-shrink-0 w-20 h-24 rounded-xl overflow-hidden snap-center transition-all duration-300 ${
                        activePreset === img.id
                          ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-[#0a0c10] scale-105 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                          : "border border-white/10 opacity-70 hover:opacity-100 hover:border-white/30"
                      }`}
                    >
                      <img src={img.urls.small} alt="Result" className="w-full h-full object-cover" />
                      
                      {isLoadingPreset && activePreset === img.id && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                          <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* --- END UNSPLASH SEARCH SECTION --- */}
          </div>

          <div className={`space-y-5 transition-all duration-500 ${overlayImage ? "opacity-100" : "opacity-30 pointer-events-none"}`}>
            <div className="bg-slate-800/40 p-4 rounded-xl border border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-white/80 flex items-center">
                  <Layers className="h-4 w-4 mr-2 text-amber-400" /> Blend Mode
                </label>

                <div className="bg-black/40 rounded-lg p-1 flex">
                  {BLEND_MODES.map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setBlendMode(mode.id)}
                      className={`text-[10px] px-2.5 py-1 rounded-md transition-all ${
                        blendMode === mode.id ? "bg-amber-500 text-white shadow-md" : "text-white/50 hover:text-white"
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-white/5">
                <div className="flex justify-between items-center mb-2 mt-2">
                  <label className="text-xs font-semibold text-white/80 flex items-center">
                    <SlidersHorizontal className="h-4 w-4 mr-2 text-amber-400" /> Overlay Opacity
                  </label>
                  <span className="text-[10px] text-amber-300 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded">
                    {Math.round(opacity * 100)}%
                  </span>
                </div>

                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={opacity}
                  onChange={(e) => setOpacity(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-semibold text-white/80">
                  <Contrast className="w-4 h-4 text-amber-400" />
                  <span>Base Image B&W</span>
                </div>

                <button
                  onClick={() => setIsGrayscale(!isGrayscale)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    isGrayscale ? "bg-amber-500" : "bg-white/20"
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      isGrayscale ? "translate-x-4.5" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="pt-3 border-t border-white/5 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <label className="text-xs font-semibold text-white/80 flex items-center">
                    <Eraser className="h-4 w-4 mr-2 text-amber-400" /> Overlay Eraser
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={resetOverlayErase}
                      disabled={!overlayImage}
                      className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center border border-white/10 disabled:opacity-40"
                      title="Reset erased overlay"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>

                    <button
                      onClick={() => setIsEraserActive(!isEraserActive)}
                      disabled={!overlayImage}
                      className={`h-8 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all flex items-center ${
                        isEraserActive
                          ? "bg-amber-500 text-white border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.35)]"
                          : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
                      } disabled:opacity-40`}
                    >
                      <Brush className="h-3.5 w-3.5 mr-1.5" />
                      {isEraserActive ? "Erasing" : "Erase"}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold text-white/70">Brush Size</label>
                    <span className="text-[10px] text-amber-300 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded">
                      {eraserSize}px
                    </span>
                  </div>

                  <input
                    type="range"
                    min="10"
                    max="140"
                    step="5"
                    value={eraserSize}
                    onChange={(e) => setEraserSize(parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold text-white/70">Eraser Opacity</label>
                    <span className="text-[10px] text-amber-300 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded">
                      {Math.round(eraserOpacity * 100)}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={eraserOpacity}
                    onChange={(e) => setEraserOpacity(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-white/10">
            <Button
              onClick={applyDoubleExposure}
              disabled={!overlayImage}
              className="w-full bg-gradient-to-r from-amber-500 to-pink-600 hover:from-amber-400 hover:to-pink-500 text-white shadow-lg border-0"
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Merge & Apply <span className="ml-2 text-[10px] opacity-60">(Enter)</span>
            </Button>

            <Button
              onClick={cancelDoubleExposure}
              variant="ghost"
              className="w-full text-white/70 hover:text-white hover:bg-white/10 border border-transparent"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel <span className="ml-2 text-[10px] opacity-60">(Esc)</span>
            </Button>
          </div>

          <div className="bg-slate-800/30 border border-amber-500/10 rounded-xl p-3 flex items-start space-x-3">
            <Info className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
            <p className="text-[10px] leading-relaxed text-white/50">
              <strong className="text-white/80 block mb-1">Pro Tip:</strong>
              You can drag, resize, or rotate the overlay image directly on the canvas. Turn on Eraser to softly remove overlay areas with adjustable brush opacity.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
