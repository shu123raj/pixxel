"use client";

import React, { useEffect, useMemo, useRef, useState, useContext } from "react";
import { ChevronLeft, ChevronRight, Images, Loader2, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { useConvexMutation, useConvexQuery } from "@/hooks/use-convex-query";
import { CanvasContext } from "@/context/context"; 
import { usePlanAccess } from "@/hooks/use-plan-access";
import { UpgradeModal } from "@/components/upgrade-modal";

const STORAGE_KEY = "pixxel-batch-projects";

function readBatchIds() {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
}

function writeBatchIds(ids) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...new Set(ids.filter(Boolean))]));
}

// ✨ CHANGE: isOpen aur setIsOpen ab props se aa rahe hain
export function BatchEditorPanel({ project, isOpen, setIsOpen }) {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [batchIds, setBatchIds] = useState([]);
  
  const [isUploadingToCloud, setIsUploadingToCloud] = useState(false);
  const [isCreatingDB, setIsCreatingDB] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 });
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const canvasContext = useContext(CanvasContext);
  const canvasEditor = canvasContext?.canvasEditor;
  const setIsSaved = canvasContext?.setIsSaved;

  const { mutate: createProject } = useConvexMutation(api.projects.create);
  const { mutate: deleteProject } = useConvexMutation(api.projects.deleteProject);
  const { mutate: updateProject } = useConvexMutation(api.projects.updateProject); 
  const { data: projects = [] } = useConvexQuery(api.projects.getUserProjects);
  const { mutate: generateUploadUrl } = useConvexMutation(api.projects.generateUploadUrl);
  const { canCreateProject, getRemainingProjects, isPro, limits } = usePlanAccess();
  
  useEffect(() => {
    const stored = readBatchIds();
    const nextIds = project?._id ? [...stored, project._id] : stored;
    const unique = [...new Set(nextIds)];
    setBatchIds(unique);
    writeBatchIds(unique);
  }, [project?._id]);

  const batchProjects = useMemo(() => {
    const projectMap = new Map((projects || []).map((item) => [item._id, item]));
    return batchIds.map((id) => projectMap.get(id)).filter(Boolean);
  }, [batchIds, projects]);

  const activeCount = batchProjects.length;

  const handleFiles = async (files) => {
    const imageFiles = Array.from(files || []).filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length === 0) return;

    const currentProjectCount = projects?.length || 0;
    const remainingProjects = getRemainingProjects(currentProjectCount);

    if (!canCreateProject(currentProjectCount)) {
      setShowUpgradeModal(true);
      return;
    }

    if (!isPro && imageFiles.length > remainingProjects) {
      toast.error(`Free plan has ${remainingProjects} project slot${remainingProjects === 1 ? "" : "s"} left. Upgrade to Pro for batch projects.`);
      setShowUpgradeModal(true);
      return;
    }

    if (imageFiles.length > limits.maxBatchUpload) {
      toast.error(`${limits.label} plan allows ${limits.maxBatchUpload} photos per batch upload.`);
      return;
    }

    setIsUploadingToCloud(true);
    setUploadProgress({ done: 0, total: imageFiles.length });

    try {
      const uploads = [];
      for (const file of imageFiles) {
        const uploadResponse = await fetch(`/api/imagekit/upload?fileName=${encodeURIComponent(file.name)}`, {
          method: "POST",
          headers: { "Content-Type": file.type || "image/jpeg" },
          body: file,
          credentials: "include",
        });

        const data = await uploadResponse.json();

        if (!uploadResponse.ok || !data.success) {
          throw new Error(data.error || "Failed to upload image");
        }

        uploads.push({ ...data, fileName: file.name });
        setUploadProgress((prev) => ({ ...prev, done: prev.done + 1 }));
      }

      setIsUploadingToCloud(false);
      setIsCreatingDB(true);
      const createdIds = [];

      for (let index = 0; index < uploads.length; index += 1) {
        const item = uploads[index];
        const imageUrl = item.url || item.resultUrl;
        const fallbackName = item.fileName?.replace(/\.[^/.]+$/, "") || `Batch image ${index + 1}`;

        const projectId = await createProject({
          title: fallbackName,
          originalImageUrl: imageUrl,
          currentImageUrl: imageUrl,
          thumbnailUrl: item.thumbnailUrl || imageUrl,
          width: Number(item.width) || 800,
          height: Number(item.height) || 600,
        });

        createdIds.push(projectId);
      }

      const nextIds = [...new Set([...batchIds, ...createdIds])];
      setBatchIds(nextIds);
      writeBatchIds(nextIds);
      toast.success(`${createdIds.length} project${createdIds.length > 1 ? "s" : ""} added instantly!`);

    } catch (error) {
      console.error("Batch upload error:", error);
      toast.error(error.message || "Batch upload failed. Please try again.");
    } finally {
      setIsUploadingToCloud(false);
      setIsCreatingDB(false);
      setUploadProgress({ done: 0, total: 0 });
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeFromBatch = async (projectId) => {
    if (!projectId) return;

    const shouldDelete = confirm(
      "Do you want to delete this photo from the batch and dashboard? This action cannot be undone."
    );
    if (!shouldDelete) return;

    try {
      await deleteProject({ projectId });
      const nextIds = batchIds.filter((id) => id !== projectId);
      setBatchIds(nextIds);
      writeBatchIds(nextIds);
      toast.success("Photo deleted from batch and dashboard.");
    } catch (error) {
      console.error("Failed to delete batch photo:", error);
      toast.error("Could not delete photo. Please try again.");
    }
  };

  const clearBatch = async () => {
    const shouldClear = confirm("Do you want to clear the batch AND delete these photos from your dashboard? This cannot be undone.");
    if (!shouldClear) return;

    const keepCurrent = project?._id ? [project._id] : [];
    
    const projectsToDelete = batchIds.filter(id => id !== project?._id);
    for (const id of projectsToDelete) {
      try {
        await deleteProject({ projectId: id });
      } catch(e) {
        console.error("Failed to delete project:", id);
      }
    }

    setBatchIds(keepCurrent);
    writeBatchIds(keepCurrent);
    toast.success("Batch cleared and photos removed from dashboard.");
  };

  const handleSwitchProject = async (targetId) => {
    if (targetId === project?._id) return; 

    if (canvasEditor && project?._id) {
      const toastId = toast.loading("Saving your edits...");
      try {
        setIsSaved?.(false);
        const json = canvasEditor.toJSON(['id', 'name', 'selectable', 'lockMovementX', 'lockMovementY', 'lockRotation', 'lockScalingX', 'lockScalingY']);
        
        let uploadUrl;
        try { uploadUrl = await generateUploadUrl(); } 
        catch { uploadUrl = await generateUploadUrl({}); }

        const blob = new Blob([JSON.stringify(json)], { type: "application/json" });
        const response = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: blob,
        });

        if (!response.ok) throw new Error("Storage upload failed");
        const { storageId } = await response.json();
        
        await updateProject({
          projectId: project._id,
          canvasStateStorageId: storageId,
        });
        
        setIsSaved?.(true);
        toast.success("Saved successfully!", { id: toastId });
      } catch (error) {
        console.error("Auto-save failed:", error);
        toast.error("Edits could not be saved. Please check connection.", { id: toastId });
      }
    }

    router.push(`/editor/${targetId}`);
  };

  return (
    <>
      {/* ✨ CHANGE: Floating button yahan se delete kar diya gaya hai */}
      <aside
        className={`absolute right-0 top-0 z-[60] flex h-full w-[218px] flex-col border-l border-white/10 bg-[#0b0d12]/95 shadow-[0_0_35px_rgba(0,0,0,0.55)] backdrop-blur-2xl transition-transform duration-200 ${isOpen ? "translate-x-0" : "translate-x-[218px]"}`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-3 py-3">
          <button className="flex items-center gap-2 rounded-lg border border-lime-400/25 bg-lime-400/10 px-3 py-2 text-xs font-bold text-lime-300">
            <Images className="h-4 w-4" />
            Batch Editor
          </button>
          <button onClick={() => setIsOpen(false)} className="rounded-md p-1 text-white/35 hover:bg-white/10 hover:text-white" title="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 no-scrollbar">
          <div className="space-y-3">
            {batchProjects.map((item, index) => {
              const isActive = item._id === project?._id;
              const thumb = item.thumbnailUrl || item.currentImageUrl || item.originalImageUrl;

              return (
                <div key={item._id} className={`group relative overflow-hidden rounded-lg border ${isActive ? "border-lime-400" : "border-white/10 hover:border-white/30"} bg-white/[0.03]`}>
                  <button onClick={() => handleSwitchProject(item._id)} className="block h-[86px] w-full bg-black text-left">
                    {thumb ? (
                      <img src={thumb} alt={item.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-white/25"><Images className="h-6 w-6" /></div>
                    )}
                  </button>
                  <div className="absolute left-2 top-2 rounded-md bg-black/60 px-1.5 py-1 text-[10px] font-bold text-white/80 backdrop-blur">
                    {index + 1}
                  </div>
                  <button
                    onClick={() => removeFromBatch(item._id)}
                    disabled={isActive}
                    className="absolute right-2 top-2 rounded-md bg-black/55 p-1 text-white/55 opacity-0 backdrop-blur transition hover:bg-red-500 hover:text-white group-hover:opacity-100 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-black/55"
                    title={isActive ? "Cannot delete currently open project" : "Remove from batch list"}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2 pb-1.5 pt-6">
                    <p className="truncate text-[10px] font-semibold text-white/80">{item.title}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {activeCount === 0 && (
            <div className="mt-8 rounded-xl border border-dashed border-white/12 p-4 text-center text-xs text-white/35">
              Upload images to start a batch.
            </div>
          )}

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingToCloud || isCreatingDB}
            className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] text-sm font-semibold text-white/75 transition hover:bg-white/[0.1] disabled:opacity-50"
          >
            {isUploadingToCloud || isCreatingDB ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            
            {isUploadingToCloud 
              ? `Uploading (${uploadProgress.done}/${uploadProgress.total})` 
              : isCreatingDB 
              ? "Creating..." 
              : "Upload Image"}
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => handleFiles(event.target.files)}
          />
        </div>

        <div className="border-t border-white/10 p-3">
          <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-lime-400" style={{ width: `${Math.min(activeCount, 50) * 2}%` }} />
          </div>
          <div className="flex items-center justify-between text-xs text-white/55">
            <span>{activeCount}/50</span>
            <button onClick={clearBatch} className="flex items-center gap-1.5 transition hover:text-white">
              <Trash2 className="h-3.5 w-3.5" />
              Clear All
            </button>
          </div>
        </div>
      </aside>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        restrictedTool="batch_editor"
        reason="Free plan includes 3 total projects. Upgrade to Pro for unlimited projects and faster batch editing."
      />
    </>
  );
}
