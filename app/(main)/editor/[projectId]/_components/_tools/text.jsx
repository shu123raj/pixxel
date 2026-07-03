"use client";

import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Type,
  Trash2,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  TypeOutline,
  User,
  Printer,
  PaintBucket,
  Check,
  RefreshCcw,
  Maximize
} from "lucide-react";
import { useCanvas } from "@/context/context";
import { IText, Shadow } from "fabric";
import { toast } from "sonner";

// 🌟 Massive list of professional and creative fonts
const FONT_FAMILIES =[
  "Arial", "Helvetica", "Verdana", "Trebuchet MS", "Open Sans", "Roboto", "Lato", "Montserrat", "Oswald", "Poppins",
  "Times New Roman", "Georgia", "Garamond", "Palatino", "Merriweather", "Playfair Display", "Lora",
  "Arial Black", "Impact", "Bebas Neue", "Righteous", "Cinzel", "Alfa Slab One", "Permanent Marker",
  "Comic Sans MS", "Pacifico", "Dancing Script", "Caveat", "Satisfy", "Great Vibes",
  "Courier New", "Consolas", "Monaco", "Space Mono"
];

const FONT_SIZES = { min: 8, max: 200, default: 40 };

// 📄 Print sizes for Passport Tool (300 DPI)
const PAPER_SIZES = {
  a4: { width: 2480, height: 3508, label: "A4 Sheet (21x29.7cm)" },
  photo4x6: { width: 1200, height: 1800, label: "4x6 Photo Paper" }
};

const PASSPORT_SIZES =[
  { id: "india", label: "Indian (3.5 x 4.5 cm)", width: 413, height: 531 },
  { id: "us", label: "US / Standard (2 x 2 inch)", width: 600, height: 600 },
  { id: "stamp", label: "Stamp Size (2 x 2.5 cm)", width: 236, height: 295 }
];

const BG_COLORS =[
  { name: "White", value: "#FFFFFF" },
  { name: "Light Blue", value: "#87CEEB" },
  { name: "Blue", value: "#0000FF" },
  { name: "Red", value: "#FF0000" },
  { name: "Grey", value: "#E5E7EB" },
];

export function TextControls() {
  const { canvasEditor } = useCanvas();
  const editTimeoutRef = useRef(null);
  
  // Tab System State (Text vs Passport)
  const [activeTab, setActiveTab] = useState("text"); 

  // ================= TEXT STATES =================
  const [selectedText, setSelectedText] = useState(null);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontSize, setFontSize] = useState(FONT_SIZES.default);
  const [textColor, setTextColor] = useState("#ffffff");
  const [textAlign, setTextAlign] = useState("center");
  const [charSpacing, setCharSpacing] = useState(0);
  const [lineHeight, setLineHeight] = useState(1.16);
  const [opacity, setOpacity] = useState(100);
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(0);
  const [shadowColor, setShadowColor] = useState("#000000");
  const [shadowBlur, setShadowBlur] = useState(0);
  const [textBgColor, setTextBgColor] = useState("transparent");
  const [_, setChanged] = useState(0);

  // ================= PASSPORT STATES =================
  const [selectedSize, setSelectedSize] = useState(PASSPORT_SIZES[0]);
  const [selectedPaper, setSelectedPaper] = useState("a4");
  const [passportBgColor, setPassportBgColor] = useState(BG_COLORS[0].value);
  const [isProcessing, setIsProcessing] = useState(false);

  // ---------- TEXT FUNCTIONALITY ----------
  const updateSelectedText = () => {
    if (!canvasEditor) return;
    const activeObject = canvasEditor.getActiveObject();
    
    if (activeObject && activeObject.type === "i-text") {
      setSelectedText(activeObject);
      setFontFamily(activeObject.fontFamily || "Arial");
      setFontSize(activeObject.fontSize || FONT_SIZES.default);
      setTextColor(activeObject.fill || "#ffffff");
      setTextAlign(activeObject.textAlign || "center");
      setCharSpacing(activeObject.charSpacing || 0);
      setLineHeight(activeObject.lineHeight || 1.16);
      setOpacity(Math.round((activeObject.opacity || 1) * 100));
      setStrokeColor(activeObject.stroke || "#000000");
      setStrokeWidth(activeObject.strokeWidth || 0);
      setTextBgColor(activeObject.textBackgroundColor || "transparent");

      if (activeObject.shadow) {
        setShadowColor(activeObject.shadow.color || "#000000");
        setShadowBlur(activeObject.shadow.blur || 0);
      } else {
        setShadowBlur(0);
      }
    } else {
      setSelectedText(null);
    }
  };

  useEffect(() => {
    if (!canvasEditor) return;

    updateSelectedText();

    const handleSelectionCreated = () => updateSelectedText();
    const handleSelectionUpdated = () => updateSelectedText();
    const handleSelectionCleared = () => setSelectedText(null);

    canvasEditor.on("selection:created", handleSelectionCreated);
    canvasEditor.on("selection:updated", handleSelectionUpdated);
    canvasEditor.on("selection:cleared", handleSelectionCleared);

    return () => {
      canvasEditor.off("selection:created", handleSelectionCreated);
      canvasEditor.off("selection:updated", handleSelectionUpdated);
      canvasEditor.off("selection:cleared", handleSelectionCleared);
      if (editTimeoutRef.current) {
        clearTimeout(editTimeoutRef.current);
        editTimeoutRef.current = null;
      }
      const activeObject = canvasEditor.getActiveObject();
      if (activeObject && typeof activeObject.exitEditing === "function") {
        activeObject.exitEditing();
      }
    };
  }, [canvasEditor]);

  const addText = () => {
    if (!canvasEditor) return;
    const text = new IText("Double Tap to Edit", {
      left: canvasEditor.width / 2,
      top: canvasEditor.height / 2,
      originX: "center",
      originY: "center",
      fontFamily: "Montserrat",
      fontWeight: "bold",
      fontSize: FONT_SIZES.default,
      fill: "#ffffff",
      textAlign: "center",
      editable: true,
      selectable: true,
      shadow: new Shadow({ color: 'rgba(0,0,0,0.5)', blur: 4, offsetX: 2, offsetY: 2 })
    });
    canvasEditor.add(text);
    canvasEditor.setActiveObject(text);
    canvasEditor.requestRenderAll();
    editTimeoutRef.current = setTimeout(() => {
      if (!canvasEditor.getObjects().includes(text)) return;
      text.enterEditing();
      text.selectAll();
      editTimeoutRef.current = null;
    }, 100);
  };

  const deleteSelectedText = () => {
    if (!canvasEditor || !selectedText) return;
    canvasEditor.remove(selectedText);
    canvasEditor.requestRenderAll();
    setSelectedText(null);
  };

  const applyProperty = (property, value) => {
    if (!selectedText) return;
    selectedText.set(property, value);
    canvasEditor.requestRenderAll();
    setChanged((c) => c + 1);
  };

  const applyShadow = (blur, color) => {
    if (!selectedText) return;
    if (blur === 0) {
      selectedText.set("shadow", null);
    } else {
      selectedText.set("shadow", new Shadow({ color: color, blur: blur, offsetX: blur / 2.5, offsetY: blur / 2.5 }));
    }
    setShadowBlur(blur);
    setShadowColor(color);
    canvasEditor.requestRenderAll();
  };

  const toggleFormat = (format) => {
    if (!selectedText) return;
    switch (format) {
      case "bold":
        selectedText.set("fontWeight", selectedText.fontWeight === "bold" ? "normal" : "bold");
        break;
      case "italic":
        selectedText.set("fontStyle", selectedText.fontStyle === "italic" ? "normal" : "italic");
        break;
      case "underline":
        selectedText.set("underline", !selectedText.underline);
        break;
    }
    canvasEditor.requestRenderAll();
    setChanged((c) => c + 1);
  };

  // ---------- PASSPORT FUNCTIONALITY ----------
  const applyBackgroundColor = () => {
    if (!canvasEditor) return;
    const activeObject = canvasEditor.getActiveObject() || canvasEditor.getObjects().find(o => o.type === "image");
    
    if (!activeObject) {
      toast.error("Please select an image first!");
      return;
    }

    activeObject.set({ backgroundColor: passportBgColor });
    canvasEditor.requestRenderAll();
    toast.success("Background color applied!");
  };

  const applyPassportSize = () => {
    if (!canvasEditor) return;
    const activeObject = canvasEditor.getActiveObject() || canvasEditor.getObjects().find(o => o.type === "image");
    
    if (!activeObject) {
      toast.error("Please select an image first!");
      return;
    }

    const scaleX = selectedSize.width / activeObject.width;
    const scaleY = selectedSize.height / activeObject.height;

    // Remove from selection safely before applying hard scale
    canvasEditor.discardActiveObject();

    activeObject.set({
      scaleX,
      scaleY,
      originX: "center",
      originY: "center",
      stroke: "#000000",
      strokeWidth: 2, 
    });
    
    activeObject.setCoords();
    canvasEditor.centerObject(activeObject);
    canvasEditor.setActiveObject(activeObject);
    canvasEditor.requestRenderAll();
    
    toast.success(`${selectedSize.label} size applied!`);
  };

  const generatePrintLayout = async () => {
    if (!canvasEditor) return;
    
    // Pehle object ko find karein
    const activeObject = canvasEditor.getActiveObject() || canvasEditor.getObjects().find(o => o.type === "image");
    
    if (!activeObject) {
      toast.error("Please select the passport photo first!");
      return;
    }

    setIsProcessing(true);

    try {
      const paper = PAPER_SIZES[selectedPaper];

      // 🔴 MOST IMPORTANT FIX: Object ko modify/clone karne se pehle un-select karna zaruri hai.
      // Agar ye nahi kiya toh Download ke time pe coordinates group ke hisab se bigad jate hain!
      canvasEditor.discardActiveObject();
      
      // Zoom aur Pan ko 100% reset karo taaki canvas coordinates hamesha perfect download ho
      canvasEditor.setViewportTransform([1, 0, 0, 1, 0, 0]);
      canvasEditor.setZoom(1);

      if (canvasEditor.updateWorkspaceSize) {
        canvasEditor.updateWorkspaceSize(paper.width, paper.height);
      } else {
        canvasEditor.setDimensions({ width: paper.width, height: paper.height });
      }
      
      canvasEditor.calcOffset();
      canvasEditor.backgroundColor = "#FFFFFF";

      // Base original object ka setting karna
      activeObject.set({
        originX: 'left',
        originY: 'top',
        scaleX: selectedSize.width / activeObject.width,
        scaleY: selectedSize.height / activeObject.height,
        stroke: "#E5E7EB", 
        strokeWidth: 2,
        strokeUniform: true,
        angle: 0
      });

      const marginX = 120;
      const marginY = 120;
      const spacing = 40; 
      
      const availableW = paper.width - (marginX * 2);
      const availableH = paper.height - (marginY * 2);

      const cols = Math.floor(availableW / (selectedSize.width + spacing));
      const rows = Math.floor(availableH / (selectedSize.height + spacing));

      const totalGridW = (cols * selectedSize.width) + ((cols - 1) * spacing);
      const totalGridH = (rows * selectedSize.height) + ((rows - 1) * spacing);

      const startX = (paper.width - totalGridW) / 2;
      const startY = (paper.height - totalGridH) / 2;

      // Purane unwanted objects safely remove karna
      const allObjects = canvasEditor.getObjects();
      allObjects.forEach(obj => {
        if (obj !== activeObject) canvasEditor.remove(obj);
      });

      // Photos ko Grid mein lagana
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          
          const posX = startX + c * (selectedSize.width + spacing);
          const posY = startY + r * (selectedSize.height + spacing);

          if (r === 0 && c === 0) {
            // First slot ke liye original object use hoga
            activeObject.set({ left: posX, top: posY });
            activeObject.setCoords();
          } else {
            // Baaki slots ke liye nayi copy banegi
            const clonedObj = await activeObject.clone();
            clonedObj.set({
              left: posX,
              top: posY,
              originX: 'left',
              originY: 'top',
              evented: true,
              selectable: true
            });
            clonedObj.setCoords(); 
            canvasEditor.add(clonedObj);
          }
        }
      }

      // Render karna
      canvasEditor.calcOffset();
      canvasEditor.requestRenderAll();
      toast.success(`Generated ${rows * cols} photos on ${selectedPaper.toUpperCase()}`);

    } catch (error) {
      console.error(error);
      toast.error("Failed to generate layout");
    } finally {
      setIsProcessing(false);
    }
  };

  // Ensure canvas is ready
  if (!canvasEditor) {
    return <div className="p-4"><p className="text-white/70 text-sm">Canvas not ready</p></div>;
  }

  return (
    <div className="flex flex-col h-full max-h-[85vh]">
      
      {/* 🚀 MODE SWITCHER TABS 🚀 */}
      <div className="flex items-center gap-1.5 p-1 bg-[#1a2133]/60 rounded-xl mb-4 border border-white/5 flex-shrink-0 mx-1">
        <button
          onClick={() => setActiveTab("text")}
          className={`flex-1 flex items-center justify-center py-2.5 rounded-lg text-[13px] font-bold tracking-wide transition-all ${
            activeTab === "text" 
            ? "bg-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.15)] ring-1 ring-cyan-500/50" 
            : "text-slate-400 hover:bg-white/5 hover:text-white"
          }`}
        >
          <Type className="w-4 h-4 mr-2" />
          Text 
        </button>
        <button
          onClick={() => setActiveTab("passport")}
          className={`flex-1 flex items-center justify-center py-2.5 rounded-lg text-[13px] font-bold tracking-wide transition-all ${
            activeTab === "passport" 
            ? "bg-purple-500/20 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.15)] ring-1 ring-purple-500/50" 
            : "text-slate-400 hover:bg-white/5 hover:text-white"
          }`}
        >
          <User className="w-4 h-4 mr-2" />
          Passport
        </button>
      </div>

      <div className="overflow-y-auto pr-2 pb-6 custom-scrollbar px-1 flex-1">
        
        {/* ============================== */}
        {/*           TEXT VIEW            */}
        {/* ============================== */}
        {activeTab === "text" && (
          <div className="animate-in fade-in zoom-in-95 duration-200">
            <div className="space-y-4 mb-5 border border-cyan-500/10 bg-cyan-500/5 p-4 rounded-xl">
              <div>
                <h3 className="text-[13px] font-semibold text-white tracking-wide">Add Custom Text</h3>
                <p className="text-[11px] text-white/50 mt-1">Insert customizable fonts & headings.</p>
              </div>
              <Button onClick={addText} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg shadow-[0_4px_10px_rgba(6,182,212,0.3)] border-none">
                <Type className="h-4 w-4 mr-2" />
                Add New Text
              </Button>
            </div>

            {selectedText && (
              <div className="pt-2 space-y-6">
                
                {/* 1. TYPOGRAPHY */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest px-1">Typography</h4>
                  
                  <select
                    value={fontFamily}
                    onChange={(e) => {
                      setFontFamily(e.target.value);
                      applyProperty("fontFamily", e.target.value);
                    }}
                    className="w-full px-3 py-2.5 bg-[#1b2333] border border-white/10 rounded-xl text-white text-[13px] font-medium outline-none hover:border-cyan-500/50 focus:border-cyan-500 cursor-pointer"
                  >
                    {FONT_FAMILIES.map((font) => (
                      <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
                    ))}
                  </select>

                  <div className="flex gap-2">
                    <Button onClick={() => toggleFormat("bold")} variant={selectedText.fontWeight === "bold" ? "default" : "outline"} className="flex-1 rounded-xl h-10 border-white/10 bg-[#1b2333]">
                      <Bold className="h-4 w-4 text-slate-300" />
                    </Button>
                    <Button onClick={() => toggleFormat("italic")} variant={selectedText.fontStyle === "italic" ? "default" : "outline"} className="flex-1 rounded-xl h-10 border-white/10 bg-[#1b2333]">
                      <Italic className="h-4 w-4 text-slate-300" />
                    </Button>
                    <Button onClick={() => toggleFormat("underline")} variant={selectedText.underline ? "default" : "outline"} className="flex-1 rounded-xl h-10 border-white/10 bg-[#1b2333]">
                      <Underline className="h-4 w-4 text-slate-300" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {[["left", AlignLeft],["center", AlignCenter], ["right", AlignRight], ["justify", AlignJustify]].map(([align, Icon]) => (
                      <Button key={align} onClick={() => { setTextAlign(align); applyProperty("textAlign", align); }} variant={textAlign === align ? "default" : "outline"} className={`h-10 rounded-xl ${textAlign === align ? 'bg-cyan-600 border-none' : 'bg-[#1b2333] border-white/10 hover:bg-white/5'}`}>
                        <Icon className={`h-4 w-4 ${textAlign === align ? 'text-white' : 'text-slate-400'}`} />
                      </Button>
                    ))}
                  </div>
                </div>

                {/* 2. SPACING & SIZE */}
                <div className="space-y-4 border-t border-white/10 pt-4 px-1">
                  <h4 className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest">Dimensions</h4>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between"><label className="text-[11px] text-white/70">Font Size</label><span className="text-[11px] font-medium text-cyan-300">{fontSize}px</span></div>
                    <Slider value={[fontSize]} onValueChange={(v) => { setFontSize(v[0]); applyProperty("fontSize", v[0]); }} min={FONT_SIZES.min} max={FONT_SIZES.max} step={1} />
                  </div>

                  <div className="space-y-1 mt-4">
                    <div className="flex justify-between"><label className="text-[11px] text-white/70">Letter Spacing</label><span className="text-[11px] font-medium text-cyan-300">{charSpacing}</span></div>
                    <Slider value={[charSpacing]} onValueChange={(v) => { setCharSpacing(v[0]); applyProperty("charSpacing", v[0]); }} min={-100} max={800} step={10} />
                  </div>

                  <div className="space-y-1 mt-4">
                    <div className="flex justify-between"><label className="text-[11px] text-white/70">Line Height</label><span className="text-[11px] font-medium text-cyan-300">{lineHeight}</span></div>
                    <Slider value={[lineHeight]} onValueChange={(v) => { setLineHeight(v[0]); applyProperty("lineHeight", v[0]); }} min={0.5} max={3} step={0.1} />
                  </div>
                </div>

                {/* 3. COLORS & EFFECTS */}
                <div className="space-y-4 border-t border-white/10 pt-4 px-1">
                  <h4 className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest">Aesthetics</h4>
                  
                  {/* Text Color */}
                  <div className="flex items-center justify-between bg-[#1b2333] p-2 rounded-xl border border-white/5">
                    <label className="text-xs text-white/80 font-medium pl-2">Font Color</label>
                    <div className="flex gap-2">
                      <Input value={textColor} onChange={(e) => { setTextColor(e.target.value); applyProperty("fill", e.target.value); }} className="w-20 h-8 text-[11px] bg-[#141a26] border-white/10" />
                      <input type="color" value={textColor} onChange={(e) => { setTextColor(e.target.value); applyProperty("fill", e.target.value); }} className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0" />
                    </div>
                  </div>

                  {/* Outline (Stroke) */}
                  <div className="space-y-3 bg-[#1b2333] p-3 rounded-xl border border-white/5 mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs text-white/80 font-medium">Outline FX</label>
                      <input type="color" value={strokeColor} onChange={(e) => { setStrokeColor(e.target.value); applyProperty("stroke", e.target.value); }} className="w-6 h-6 rounded cursor-pointer bg-transparent border-0" />
                    </div>
                    <Slider value={[strokeWidth]} onValueChange={(v) => { setStrokeWidth(v[0]); applyProperty("strokeWidth", v[0]); }} min={0} max={10} step={0.5} />
                  </div>

                  {/* Drop Shadow */}
                  <div className="space-y-3 bg-[#1b2333] p-3 rounded-xl border border-white/5 mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs text-white/80 font-medium">Glow & Shadow</label>
                      <input type="color" value={shadowColor} onChange={(e) => applyShadow(shadowBlur, e.target.value)} className="w-6 h-6 rounded cursor-pointer bg-transparent border-0" />
                    </div>
                    <Slider value={[shadowBlur]} onValueChange={(v) => applyShadow(v[0], shadowColor)} min={0} max={50} step={1} />
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <label className="text-[11px] text-white/70">Text Background Box</label>
                    <div className="flex gap-2">
                      <input type="color" value={textBgColor !== "transparent" ? textBgColor : "#000000"} onChange={(e) => { setTextBgColor(e.target.value); applyProperty("textBackgroundColor", e.target.value); }} className="w-7 h-7 rounded cursor-pointer bg-transparent border-0" title="Choose color" />
                      <Button size="sm" variant="ghost" className="h-7 text-[10px] bg-red-500/10 text-red-400 hover:bg-red-500/20" onClick={() => { setTextBgColor("transparent"); applyProperty("textBackgroundColor", "transparent"); }}>Clear</Button>
                    </div>
                  </div>
                </div>

                <Button onClick={deleteSelectedText} className="w-full mt-2 h-10 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-colors shadow-none font-bold tracking-wide">
                  <Trash2 className="h-4 w-4 mr-2" /> Delete Element
                </Button>
              </div>
            )}
            
            {!selectedText && (
              <div className="flex flex-col items-center justify-center p-8 mt-4 text-center border border-dashed border-white/10 rounded-2xl bg-white/5">
                 <TypeOutline className="w-8 h-8 text-white/20 mb-3" />
                 <p className="text-xs text-white/40 font-medium leading-relaxed">Add a text element or click<br/>existing text to edit.</p>
              </div>
            )}

          </div>
        )}

        {/* ============================== */}
        {/*         PASSPORT VIEW          */}
        {/* ============================== */}
        {activeTab === "passport" && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-200">
             
            <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20 text-center mb-6">
              <User className="w-8 h-8 text-purple-400 mx-auto mb-2 drop-shadow-md" />
              <h3 className="text-[13px] font-bold text-white tracking-wide">Photo Maker AI</h3>
              <p className="text-[10px] text-white/60 mt-1 px-2">Setup background color, resize automatically, & generate multi-photo layout.</p>
            </div>

            {/* Step 1: Select Size */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-[11px] font-bold text-purple-300 uppercase tracking-widest pl-1">
                <span className="w-5 h-5 rounded-md bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs border border-purple-500/30">1</span>
                Dimension Formats
              </div>
              <div className="grid grid-cols-1 gap-2">
                {PASSPORT_SIZES.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => setSelectedSize(size)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all text-left group ${
                      selectedSize.id === size.id
                        ? "bg-purple-500/10 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)] ring-1 ring-purple-500/20"
                        : "bg-[#1b2333] border-white/5 hover:border-white/20"
                    }`}
                  >
                    <span className={`text-[12px] ${selectedSize.id === size.id ? 'text-purple-300 font-bold' : 'text-slate-400 font-medium'}`}>
                      {size.label}
                    </span>
                    {selectedSize.id === size.id && <Check className="w-4 h-4 text-purple-400" />}
                  </button>
                ))}
              </div>
              <Button onClick={applyPassportSize} className="w-full text-[12px] font-bold h-10 border-white/10 hover:bg-white/10 text-slate-300 rounded-xl bg-[#1b2333]">
                <Maximize className="w-3.5 h-3.5 mr-2 text-cyan-400" /> Rescale Photo Now
              </Button>
            </div>

            {/* Step 2: Background Colors */}
            <div className="space-y-3 mb-6 pt-2 border-t border-white/10">
              <div className="flex items-center gap-2 text-[11px] font-bold text-purple-300 uppercase tracking-widest pl-1">
                <span className="w-5 h-5 rounded-md bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs border border-purple-500/30">2</span>
                Backdrop Replace
              </div>
              <div className="flex flex-wrap gap-2.5">
                {BG_COLORS.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setPassportBgColor(color.value)}
                    className={`w-9 h-9 rounded-xl shadow-lg border-2 transition-all ${
                      passportBgColor === color.value 
                      ? 'border-purple-400 scale-110 ring-2 ring-purple-500/20 shadow-purple-500/40' 
                      : 'border-white/10 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
              <Button onClick={applyBackgroundColor} className="w-full text-[12px] font-bold h-10 border-white/10 hover:bg-white/10 text-slate-300 rounded-xl bg-[#1b2333]">
                <PaintBucket className="w-3.5 h-3.5 mr-2 text-pink-400" /> Apply Studio Background
              </Button>
            </div>

            {/* Step 3: Paper Sheet Setup */}
            <div className="space-y-4 pt-4 border-t border-white/10 pb-2">
              <div className="flex items-center gap-2 text-[11px] font-bold text-purple-300 uppercase tracking-widest pl-1">
                <span className="w-5 h-5 rounded-md bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs border border-purple-500/30">3</span>
                Sheet Maker Output
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(PAPER_SIZES).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedPaper(key)}
                    className={`px-2 py-3 rounded-xl border text-[11px] font-bold transition-all text-center tracking-wide ${
                      selectedPaper === key
                        ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-300 ring-1 ring-cyan-500/20"
                        : "bg-[#1b2333] border-white/5 text-slate-400 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    {value.label}
                  </button>
                ))}
              </div>

              <Button 
                onClick={generatePrintLayout} 
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold tracking-wide shadow-[0_5px_20px_rgba(147,51,234,0.35)] hover:shadow-[0_5px_25px_rgba(147,51,234,0.5)] h-[46px] rounded-xl text-sm border-none group"
              >
                {isProcessing ? (
                  <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Printer className="w-[18px] h-[18px] mr-2 group-hover:scale-110 transition-transform text-pink-200" />
                )}
                Auto-Generate Layout
              </Button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
