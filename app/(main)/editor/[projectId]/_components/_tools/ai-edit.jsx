"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Wand2,
  Info,
  Sparkles,
  User,
  Mountain,
  CheckCircle,
  AlertTriangle,
  Camera,
  Smile,
} from "lucide-react";
import { useCanvas } from "@/context/context";
import { FabricImage } from "fabric";
import { useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "do6jlckzy";
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

const RETOUCH_PRESETS = [
  {
    key: "ai_retouch",
    label: "AI Retouch",
    description: "Improve image quality with AI",
    icon: Sparkles,
    transformations: ["e-retouch"],
    recommended: true,
  },
  {
    key: "ai_upscale",
    label: "AI Upscale",
    description: "Increase resolution to 16MP",
    icon: User,
    transformations: ["e-upscale"],
    recommended: false,
  },
  {
    key: "cloudinary_skin_tone",
    label: "Skin Tone & Smooth",
    description: "Cloudinary AI skin smoothing & tone",
    icon: Smile,
    transformations: ["e_improve"],
    isCloudinary: true,
    recommended: true,
  },
  {
    key: "enhance_sharpen",
    label: "Enhance & Sharpen",
    description: "AI retouch + contrast + sharpening",
    icon: Mountain,
    transformations: ["e-retouch", "e-contrast-1", "e-sharpen"],
    recommended: false,
  },
  {
    key: "premium_quality",
    label: "Premium Quality",
    description: "AI retouch + upscale + enhancements",
    icon: Camera,
    transformations: ["e-retouch", "e-upscale", "e-contrast-1", "e-sharpen"],
    recommended: false,
  },
];

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

const isImageKitUrl = (url) => {
  try {
    return new URL(url).hostname.includes("ik.imagekit.io");
  } catch {
    return false;
  }
};

const getImageObjectDataUrl = (imageObject) => {
  if (typeof imageObject.toDataURL === "function") {
    return imageObject.toDataURL({ format: "png", quality: 1 });
  }

  const imageElement = imageObject.getElement?.() || imageObject._element;
  if (!imageElement) throw new Error("Could not read current image for ImageKit upload.");

  const canvas = document.createElement("canvas");
  canvas.width = imageObject.width || imageElement.naturalWidth || imageElement.width;
  canvas.height = imageObject.height || imageElement.naturalHeight || imageElement.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/png", 1);
};

const dataUrlToBlob = async (dataUrl) => {
  const response = await fetch(dataUrl);
  return await response.blob();
};

const uploadToImageKit = async (imageObject) => {
  const blob = await dataUrlToBlob(getImageObjectDataUrl(imageObject));
  const fileName = `pixxel-ai-edit-${Date.now()}.png`;

  const response = await fetch(`/api/imagekit/upload?fileName=${encodeURIComponent(fileName)}`, {
    method: "POST",
    headers: { "Content-Type": blob.type || "image/png" },
    body: blob,
    credentials: "include",
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || "ImageKit upload failed");
  }

  return data.url || data.resultUrl;
};

const buildImageKitUrl = (imageUrl, transformations) => {
  const url = new URL(imageUrl);
  const existingTr = url.searchParams.get("tr");
  const nextTransforms = [
    ...(existingTr ? existingTr.split(",").filter(Boolean) : []),
    ...transformations,
  ];

  url.searchParams.set("tr", [...new Set(nextTransforms)].join(","));
  return url.toString();
};

const waitForImage = (url, attempt = 1) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(url);
    image.onerror = () => {
      if (attempt >= 4) {
        reject(new Error("ImageKit transformation is not ready yet. Please try again."));
        return;
      }

      setTimeout(() => {
        waitForImage(`${url}${url.includes("?") ? "&" : "?"}ik-attempt=${attempt}`, attempt + 1)
          .then(resolve)
          .catch(reject);
      }, attempt * 900);
    };
    image.src = url;
  });

export function AIEdit({ project }) {
  const { canvasEditor, setProcessingMessage } = useCanvas();
  const [selectedPreset, setSelectedPreset] = useState("ai_retouch");
  const { mutate: updateProject } = useConvexMutation(api.projects.updateProject);

  const getMainImage = () =>
    canvasEditor?.getObjects().find((obj) => obj.type === "image" || obj.type === "FabricImage") || null;

  const buildRetouchUrl = (imageUrl, presetKey) => {
    const preset = RETOUCH_PRESETS.find((p) => p.key === presetKey);
    if (!imageUrl || !preset) return imageUrl;

    if (preset.isCloudinary) {
      let originalUrl = imageUrl;
      if (imageUrl.includes("res.cloudinary.com") && imageUrl.includes("/fetch/")) {
        const fetchIndex = imageUrl.indexOf("http", imageUrl.indexOf("/fetch/") + 7);
        if (fetchIndex !== -1) originalUrl = imageUrl.substring(fetchIndex);
      }

      return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/fetch/${preset.transformations.join(",")}/${originalUrl}`;
    }

    return buildImageKitUrl(imageUrl, preset.transformations);
  };

  const applyRetouch = async () => {
    const mainImage = getMainImage();
    const selectedPresetData = RETOUCH_PRESETS.find((p) => p.key === selectedPreset);

    if (!mainImage || !project || !selectedPresetData) return;

    setProcessingMessage(`Enhancing image with ${selectedPresetData.label}...`);

    try {
      let currentImageUrl =
        mainImage.getSrc?.() || mainImage._element?.src || mainImage.src;

      if (!currentImageUrl) throw new Error("Image URL not found.");

      if (!selectedPresetData.isCloudinary && !isImageKitUrl(currentImageUrl)) {
        setProcessingMessage("Preparing image for ImageKit AI...");
        currentImageUrl = await uploadToImageKit(mainImage);
      }

      if (
        selectedPresetData.isCloudinary &&
        (currentImageUrl.startsWith("data:") || currentImageUrl.startsWith("blob:"))
      ) {
        setProcessingMessage("Syncing local edits to cloud...");
        const base64Data = currentImageUrl.startsWith("data:")
          ? currentImageUrl
          : getImageObjectDataUrl(mainImage);
        currentImageUrl = await uploadToCloudinary(base64Data);
      }

      setProcessingMessage(`Enhancing image with ${selectedPresetData.label}...`);
      const retouchedUrl = buildRetouchUrl(currentImageUrl, selectedPreset);
      const readyUrl = selectedPresetData.isCloudinary
        ? retouchedUrl
        : await waitForImage(retouchedUrl);

      const retouchedImage = await FabricImage.fromURL(readyUrl, {
        crossOrigin: "anonymous",
      });

      const displayWidth = typeof mainImage.getScaledWidth === "function"
        ? mainImage.getScaledWidth()
        : (mainImage.width || 1) * (mainImage.scaleX || 1);
      const displayHeight = typeof mainImage.getScaledHeight === "function"
        ? mainImage.getScaledHeight()
        : (mainImage.height || 1) * (mainImage.scaleY || 1);

      const imageProps = {
        left: mainImage.left,
        top: mainImage.top,
        originX: mainImage.originX,
        originY: mainImage.originY,
        angle: mainImage.angle,
        scaleX: displayWidth / (retouchedImage.width || displayWidth || 1),
        scaleY: displayHeight / (retouchedImage.height || displayHeight || 1),
        selectable: true,
        evented: true,
      };

      canvasEditor.remove(mainImage);
      retouchedImage.set(imageProps);
      canvasEditor.add(retouchedImage);
      retouchedImage.setCoords();
      canvasEditor.setActiveObject(retouchedImage);
      canvasEditor.requestRenderAll();

      await updateProject({
        projectId: project._id,
        currentImageUrl: readyUrl,
        canvasState: canvasEditor.toJSON(),
        activeTransformations: selectedPresetData.transformations.join(","),
      });
    } catch (error) {
      console.error("Error retouching image:", error);
      alert(error.message || "Failed to retouch image. Please try again.");
    } finally {
      setProcessingMessage(null);
    }
  };

  if (!canvasEditor) {
    return <div className="p-4 text-white/70 text-sm">Canvas not ready</div>;
  }

  const mainImage = getMainImage();
  if (!mainImage) {
    return (
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-amber-400 font-medium mb-1">No Image Found</h3>
            <p className="text-amber-300/80 text-sm">
              Please add an image to the canvas first to use AI retouching.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const hasActiveTransformations =
    project.activeTransformations?.includes("e-retouch") ||
    project.activeTransformations?.includes("e-upscale") ||
    project.activeTransformations?.includes("e_improve");
  const selectedPresetData = RETOUCH_PRESETS.find((p) => p.key === selectedPreset);

  return (
    <div className="space-y-6">
      {hasActiveTransformations && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-green-400 font-medium mb-1">Image Enhanced</h3>
              <p className="text-green-300/80 text-sm">
                AI enhancements have been applied to this image
              </p>
            </div>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-medium text-white mb-3">
          Choose Enhancement Style
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {RETOUCH_PRESETS.map((preset) => {
            const Icon = preset.icon;
            const isSelected = selectedPreset === preset.key;

            return (
              <div
                key={preset.key}
                className={`relative p-4 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? "border-cyan-400 bg-cyan-400/10"
                    : "border-white/20 bg-slate-700/30 hover:border-white/40"
                }`}
                onClick={() => setSelectedPreset(preset.key)}
              >
                <div className="flex flex-col items-center text-center">
                  <Icon className="h-8 w-8 text-cyan-400 mb-2" />
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-white font-medium text-sm">
                      {preset.label}
                    </h4>
                    {preset.recommended && (
                      <span className="px-1.5 py-0.5 bg-cyan-500 text-white text-xs rounded-full">
                        Star
                      </span>
                    )}
                  </div>
                  <p className="text-white/70 text-xs">{preset.description}</p>
                </div>

                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 bg-cyan-400 rounded-full" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Button onClick={applyRetouch} className="w-full" variant="primary">
        <Wand2 className="h-4 w-4 mr-2" />
        Apply {selectedPresetData?.label}
      </Button>

      <div className="bg-slate-700/30 rounded-lg p-4">
        <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
          <Info className="h-4 w-4" />
          How AI Retouch Works
        </h4>
        <div className="space-y-2 text-xs text-white/70">
          <p>
            <strong>AI Retouch:</strong> ImageKit analyzes and improves image quality automatically.
          </p>
          <p>
            <strong>AI Upscale:</strong> ImageKit increases image resolution while preserving details.
          </p>
          <p>
            <strong>Enhance & Sharpen:</strong> Retouch, contrast, and sharpen are applied together.
          </p>
          <p>
            <strong>Premium Quality:</strong> Upscale, retouch, contrast, and sharpening are combined.
          </p>
        </div>
      </div>
    </div>
  );
}
