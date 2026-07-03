"use client";

import { useCanvas } from "@/context/context";
import { api } from "@/convex/_generated/api";
import { useConvexMutation } from "@/hooks/use-convex-query";
import * as fabric from "fabric";
import { Canvas, FabricImage, PencilBrush } from "fabric";
import { registerTwilightEnhanceFilter } from "./twilight-enhance-panel";
import { registerWaterEnhancerFilter } from "./water-enhancer-panel";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "convex/react";

const CANVAS_CUSTOM_PROPS = [
  "id", "name", "selectable", "evented",
  "lockMovementX", "lockMovementY", "lockRotation",
  "lockScalingX", "lockScalingY", "visible",
  "crossOrigin", "globalCompositeOperation", "opacity",
];

const uploadCanvasStateToStorage = async (generateUploadUrl, canvasState) => {
  let uploadUrl;
  try {
    uploadUrl = await generateUploadUrl();
  } catch {
    uploadUrl = await generateUploadUrl({});
  }
  const blob = new Blob([JSON.stringify(canvasState)], { type: "application/json" });
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: blob,
  });
  if (!response.ok) throw new Error("Canvas state upload failed");
  const { storageId } = await response.json();
  return storageId;
};

// ================================================================
// THE ONLY CORRECT WAY to resize Fabric v6 canvas
// ================================================================
const isCanvasAlive = (canvas) => {
  if (!canvas) return false;
  try {
    return !!canvas.contextContainer;
  } catch {
    return false;
  }
};

const safeResizeCanvas = (canvas, displayW, displayH, zoom) => {
  if (!isCanvasAlive(canvas)) return;
  if (!displayW || !displayH || isNaN(displayW) || isNaN(displayH)) return;
  if (!zoom || isNaN(zoom) || zoom <= 0) zoom = 1;

  try {
    canvas.setDimensions({ width: Math.round(displayW), height: Math.round(displayH) });
    canvas.setZoom(zoom);
    canvas.setViewportTransform([zoom, 0, 0, zoom, 0, 0]);
    canvas.calcOffset();
    canvas.requestRenderAll();
  } catch (err) {
    console.warn("safeResizeCanvas suppressed:", err?.message);
  }
};

function CanvasEditor({ project }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const initializedProjectIdRef = useRef(null);
  const isMountedRef = useRef(true);

  const {
    canvasEditor, setCanvasEditor,
    activeTool, onToolChange,
    zoomLevel, setZoomLevel,
  } = useCanvas();

  const [isLoading, setIsLoading] = useState(true);

  const { mutate: updateProject } = useConvexMutation(api.projects.updateProject);
  const { mutate: generateUploadUrl } = useConvexMutation(api.projects.generateUploadUrl);

  const storedCanvasState = useQuery(
    api.projects.getCanvasState,
    project?.canvasStateStorageId ? { storageId: project.canvasStateStorageId } : "skip"
  );

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  const calculateViewportScale = useCallback((w, h) => {
    if (!containerRef.current) return 1;
    const container = containerRef.current;
    const cWidth  = container.clientWidth  || window.innerWidth;
    const cHeight = container.clientHeight || window.innerHeight;
    const scaleX = cWidth  / w;
    const scaleY = cHeight / h;
    const scale = Math.min(scaleX, scaleY, 1);
    return (!scale || isNaN(scale) || scale <= 0) ? 1 : scale;
  }, []);

  const safelyDisposeCanvas = useCallback((canvas) => {
    if (!canvas) return;
    try {
      canvas.renderOnAddRemove = false;
      canvas.requestRenderAll = () => {};
      canvas.renderAll = () => {};

      canvas.off(); 
      const result = canvas.dispose();
      if (result?.catch) result.catch(() => {});
    } catch {
    }
  }, []);

  // ────────────────── MAIN CANVAS INIT ──────────────────
  useEffect(() => {
    if (!canvasRef.current || !project?._id) return;
    if (project.canvasStateStorageId && storedCanvasState === undefined) return;
    if (initializedProjectIdRef.current === project._id && fabricCanvasRef.current) return;

    let disposed = false;
    let createdCanvas = null;

    const initializeCanvas = async () => {
      setIsLoading(true);

      if (fabricCanvasRef.current) {
        safelyDisposeCanvas(fabricCanvasRef.current);
        fabricCanvasRef.current = null;
      }

      // WebGL Filter disable to fix texture slice glitches
      fabric.config.enableGLFiltering = false; 

      registerTwilightEnhanceFilter(fabric);
      registerWaterEnhancerFilter(fabric);

      const canvas = new Canvas(canvasRef.current, {
        backgroundColor: "#ffffff",
        preserveObjectStacking: true,
        controlsAboveOverlay: true,
        selection: true,
        hoverCursor: "move",
        moveCursor: "move",
        defaultCursor: "default",
        allowTouchScrolling: false,
        renderOnAddRemove: true,
        skipTargetFind: false,
        // Disable Retina scaling (prevents high MB pixel doubling issues)
        enableRetinaScaling: false 
      });

      createdCanvas = canvas;
      fabricCanvasRef.current = canvas;
      initializedProjectIdRef.current = project._id;

      if (disposed) {
        safelyDisposeCanvas(canvas);
        fabricCanvasRef.current = null;
        initializedProjectIdRef.current = null;
        return;
      }

      if (!canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush = new PencilBrush(canvas);
      }
      canvas.freeDrawingBrush.color = "rgba(255,255,255,1)";
      canvas.freeDrawingBrush.width = 30;
      canvas.isDrawingMode = false;

      // FIXED: Limit Canvas Workspace Maximum Memory limits
      const MAX_SAFE_CANVAS_DIMENSION = 2048; // Maximum texture limit for safe WebGL/2D
      let safeWidth = project.width;
      let safeHeight = project.height;

      if (safeWidth > MAX_SAFE_CANVAS_DIMENSION || safeHeight > MAX_SAFE_CANVAS_DIMENSION) {
        const ratio = Math.min(MAX_SAFE_CANVAS_DIMENSION / safeWidth, MAX_SAFE_CANVAS_DIMENSION / safeHeight);
        safeWidth = Math.round(safeWidth * ratio);
        safeHeight = Math.round(safeHeight * ratio);
      }

      canvas.workspaceWidth  = safeWidth;
      canvas.workspaceHeight = safeHeight;

      canvas.updateWorkspaceSize = (newW, newH) => {
        if (!isCanvasAlive(canvas)) return;
        canvas.workspaceWidth  = newW;
        canvas.workspaceHeight = newH;
        const s = calculateViewportScale(newW, newH);
        safeResizeCanvas(canvas, newW * s, newH * s, s);
        if (setZoomLevel) setZoomLevel(100);
      };

      const vScale = calculateViewportScale(safeWidth, safeHeight);
      safeResizeCanvas(canvas, safeWidth * vScale, safeHeight * vScale, vScale);
      if (setZoomLevel) setZoomLevel(100);

      let canvasStateToLoad = project.canvasState;

      if (!canvasStateToLoad && project.canvasStateStorageUrl) {
        try {
          const r = await fetch(project.canvasStateStorageUrl);
          if (r.ok) canvasStateToLoad = await r.json();
        } catch {}
      }
      if (!canvasStateToLoad && project.canvasStateUrl) {
        try {
          const r = await fetch(project.canvasStateUrl);
          if (r.ok) canvasStateToLoad = await r.json();
        } catch {}
      }
      if (!canvasStateToLoad && storedCanvasState) {
        try {
          const r = await fetch(storedCanvasState);
          if (r.ok) canvasStateToLoad = await r.json();
        } catch {}
      }

      if (disposed) return;

      if (canvasStateToLoad) {
        try {
          await canvas.loadFromJSON(canvasStateToLoad);
          if (disposed) return;
          canvas.getObjects().forEach((obj) => {
            if (["image","Image","FabricImage","fabricImage"].includes(obj.type)) {
              obj.set("crossOrigin", "anonymous");
            }
          });
          canvas.requestRenderAll();
        } catch (err) {
          console.error("Error loading canvas JSON:", err);
        }
      } else if (project.currentImageUrl || project.originalImageUrl) {
        try {
          const imageUrl = project.currentImageUrl || project.originalImageUrl;
          
          // Image load as standard HTMLImageElement to bypass strict Fabric caching glitch
          const imgElement = new window.Image();
          imgElement.crossOrigin = "anonymous";
          imgElement.src = imageUrl;
          
          await new Promise((resolve, reject) => {
             imgElement.onload = resolve;
             imgElement.onerror = reject;
          });

          if (disposed) return;

          // Resize original image if it's too large before converting to Fabric
          const fabricImage = new FabricImage(imgElement);

          const imgAR    = fabricImage.width / fabricImage.height;
          const canvasAR = safeWidth / safeHeight;
          let scaleX, scaleY;
          if (imgAR > canvasAR) {
            scaleX = safeWidth / fabricImage.width; scaleY = scaleX;
          } else {
            scaleY = safeHeight / fabricImage.height; scaleX = scaleY;
          }

          fabricImage.set({
            left: safeWidth / 2, top: safeHeight / 2,
            originX: "center", originY: "center",
            scaleX, scaleY, selectable: true, evented: true,
          });
          
          canvas.add(fabricImage);
          canvas.centerObject(fabricImage);
          fabricImage.setCoords();
          canvas.requestRenderAll();
        } catch (err) {
          console.error("Error loading project image:", err);
        }
      }

      if (disposed) return;

      canvas.calcOffset();
      canvas.requestRenderAll();
      setCanvasEditor(canvas);

      setTimeout(() => {
        if (!disposed && isMountedRef.current) {
          window.dispatchEvent(new Event("resize"));
        }
      }, 300);

      if (isMountedRef.current) setIsLoading(false);
    };

    initializeCanvas();

    return () => {
      disposed = true;
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
      safelyDisposeCanvas(createdCanvas);
      if (fabricCanvasRef.current === createdCanvas) fabricCanvasRef.current = null;
      if (initializedProjectIdRef.current === project._id) initializedProjectIdRef.current = null;
      setCanvasEditor(null);
    };
  }, [
    project?._id, project?.width, project?.height,
    project?.canvasStateStorageId, storedCanvasState,
    calculateViewportScale, safelyDisposeCanvas, setCanvasEditor, setZoomLevel,
  ]);

  // ────────────────── MOUSE WHEEL + PAN ──────────────────
  useEffect(() => {
    if (!canvasEditor || !project) return;

    const handleWheel = (opt) => {
      opt.e.preventDefault();
      opt.e.stopPropagation();
      if (!isCanvasAlive(canvasEditor)) return;

      const e = opt.e;
      let zoom = canvasEditor.getZoom();
      zoom *= 0.995 ** e.deltaY;

      const w = canvasEditor.workspaceWidth || project.width;
      const h = canvasEditor.workspaceHeight || project.height;
      const baseScale = calculateViewportScale(w, h);
      const minScale  = baseScale * 0.1;

      if (zoom > 20)       zoom = 20;
      if (zoom < minScale) zoom = minScale;

      canvasEditor.zoomToPoint({ x: e.offsetX, y: e.offsetY }, zoom);
      if (setZoomLevel) setZoomLevel(Math.round((zoom / baseScale) * 100));
    };

    let isDragging = false, lastPosX = 0, lastPosY = 0;

    const handleMouseDown = (opt) => {
      const e = opt.e;
      if (e.altKey || e.button === 1) {
        isDragging = true;
        canvasEditor.selection = false;
        lastPosX = e.clientX; lastPosY = e.clientY;
        canvasEditor.defaultCursor = "grabbing";
        canvasEditor.hoverCursor   = "grabbing";
      }
    };

    const handleMouseMove = (opt) => {
      if (!isDragging) return;
      const e   = opt.e;
      const vpt = canvasEditor.viewportTransform;
      vpt[4] += e.clientX - lastPosX;
      vpt[5] += e.clientY - lastPosY;
      canvasEditor.requestRenderAll();
      lastPosX = e.clientX; lastPosY = e.clientY;
    };

    const handleMouseUp = () => {
      if (!isDragging) return;
      isDragging = false;
      canvasEditor.selection      = true;
      canvasEditor.defaultCursor  = activeTool === "crop" ? "crosshair" : "default";
      canvasEditor.hoverCursor    = activeTool === "crop" ? "crosshair" : "move";
    };

    canvasEditor.on("mouse:wheel", handleWheel);
    canvasEditor.on("mouse:down",  handleMouseDown);
    canvasEditor.on("mouse:move",  handleMouseMove);
    canvasEditor.on("mouse:up",    handleMouseUp);

    return () => {
      canvasEditor.off("mouse:wheel", handleWheel);
      canvasEditor.off("mouse:down",  handleMouseDown);
      canvasEditor.off("mouse:move",  handleMouseMove);
      canvasEditor.off("mouse:up",    handleMouseUp);
      if (isCanvasAlive(canvasEditor)) {
        canvasEditor.selection = true;
        canvasEditor.defaultCursor = "default";
        canvasEditor.hoverCursor = "move";
        if (canvasEditor.upperCanvasEl) canvasEditor.upperCanvasEl.style.cursor = "";
      }
    };
  }, [canvasEditor, project, setZoomLevel, activeTool, calculateViewportScale]);

  // ────────────────── ZOOM RESET ──────────────────
  useEffect(() => {
    if (!canvasEditor || !project || !zoomLevel) return;
    if (!isCanvasAlive(canvasEditor)) return;

    if (zoomLevel === 100) {
      const w = canvasEditor.workspaceWidth || project.width;
      const h = canvasEditor.workspaceHeight || project.height;
      const baseScale   = calculateViewportScale(w, h);
      const currentZoom = Math.round((canvasEditor.getZoom() / baseScale) * 100);
      if (currentZoom !== 100) {
        canvasEditor.setViewportTransform([baseScale, 0, 0, baseScale, 0, 0]);
        canvasEditor.requestRenderAll();
      }
    }
  }, [zoomLevel, canvasEditor, project, calculateViewportScale]);

  // ────────────────── AUTO SAVE ──────────────────
  const saveCanvasState = useCallback(async () => {
    if (!canvasEditor || !project?._id) return;
    if (!isCanvasAlive(canvasEditor)) return;
    try {
      const canvasJSON = canvasEditor.toJSON(CANVAS_CUSTOM_PROPS);
      const canvasStateStorageId = await uploadCanvasStateToStorage(generateUploadUrl, canvasJSON);
      await updateProject({ projectId: project._id, canvasStateStorageId });
    } catch (err) {
      console.error("Canvas save failed:", err);
    }
  }, [canvasEditor, project?._id, generateUploadUrl, updateProject]);

  useEffect(() => {
    if (!canvasEditor) return;

    const handleCanvasChange = () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => saveCanvasState(), 2000);
    };

    canvasEditor.on("object:modified", handleCanvasChange);
    canvasEditor.on("object:added",    handleCanvasChange);
    canvasEditor.on("object:removed",  handleCanvasChange);
    canvasEditor.on("path:created",    handleCanvasChange);
    canvasEditor.on("erasing:end",     handleCanvasChange);

    return () => {
      if (saveTimeoutRef.current) { clearTimeout(saveTimeoutRef.current); saveTimeoutRef.current = null; }
      canvasEditor.off("object:modified", handleCanvasChange);
      canvasEditor.off("object:added",    handleCanvasChange);
      canvasEditor.off("object:removed",  handleCanvasChange);
      canvasEditor.off("path:created",    handleCanvasChange);
      canvasEditor.off("erasing:end",     handleCanvasChange);
    };
  }, [canvasEditor, saveCanvasState]);

  // ────────────────── CURSOR ──────────────────
  useEffect(() => {
    if (!canvasEditor) return;
    canvasEditor.defaultCursor = activeTool === "crop" ? "crosshair" : "default";
    canvasEditor.hoverCursor   = activeTool === "crop" ? "crosshair" : "move";
  }, [canvasEditor, activeTool]);

  // ────────────────── WINDOW RESIZE ──────────────────
  useEffect(() => {
    const handleResize = () => {
      if (!isMountedRef.current) return;
      if (!isCanvasAlive(canvasEditor)) return;
      if (!project) return;

      const w = canvasEditor.workspaceWidth || project.width;
      const h = canvasEditor.workspaceHeight || project.height;
      const newScale = calculateViewportScale(w, h);
      safeResizeCanvas(canvasEditor, w * newScale, h * newScale, newScale);
      if (setZoomLevel) setZoomLevel(100);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [canvasEditor, project, calculateViewportScale, setZoomLevel]);

  // ────────────────── SELECTION -> TOOL SYNC ──────────────────
  useEffect(() => {
    if (!canvasEditor || !onToolChange) return;

    const handleSelection = (e) => {
      if (e.selected?.[0]?.type === "i-text") onToolChange("text");
    };

    canvasEditor.on("selection:created", handleSelection);
    canvasEditor.on("selection:updated", handleSelection);

    return () => {
      canvasEditor.off("selection:created", handleSelection);
      canvasEditor.off("selection:updated", handleSelection);
    };
  }, [canvasEditor, onToolChange]);

  // ────────────────── RENDER ──────────────────
  return (
    <div
      ref={containerRef}
      className="relative flex h-full min-h-0 w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#111827] via-[#0f172a] to-[#050816]"
    >
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(45deg,#06B6D4 25%,transparent 25%),
            linear-gradient(-45deg,#06B6D4 25%,transparent 25%),
            linear-gradient(45deg,transparent 75%,#06B6D4 75%),
            linear-gradient(-45deg,transparent 75%,#06B6D4 75%)`,
          backgroundSize: "40px 40px",
          backgroundPosition: "0 0,0 20px,20px -20px,-20px 0px",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent pointer-events-none" />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm z-10">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-cyan-500/30 border-t-cyan-400" />
            <p className="text-white/70 text-sm">Loading canvas...</p>
          </div>
        </div>
      )}

      <div className="flex h-full w-full items-center justify-center p-0">
        <div className="shadow-[0_28px_80px_rgba(0,0,0,0.6)] flex items-center justify-center">
          <canvas
            id="canvas"
            ref={canvasRef}
            tabIndex={0}
            onClick={() => canvasRef.current?.focus()}
            style={{ display: "block" }} 
          />
        </div>
      </div>
    </div>
  );
}

export default CanvasEditor;
