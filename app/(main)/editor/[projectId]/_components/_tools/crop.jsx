"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Crop,
  CheckCheck,
  X,
  Square,
  RectangleHorizontal,
  RectangleVertical,
  Smartphone,
  Maximize,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Info
} from "lucide-react";
import { useCanvas } from "@/context/context";
import { FabricImage, Rect } from "fabric";

const ASPECT_RATIOS = [
  { label: "Freeform", value: null, icon: Maximize },
  { label: "Square", value: 1, icon: Square, ratio: "1:1" },
  { label: "Widescreen", value: 16 / 9, icon: RectangleHorizontal, ratio: "16:9" },
  { label: "Portrait", value: 4 / 5, icon: RectangleVertical, ratio: "4:5" },
  { label: "Story", value: 9 / 16, icon: Smartphone, ratio: "9:16" },
];

const getSafeBounds = (obj, canvas = null) => {
  if (!obj) return { left: 0, top: 0, width: 0, height: 0 };
  
  let bounds;
  if (canvas && canvas.viewportTransform) {
    const originalVpt = [...canvas.viewportTransform];
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    bounds = typeof obj.getBoundingRect === "function" ? obj.getBoundingRect() : null;
    canvas.setViewportTransform(originalVpt);
  } else {
    bounds = typeof obj.getBoundingRect === "function" ? obj.getBoundingRect() : null;
  }

  return {
    left: bounds?.left ?? obj.left ?? 0,
    top: bounds?.top ?? obj.top ?? 0,
    width: bounds?.width ?? (obj.width * (obj.scaleX || 1)) ?? 0,
    height: bounds?.height ?? (obj.height * (obj.scaleY || 1)) ?? 0,
  };
};

export function CropContent() {
  const { canvasEditor } = useCanvas();

  // --- Common States ---
  const [selectedImage, setSelectedImage] = useState(null);
  const [originalProps, setOriginalProps] = useState(null);

  // --- Crop States ---
  const [isCropMode, setIsCropMode] = useState(false);
  const [selectedRatio, setSelectedRatio] = useState(null);
  const [cropRect, setCropRect] = useState(null);
  const [cropDimensions, setCropDimensions] = useState({ w: 0, h: 0 });

  const getActiveImage = useCallback(() => {
    if (!canvasEditor) return null;
    const activeObject = canvasEditor.getActiveObject();
    if (activeObject && (activeObject.type === "image" || activeObject.type === "Image" || activeObject.type === "fabricImage")) {
      return activeObject;
    }
    const objects = canvasEditor.getObjects();
    return objects.find((obj) => obj.type === "image" || obj.type === "Image" || obj.type === "fabricImage") || null;
  }, [canvasEditor]);

  // Handle Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isCropMode) {
        if (e.key === "Enter") applyCrop();
        if (e.key === "Escape") cancelCrop();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCropMode, cropRect, selectedImage]);

  // -----------------------------------------------------------
  // 1. CROP MODE LOGIC
  // -----------------------------------------------------------
  const removeAllCropRectangles = useCallback(() => {
    if (!canvasEditor) return;
    const objects = canvasEditor.getObjects();
    const rectsToRemove = objects.filter((obj) => obj.isCropRectangle);
    rectsToRemove.forEach((rect) => canvasEditor.remove(rect));
    canvasEditor.requestRenderAll();
  }, [canvasEditor]);

  const initializeCropMode = (image) => {
    if (!image || isCropMode) return;
    removeAllCropRectangles();

    const original = {
      left: image.left, top: image.top,
      width: image.width, height: image.height,
      scaleX: image.scaleX, scaleY: image.scaleY,
      angle: image.angle || 0,
      selectable: image.selectable, evented: image.evented,
      lockMovementX: image.lockMovementX,
      lockMovementY: image.lockMovementY,
      lockRotation: image.lockRotation,
      lockScalingX: image.lockScalingX,
      lockScalingY: image.lockScalingY,
    };

    image._pixxelOriginalInteractionProps = original;
    setOriginalProps(original);
    setSelectedImage(image);
    setIsCropMode(true);

    image.set({ selectable: false, evented: false });
    createCropRectangle(image);
    canvasEditor.requestRenderAll();
  };

  const createCropRectangle = (image) => {
    const bounds = getSafeBounds(image, canvasEditor);
    const initialWidth = (bounds.width || 100) * 0.8;
    const initialHeight = (bounds.height || 100) * 0.8;

    setCropDimensions({ w: Math.round(initialWidth), h: Math.round(initialHeight) });

    const cropRectangle = new Rect({
      left: bounds.left + (bounds.width * 0.1),
      top: bounds.top + (bounds.height * 0.1),
      width: initialWidth,
      height: initialHeight,
      fill: "rgba(0, 0, 0, 0.1)",
      stroke: "#06b6d4",
      strokeWidth: 2,
      strokeDashArray: [6, 4],
      selectable: true,
      evented: true,
      name: "cropRect",
      cornerColor: "#ffffff",
      cornerStrokeColor: "#06b6d4",
      cornerSize: 14,
      transparentCorners: false,
      cornerStyle: "circle",
      borderColor: "#06b6d4",
      borderScaleFactor: 1.5,
      isCropRectangle: true,
    });

    const updateDimensions = (rect) => {
      if (!rect) return;
      setCropDimensions({
        w: Math.round((rect.width || 0) * (rect.scaleX || 1)),
        h: Math.round((rect.height || 0) * (rect.scaleY || 1))
      });
    };

    cropRectangle.on("scaling", (e) => {
      const rect = e.target || cropRectangle;
      if (!rect) return;

      if (selectedRatio && selectedRatio !== null) {
        const currentRatio = (rect.width * rect.scaleX) / (rect.height * rect.scaleY);
        if (Math.abs(currentRatio - selectedRatio) > 0.01) {
          const newHeight = (rect.width * rect.scaleX) / selectedRatio / rect.scaleY;
          rect.set("height", newHeight);
        }
      }
      updateDimensions(rect);
      canvasEditor.requestRenderAll();
    });

    cropRectangle.on("moving", (e) => {
      const rect = e.target || cropRectangle;
      if (rect) updateDimensions(rect);
    });

    canvasEditor.add(cropRectangle);
    canvasEditor.setActiveObject(cropRectangle);
    setCropRect(cropRectangle);
  };

  const exitCropMode = () => {
    if (!isCropMode) return;
    removeAllCropRectangles();
    setCropRect(null);

    if (selectedImage && originalProps) {
      selectedImage.set({
        selectable: originalProps.selectable,
        evented: originalProps.evented,
        left: originalProps.left,
        top: originalProps.top,
        scaleX: originalProps.scaleX,
        scaleY: originalProps.scaleY,
        angle: originalProps.angle,
        lockMovementX: originalProps.lockMovementX,
        lockMovementY: originalProps.lockMovementY,
        lockRotation: originalProps.lockRotation,
        lockScalingX: originalProps.lockScalingX,
        lockScalingY: originalProps.lockScalingY,
      });
      delete selectedImage._pixxelOriginalInteractionProps;
      canvasEditor.setActiveObject(selectedImage);
    }

    setIsCropMode(false);
    setSelectedImage(null);
    setOriginalProps(null);
    setSelectedRatio(null);

    if (canvasEditor) canvasEditor.requestRenderAll();
  };

  // Cleanup crop overlays when the user switches to another tool.
  useEffect(() => {
    return () => {
      if (!canvasEditor) return;
      const objects = canvasEditor.getObjects();
      objects
        .filter((obj) => obj.isCropRectangle)
        .forEach((rect) => canvasEditor.remove(rect));

      objects.forEach((obj) => {
        if (obj._pixxelOriginalInteractionProps) {
          obj.set(obj._pixxelOriginalInteractionProps);
          delete obj._pixxelOriginalInteractionProps;
          if (typeof obj.setCoords === "function") obj.setCoords();
        }
      });

      canvasEditor.requestRenderAll();
    };
  }, [canvasEditor]);

  const applyAspectRatio = (ratio) => {
    setSelectedRatio(ratio);
    if (!cropRect || ratio === null) return;

    const currentWidth = (cropRect.width || 0) * (cropRect.scaleX || 1);
    const newHeight = currentWidth / ratio;

    cropRect.set({
      height: newHeight / (cropRect.scaleY || 1),
      scaleY: cropRect.scaleX || 1,
    });

    setCropDimensions({ w: Math.round(currentWidth), h: Math.round(newHeight) });
    canvasEditor.requestRenderAll();
  };

  const applyCrop = async () => {
    if (!selectedImage || !cropRect) return;

    try {
      const cropBounds = getSafeBounds(cropRect, canvasEditor);
      const imageBounds = getSafeBounds(selectedImage, canvasEditor);

      const cropX = Math.max(0, cropBounds.left - imageBounds.left);
      const cropY = Math.max(0, cropBounds.top - imageBounds.top);
      const cropWidth = Math.min(cropBounds.width, imageBounds.width - cropX);
      const cropHeight = Math.min(cropBounds.height, imageBounds.height - cropY);

      const imageScaleX = selectedImage.scaleX || 1;
      const imageScaleY = selectedImage.scaleY || 1;

      const actualCropX = cropX / imageScaleX;
      const actualCropY = cropY / imageScaleY;
      const actualCropWidth = cropWidth / imageScaleX;
      const actualCropHeight = cropHeight / imageScaleY;

      const croppedImage = new FabricImage(selectedImage._element, {
        left: cropBounds.left + cropBounds.width / 2,
        top: cropBounds.top + cropBounds.height / 2,
        originX: "center",
        originY: "center",
        selectable: true,
        evented: true,
        cropX: actualCropX,
        cropY: actualCropY,
        width: actualCropWidth,
        height: actualCropHeight,
        scaleX: imageScaleX,
        scaleY: imageScaleY,
      });

      canvasEditor.remove(selectedImage);
      canvasEditor.add(croppedImage);
      
      setSelectedImage(null);
      setOriginalProps(null);

      canvasEditor.setActiveObject(croppedImage);
      canvasEditor.requestRenderAll();
      exitCropMode();
    } catch (error) {
      console.error("Error applying crop:", error);
      exitCropMode();
    }
  };

  const cancelCrop = () => exitCropMode();

  // -----------------------------------------------------------
  // 2. PRE-CROP QUICK ADJUSTMENTS
  // -----------------------------------------------------------
  const handleRotate = () => {
    const img = getActiveImage();
    if (!img) return;
    img.rotate((img.angle || 0) + 90);
    canvasEditor.requestRenderAll();
  };

  const handleFlip = (direction) => {
    const img = getActiveImage();
    if (!img) return;
    if (direction === 'x') img.set('flipX', !img.flipX);
    if (direction === 'y') img.set('flipY', !img.flipY);
    canvasEditor.requestRenderAll();
  };

  if (!canvasEditor) return <div className="p-4 text-white/70 text-sm">Canvas not ready</div>;

  const activeImage = getActiveImage();
  if (!activeImage && !isCropMode) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
        <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center">
          <Crop className="h-6 w-6 text-white/40" />
        </div>
        <p className="text-white/70 text-sm">Select an image on the canvas to edit</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* ---------------- QUICK ADJUSTMENTS (Default View) ---------------- */}
      {!isCropMode && activeImage && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-white/90">Quick Adjustments</h3>
          <div className="flex gap-2">
            <Button onClick={handleRotate} variant="outline" className="flex-1 bg-white/5 hover:bg-white/10 border-white/10 text-white">
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button onClick={() => handleFlip('x')} variant="outline" className="flex-1 bg-white/5 hover:bg-white/10 border-white/10 text-white">
              <FlipHorizontal className="h-4 w-4" />
            </Button>
            <Button onClick={() => handleFlip('y')} variant="outline" className="flex-1 bg-white/5 hover:bg-white/10 border-white/10 text-white">
              <FlipVertical className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="mt-4">
            <Button onClick={() => initializeCropMode(activeImage)} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg text-xs transition-all py-2">
              <Crop className="h-4 w-4 mr-1.5" /> Crop Image
            </Button>
          </div>
        </div>
      )}

      {/* ---------------- CROP MODE VIEW ---------------- */}
      {isCropMode && (
        <>
          <div className="flex items-center justify-between bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
              <p className="text-cyan-400 text-sm font-medium">Crop Mode Active</p>
            </div>
            <div className="bg-cyan-950/50 px-2 py-1 rounded text-xs font-mono text-cyan-300">
              {cropDimensions.w} × {cropDimensions.h}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-white mb-3 flex items-center justify-between">
              Aspect Ratios
              {selectedRatio && (
                 <span className="text-[10px] bg-white/10 px-2 py-1 rounded-full text-white/70">
                    Locked
                 </span>
              )}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {ASPECT_RATIOS.map((ratio) => {
                const IconComponent = ratio.icon;
                const isSelected = selectedRatio === ratio.value;
                return (
                  <button
                    key={ratio.label}
                    onClick={() => applyAspectRatio(ratio.value)}
                    className={`group flex flex-col items-center justify-center p-3 border rounded-xl transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "border-cyan-400 bg-cyan-400/10 shadow-[0_0_15px_rgba(6,182,212,0.15)] scale-[0.98]"
                        : "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10 hover:-translate-y-0.5"
                    }`}
                  >
                    <IconComponent className={`h-5 w-5 mb-2 transition-colors ${isSelected ? "text-cyan-400" : "text-white/60 group-hover:text-white"}`} />
                    <div className={`text-[11px] font-medium ${isSelected ? "text-cyan-400" : "text-white/80"}`}>
                      {ratio.label}
                    </div>
                    {ratio.ratio && (
                      <div className="text-[10px] text-white/40 mt-0.5">{ratio.ratio}</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-white/10">
            <Button onClick={applyCrop} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg">
              <CheckCheck className="h-4 w-4 mr-2" />
              Apply Crop <span className="ml-2 text-[10px] opacity-60">(Enter)</span>
            </Button>
            <Button onClick={cancelCrop} variant="ghost" className="w-full text-white/70 hover:text-white hover:bg-white/10 border border-transparent">
              <X className="h-4 w-4 mr-2" />
              Cancel <span className="ml-2 text-[10px] opacity-60">(Esc)</span>
            </Button>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 flex items-start space-x-3">
            <Info className="h-4 w-4 text-cyan-400 mt-0.5 shrink-0" />
            <p className="text-[11px] leading-relaxed text-white/60">
              Drag corners to resize. Use the options above to lock aspect ratio. Press <kbd className="bg-black/30 px-1 py-0.5 rounded border border-white/10">Enter</kbd> to apply.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
