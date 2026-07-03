"use client";

import React, { useState, useCallback } from "react";
import { X, Upload, Image as ImageIcon, Loader2, CloudLightning, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useDropzone } from "react-dropzone";
import { useConvexMutation, useConvexQuery } from "@/hooks/use-convex-query";
import { usePlanAccess } from "@/hooks/use-plan-access";
import { UpgradeModal } from "@/components/upgrade-modal";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export function NewProjectModal({ isOpen, onClose }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [projectTitle, setProjectTitle] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState("none");
  
  const [isUploadingToCloud, setIsUploadingToCloud] = useState(false);
  const [uploadedData, setUploadedData] = useState(null);
  const [isCreatingDB, setIsCreatingDB] = useState(false);
  
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const { mutate: createProject } = useConvexMutation(api.projects.create);
  const { data: folders } = useConvexQuery(api.folders.getUserFolders);
  const { data: projects } = useConvexQuery(api.projects.getUserProjects);
  const { canCreateProject, getRemainingProjects, limits, isPro } = usePlanAccess();
  const router = useRouter();

  const currentProjectCount = projects?.length || 0;
  const canCreate = canCreateProject(currentProjectCount);
  const remainingProjects = getRemainingProjects(currentProjectCount);

  const uploadImagesInBackground = async (files) => {
    setIsUploadingToCloud(true);
    setUploadedData(null);

    try {
      const uploads = [];

      for (const file of files) {
       const uploadResponse = await fetch(`/api/imagekit/upload?fileName=${encodeURIComponent(file.name)}`, {
        method: "POST",
        headers: {
          "Content-Type": file.type || "image/jpeg"
        },
        body: file, 
        credentials: "include",
      });

        const data = await uploadResponse.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to upload image");
        }

        uploads.push({ ...data, fileName: file.name });
      }

      setUploadedData(uploads);
    } catch (error) {
      console.error("Background upload error:", error);
      toast.error("Image upload failed. Please try another image.");
      handleResetFile();
    } finally {
      setIsUploadingToCloud(false);
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    const files = acceptedFiles.filter((file) => file.type.startsWith("image/"));
    const file = files[0];

    if (!canCreate) {
      setShowUpgradeModal(true);
      return;
    }

    if (!isPro && files.length > remainingProjects) {
      toast.error(`Free plan has ${remainingProjects} project slot${remainingProjects === 1 ? "" : "s"} left. Upgrade to Pro for unlimited projects.`);
      setShowUpgradeModal(true);
      return;
    }

    if (file) {
      setSelectedFile(file);
      setSelectedFiles(files);
      setPreviewUrl(URL.createObjectURL(file));

      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      setProjectTitle(files.length > 1 ? `${nameWithoutExt} batch` : (nameWithoutExt || "Untitled Project"));

      uploadImagesInBackground(files);
    }
  }, [canCreate, isPro, remainingProjects]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*":[".png", ".jpg", ".jpeg", ".webp", ".gif"] },
    maxFiles: limits.maxBatchUpload,
    maxSize: limits.maxUploadSizeMb * 1024 * 1024,
  });

  const handleCreateProject = async () => {
    if (!uploadedData?.length) {
      toast.error("Please wait for the image to finish uploading.");
      return;
    }

    if (!projectTitle.trim()) {
      toast.error("Please enter a project title");
      return;
    }

    setIsCreatingDB(true);

    try {
      const projectIds = [];

      for (let index = 0; index < uploadedData.length; index += 1) {
        const item = uploadedData[index];
        const imageUrl = item.url || item.resultUrl;
        const fallbackName = item.fileName?.replace(/\.[^/.]+$/, "") || projectTitle.trim();
        const title = uploadedData.length > 1 ? `${projectTitle.trim()} ${index + 1}` : projectTitle.trim() || fallbackName;

        const origWidth = Number(item.width) || 800;
        const origHeight = Number(item.height) || 600;
        
        let safeUrl = imageUrl;
        let optimalWidth = origWidth;
        let optimalHeight = origHeight;

        // 🚀 100% GLITCH FIX LOGIC: GPU/WebGL limit cross hone par ImageKit Smart Resize
        if (origWidth > 2048 || origHeight > 2048) {
           const ratio = Math.min(2048 / origWidth, 2048 / origHeight);
           optimalWidth = Math.round(origWidth * ratio);
           optimalHeight = Math.round(origHeight * ratio);
           
           // URL mein dynamic size limits add kar rahe hain (Canvas GPU crash rokne ke liye)
           const separator = imageUrl.includes("?") ? "&" : "?";
           safeUrl = `${imageUrl}${separator}tr=w-2048,h-2048,c-at_max`;
        }

        const projectId = await createProject({
          title,
          originalImageUrl: safeUrl, // Modified Safe URL
          currentImageUrl: safeUrl,  // Modified Safe URL
          thumbnailUrl: item.thumbnailUrl || safeUrl,
          width: optimalWidth,
          height: optimalHeight,
          folderId: selectedFolderId && selectedFolderId !== "none" ? selectedFolderId : undefined,
        });

        projectIds.push(projectId);
      }

      toast.success(`${projectIds.length} project${projectIds.length > 1 ? "s" : ""} created instantly!`);

      handleClose();
      router.push(`/editor/${projectIds[0]}`);
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error(error.message || "Failed to create project. Please try again.");
    } finally {
      setIsCreatingDB(false);
    }
  };

  const handleResetFile = () => {
    setSelectedFile(null);
    setSelectedFiles([]);
    setPreviewUrl(null);
    setProjectTitle("");
    setUploadedData(null);
    setIsUploadingToCloud(false);
  };

  const handleClose = () => {
    handleResetFile();
    setSelectedFolderId("none");
    setIsCreatingDB(false);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl bg-[#0a0c10]/95 backdrop-blur-2xl border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden p-0">
          
          <div className="h-1.5 w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600"></div>

          <div className="p-6 sm:p-8">
            <DialogHeader className="mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30">
                  <CloudLightning className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <DialogTitle className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Create New Project
                  </DialogTitle>
                  <p className="text-xs sm:text-sm text-white/50 mt-1">Upload your image and setup the workspace.</p>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6">
              
              <AnimatePresence mode="wait">
                {!selectedFile ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    {...getRootProps()}
                    className={`relative overflow-hidden border-2 border-dashed rounded-2xl p-10 sm:p-14 text-center cursor-pointer transition-all duration-300 ${
                      isDragActive
                        ? "border-cyan-400 bg-cyan-400/5 shadow-[0_0_30px_rgba(34,211,238,0.15)]"
                        : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/30"
                    } ${!canCreate ? "opacity-50 pointer-events-none" : ""}`}
                  >
                    <input {...getInputProps()} />
                    <div className="relative z-10 flex flex-col items-center">
                      <div className={`p-4 rounded-full mb-4 transition-all duration-300 ${isDragActive ? "bg-cyan-500/20 text-cyan-400" : "bg-white/5 text-white/40"}`}>
                        <Upload className="h-8 w-8" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">
                        {isDragActive ? "Drop image here to begin" : "Drag & Drop Image"}
                      </h3>
                      <p className="text-white/50 text-sm mb-4">
                        {canCreate ? `or click to browse one or many photos (${isPro ? "Pro" : `${remainingProjects} free slots left`})` : "Upgrade to Pro to create more projects"}
                      </p>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-[10px] text-white/40 font-medium">
                        <span>PNG</span>•<span>JPG</span>•<span>WEBP</span>•<span>Up to {limits.maxUploadSizeMb}MB</span>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6"
                  >
                    {selectedFiles.length > 1 && (
                      <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-200">
                        {selectedFiles.length} photos selected. Each photo will become a dashboard project.
                      </div>
                    )}
                    <div className="relative group rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className={`w-full h-48 sm:h-60 object-contain transition-opacity duration-500 ${isUploadingToCloud ? 'opacity-40 blur-sm' : 'opacity-100'}`}
                      />
                      
                      {isUploadingToCloud && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className="w-12 h-12 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin mb-3"></div>
                          <p className="text-cyan-300 font-bold text-sm tracking-wide bg-black/50 px-3 py-1 rounded-full backdrop-blur-md">Fast Uploading...</p>
                        </div>
                      )}

                      {uploadedData?.length > 0 && !isUploadingToCloud && (
                        <div className="absolute top-3 left-3 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                          <CheckCircle2 className="w-4 h-4" /> Ready
                        </div>
                      )}

                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={handleResetFile}
                        className="absolute top-3 right-3 bg-red-500/80 hover:bg-red-600 backdrop-blur-md text-white h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="project-title" className="text-white/70 text-xs font-semibold uppercase tracking-wider">
                          Project Title
                        </Label>
                        <Input
                          id="project-title"
                          type="text"
                          value={projectTitle}
                          onChange={(e) => setProjectTitle(e.target.value)}
                          placeholder="Enter project name..."
                          className="bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-cyan-500/50 focus:ring-cyan-500/50 h-11 rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="folder-select" className="text-white/70 text-xs font-semibold uppercase tracking-wider">
                          Save to Folder
                        </Label>
                        <Select value={selectedFolderId} onValueChange={setSelectedFolderId}>
                          <SelectTrigger id="folder-select" className="bg-white/5 border-white/10 text-white h-11 rounded-xl">
                            <SelectValue placeholder="Select folder" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-white/10 text-white rounded-xl">
                            <SelectItem value="none">No folder (Default)</SelectItem>
                            {folders?.map((folder) => (
                              <SelectItem key={folder._id} value={folder._id}>
                                {folder.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <DialogFooter className="mt-8 gap-3 sm:gap-2">
              <Button
                variant="ghost"
                onClick={handleClose}
                disabled={isCreatingDB}
                className="text-white/50 hover:text-white hover:bg-white/5 rounded-xl h-11 px-6"
              >
                Cancel
              </Button>

              <Button
                onClick={handleCreateProject}
                disabled={!selectedFile || !projectTitle.trim() || isUploadingToCloud || isCreatingDB || !uploadedData?.length}
                className={`rounded-xl h-11 px-8 font-bold transition-all duration-300 ${
                  isUploadingToCloud || !selectedFile 
                    ? "bg-white/10 text-white/30" 
                    : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)]"
                }`}
              >
                {isUploadingToCloud ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading Image...
                  </>
                ) : isCreatingDB ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Projects...
                  </>
                ) : (
                  selectedFiles.length > 1 ? `Create ${selectedFiles.length} Projects` : "Create Project"
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        restrictedTool="projects"
        reason="Free plan includes 3 projects and 20 exports per month. Upgrade to Pro for unlimited projects, unlimited exports, batch editing, and all AI tools."
      />
    </>
  );
}
