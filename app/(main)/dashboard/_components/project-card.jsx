import { Edit, Trash2, ArrowRight, Clock, Image as ImageIcon, FolderInput } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { motion } from "framer-motion";

// Yahan props mein `onMove` add kiya gaya hai
export default function ProjectCard({ project, folderMap, onEdit, onMove }) {
  const { mutate: deleteProject, isLoading } = useConvexMutation(
    api.projects.deleteProject
  );

  const lastUpdated = formatDistanceToNow(new Date(project.updatedAt), {
    addSuffix: true,
  });

  const displayImage = project.currentImageUrl || project.imageUrl || project.thumbnailUrl;

  const getStatusBadge = () => {
    const hoursSinceUpdate = (Date.now() - new Date(project.updatedAt)) / (1000 * 60 * 60);
    
    if (hoursSinceUpdate < 1) {
      return { label: "Just now", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" };
    } else if (hoursSinceUpdate < 24) {
      return { label: "Recently edited", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" };
    } else if (hoursSinceUpdate < 168) {
      return { label: "This week", color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" };
    } else {
      return { label: "Archived", color: "bg-slate-500/20 text-slate-300 border-slate-500/30" };
    }
  };

  const statusBadge = getStatusBadge();
  const folderName = project.folderId ? folderMap?.[project.folderId]?.name : null;

  const handleDelete = async (e) => {
    e.stopPropagation(); // Event propagation rokne ke liye
    const confirmed = confirm(
      `Are you sure you want to delete "${project.title}"? This action cannot be undone.`
    );

    if (confirmed) {
      try {
        await deleteProject({ projectId: project._id });
        toast.success("Project deleted successfully");
      } catch (error) {
        console.error("Error deleting project:", error);
        toast.error("Failed to delete project. Please try again.");
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="group relative overflow-hidden border border-white/10 bg-slate-800/30 backdrop-blur-sm transition-all duration-500 hover:border-cyan-500/30 hover:shadow-[0_20px_40px_rgba(34,211,238,0.1)] hover:bg-slate-800/60 py-0 h-full">
        {/* Animated Background Gradient on Hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/10" />

        {/* Thumbnail Container */}
        <div className="relative aspect-video bg-gradient-to-br from-slate-700 to-slate-800 overflow-hidden">
          
          {displayImage ? (
            <>
              <img
                src={displayImage}
                alt={project.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 group-hover:brightness-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </>
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 border-b border-white/5">
              <div className="text-center flex flex-col items-center">
                <ImageIcon className="h-8 sm:h-10 w-8 sm:w-10 text-slate-500 mb-2 opacity-50" />
                <p className="text-xs font-medium text-slate-500">No preview</p>
              </div>
            </div>
          )}

          {/* Status Badge - Top Left */}
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
            <Badge className={`border ${statusBadge.color} text-[10px] sm:text-xs font-semibold px-2 py-1 shadow-lg`}>
              {statusBadge.label}
            </Badge>
          </div>

          {/* Dimensions Badge - Top Right */}
          {(project.width && project.height) && (
            <div className="absolute top-2 sm:top-3 right-2 sm:right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Badge className="bg-slate-950/80 text-cyan-300 text-[10px] sm:text-xs font-semibold px-2 py-1 border border-cyan-500/30 shadow-lg backdrop-blur-sm">
                {project.width} × {project.height}
              </Badge>
            </div>
          )}

          {/* Hover Actions */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-2 sm:gap-3"
          >
            {/* 1. Edit Button */}
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="w-32 sm:w-40 flex items-center justify-center gap-2 rounded-lg sm:rounded-xl border border-white/20 bg-white/10 py-2 text-xs sm:text-sm font-semibold text-white backdrop-blur-md transition-all duration-300 hover:bg-white/20 hover:border-white/40 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:-translate-y-0.5 active:scale-95"
            >
              <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Edit</span>
            </button>

            {/* 2. Move to Folder Button (NEW) */}
            <button
              onClick={(e) => { e.stopPropagation(); onMove(); }}
              className="w-32 sm:w-40 flex items-center justify-center gap-2 rounded-lg sm:rounded-xl border border-cyan-500/30 bg-cyan-500/10 py-2 text-xs sm:text-sm font-semibold text-cyan-300 backdrop-blur-md transition-all duration-300 hover:bg-cyan-500/20 hover:border-cyan-500/50 hover:text-cyan-200 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:-translate-y-0.5 active:scale-95"
            >
              <FolderInput className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Move</span>
            </button>

            {/* 3. Delete Button */}
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="w-32 sm:w-40 flex items-center justify-center gap-2 rounded-lg sm:rounded-xl border border-rose-500/30 bg-rose-500/10 py-2 text-xs sm:text-sm font-semibold text-rose-300 backdrop-blur-md transition-all duration-300 hover:bg-rose-500/20 hover:border-rose-500/50 hover:text-rose-200 hover:shadow-[0_0_15px_rgba(244,63,94,0.2)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Delete</span>
            </button>
          </motion.div>
        </div>

        {/* Project Info Section */}
        <CardContent className="relative z-10 space-y-2 sm:space-y-3 p-3 sm:p-4 sm:pt-4 pb-4 sm:pb-5">
          <div className="space-y-1">
            <h3 className="font-bold text-white text-sm leading-snug line-clamp-2 group-hover:text-cyan-200 transition-colors duration-300">
              {project.title}
            </h3>
            {folderName && (
              <div className="inline-flex rounded-full border border-white/10 bg-slate-900/80 px-2 py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.1em] text-cyan-400">
                {folderName}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] sm:text-xs text-white/60 gap-2">
            <div className="flex items-center gap-1 font-medium truncate">
              <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">{lastUpdated}</span>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0 flex-shrink-0">
              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-cyan-400" />
            </div>
          </div>

          {/* Hover Action Indicator (Bottom Line) */}
          <motion.div 
            initial={{ width: 0 }}
            whileHover={{ width: "100%" }}
            className="absolute bottom-0 left-0 h-[2px] sm:h-[3px] bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 transition-all duration-500 ease-out" 
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}