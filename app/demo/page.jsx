"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Eye, Download, Heart, Share2, Sparkles, Zap, Layers, Loader2, X, MessageCircle, Send } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useEditedImages } from "@/hooks/use-edited-images";
import { toast } from "sonner"; 
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const filterOptions = [
  { key: "all", label: "All" },
  { key: "portrait", label: "Portrait" },
  { key: "background", label: "Background" },
  { key: "color", label: "Color" },
  { key: "landscape", label: "Landscape" },
  { key: "product", label: "Product" },
  { key: "wedding", label: "Wedding" },
];

const galleryStats = [
  { label: "Premium Edits", value: "120+", icon: Sparkles, color: "from-cyan-400 to-blue-500" },
  { label: "Trusted Users", value: "8.4K", icon: Heart, color: "from-pink-400 to-rose-500" },
  { label: "Average Rating", value: "4.9/5", icon: Zap, color: "from-amber-400 to-orange-500" },
  { label: "Studio Results", value: "100%", icon: Layers, color: "from-purple-400 to-indigo-500" },
];

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

export default function DemoGalleryPage() {
  const { user } = useUser();
  const [selectedImage, setSelectedImage] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Likes Modal State
  const [likesModalData, setLikesModalData] = useState(null); 
  const [commentText, setCommentText] = useState("");

  const { editedImages } = useEditedImages();

  // CONVEX API MUTATIONS & QUERIES
  const sendNotification = useMutation(api.notifications?.sendNotification) || null;
  const toggleLikeMut = useMutation(api.interactions.toggleLike);
  const addCommentMut = useMutation(api.interactions.addComment);
  const interactions = useQuery(api.interactions.getLikesAndComments) || { likes: [], comments: [] };
  const projects = useQuery(api.projects.getAllProjects) || [];

  const mockProjects = [
    {
      _id: "demo-1", userId: "mock_user", title: "Portrait Enhancement", description: "A premium portrait workflow with skin retouching, color harmony, and polished lighting.",
      thumbnailUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=225&fit=crop&crop=face", currentImageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1200&h=800&fit=crop&crop=face",
      width: 1920, height: 1080, updatedAt: Date.now() - 86400000, tags: ["portrait", "beauty"], likes: 45, views: 120, comments: 12
    },
    {
      _id: "demo-2", userId: "mock_user", title: "Background Removal", description: "A polished product shot with a clean white background and refined edge detail.",
      thumbnailUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=225&fit=crop", currentImageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=800&fit=crop",
      width: 1280, height: 720, updatedAt: Date.now() - 172800000, tags: ["background", "product"], likes: 32, views: 89, comments: 4
    },
    {
      _id: "demo-3", userId: "mock_user", title: "Color Correction", description: "Precision color grading and mood enhancement for vibrant editorial images.",
      thumbnailUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=225&fit=crop", currentImageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop",
      width: 1600, height: 900, updatedAt: Date.now() - 259200000, tags: ["color", "retouch"], likes: 28, views: 76, comments: 8
    },
  ];

  const displayProjects = useMemo(() => {
    const baseProjects = projects.length > 0 ? projects : mockProjects;
    
    const merged = baseProjects.map((project) => {
      const editedVersion = editedImages[project._id];
      if (editedVersion) {
        return {
          ...project,
          currentImageUrl: editedVersion.imageUrl,
          thumbnailUrl: editedVersion.imageUrl,
          updatedAt: editedVersion.timestamp,
          isEdited: true,
        };
      }
      return project;
    });

    const newEditedProjects = Object.entries(editedImages).map(([projectId, edited]) => {
      if (!baseProjects.find(p => p._id === projectId)) {
        return {
          _id: projectId,
          userId: user?.id || "anonymous",
          title: edited.title || "Your Edited Image",
          description: "Recently edited in Pixxel Studio",
          currentImageUrl: edited.imageUrl,
          thumbnailUrl: edited.imageUrl,
          updatedAt: edited.timestamp,
          tags: ["edited"],
          likes: 0,
          views: 0,
          comments: 0,
          isEdited: true,
          isNew: true,
        };
      }
      return null;
    }).filter(Boolean);

    return [...merged, ...newEditedProjects].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 10);
  }, [projects, editedImages, user]);

  const filteredProjects = useMemo(() => {
    return displayProjects.filter((project) => {
      const matchesFilter = filter === "all" || project.tags?.includes(filter);
      const matchesSearch = project.title.toLowerCase().includes(search.toLowerCase()) ||
        project.description?.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [displayProjects, filter, search]);

  const handleImageClick = (project) => setSelectedImage(project);
  const closeModal = () => {
    setSelectedImage(null);
    setCommentText(""); 
  };

  // ==========================================
  // REAL-TIME ACTIONS (Like & Comment)
  // ==========================================
  
  const handleLike = async (e, project) => {
    e.stopPropagation();
    if (!user) return toast.error("Please login to like photos!");

    try {
      const result = await toggleLikeMut({
        projectId: project._id,
        userId: user.id,
        userName: user.firstName || user.fullName || "User",
        userImage: user.imageUrl
      });
      
      if (result.liked) {
        toast.success("Photo Liked! ❤️");
        // Notification Bhejna
        if (project.userId && project.userId !== "mock_user" && sendNotification) {
          sendNotification({
            userId: project.userId,
            title: "New Like! ❤️",
            message: `${user.firstName || "Someone"} liked your edit "${project.title}".`,
            link: `/editor/${project._id}`
          });
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handlePostComment = async () => {
    if (!commentText.trim() || !selectedImage || !user) return toast.error("Login required");

    try {
      await addCommentMut({
        projectId: selectedImage._id,
        userId: user.id,
        userName: user.firstName || user.fullName || "User",
        userImage: user.imageUrl,
        text: commentText
      });

      toast.success("Comment posted successfully! 💬");
      setCommentText(""); // Clear input
      
      // Notification Bhejna
      if (selectedImage.userId && selectedImage.userId !== "mock_user" && sendNotification) {
        sendNotification({
          userId: selectedImage.userId,
          title: "New Comment! 💬",
          message: `${user.firstName || "Someone"} commented: "${commentText}" on your edit "${selectedImage.title}".`,
          link: `/editor/${selectedImage._id}`
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Get project specific stats from Database
  const getProjectStats = (projectId, baseLikes, baseComments) => {
    const dbLikes = interactions.likes.filter(l => l.projectId === projectId);
    const dbComments = interactions.comments.filter(c => c.projectId === projectId);
    const isLikedByMe = dbLikes.some(l => l.userId === user?.id);
    
    return {
      totalLikes: dbLikes.length + (baseLikes || 0),
      totalComments: dbComments.length + (baseComments || 0),
      isLiked: isLikedByMe,
      likersList: dbLikes
    };
  };

  const openLikesModal = (e, likersList) => {
    e.stopPropagation();
    if (likersList.length === 0) return toast.info("No likes yet. Be the first!");
    setLikesModalData(likersList);
  };

  const handleDownload = async (url, filename) => {
    try {
      setIsDownloading(true);
      toast.loading("Preparing download...", { id: "downloading" });
      const response = await fetch(url, { mode: 'cors' });
      if (!response.ok) throw new Error("Network response was not ok");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${filename.toLowerCase().replace(/\s+/g, '-')}-pixxel.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success("Download complete!", { id: "downloading" });
    } catch (error) {
      window.open(url, "_blank");
      toast.success("Image opened securely!", { id: "downloading" });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white pt-32 pb-16 relative overflow-hidden selection:bg-cyan-500/30">
      
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-cyan-600/20 blur-[150px] animate-pulse" />
        <div className="absolute top-1/2 -right-40 w-[600px] h-[600px] rounded-full bg-violet-600/20 blur-[150px] animate-[pulse_4s_ease-in-out_infinite]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        
        {/* HERO SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="relative overflow-visible rounded-[2.5rem] border border-white/10 bg-slate-900/40 p-8 sm:p-12 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-2xl mb-8"
        >
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[150%] w-[150%] bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.1)_0%,transparent_50%)] animate-[pulse_8s_ease-in-out_infinite]" />
          
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center relative z-10">
            <div className="order-2 lg:order-1 text-center lg:text-left">
              <motion.span 
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
              >
                <Sparkles className="w-4 h-4" /> Premium Showcase
              </motion.span>
              <h1 className="mt-6 text-5xl font-black leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 sm:text-6xl pb-2">
                Discover AI-powered image edits built for studios.
              </h1>
              <p className="mt-6 max-w-xl mx-auto lg:mx-0 text-lg text-slate-400 font-light leading-relaxed">
                Browse curated image transformations that highlight the full power of Pixxel's AI editing suite. Experience seamless editing across all your devices.
              </p>

              <div className="mt-10 flex flex-wrap justify-center lg:justify-start gap-4">
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-2xl px-8 h-14 font-bold shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all hover:scale-105 w-full sm:w-auto">
                  Explore the gallery
                </Button>
                <Link href="/" className="w-full sm:w-auto">
                  <Button className="w-full bg-slate-900/50 hover:bg-slate-800 backdrop-blur-md border border-white/10 text-white rounded-2xl px-8 h-14 transition-all hover:scale-105">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                  </Button>
                </Link>
              </div>
            </div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.8 }}
              className="order-1 lg:order-2 w-full relative flex justify-center lg:justify-end items-center mt-6 lg:mt-0 perspective-1000"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-blue-500/20 blur-[80px] rounded-full" />
              <div className="relative w-[90%] sm:w-[500px] xl:w-[600px] aspect-video bg-[#0a0c10] rounded-xl sm:rounded-2xl border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.6)] overflow-hidden z-10">
                <div className="h-6 sm:h-8 bg-slate-900 border-b border-white/5 flex items-center px-3 sm:px-4 gap-1.5 sm:gap-2 absolute top-0 w-full z-20">
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-rose-500/80" />
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500/80" />
                  <div className="flex-1 text-center pr-8">
                    <div className="inline-block px-4 py-1 bg-white/5 rounded-full text-[10px] md:text-xs font-medium text-white/50 border border-white/5">
                      demo.pixxel-studio.com
                    </div>
                  </div>
                </div>
                <div className="absolute top-6 sm:top-8 inset-x-0 bottom-0 bg-slate-800">
                  <video src="/desktop-demo.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover opacity-90 aspect-ratio" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
                </div>
              </div>

              <motion.div 
                initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8, type: "spring", stiffness: 100 }}
                className="absolute -bottom-8 -left-4 sm:-bottom-12 sm:-left-8 lg:-bottom-10 lg:-left-4 xl:-left-12 w-[110px] sm:w-[140px] xl:w-[160px] aspect-[9/19] bg-black border-[4px] sm:border-[6px] border-slate-800 rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden shadow-[20px_20px_60px_rgba(0,0,0,0.8)] z-20"
              >
                <div className="absolute top-0 inset-x-0 h-4 sm:h-5 bg-slate-800 rounded-b-xl w-[50%] mx-auto z-30 flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-white/20 ml-6" />
                </div>
                <video src="/mobile-demo.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover opacity-95" />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="mt-8 grid gap-4 grid-cols-2 lg:grid-cols-4">
          {galleryStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div key={stat.label} variants={itemVariants} className="group rounded-3xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-md hover:border-cyan-500/30 hover:bg-slate-800/80 transition-all duration-300">
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.color} text-white shadow-lg shadow-black/20 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-4 text-3xl font-bold text-white tracking-tight">{stat.value}</p>
                <p className="mt-1 text-xs font-medium text-slate-400 uppercase tracking-widest">{stat.label}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* FILTER & SEARCH BAR */}
        <div className="mt-20 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between mb-10">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-400 mb-3">Premium Features</p>
            <h2 className="text-4xl font-bold text-white">Curated inspiration</h2>
          </div>
          <div className="flex flex-wrap items-center gap-4 bg-slate-900/40 p-2 rounded-2xl border border-white/5 backdrop-blur-md">
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((option) => (
                <button
                  key={option.key}
                  onClick={() => setFilter(option.key)}
                  className={`capitalize px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    filter === option.key 
                      ? "bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]" 
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* =====================================
            GALLERY GRID (LIVE DATABASE STATS)
        ====================================== */}
        <motion.div layout className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          <AnimatePresence>
            {filteredProjects.map((project) => {
              const { totalLikes, totalComments, isLiked, likersList } = getProjectStats(project._id, project.likes, project.comments);

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  key={project._id}
                >
                  <Card
                    className="group relative overflow-hidden border border-white/5 bg-slate-900/40 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1.5 hover:border-cyan-500/30 hover:shadow-[0_15px_30px_rgba(6,182,212,0.1)] cursor-pointer rounded-2xl"
                    onClick={() => handleImageClick(project)}
                  >
                    <div className="relative overflow-hidden bg-slate-950 aspect-square">
                      <img
                        src={project.thumbnailUrl || project.currentImageUrl}
                        alt={project.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex flex-col justify-between p-3">
                        <div className="flex justify-between items-start">
                          {project.isEdited ? (
                            <div className="bg-cyan-500/90 text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-lg">
                              {project.isNew ? "✨ New" : "📝 Edit"}
                            </div>
                          ) : <div/>}

                          <button 
                            onClick={(e) => handleLike(e, project)} 
                            className={`p-2 rounded-full backdrop-blur-md transition-transform hover:scale-110 shadow-lg ${isLiked ? 'bg-rose-500/20 text-rose-500' : 'bg-black/50 text-white/80 hover:text-white hover:bg-black/80'}`}
                          >
                            <Heart className="w-5 h-5" fill={isLiked ? "currentColor" : "none"} />
                          </button>
                        </div>

                        <div className="self-center translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                          <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md text-white px-5 py-2.5 rounded-full font-medium border border-white/20 text-sm shadow-xl hover:bg-white/20">
                            <Eye className="w-4 h-4" /> View
                          </div>
                        </div>
                        <div/>
                      </div>
                    </div>
                    
                    <CardContent className="px-4 py-3.5 bg-gradient-to-b from-slate-900/50 to-slate-950/50 border-t border-white/5">
                      <h3 className="text-sm font-bold text-white truncate">{project.title}</h3>
                      <div className="mt-2.5 flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center gap-4">
                          
                          {/* LIKES WITH CLICKABLE NUMBER */}
                          <div className={`flex items-center gap-1.5 font-medium ${isLiked ? 'text-rose-400' : ''}`}>
                            <Heart className="w-4 h-4 text-rose-500" fill={isLiked ? "currentColor" : "none"} /> 
                            <span 
                              onClick={(e) => openLikesModal(e, likersList)} 
                              className="cursor-pointer hover:underline hover:text-white transition-colors"
                            >
                              {totalLikes}
                            </span>
                          </div>

                          {/* COMMENTS */}
                          <div className={`flex items-center gap-1.5 font-medium ${totalComments > 0 ? 'text-cyan-400' : ''}`}>
                            <MessageCircle className="w-4 h-4 text-cyan-500" fill={totalComments > 0 ? "currentColor" : "none"} /> 
                            {totalComments}
                          </div>

                        </div>
                        <span className="text-[10px]">{formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true }).replace('about ', '')}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* =====================================
          PREMIUM LIKES LIST POPUP (MODAL)
      ====================================== */}
      <Dialog open={!!likesModalData} onOpenChange={() => setLikesModalData(null)}>
        <DialogContent className="sm:max-w-xs bg-slate-900 border border-white/10 rounded-3xl shadow-2xl p-0 overflow-hidden">
          <div className="p-5 border-b border-white/5 flex items-center gap-3 bg-slate-800/50">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <DialogTitle className="text-lg font-bold text-white tracking-wide">Liked by</DialogTitle>
          </div>
          
          <div className="max-h-[50vh] overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {likesModalData?.map((like) => (
              <div key={like._id} className="flex items-center gap-4 bg-white/[0.02] p-3 rounded-2xl border border-white/5 hover:bg-white/[0.05] transition-colors">
                <img src={like.userImage} alt={like.userName} className="w-10 h-10 rounded-full object-cover border border-white/10 shadow-sm" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white">{like.userName}</span>
                  <span className="text-[10px] text-white/40">{formatDistanceToNow(like.timestamp, { addSuffix: true })}</span>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* =====================================
          PREMIUM LIGHTBOX / MODAL (WITH COMMENTS)
      ====================================== */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#030712]/95 p-2 sm:p-4 backdrop-blur-xl" 
            onClick={closeModal}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-6xl max-h-[95vh] overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a0c10] shadow-[0_0_80px_rgba(6,182,212,0.15)] flex flex-col lg:flex-row" 
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeModal}
                className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 border border-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-110"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col lg:flex-row h-full max-h-[95vh] overflow-hidden w-full">
                
                {/* Image Area */}
                <div className="bg-[#030508] p-4 lg:p-8 flex items-center justify-center relative group lg:w-[65%] min-h-[40vh] lg:min-h-full">
                  <img
                    src={selectedImage.currentImageUrl || selectedImage.thumbnailUrl}
                    alt={selectedImage.title}
                    className="max-h-[85vh] w-auto max-w-full rounded-xl object-contain drop-shadow-2xl"
                  />
                </div>

                {/* Details & Interaction Area */}
                <div className="flex flex-col bg-slate-900/50 border-t lg:border-l lg:border-t-0 border-white/5 lg:w-[35%] overflow-hidden">
                  
                  {/* Stats Object for the Modal */}
                  {(() => {
                    const stats = getProjectStats(selectedImage._id, selectedImage.likes, selectedImage.comments);
                    return (
                      <>
                        <div className="p-6 border-b border-white/5 shrink-0">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400 mb-3">
                            <Sparkles className="w-3 h-3" /> Pixxel Edit
                          </span>
                          <h2 className="text-2xl font-bold text-white">{selectedImage.title}</h2>
                          <p className="mt-2 text-sm text-slate-400 font-light line-clamp-2">{selectedImage.description}</p>
                          
                          <div className="flex items-center gap-4 mt-6">
                            <button 
                              onClick={(e) => handleLike(e, selectedImage)}
                              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all border shadow-md hover:scale-105 ${stats.isLiked ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
                            >
                              <Heart className="w-5 h-5" fill={stats.isLiked ? "currentColor" : "none"} /> 
                              <span className="text-sm font-semibold">{stats.isLiked ? "Liked" : "Like"}</span>
                            </button>
                            
                            <Button onClick={() => handleDownload(selectedImage.currentImageUrl || selectedImage.thumbnailUrl, selectedImage.title)} disabled={isDownloading} className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl h-[42px] flex-1">
                              {isDownloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5 mr-2" />} Download
                            </Button>
                          </div>

                          <div className="mt-4 pt-3 flex items-center gap-4 text-xs font-medium text-slate-400 border-t border-white/5">
                            <span 
                              onClick={(e) => openLikesModal(e, stats.likersList)} 
                              className="cursor-pointer hover:text-white hover:underline flex items-center gap-1.5"
                            >
                              <Heart className="w-3.5 h-3.5" /> {stats.totalLikes} Likes
                            </span>
                            <span className="flex items-center gap-1.5">
                              <MessageCircle className="w-3.5 h-3.5" /> {stats.totalComments} Comments
                            </span>
                          </div>
                        </div>
                        
                        {/* Live Comments Section */}
                        <div className="flex-1 p-6 flex flex-col overflow-hidden bg-gradient-to-b from-transparent to-black/20">
                          
                          {/* Chat History from Database */}
                          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                            {interactions.comments.filter(c => c.projectId === selectedImage._id).map((c) => (
                              <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} key={c._id} className="flex gap-3 bg-white/5 p-3.5 rounded-2xl border border-white/5 backdrop-blur-sm">
                                <img src={c.userImage} className="w-8 h-8 rounded-full object-cover shrink-0" />
                                <div>
                                  <div className="flex items-baseline gap-2 mb-1">
                                    <span className="text-xs font-bold text-cyan-300">{c.userName}</span>
                                    <span className="text-[9px] text-white/40">{formatDistanceToNow(c.createdAt, { addSuffix: true })}</span>
                                  </div>
                                  <p className="text-sm text-white/80 leading-relaxed">{c.text}</p>
                                </div>
                              </motion.div>
                            ))}

                            {/* Empty State */}
                            {stats.totalComments === 0 && (
                              <div className="h-full flex flex-col justify-center items-center text-center opacity-50 py-8">
                                 <MessageCircle className="w-10 h-10 mb-3" />
                                 <p className="text-xs">Be the first to comment on this edit!</p>
                              </div>
                            )}
                          </div>

                          {/* Add Comment Input */}
                          <div className="mt-4 pt-4 border-t border-white/5 shrink-0 relative">
                            <Input 
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              placeholder="Write a public comment..." 
                              className="bg-slate-950/80 border-white/10 pr-12 focus:border-cyan-500/50 h-12 rounded-xl text-sm placeholder:text-white/30"
                              onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                            />
                            <button 
                              onClick={handlePostComment}
                              disabled={!commentText.trim()}
                              className="absolute right-3 top-[calc(50%+8px)] -translate-y-1/2 text-cyan-400 hover:text-cyan-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Send className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}