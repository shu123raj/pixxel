"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  RotateCcw,
  RotateCw,
  Crop,
  Expand,
  Sliders,
  Palette,
  Maximize2,
  Text,
  RefreshCcw,
  Loader2,
  Eye,
  Save,
  Download,
  Lock,
  Layers,
  Crown,
  Share2,
  Link2,
  X,
  Image as ImageIcon,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useCanvas } from "@/context/context";
import { usePlanAccess } from "@/hooks/use-plan-access";
import { UpgradeModal } from "@/components/upgrade-modal";
import { FabricImage } from "fabric";
import { api } from "@/convex/_generated/api";
import { useConvexMutation, useConvexQuery } from "@/hooks/use-convex-query";
import { useEditedImages } from "@/hooks/use-edited-images";
import { toast } from "sonner";

const WhatsAppIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const FacebookIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2.04c-5.5 0-10 4.48-10 10.02c0 5.01 3.66 9.15 8.44 9.9v-7.03H7.9v-2.87h2.54V9.89c0-2.5 1.49-3.89 3.77-3.89c1.1 0 2.25.19 2.25.19v2.46h-1.27c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.87h-2.33v7.03C18.34 21.17 22 17.03 22 12.06c0-5.54-4.5-10.02-10-10.02z" />
  </svg>
);

const InstagramIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const TwitterIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);

const TOOLS = [
  { id: "resize", label: "Resize", icon: Expand, isActive: true },
  { id: "crop", label: "Crop", icon: Crop },
  { id: "adjust", label: "Adjust", icon: Sliders },
  { id: "text", label: "Text", icon: Text },
  { id: "background", label: "AI Background", icon: Palette, proOnly: true },
  { id: "ai_extender", label: "AI Image Extender", icon: Maximize2, proOnly: true },
  { id: "ai_edit", label: "AI Editing", icon: Eye, proOnly: true },
  { id: "double_exposure", label: "Double Exposure", icon: Layers, proOnly: true },
];

const EXPORT_SCALE = 3;

const EXPORT_FORMATS = [
  { id: "png", format: "PNG", label: "PNG", description: "Best quality", extension: "png", mimeType: "image/png", quality: 1 },
  { id: "jpeg", format: "JPG", label: "JPG", description: "High quality", extension: "jpg", mimeType: "image/jpeg", quality: 0.95, whiteBackground: true },
  { id: "webp", format: "WEBP", label: "WEBP", description: "Modern format", extension: "webp", mimeType: "image/webp", quality: 0.95 },
  { id: "bmp", format: "BMP", label: "BMP", description: "Uncompressed", extension: "bmp", mimeType: "image/bmp", quality: 1, whiteBackground: true },
  { id: "svg", format: "SVG", label: "SVG", description: "Vector file", extension: "svg", mimeType: "image/svg+xml", quality: 1 },
  { id: "pdf", format: "PDF", label: "PDF", description: "Print ready", extension: "pdf", mimeType: "application/pdf", quality: 0.95, whiteBackground: true },
];

export function EditorTopBar({ project }) {
  const router = useRouter();
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [restrictedTool, setRestrictedTool] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);

  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [isUndoRedoOperation, setIsUndoRedoOperation] = useState(false);

  const { activeTool, onToolChange, canvasEditor } = useCanvas();
  const { hasAccess, canExport, isFree, limits } = usePlanAccess();
  const { saveEditedImage } = useEditedImages();

  const { mutate: updateProject, isLoading: isSaving } = useConvexMutation(api.projects.updateProject);
  const { mutate: generateUploadUrl } = useConvexMutation(api.projects.generateUploadUrl);
  const { mutate: incrementExportUsage } = useConvexMutation(api.users.incrementExportUsage);
  const { data: user } = useConvexQuery(api.users.getCurrentUser);

  const CUSTOM_PROPS = [
    "isPremiumFrame",
    "selectable",
    "evented",
    "lockMovementX",
    "lockMovementY",
    "lockRotation",
    "lockScalingX",
    "lockScalingY",
    "hasControls",
    "hasBorders",
    "crossOrigin",
    "backgroundColor"
  ];

  const uploadCanvasStateToStorage = async (canvasState) => {
    let uploadUrl;

    try {
      uploadUrl = await generateUploadUrl();
    } catch (error) {
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

  const downloadBlob = (blob, filename) => {
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = blobUrl;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(blobUrl);
  };

  const canvasToBlob = (canvas, mimeType, quality = 1) => {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) reject(new Error("Failed to create file"));
          else resolve(blob);
        },
        mimeType,
        quality
      );
    });
  };

  const canvasToBmpBlob = (canvas) => {
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const imageData = ctx.getImageData(0, 0, width, height);
    const rowSize = Math.floor((24 * width + 31) / 32) * 4;
    const pixelArraySize = rowSize * height;
    const fileSize = 54 + pixelArraySize;
    const buffer = new ArrayBuffer(fileSize);
    const view = new DataView(buffer);

    view.setUint8(0, 0x42);
    view.setUint8(1, 0x4d);
    view.setUint32(2, fileSize, true);
    view.setUint32(10, 54, true);
    view.setUint32(14, 40, true);
    view.setInt32(18, width, true);
    view.setInt32(22, height, true);
    view.setUint16(26, 1, true);
    view.setUint16(28, 24, true);
    view.setUint32(34, pixelArraySize, true);

    let offset = 54;

    for (let y = height - 1; y >= 0; y--) {
      let rowOffset = offset;

      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        view.setUint8(rowOffset++, imageData.data[i + 2]);
        view.setUint8(rowOffset++, imageData.data[i + 1]);
        view.setUint8(rowOffset++, imageData.data[i]);
      }

      offset += rowSize;
    }

    return new Blob([buffer], { type: "image/bmp" });
  };

  const createPdfBlobFromJpeg = async (jpegBlob, width, height) => {
    const encoder = new TextEncoder();
    const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
    const contentStream = `q\n${width} 0 0 ${height} 0 0 cm\n/Im0 Do\nQ`;

    const objects = [
      encoder.encode("<< /Type /Catalog /Pages 2 0 R >>"),
      encoder.encode("<< /Type /Pages /Kids [3 0 R] /Count 1 >>"),
      encoder.encode(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`),
      [
        encoder.encode(`<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`),
        jpegBytes,
        encoder.encode("\nendstream"),
      ],
      encoder.encode(`<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream`),
    ];

    const chunks = [encoder.encode("%PDF-1.4\n")];
    const offsets = [];
    const getLength = () => chunks.reduce((sum, chunk) => sum + chunk.length, 0);

    objects.forEach((object, index) => {
      offsets.push(getLength());
      chunks.push(encoder.encode(`${index + 1} 0 obj\n`));

      if (Array.isArray(object)) {
        object.forEach((part) => chunks.push(part));
      } else {
        chunks.push(object);
      }

      chunks.push(encoder.encode("\nendobj\n"));
    });

    const xrefOffset = getLength();
    let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;

    offsets.forEach((offset) => {
      xref += `${String(offset).padStart(10, "0")} 00000 n \n`;
    });

    xref += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
    chunks.push(encoder.encode(xref));

    return new Blob(chunks, { type: "application/pdf" });
  };

  const getSafeFileName = () => {
    return (project?.title || "pixxel-export")
      .replace(/[^\w-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase();
  };

  const createExportCanvas = async (exportConfig) => {
    const originalVpt = canvasEditor.viewportTransform ? [...canvasEditor.viewportTransform] : null;
    const originalBg = canvasEditor.backgroundColor;
    const originalWidth = canvasEditor.width;
    const originalHeight = canvasEditor.height;

    const targetWidth = canvasEditor.workspaceWidth || project.width;
    const targetHeight = canvasEditor.workspaceHeight || project.height;

    canvasEditor.discardActiveObject();
    canvasEditor.setViewportTransform([1, 0, 0, 1, 0, 0]);
    canvasEditor.setDimensions({ width: targetWidth, height: targetHeight });

    if (exportConfig.whiteBackground) {
      canvasEditor.backgroundColor = "#ffffff";
    }

    canvasEditor.renderAll();

    const exportCanvas = canvasEditor.toCanvasElement(EXPORT_SCALE, {
      left: 0,
      top: 0,
      width: targetWidth,
      height: targetHeight,
    });

    canvasEditor.backgroundColor = originalBg;
    canvasEditor.setDimensions({ width: originalWidth, height: originalHeight });

    if (originalVpt) {
      canvasEditor.setViewportTransform(originalVpt);
    }

    canvasEditor.renderAll();

    return exportCanvas;
  };

  const saveExportHistoryThumbnail = (exportCanvas, exportConfig) => {
    try {
      const thumbnailCanvas = document.createElement("canvas");
      const maxThumbSize = 360;

      const ratio = Math.min(
        maxThumbSize / exportCanvas.width,
        maxThumbSize / exportCanvas.height,
        1
      );

      thumbnailCanvas.width = Math.max(1, Math.round(exportCanvas.width * ratio));
      thumbnailCanvas.height = Math.max(1, Math.round(exportCanvas.height * ratio));

      const thumbCtx = thumbnailCanvas.getContext("2d");
      thumbCtx.drawImage(
        exportCanvas,
        0,
        0,
        thumbnailCanvas.width,
        thumbnailCanvas.height
      );

      const thumbnailDataUrl = thumbnailCanvas.toDataURL("image/jpeg", 0.72);

      saveEditedImage(project._id, {
        imageUrl: thumbnailDataUrl,
        title: project.title,
        format: exportConfig.format,
        createdAt: Date.now(),
      });
    } catch (error) {
      console.warn("Edited image history save skipped:", error);
    }
  };

  const saveToUndoStack = () => {
    if (!canvasEditor || isUndoRedoOperation) return;

    const canvasState = JSON.stringify(canvasEditor.toJSON(CUSTOM_PROPS));

    setUndoStack((prev) => {
      const newStack = [...prev, canvasState];
      if (newStack.length > 20) newStack.shift();
      return newStack;
    });

    setRedoStack([]);
  };

  useEffect(() => {
    if (!canvasEditor) return;

    const timer = setTimeout(() => {
      if (canvasEditor && !isUndoRedoOperation) {
        const initialState = JSON.stringify(canvasEditor.toJSON(CUSTOM_PROPS));
        setUndoStack([initialState]);
      }
    }, 1000);

    const handleCanvasModified = () => {
      if (!isUndoRedoOperation) {
        setTimeout(() => {
          if (!isUndoRedoOperation) saveToUndoStack();
        }, 500);
      }
    };

    canvasEditor.on("object:modified", handleCanvasModified);
    canvasEditor.on("object:added", handleCanvasModified);
    canvasEditor.on("object:removed", handleCanvasModified);
    canvasEditor.on("path:created", handleCanvasModified);

    return () => {
      clearTimeout(timer);
      canvasEditor.off("object:modified", handleCanvasModified);
      canvasEditor.off("object:added", handleCanvasModified);
      canvasEditor.off("object:removed", handleCanvasModified);
      canvasEditor.off("path:created", handleCanvasModified);
    };
  }, [canvasEditor, isUndoRedoOperation]);

  const handleUndo = async () => {
    if (!canvasEditor || undoStack.length <= 1) return;

    setIsUndoRedoOperation(true);

    try {
      const currentState = JSON.stringify(canvasEditor.toJSON(CUSTOM_PROPS));
      setRedoStack((prev) => [...prev, currentState]);

      const newUndoStack = [...undoStack];
      newUndoStack.pop();

      const previousState = newUndoStack[newUndoStack.length - 1];

      if (previousState) {
        await canvasEditor.loadFromJSON(JSON.parse(previousState));
        canvasEditor.requestRenderAll();
        setUndoStack(newUndoStack);
        toast.success("Undid last action");
      }
    } catch (error) {
      console.error("Error during undo:", error);
      toast.error("Failed to undo action");
    } finally {
      setTimeout(() => setIsUndoRedoOperation(false), 100);
    }
  };

  const handleRedo = async () => {
    if (!canvasEditor || redoStack.length === 0) return;

    setIsUndoRedoOperation(true);

    try {
      const newRedoStack = [...redoStack];
      const nextState = newRedoStack.pop();

      if (nextState) {
        const currentState = JSON.stringify(canvasEditor.toJSON(CUSTOM_PROPS));
        setUndoStack((prev) => [...prev, currentState]);

        await canvasEditor.loadFromJSON(JSON.parse(nextState));
        canvasEditor.requestRenderAll();
        setRedoStack(newRedoStack);
        toast.success("Redid last action");
      }
    } catch (error) {
      console.error("Error during redo:", error);
      toast.error("Failed to redo action");
    } finally {
      setTimeout(() => setIsUndoRedoOperation(false), 100);
    }
  };

  const handleBackToDashboard = () => {
    router.push("/dashboard");
  };

  const handleToolChange = (toolId) => {
    const accessCheckId = toolId === "double_exposure" ? "ai_edit" : toolId;

    if (!hasAccess(accessCheckId)) {
      setRestrictedTool(toolId);
      setShowUpgradeModal(true);
      return;
    }

    onToolChange(toolId);
  };

  const handleManualSave = async () => {
    if (!canvasEditor || !project) {
      toast.error("Canvas not ready for saving");
      return;
    }

    try {
      const canvasJSON = canvasEditor.toJSON(CUSTOM_PROPS);
      const canvasStateStorageId = await uploadCanvasStateToStorage(canvasJSON);

      await updateProject({
        projectId: project._id,
        canvasStateStorageId,
      });

      toast.success("Project permanently saved!");
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error("Failed to save project. Please try again.");
    }
  };

  const handleExport = async (exportConfig) => {
    if (!canvasEditor || !project) {
      toast.error("Canvas not ready for export");
      return;
    }

    if (!canExport(user?.exportsThisMonth || 0)) {
      setRestrictedTool("export");
      setShowUpgradeModal(true);
      setShowExportModal(false);
      return;
    }

    setIsExporting(true);
    setExportFormat(exportConfig.id);

    try {
      const registerExport = async () => {
        try {
          await incrementExportUsage();
        } catch (error) {
          console.error("Error recording export usage:", error);
        }
      };

      const fileBaseName = getSafeFileName();

      if (exportConfig.id === "svg") {
        const targetWidth = canvasEditor.workspaceWidth || project.width;
        const targetHeight = canvasEditor.workspaceHeight || project.height;
        const originalVpt = canvasEditor.viewportTransform
          ? [...canvasEditor.viewportTransform]
          : null;

        canvasEditor.discardActiveObject();
        canvasEditor.setViewportTransform([1, 0, 0, 1, 0, 0]);
        canvasEditor.renderAll();

        const svg = canvasEditor.toSVG({
          width: targetWidth,
          height: targetHeight,
          viewBox: {
            x: 0,
            y: 0,
            width: targetWidth,
            height: targetHeight,
          },
        });

        if (originalVpt) canvasEditor.setViewportTransform(originalVpt);
        canvasEditor.renderAll();

        downloadBlob(
          new Blob([svg], { type: "image/svg+xml;charset=utf-8" }),
          `${fileBaseName}.svg`
        );
        await registerExport();

        toast.success("SVG exported successfully!");
        setShowExportModal(false);
        return;
      }

      const exportCanvas = await createExportCanvas(exportConfig);

      if (exportConfig.id === "bmp") {
        const blob = canvasToBmpBlob(exportCanvas);
        downloadBlob(blob, `${fileBaseName}.bmp`);
        saveExportHistoryThumbnail(exportCanvas, exportConfig);
        await registerExport();

        toast.success("BMP exported successfully!");
        setShowExportModal(false);
        return;
      }

      if (exportConfig.id === "pdf") {
        const jpegBlob = await canvasToBlob(
          exportCanvas,
          "image/jpeg",
          exportConfig.quality
        );

        const pdfBlob = await createPdfBlobFromJpeg(
          jpegBlob,
          exportCanvas.width,
          exportCanvas.height
        );

        downloadBlob(pdfBlob, `${fileBaseName}.pdf`);
        saveExportHistoryThumbnail(exportCanvas, exportConfig);
        await registerExport();

        toast.success("PDF exported successfully!");
        setShowExportModal(false);
        return;
      }

      const blob = await canvasToBlob(
        exportCanvas,
        exportConfig.mimeType,
        exportConfig.quality
      );

      downloadBlob(blob, `${fileBaseName}.${exportConfig.extension}`);
      saveExportHistoryThumbnail(exportCanvas, exportConfig);
      await registerExport();

      toast.success(`${exportConfig.format} exported in high quality!`);
      setShowExportModal(false);
    } catch (error) {
      console.error("Error exporting image:", error);
      toast.error("Failed to export image. Try a smaller canvas or another format.");
    } finally {
      setIsExporting(false);
      setExportFormat(null);
    }
  };

  const handleSocialShare = async () => {
    if (!canvasEditor || !project) return;

    try {
      const exportCanvas = await createExportCanvas(EXPORT_FORMATS[0]);
      const blob = await canvasToBlob(exportCanvas, "image/png", 1);
      const file = new File([blob], "pixxel_edit.png", { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "My Awesome Edit",
          text: "Check out this image I just edited on Pixxel!",
          files: [file],
        });
      } else {
        toast.info("Direct sharing not supported. Downloading PNG for you.");
        downloadBlob(blob, `${getSafeFileName()}.png`);
      }
    } catch (error) {
      console.log("Error sharing:", error);
      toast.error("Failed to share image.");
    }
  };

  const copyProjectLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Project Link Copied to Clipboard!");
  };

  const handleResetToOriginal = async () => {
    if (!canvasEditor || !project || !project.originalImageUrl) {
      toast.error("No original image found to reset to");
      return;
    }

    saveToUndoStack();

    try {
      canvasEditor.clear();
      canvasEditor.backgroundColor = "#ffffff";
      canvasEditor.backgroundImage = null;

      const fabricImage = await FabricImage.fromURL(project.originalImageUrl, {
        crossOrigin: "anonymous",
      });

      const imgAspectRatio = fabricImage.width / fabricImage.height;
      const canvasAspectRatio = project.width / project.height;
      const scale =
        imgAspectRatio > canvasAspectRatio
          ? project.width / fabricImage.width
          : project.height / fabricImage.height;

      fabricImage.set({
        left: project.width / 2,
        top: project.height / 2,
        originX: "center",
        originY: "center",
        scaleX: scale,
        scaleY: scale,
        selectable: true,
        evented: true,
      });

      fabricImage.filters = [];

      canvasEditor.add(fabricImage);
      canvasEditor.centerObject(fabricImage);
      canvasEditor.setActiveObject(fabricImage);
      canvasEditor.requestRenderAll();

      const canvasJSON = canvasEditor.toJSON(CUSTOM_PROPS);
      const canvasStateStorageId = await uploadCanvasStateToStorage(canvasJSON);

      await updateProject({
        projectId: project._id,
        canvasStateStorageId,
        currentImageUrl: project.originalImageUrl,
        activeTransformations: undefined,
        backgroundRemoved: false,
      });

      toast.success("Canvas reset to original image");
    } catch (error) {
      console.error("Error resetting canvas:", error);
      toast.error("Failed to reset canvas. Please try again.");
    }
  };

  const canUndo = undoStack.length > 1;
  const canRedo = redoStack.length > 0;

  return (
    <>
      <div className="w-full relative z-40 bg-[#0d1117] border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-3 h-auto sm:h-[60px] gap-4 bg-gradient-to-r from-black/40 via-transparent to-black/40">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToDashboard}
              className="p-1.5 rounded-lg border border-transparent hover:border-white/10 hover:bg-white/5 transition-all text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="w-px h-6 bg-white/10"></div>

            <div>
              <h1 className="text-[14px] font-extrabold capitalize text-slate-100 tracking-wide line-clamp-1 leading-none">
                {project?.title}
              </h1>
              <p className="text-[10px] uppercase font-bold text-cyan-400 tracking-[0.15em] mt-1 line-clamp-1 leading-none opacity-80">
                PRO EDITOR Workspace
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/5 shadow-inner hidden md:flex">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleResetToOriginal}
                disabled={isSaving || !project?.originalImageUrl}
                className="h-8 w-8 px-0 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Reset to Original"
              >
                {isSaving ? <Loader2 className="w-[18px] h-[18px] animate-spin text-slate-500" /> : <RefreshCcw className="w-[16px] h-[16px]" />}
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleManualSave}
              disabled={isSaving || !canvasEditor}
              className="h-9 rounded-xl px-4 border-slate-700/80 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white hover:border-slate-600 transition-all font-semibold gap-2 shadow-sm"
            >
              {isSaving ? <Loader2 className="h-[16px] w-[16px] animate-spin" /> : <Save className="h-[16px] w-[16px] text-indigo-400" />}
              Save <span className="hidden lg:inline">Project</span>
            </Button>

            <Button
              size="sm"
              onClick={() => setShowExportModal(true)}
              disabled={isExporting || !canvasEditor}
              className="h-9 px-4 rounded-xl border-none text-white font-bold tracking-wide transition-all bg-gradient-to-tr from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] group gap-2"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-[16px] w-[16px] animate-spin" />
                  <span className="hidden xs:inline text-white/90 font-medium">Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="h-[16px] w-[16px] text-white/90 group-hover:scale-110 transition-transform" />
                  Export & Share
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="w-full flex flex-col md:flex-row md:items-center justify-between px-2 sm:px-5 py-2.5 sm:py-3 bg-[#0a0d13] gap-3">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 flex-1 pt-2 md:pt-1 pb-1 px-1">
            <div className="flex items-center gap-1 p-1 bg-slate-800/40 rounded-2xl border border-white/10 shadow-inner backdrop-blur-sm">
              {TOOLS.slice(0, 4).map((tool) => {
                const Icon = tool.icon;
                const isActive = activeTool === tool.id;

                return (
                  <button
                    key={tool.id}
                    onClick={() => handleToolChange(tool.id)}
                    title={tool.label}
                    className={`relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 group outline-none ${
                      isActive
                        ? "bg-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.15)] ring-1 ring-cyan-500/30"
                        : "text-slate-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon className={`w-[18px] h-[18px] transition-transform ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
                    {isActive && <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-cyan-400 rounded-t-lg drop-shadow-[0_-2px_4px_rgba(34,211,238,0.8)]" />}
                  </button>
                );
              })}
            </div>

            <div className="relative group/pro mt-3 md:mt-0">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 rounded-2xl blur-md opacity-30 group-hover/pro:opacity-60 transition duration-500 animate-[pulse_3s_ease-in-out_infinite]"></div>

              <div className="relative flex items-center gap-1 p-1 bg-gradient-to-b from-[#1a1405] to-[#0a0802] border border-amber-500/40 rounded-2xl shadow-2xl">
                <div className="absolute -top-[14px] left-3 px-2.5 py-[2px] bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-500 rounded-full flex items-center gap-1 shadow-[0_0_10px_rgba(251,191,36,0.6)] z-20 border border-yellow-200/50">
                  <Crown className="w-[10px] h-[10px] text-black fill-black/60" />
                </div>

                {TOOLS.slice(4).map((tool) => {
                  const Icon = tool.icon;
                  const isActive = activeTool === tool.id;
                  const accessCheckId = tool.id === "double_exposure" ? "ai_edit" : tool.id;
                  const hasToolAccess = hasAccess(accessCheckId);

                  return (
                    <button
                      key={tool.id}
                      onClick={() => handleToolChange(tool.id)}
                      className={`relative flex items-center gap-1.5 h-9 px-2.5 sm:px-3 rounded-xl overflow-hidden transition-all duration-300 group/btn outline-none ${
                        isActive
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_15px_rgba(251,191,36,0.3)] ring-1 ring-amber-500/20"
                          : "text-amber-200/60 hover:text-amber-100 border border-transparent hover:border-amber-500/30 hover:bg-amber-500/10"
                      } ${!hasToolAccess && !isActive && "opacity-80"}`}
                    >
                      <Icon className={`w-[14px] h-[14px] relative z-10 transition-transform ${isActive ? "scale-110" : "group-hover/btn:scale-110"}`} />
                      <span className="text-[11px] sm:text-[12px] font-bold tracking-wide whitespace-nowrap z-10">{tool.label}</span>

                      {!hasToolAccess && (
                        <div className="flex h-4 w-4 ml-0.5 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 z-10">
                          <Lock className="w-2 h-2" />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity transform -translate-x-full group-hover/btn:translate-x-full duration-700"></div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center flex-shrink-0 md:pl-4 md:border-l border-white/10 h-fit bg-[#0a0d13] w-full md:w-auto justify-end mt-1 md:mt-0">
            <div className="flex bg-[#07090d] rounded-full border border-white/10 p-1 shadow-inner gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleUndo}
                disabled={!canUndo || isUndoRedoOperation}
                className={`h-8 w-9 px-0 rounded-l-full rounded-r-sm text-slate-400 bg-transparent ${
                  !canUndo ? "opacity-30" : "hover:text-white hover:bg-white/10 active:scale-95 transition-all"
                }`}
                title="Undo Action"
              >
                <RotateCcw className="w-[14px] h-[14px]" />
              </Button>

              <div className="w-[1px] h-4 mt-[8px] bg-white/10 rounded-full" />

              <Button
                variant="ghost"
                size="icon"
                onClick={handleRedo}
                disabled={!canRedo || isUndoRedoOperation}
                className={`h-8 w-9 px-0 rounded-r-full rounded-l-sm text-slate-400 bg-transparent ${
                  !canRedo ? "opacity-30" : "hover:text-white hover:bg-white/10 active:scale-95 transition-all"
                }`}
                title="Redo Action"
              >
                <RotateCw className="w-[14px] h-[14px]" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {showExportModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-[#030712]/80 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => !isExporting && setShowExportModal(false)}
          />

          <div className="relative w-full max-w-[520px] bg-slate-900/90 border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(34,211,238,0.15)] overflow-hidden flex flex-col animate-in zoom-in-95 fade-in duration-200">
            <div className="px-6 py-5 border-b border-white/5 bg-slate-800/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl border border-cyan-500/30">
                  <Share2 className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-wide">Export Image</h2>
                  <p className="text-white/40 text-[11px] mt-0.5">High quality downloads in multiple formats</p>
                </div>
              </div>

              <button
                disabled={isExporting}
                onClick={() => setShowExportModal(false)}
                className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-all disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-7 bg-gradient-to-b from-transparent to-[#030712]/60">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-white/60 uppercase tracking-widest">Save to Device</h3>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                      {EXPORT_SCALE}x Quality
                    </span>

                    {isFree && (
                      <span className="text-[10px] text-orange-300 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                        {Math.max(0, limits.maxExportsPerMonth - (user?.exportsThisMonth || 0))}/{limits.maxExportsPerMonth} exports left
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {EXPORT_FORMATS.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleExport(item)}
                      disabled={isExporting}
                      className="group relative overflow-hidden flex flex-col items-center justify-center gap-2 p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/50 rounded-2xl transition-all disabled:opacity-50"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                      {isExporting && exportFormat === item.id ? (
                        <Loader2 className="w-6 h-6 text-cyan-400 mb-1 animate-spin" />
                      ) : item.id === "pdf" ? (
                        <FileText className="w-6 h-6 text-purple-400 mb-1" />
                      ) : item.id === "svg" ? (
                        <ImageIcon className="w-6 h-6 text-purple-400 mb-1" />
                      ) : (
                        <Download className="w-6 h-6 text-cyan-400 mb-1" />
                      )}

                      <div className="text-center relative z-10">
                        <span className="block text-sm font-medium text-white">{item.label}</span>
                        <span className="block text-[10px] text-white/40 mt-0.5">{item.description}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              <div>
                <h3 className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-4">Share to Socials</h3>

                <div className="flex items-center justify-between px-2">
                  <button onClick={handleSocialShare} disabled={isExporting} className="group flex flex-col items-center gap-2 disabled:opacity-50">
                    <div className="w-12 h-12 rounded-full bg-[#25D366]/10 border border-[#25D366]/20 flex items-center justify-center group-hover:bg-[#25D366] group-hover:shadow-[0_0_15px_rgba(37,211,102,0.4)] transition-all duration-300">
                      <WhatsAppIcon className="w-5 h-5 text-[#25D366] group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-[10px] font-medium text-white/60 group-hover:text-white">WhatsApp</span>
                  </button>

                  <button onClick={handleSocialShare} disabled={isExporting} className="group flex flex-col items-center gap-2 disabled:opacity-50">
                    <div className="w-12 h-12 rounded-full bg-[#1877F2]/10 border border-[#1877F2]/20 flex items-center justify-center group-hover:bg-[#1877F2] group-hover:shadow-[0_0_15px_rgba(24,119,242,0.4)] transition-all duration-300">
                      <FacebookIcon className="w-5 h-5 text-[#1877F2] group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-[10px] font-medium text-white/60 group-hover:text-white">Facebook</span>
                  </button>

                  <button onClick={handleSocialShare} disabled={isExporting} className="group flex flex-col items-center gap-2 disabled:opacity-50">
                    <div className="w-12 h-12 rounded-full bg-[#E1306C]/10 border border-[#E1306C]/20 flex items-center justify-center group-hover:bg-gradient-to-tr from-[#F56040] via-[#E1306C] to-[#833AB4] group-hover:shadow-[0_0_15px_rgba(225,48,108,0.4)] transition-all duration-300 border-none relative">
                      <div className="absolute inset-[1px] rounded-full bg-[#1e2330] group-hover:bg-transparent transition-colors z-0" />
                      <InstagramIcon className="w-5 h-5 text-[#E1306C] group-hover:text-white transition-colors relative z-10" />
                    </div>
                    <span className="text-[10px] font-medium text-white/60 group-hover:text-white">Instagram</span>
                  </button>

                  <button onClick={handleSocialShare} disabled={isExporting} className="group flex flex-col items-center gap-2 disabled:opacity-50">
                    <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all duration-300">
                      <TwitterIcon className="w-5 h-5 text-white/80 group-hover:text-black transition-colors" />
                    </div>
                    <span className="text-[10px] font-medium text-white/60 group-hover:text-white">Twitter</span>
                  </button>
                </div>

                <button
                  onClick={copyProjectLink}
                  className="w-full mt-5 flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors group"
                >
                  <Link2 className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
                  <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">Copy Link to Editor</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => {
          setShowUpgradeModal(false);
          setRestrictedTool(null);
        }}
        restrictedTool={restrictedTool}
        reason={
          restrictedTool === "export"
            ? "Free plan is limited to 20 exports per month. Upgrade to Pro for unlimited exports."
            : undefined
        }
      />
    </>
  );
}