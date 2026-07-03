"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, 
  Wand2, Eraser, Expand, Sparkles, ImagePlus, Search
} from "lucide-react";
import { useCanvas } from "@/context/context";
import { FabricImage } from "fabric";
import { useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner"; 

const DIRECTIONS = [
  { key: "top", label: "Top", icon: ArrowUp },
  { key: "bottom", label: "Bottom", icon: ArrowDown },
  { key: "left", label: "Left", icon: ArrowLeft },
  { key: "right", label: "Right", icon: ArrowRight },
];

const ProBadge = () => (
  <span className="flex items-center bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm tracking-wide">
    PRO
  </span>
);

// 🌟 NEW ALGORITHM: Cloudinary AI URL ko Max HD (100% Quality) me force karne ka function
const getHighQualityUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  
  // Agar URL Cloudinary ka hai tabhi usko HD banayenge
  if (url.includes("res.cloudinary.com")) {
    // Agar existing low quality parameter (jaise q_auto) laga hai, usko hara kar 100% karenge
    let hdUrl = url.replace(/q_auto(:[a-zA-Z]+)?/g, "q_100");
    
    // Agar url me ab tak q_100 nahi hai, toh explicitly upload/ ke baad inject kar denge
    if (!hdUrl.includes("q_100")) {
      hdUrl = hdUrl.replace("/upload/", "/upload/q_100,f_auto/");
    }
    return hdUrl;
  }
  return url;
};

export function AIExtenderControls({ project }) {
  const { canvasEditor, setProcessingMessage, processingMessage } = useCanvas();
  
  // 🌟 AI Extend States
  const [selectedDirection, setSelectedDirection] = useState(null);
  const [extensionAmount, setExtensionAmount] = useState(200);
  
  // 🌟 AI Prompt States
  const [erasePrompt, setErasePrompt] = useState("");
  const [genFillPrompt, setGenFillPrompt] = useState(""); 

  const { mutate: updateProject } = useConvexMutation(api.projects.updateProject);

  const getMainImage = () => canvasEditor?.getObjects().find((obj) => obj.type === "image") || null;
  const getImageSrc = (image) => image?.getSrc?.() || image?._element?.src || image?.src;

  const hasBackgroundRemoval = () => {
    const imageSrc = getImageSrc(getMainImage());
    return imageSrc?.includes("e-bgremove") || imageSrc?.includes("e-removedotbg") || imageSrc?.includes("e-changebg") || imageSrc?.includes("e_background_removal");
  };

  const replaceCanvasImage = async (mainImage, newImageUrl) => {
    // 🌟 Yahan Humne HD Fix Apply Kiya Hai
    const hdImageUrl = getHighQualityUrl(newImageUrl);

    const resultImage = await FabricImage.fromURL(hdImageUrl, { crossOrigin: "anonymous" });
    const currentProps = {
      left: mainImage.left, top: mainImage.top,
      scaleX: mainImage.scaleX, scaleY: mainImage.scaleY,
      angle: mainImage.angle, originX: mainImage.originX, originY: mainImage.originY,
    };
    
    canvasEditor.remove(mainImage);
    resultImage.set(currentProps);
    canvasEditor.add(resultImage);
    canvasEditor.sendObjectToBack(resultImage);
    canvasEditor.setActiveObject(resultImage);
    canvasEditor.requestRenderAll();

    await updateProject({
      projectId: project._id, currentImageUrl: hdImageUrl, canvasState: canvasEditor.toJSON(),
    });
  };

  // ==========================================
  // 🧹 1. MAGIC ERASER
  // ==========================================
  const applyMagicEraser = async () => {
    if (!erasePrompt.trim()) { toast.error("Please type what you want to erase!"); return; }
    
    const mainImage = getMainImage();
    if (!mainImage || !canvasEditor) return;

    setProcessingMessage(`Finding and removing "${erasePrompt}"...`);
    try {
      const response = await fetch("/api/imagekit/upload", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          image: getImageSrc(mainImage), 
          type: "eraser", 
          erasePrompt 
        }),
      });
      
      const responseText = await response.text();
      if (!response.ok) throw new Error(responseText);
      
      const data = responseText ? JSON.parse(responseText) : {};
      if(data.resultUrl) await replaceCanvasImage(mainImage, data.resultUrl);
      else throw new Error("No URL returned from AI");
    } catch (error) {
      console.error("Eraser Error:", error); toast.error("Failed to erase object.");
    } finally { 
      setProcessingMessage(null); 
    }
  };

  // ==========================================
  // 🎨 2. GENERATIVE FILL
  // ==========================================
  const applyGenerativeFill = async () => {
    if (!genFillPrompt.trim()) { toast.error("Please enter a prompt!"); return; }
    
    const mainImage = getMainImage();
    if (!mainImage || !canvasEditor) return;

    setProcessingMessage(`Generating magic scene: "${genFillPrompt}"...`);
    try {
      const response = await fetch("/api/imagekit/upload", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          image: getImageSrc(mainImage), 
          type: "gen-fill",
          prompt: genFillPrompt 
        }),
      });
      
      const responseText = await response.text();
      if (!response.ok) throw new Error(responseText);

      const data = responseText ? JSON.parse(responseText) : {};
      if(data.resultUrl) await replaceCanvasImage(mainImage, data.resultUrl);
      else throw new Error("No URL returned from AI");
    } catch (error) {
      console.error("GenFill Error:", error); toast.error("Failed to generate scene.");
    } finally { 
      setProcessingMessage(null); 
    }
  };

  // ==========================================
  // 🖼️ 3. AI EXTENSION (New Cloudinary API Logic)
  // ==========================================
  const calculateDimensions = () => {
    const image = getMainImage();
    if (!image || !selectedDirection) return { width: 0, height: 0 };

    const currentWidth = image.width * (image.scaleX || 1);
    const currentHeight = image.height * (image.scaleY || 1);

    const isHorizontal = ["left", "right"].includes(selectedDirection);
    const isVertical = ["top", "bottom"].includes(selectedDirection);

    return {
      width: Math.round(currentWidth + (isHorizontal ? extensionAmount : 0)),
      height: Math.round(currentHeight + (isVertical ? extensionAmount : 0)),
    };
  };

  const selectDirection = (direction) => {
    setSelectedDirection((prev) => (prev === direction ? null : direction));
  };

  const applyExtension = async () => {
    const mainImage = getMainImage();
    if (!mainImage || !selectedDirection) return;

    setProcessingMessage("Extending image with AI... This takes 10-15 seconds.");

    try {
      const { width, height } = calculateDimensions();
      
      // Cloudinary Logic: Anchor original image correctly
      const GRAVITY_MAP = {
        left: "east",
        right: "west",
        top: "south",
        bottom: "north"
      };
      const gravity = GRAVITY_MAP[selectedDirection];

      // Dhyan de: URL wahi hai jisme aapka backend route.js rakha hai
      const response = await fetch("/api/imagekit/upload", {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          image: getImageSrc(mainImage), 
          type: "extend",
          width,
          height,
          gravity
        }),
      });
      
      const responseText = await response.text();
      if (!response.ok) throw new Error(responseText);

      const data = responseText ? JSON.parse(responseText) : {};
      
      if(data.resultUrl) {
        await replaceCanvasImage(mainImage, data.resultUrl);
        setSelectedDirection(null);
      } else {
        throw new Error("No URL returned from AI");
      }
    } catch (error) {
      console.error("AI Extend Error:", error); 
      toast.error("Failed to extend image using AI.");
    } finally { 
      setProcessingMessage(null); 
    }
  };

  if (!canvasEditor) return <div className="p-4 text-white/70 text-sm">Canvas not ready</div>;
  const currentImage = getMainImage();
  if (!currentImage) return <div className="p-4 text-white/70 text-sm">Please add an image first</div>;

  const { width: newWidth, height: newHeight } = calculateDimensions();

  return (
    <div className="flex flex-col h-full max-h-[75vh]">
      <div className="overflow-y-auto pr-2 custom-scrollbar pb-6 space-y-6">
        <Tabs defaultValue="extend" className="w-full">
          <TabsList className="flex w-full p-1 bg-slate-800/80 rounded-lg mb-4">
            <TabsTrigger value="extend" className="flex-1 flex flex-row items-center justify-center gap-1.5 data-[state=active]:bg-cyan-500 data-[state=active]:text-white text-xs py-2 px-1 transition-all">
              <Expand className="h-3.5 w-3.5 shrink-0" /> <span className="whitespace-nowrap">Extend</span>
            </TabsTrigger>
            <TabsTrigger value="eraser" className="flex-1 flex flex-row items-center justify-center gap-1.5 data-[state=active]:bg-cyan-500 data-[state=active]:text-white text-xs py-2 px-1 transition-all">
              <Eraser className="h-3.5 w-3.5 shrink-0" /> <span className="whitespace-nowrap">Eraser</span>
            </TabsTrigger>
            <TabsTrigger value="genfill" className="flex-1 flex flex-row items-center justify-center gap-1.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white text-xs py-2 px-1 transition-all border border-transparent">
              <Sparkles className="h-3.5 w-3.5 shrink-0" /> <span className="whitespace-nowrap">Gen Fill</span> <ProBadge />
            </TabsTrigger>
          </TabsList>

          {/* ======================= */}
          {/* TAB 1: EXTEND           */}
          {/* ======================= */}
          <TabsContent value="extend" className="space-y-6">
            {hasBackgroundRemoval() ? (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                <h3 className="text-amber-400 font-medium mb-2">Extension Not Available</h3>
                <p className="text-amber-300/80 text-sm">Cannot be used on images with removed backgrounds. Use extension first, then remove background.</p>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-medium text-white mb-1">Select Extension Direction</h3>
                  <p className="text-xs text-white/50 mb-3">Choose one direction to extend your image</p>
                  <div className="grid grid-cols-2 gap-3">
                    {DIRECTIONS.map(({ key, label, icon: Icon }) => (
                      <Button
                        key={key}
                        onClick={() => selectDirection(key)}
                        variant={selectedDirection === key ? "default" : "outline"}
                        className={`flex items-center gap-2 ${
                          selectedDirection === key 
                            ? "bg-cyan-500 hover:bg-cyan-600 border-transparent text-white" 
                            : "border-white/10 hover:bg-white/5 text-white/80"
                        }`}
                      >
                        <Icon className="h-4 w-4" />{label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm text-white">Extension Amount</label>
                    <span className="text-xs text-white/70">{extensionAmount}px</span>
                  </div>
                  <Slider
                    value={[extensionAmount]}
                    onValueChange={([value]) => setExtensionAmount(value)}
                    min={50}
                    max={500}
                    step={25}
                    className="w-full py-2"
                    disabled={!selectedDirection}
                  />
                </div>

                {selectedDirection && (
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-white/5">
                    <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                      <Expand className="w-4 h-4 text-cyan-400" /> Extension Preview
                    </h4>
                    <div className="text-xs space-y-2 font-mono">
                      <div className="flex justify-between text-white/60">
                        <span>Current:</span>
                        <span>{Math.round(currentImage.width * (currentImage.scaleX || 1))} × {Math.round(currentImage.height * (currentImage.scaleY || 1))}px</span>
                      </div>
                      <div className="flex justify-between text-cyan-400 font-medium">
                        <span>Extended:</span>
                        <span>{newWidth} × {newHeight}px</span>
                      </div>
                      <div className="flex justify-between text-white/40">
                        <span>Canvas:</span>
                        <span>{project.width} × {project.height}px (unchanged)</span>
                      </div>
                      <div className="flex justify-between text-cyan-300">
                        <span>Direction:</span>
                        <span>{DIRECTIONS.find((d) => d.key === selectedDirection)?.label}</span>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  onClick={applyExtension}
                  disabled={!selectedDirection || processingMessage}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg"
                >
                  <Wand2 className="h-4 w-4 mr-2" /> Apply AI Extension
                </Button>

                <div className="bg-slate-800/30 rounded-lg p-4 border border-white/5">
                  <p className="text-xs text-white/60 leading-relaxed">
                    <strong className="text-white/90">How it works:</strong> Select one direction → Set amount → Apply extension. AI will intelligently generate and fill the new area.
                  </p>
                </div>
              </div>
            )}
          </TabsContent>

          {/* ======================= */}
          {/* TAB 2: MAGIC ERASER     */}
          {/* ======================= */}
          <TabsContent value="eraser" className="space-y-6">
            <div className="bg-slate-800/50 p-4 rounded-xl border border-white/10 shadow-inner">
              <h3 className="text-sm font-medium text-white flex items-center gap-2 mb-2">
                <Eraser className="h-4 w-4 text-pink-400" /> Magic Eraser
              </h3>
              <p className="text-xs text-white/70 mb-4">Tell AI what object you want to completely remove.</p>

              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="e.g. Person, dog, building..."
                    value={erasePrompt}
                    onChange={(e) => setErasePrompt(e.target.value)}
                    className="w-full bg-slate-900/50 border border-pink-500/30 rounded-md py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-pink-400 transition-colors"
                  />
                </div>
                
                <Button onClick={applyMagicEraser} disabled={processingMessage || !erasePrompt} className="w-full bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 text-white shadow-lg shadow-pink-500/20">
                  <Wand2 className="h-4 w-4 mr-2" /> Erase Object
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* ======================= */}
          {/* TAB 3: AI GENERATIVE FILL*/}
          {/* ======================= */}
          <TabsContent value="genfill" className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 p-4 rounded-xl border border-purple-500/30 shadow-inner">
              <h3 className="text-sm font-medium text-white flex items-center gap-2 mb-2">
                <ImagePlus className="h-4 w-4 text-purple-400" /> AI Magic Fill
              </h3>
              <p className="text-xs text-purple-200/70 mb-4">
                Describe the new scene or background you want for this image.
              </p>

              <div className="space-y-4">
                <div className="relative">
                  <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
                  <input 
                    type="text"
                    placeholder="e.g. A futuristic cyberpunk city..."
                    value={genFillPrompt}
                    onChange={(e) => setGenFillPrompt(e.target.value)}
                    className="w-full bg-slate-900/50 border border-purple-500/30 rounded-md py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-purple-400"
                  />
                </div>

                <Button onClick={applyGenerativeFill} disabled={processingMessage || !genFillPrompt} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/30 border-0 mt-2">
                  <Sparkles className="h-4 w-4 mr-2" /> Generate Magic
                </Button>
              </div>
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}