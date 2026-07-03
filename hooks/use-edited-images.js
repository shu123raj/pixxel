import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const STORAGE_KEY = "pixxel_edited_images";

export function useEditedImages() {
  const [editedImages, setEditedImages] = useState({});

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setEditedImages(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load edited images:", error);
    }
  }, []);

  // Save edited image
  const saveEditedImage = useCallback((projectId, imageData) => {
    try {
      setEditedImages((prev) => {
        const updated = {
          ...prev,
          [projectId]: {
            imageUrl: imageData.imageUrl,
            canvasData: imageData.canvasData,
            timestamp: Date.now(),
            title: imageData.title || `Edited - ${new Date().toLocaleDateString()}`,
          },
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
      toast.success("Image saved to demo!");
    } catch (error) {
      console.error("Failed to save edited image:", error);
      toast.error("Failed to save image");
    }
  }, []);

  // Get edited image
  const getEditedImage = useCallback((projectId) => {
    return editedImages[projectId] || null;
  }, [editedImages]);

  // Clear edited image
  const clearEditedImage = useCallback((projectId) => {
    setEditedImages((prev) => {
      const updated = { ...prev };
      delete updated[projectId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Clear all edited images
  const clearAllEditedImages = useCallback(() => {
    setEditedImages({});
    localStorage.removeItem(STORAGE_KEY);
    toast.success("All edited images cleared");
  }, []);

  return {
    editedImages,
    saveEditedImage,
    getEditedImage,
    clearEditedImage,
    clearAllEditedImages,
  };
}
