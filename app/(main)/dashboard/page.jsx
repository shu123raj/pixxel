"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image"; 
import { useRouter } from "next/navigation";
import { useAuth, useUser, UserButton } from "@clerk/nextjs"; 
import { useSearchParams } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

import { 
  Search, Bell, Plus, Folder, Edit3, Cloud, Clock, UploadCloud, 
  MoreVertical, Home, Edit2, LayoutTemplate, Layers, Palette, 
  HardDrive, Sparkles, Wand2, Maximize, ChevronDown, ChevronRight,
  Image as ImageIcon, Trash2, ArrowUpDown, Eye, Zap, LayoutGrid, X, 
  Menu, FolderInput, CheckCircle2, Loader2, GalleryVerticalEnd,
  MapPin, User, AtSign, Mail, Crown, Calendar, Pencil 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConvexMutation, useConvexQuery } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { NewProjectModal } from "./_components/new-project-modal";
import { ProjectGrid } from "./_components/project-grid";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// ==========================================
// 1. REAL-TIME NUMBER ANIMATION HOOK
// ==========================================
const useCounter = (end, duration = 2000, isFloat = false) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = null;
    let animationFrame;

    const animate = (time) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = easeOutQuart * end;

      setCount(isFloat ? currentCount : Math.floor(currentCount));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, isFloat]);

  if (isFloat) return count.toFixed(1);
  return count.toLocaleString();
};

// ==========================================
// 2. MAIN UNIFIED COMPONENT
// ==========================================
export default function DashboardPage() {
  const { user } = useUser();
  const { has } = useAuth();
  const router = useRouter();
  
  // Navigation & UI States 
  const [currentView, setCurrentView] = useState("dashboard"); 
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Notification States
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Edit Profile States
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", username: "", jobTitle: "" }); 
  
  // 🚀 OPTIMISTIC UPDATE STATE (For Instant Profile Change)
  const [optimisticProfile, setOptimisticProfile] = useState({ name: null, username: null, jobTitle: null });

  // Old Code States
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [projectToMove, setProjectToMove] = useState(null);
  

  // =============================================================
  // DATABASE FETCHING (Convex)
  // =============================================================
  const { data: projects, isLoading } = useConvexQuery(api.projects.getUserProjects);
  const { data: folders, isLoading: foldersLoading } = useConvexQuery(api.folders.getUserFolders);
  
  const dbUserQuery = useConvexQuery(api.users.getCurrentUser);
  const dbUser = dbUserQuery.data;

  // 📍 AUTOMATIC LOCATION FETCHING (From Auth History)
  const authHistoryQuery = useConvexQuery(api.users.getAuthHistory) || {};
  const authHistory = Array.isArray(authHistoryQuery.data) ? authHistoryQuery.data : [];
  const automaticLocation = authHistory.find((event) => event.location && event.location !== "unset" && event.location.trim() !== "")?.location;
  
  // ⚡ INSTANT PROFILE VARIABLES
  const userName = optimisticProfile.name || dbUser?.name || user?.firstName || "User";
  const userJobTitle = optimisticProfile.jobTitle || dbUser?.jobTitle || "Photo Editor & Retoucher";
  const displayUsername = optimisticProfile.username 
    ? `@${optimisticProfile.username}` 
    : (dbUser?.firstName ? `@${dbUser.firstName}` : `@${userName.toLowerCase().replace(/\s+/g, '')}`);
    
  // Agar authHistory me location mili, toh wo dikhao, warna database/fallback
  const displayLocation = automaticLocation || (dbUser?.city && dbUser?.country ? `${dbUser.city}, ${dbUser.country}` : "Location not captured yet");

  const userImage = dbUser?.imageUrl || user?.imageUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop";
  const isProPlan = dbUser?.plan === "pro" || has?.({ plan: "pro" }) || false;
  const userPlan = isProPlan ? "Pro Plan" : "Free Plan";
  
  const memberSinceDate = dbUser?.createdAt 
    ? new Date(dbUser.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : "Recently";

  // -------------------------------------------------------------
  // NOTIFICATION LOGIC
  // -------------------------------------------------------------
  const notifQuery = useConvexQuery(api.notifications.getUserNotifications) || {};
  const notifications = notifQuery.data || []; 
  
  const readMutation = useConvexMutation(api.notifications.markAllAsRead) || {};
  const markAsRead = readMutation.mutate;

  const unreadCount = notifications.filter((n) => n && n.isRead === false).length;

  const handleBellClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const willBeOpen = !isNotifOpen;
    setIsNotifOpen(willBeOpen);
    
    if (willBeOpen && unreadCount > 0 && markAsRead) {
      setTimeout(() => {
        markAsRead();
      }, 1500);
    }
  };

  // -------------------------------------------------------------
  // MUTATIONS (Convex)
  // -------------------------------------------------------------
  const { mutate: createFolder, isLoading: isCreatingFolder } = useConvexMutation(api.folders.createFolder);
  const { mutate: deleteFolder, isLoading: isDeletingFolder } = useConvexMutation(api.folders.deleteFolder);
  const { mutate: updateProject, isLoading: isMovingProject } = useConvexMutation(api.projects.updateProject);
  const { mutate: deleteProject } = useConvexMutation(api.projects.deleteProject);
  const { mutate: createProject, isLoading: isCreatingBlankProject } = useConvexMutation(api.projects.create);
  
  // Profile Update Mutation
  const { mutate: updateProfile, isLoading: isUpdatingProfile } = useConvexMutation(api.users.updateUserProfile);
  const { mutate: updatePlan } = useConvexMutation(api.users.updateUserPlan);

  useEffect(() => {
    if (!dbUser || dbUser.plan === "pro" || !has?.({ plan: "pro" })) return;

    updatePlan({ plan: "pro" }).catch((error) => {
      console.error("Failed to sync Pro plan:", error);
    });
  }, [dbUser?._id, dbUser?.plan, has, updatePlan]);

  // Handle Profile Update Submission (Instant UI Update)
  const handleUpdateProfile = async () => {
    if (!editForm.name.trim()) return toast.error("Name cannot be empty");
    
    // 1. Instant UI Update
    setOptimisticProfile({
      name: editForm.name,
      username: editForm.username.replace('@', ''),
      jobTitle: editForm.jobTitle
    });
    setShowEditProfile(false);
    toast.success("Profile updated successfully!");

    try {
      // 2. Background Database Update
      await updateProfile({
        name: editForm.name,
        firstName: editForm.username.replace('@', ''),
        jobTitle: editForm.jobTitle
      });
    } catch (error) {
      toast.error("Failed to sync profile with database");
      // Agar fail ho jaye toh purana data wapas le aao
      setOptimisticProfile({ name: null, username: null, jobTitle: null });
    }
  };

  // Open Profile Edit Modal with Current Data
  const openEditProfile = () => {
    setEditForm({
      name: userName,
      username: displayUsername.replace('@', ''),
      jobTitle: userJobTitle
    });
    setShowEditProfile(true);
  };

  // Data Processing
  const projectCount = projects?.length ?? 0;
  const folderCount = folders?.length ?? 0;
  
  const latestProject = projects?.length
    ? projects.reduce((latest, project) =>
        new Date(project.updatedAt) > new Date(latest.updatedAt) ? project : latest,
        projects[0]
      )
    : null;

  const folderMap = folders?.reduce((map, folder) => {
    map[folder._id] = folder;
    return map;
  }, {}) ?? {};

  const filteredProjects = useMemo(() => {
    let filtered = selectedFolderId ? projects?.filter((project) => project.folderId === selectedFolderId) : projects;
    if (!filtered) return [];
    if (searchQuery.trim()) {
      filtered = filtered.filter((project) => project.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    const sorted = [...filtered];
    if (sortBy === "recent") sorted.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    else if (sortBy === "name") sorted.sort((a, b) => a.title.localeCompare(b.title));
    else if (sortBy === "oldest") sorted.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));
    return sorted;
  }, [projects, selectedFolderId, searchQuery, sortBy]);

  const statCards = [
    { label: "Total Projects", value: projectCount, desc: "Active design workspaces", color: "from-cyan-400 to-blue-500" },
    { label: "Latest Update", value: latestProject ? "Just now" : "None", desc: latestProject ? `Updated ${latestProject.title}` : "No recent activity", color: "from-violet-400 to-fuchsia-500" },
    { label: "Collections", value: folderCount, desc: "Organized folders", color: "from-emerald-400 to-teal-500" },
    { label: "Active Designs", value: projectCount, desc: "Ready for editing", color: "from-pink-400 to-rose-500" }
  ];

  const handleMoveProject = async (targetFolderId) => {
    if (!projectToMove) return;
    try {
      await updateProject({
        projectId: projectToMove._id,
        folderId: targetFolderId === "none" ? undefined : targetFolderId,
        canvasState: projectToMove.canvasState
      });
      toast.success(`Project moved successfully!`);
      setProjectToMove(null);
    } catch (error) {
      toast.error("Failed to move project");
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await deleteProject({ projectId });
      toast.success("Project deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete project");
    }
  };

  const openBlankEditor = async () => {
    try {
      const projectId = await createProject({
        title: `Blank Canvas ${new Date().toLocaleDateString("en-GB")}`,
        width: 1080,
        height: 1080,
        canvasState: {
          version: "7.4.0",
          objects: [],
          background: "#ffffff",
        },
      });

      toast.success("Blank editor opened");
      router.push(`/editor/${projectId}`);
    } catch (error) {
      console.error("Failed to open blank editor:", error);
    }
  };

  const animatedTotalProjects = useCounter(projectCount, 2000); 
  const animatedImagesEdited = useCounter(1342, 2500);
  const animatedStorageUsed = useCounter(7.4, 2000, true);
  const animatedTimeSaved = useCounter(28.5, 2500, true);

  const recentProjectsDashboard = useMemo(() => {
    if (!projects) return [];
    return [...projects]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 6);
  }, [projects]);

  const handleViewChange = (view) => {
    setCurrentView(view);
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-[#06080c] text-slate-200 font-sans overflow-hidden relative">
      
      {(openMenuId || isNotifOpen) && (
        <div className="fixed inset-0 z-[50]" onClick={() => { setOpenMenuId(null); setIsNotifOpen(false); }} />
      )}

      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-[90] bg-black/65 backdrop-blur-sm lg:hidden" onClick={() => setIsMobileSidebarOpen(false)} />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside className={`fixed inset-y-0 left-0 z-[100] w-[280px] max-w-[82vw] bg-[#0a0c10] border-r border-white/5 flex flex-col justify-between h-full overflow-y-auto lg:overflow-y-visible no-scrollbar transition-transform duration-300 lg:static lg:w-[260px] lg:max-w-none lg:translate-x-0 shrink-0 ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-5 shrink-0">
          <div className="block w-[250px] h-auto object-contain -mt-6 mb-0">
            <div className="relative overflow-visible -ml-1 -mt-14 mb-0">
              <Link href="/" className="block">
                <Image
                  src="/logo-text.png"
                  alt="Pixxel Logo"
                  width={0}
                  height={0}
                  sizes="50vw"
                  priority
                  className="w-[140px] h-auto object-contain"
                />
              </Link>
            </div>
          </div>

          <nav className="space-y-1.5 -mt-8">
            <button 
              onClick={() => handleViewChange("dashboard")} 
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                currentView === "dashboard" ? "bg-[#141824] text-cyan-400 border border-cyan-500/20 font-medium" : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Home className="w-4 h-4" /> Dashboard
            </button>
            <button
              onClick={openBlankEditor}
              disabled={isCreatingBlankProject}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all disabled:opacity-60 disabled:cursor-wait"
            >
              {isCreatingBlankProject ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit2 className="w-4 h-4" />}
              AI Editor
            </button>
            
            <button 
              onClick={() => handleViewChange("projects")} 
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                currentView === "projects" ? "bg-[#141824] text-cyan-400 border border-cyan-500/20 font-medium" : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Folder className="w-4 h-4" /> Projects
            </button>
            
            <Link href="/templates" onClick={() => setIsMobileSidebarOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all">
              <LayoutTemplate className="w-4 h-4" /> Templates
            </Link>
            
          </nav>

          <div className="mt-8">
            <h4 className="px-3 text-xs font-semibold text-white/30 tracking-widest uppercase mb-3">Favorites</h4>
            <nav className="space-y-1.5">
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-white/50 hover:text-white hover:bg-white/5 text-sm transition-all">
                <Sparkles className="w-4 h-4" /> Portrait Enhancer
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-white/50 hover:text-white hover:bg-white/5 text-sm transition-all">
                <Wand2 className="w-4 h-4" /> Background Remover
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-white/50 hover:text-white hover:bg-white/5 text-sm transition-all">
                <Maximize className="w-4 h-4" /> Face Retouch
              </button>
            </nav>
          </div>
        </div>

        {/* ========================================================= */}
        {/* BOTTOM SECTION: Storage on top, Profile at absolute bottom */}
        {/* ========================================================= */}
        <div className="p-5 space-y-4 mt-auto shrink-0">
          
          {/* STORAGE & PLAN UPGRADE BOX (Ab upar aa gaya) */}
          <div className="bg-[#12151c] border border-white/5 rounded-2xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-white/50 font-medium">Storage</span>
              <span className="text-[10px] text-white/40">7.4 GB / 20 GB</span>
            </div>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mb-4">
              <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full" style={{ width: "37%" }}></div>
            </div>
            <button className={`w-full py-2 rounded-lg text-xs font-bold tracking-wide transition-all ${
              isProPlan
                ? "bg-gradient-to-r from-amber-400 to-cyan-300 text-slate-950 shadow-[0_0_18px_rgba(34,211,238,0.22)]"
                : "bg-gradient-to-r from-[#9d4edd] to-[#c77dff] hover:opacity-90 text-white shadow-[0_0_15px_rgba(157,78,221,0.2)]"
            }`}>
              {isProPlan ? "Pro Active" : "Upgrade Plan"}
            </button>
          </div>

          {/* PROFILE BOX (Ab sabse aakhiri me hai jaisa screenshot me hai) */}
          <div 
            onClick={() => handleViewChange("profile")}
            className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer border transition-all ${
              currentView === 'profile'
                ? 'bg-[#141824] border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]'
                : isProPlan
                ? 'bg-gradient-to-r from-amber-400/10 via-cyan-400/10 to-white/[0.04] hover:from-amber-400/15 hover:via-cyan-400/15 border-amber-300/20'
                : 'bg-[#12151c] hover:bg-white/10 border-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={userImage}
                  alt="User"
                  className={`w-9 h-9 rounded-full object-cover ${
                    isProPlan
                      ? "border-2 border-amber-300 shadow-[0_0_14px_rgba(251,191,36,0.28)]"
                      : "border border-white/10"
                  }`}
                />
                {isProPlan && (
                  <span className="absolute -right-1 -bottom-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-cyan-300 text-slate-950 ring-2 ring-[#0a0c10]">
                    <Crown className="h-2.5 w-2.5" />
                  </span>
                )}
              </div>
              <div>
                <h4 className={`text-sm font-medium ${currentView === 'profile' ? 'text-cyan-400' : 'text-white'}`}>{userName}</h4>
                <p className={`mt-0.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] ${
                  isProPlan
                    ? "bg-amber-300/15 text-amber-200 border border-amber-300/20"
                    : "text-white/45"
                }`}>
                  {isProPlan && <Crown className="h-2.5 w-2.5" />}
                  {userPlan}
                </p>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 ${currentView === 'profile' ? 'text-cyan-400' : 'text-white/40'}`} />
          </div>

        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 flex min-w-0 flex-col h-screen overflow-y-auto bg-[#0a0c10] no-scrollbar relative">
        
        <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
          <div className="absolute top-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-cyan-600/20 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-violet-600/20 blur-[120px]" />
        </div>

        <header className="min-h-16 flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8 shrink-0 relative z-[60] border-b border-white/5 bg-[#0a0c10]/85 backdrop-blur-md sticky top-0">
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
              aria-label="Open dashboard menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="font-black text-lg tracking-tight text-white">Pixxel <span className="text-cyan-300">OS</span></span>
          </div>

          <div className="relative order-3 w-full md:order-none md:block md:w-80 lg:w-96">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input 
              type="text" 
              placeholder="Search anything..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#12151c] border border-white/5 rounded-xl pl-10 pr-12 py-2 text-sm text-white focus:outline-none focus:border-white/20 transition-colors"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-white/30 bg-white/5 px-1.5 py-0.5 rounded border border-white/10">⌘K</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 ml-auto">
            <Link href="/pricing">
            <button className="flex items-center gap-2 text-xs font-medium bg-[#12151c] border border-white/10 px-3 sm:px-4 py-2 rounded-xl hover:bg-white/5 transition-all">
              <Sparkles className="w-3.5 h-3.5 text-white/60" /> <span className="hidden xs:inline">Upgrade Plan</span>
            </button>
            </Link>
            
            <div className="h-6 w-px bg-white/10 mx-2 hidden md:block"></div>
            
            <div className="relative">
              <button 
                onClick={handleBellClick}
                className="relative p-2.5 text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/5"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,1)]"></span>
                )}
              </button>

              <AnimatePresence>
                {isNotifOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    style={{ position: 'fixed', top: '70px', right: 'min(16px, 4vw)', zIndex: 999999 }}
                    className="w-[calc(100vw-32px)] max-w-[380px] bg-slate-900 border border-white/10 rounded-2xl shadow-[0_30px_100px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-4 py-3 border-b border-white/10 bg-slate-800/80 flex items-center justify-between shrink-0">
                      <h3 className="text-sm font-bold text-white tracking-wide">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full font-medium border border-cyan-500/30">
                          {unreadCount} New
                        </span>
                      )}
                    </div>

                    <div className="max-h-[350px] overflow-y-auto no-scrollbar flex-1 bg-gradient-to-b from-transparent to-black/20">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-10 text-center flex flex-col items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                            <Bell className="w-5 h-5 text-white/20" />
                          </div>
                          <p className="text-sm font-medium text-white/60">All caught up!</p>
                          <p className="text-xs text-white/30 mt-1">Check back later for new alerts.</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div 
                            key={notif._id} 
                            className={`px-4 py-3.5 border-b border-white/5 transition-all cursor-default ${!notif.isRead ? 'bg-cyan-500/[0.08] hover:bg-cyan-500/[0.12]' : 'hover:bg-white/[0.04]'}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-1.5 w-2 h-2 rounded-full bg-cyan-400 shrink-0 shadow-[0_0_8px_rgba(34,211,238,0.8)] transition-opacity duration-500" style={{ opacity: !notif.isRead ? 1 : 0 }} />
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-semibold text-white mb-1 tracking-wide">{notif.title}</h4>
                                <p className="text-[11px] text-white/60 leading-relaxed line-clamp-2">{notif.message}</p>
                                <span className="text-[9px] text-white/30 font-mono mt-2 block uppercase tracking-wider">
                                  {formatDistanceToNow(notif.createdAt)} ago
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative z-[99999] ml-2">
              <UserButton 
                afterSignOutUrl="/" 
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8 rounded-full border border-white/10 hover:scale-105 transition-transform"
                  }
                }}
              />
            </div>
          </div>
        </header>

        {/* ========================================================
            VIEW 3: MY PROFILE 
        ======================================================== */}
        {currentView === "profile" && (
          <div className="p-4 sm:p-6 lg:p-8 max-w-[1000px] mx-auto w-full space-y-5 sm:space-y-6 relative z-10 animate-in fade-in duration-500">
            
            <div className="mb-8">
              <div className="flex items-center text-sm text-white/40 mb-2">
                <button onClick={() => setCurrentView("dashboard")} className="hover:text-cyan-400 transition-colors">Dashboard</button>
                <ChevronRight className="w-3.5 h-3.5 mx-2" />
                <span className="text-white/80">Profile</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">My Profile</h1>
            </div>

            <div className="bg-[#11131a] border border-white/5 rounded-3xl p-5 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none"></div>
              
              <div className="flex w-full flex-col sm:flex-row items-center sm:items-center gap-5 sm:gap-8 text-center sm:text-left relative z-10">
                <div className="relative">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-[3px] border-[#1a1d24] shadow-2xl">
                    <img src={userImage} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                    <h2 className="text-xl sm:text-2xl font-bold text-white break-words">{userName}</h2>
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-md border tracking-wide ${
                      isProPlan
                        ? "bg-amber-300/15 text-amber-200 border-amber-300/25 shadow-[0_0_16px_rgba(251,191,36,0.12)]"
                        : "bg-[#1a1c29] text-[#818cf8] border-[#818cf8]/20"
                    }`}>
                      {isProPlan && <Crown className="h-3 w-3" />}
                      {userPlan.toUpperCase()}
                    </span>
                  </div>
                  
                  <p className="text-slate-300 text-sm font-medium">{userJobTitle}</p>
                  
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 text-white/40 text-xs">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{displayLocation}</span> {/* AUTOMATIC LOCATION DISPLAY */}
                  </div>
                </div>
              </div>

              <button 
                onClick={openEditProfile}
                className="relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 transition-all w-full md:w-auto justify-center"
              >
                <Edit2 className="w-4 h-4" /> Edit Profile
              </button>
            </div>

            <div className="bg-[#11131a] border border-white/5 rounded-3xl p-4 sm:p-8 shadow-xl overflow-hidden">
              <h3 className="text-lg font-bold text-white mb-6">Account Information</h3>
              
              <div className="space-y-1">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-4 hover:bg-white/[0.02] rounded-2xl transition-colors cursor-default group">
                  <div className="flex items-center gap-4 sm:w-1/3">
                    <User className="w-4 h-4 text-white/40" />
                    <span className="text-sm text-white/50">Full Name</span>
                  </div>
                  <div className="flex items-center justify-between sm:w-2/3 sm:pl-4 min-w-0">
                    <span className="text-sm text-white/90 font-medium break-words">{userName}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-4 hover:bg-white/[0.02] rounded-2xl transition-colors cursor-default group">
                  <div className="flex items-center gap-4 sm:w-1/3">
                    <AtSign className="w-4 h-4 text-white/40" />
                    <span className="text-sm text-white/50">Username</span>
                  </div>
                  <div className="flex items-center justify-between sm:w-2/3 sm:pl-4 min-w-0">
                    <span className="text-sm text-white/90 font-medium">{displayUsername}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-4 hover:bg-white/[0.02] rounded-2xl transition-colors cursor-default group">
                  <div className="flex items-center gap-4 sm:w-1/3">
                    <Mail className="w-4 h-4 text-white/40" />
                    <span className="text-sm text-white/50">Email</span>
                  </div>
                  <div className="flex items-center justify-between sm:w-2/3 sm:pl-4 min-w-0">
                    <span className="text-sm text-white/90 font-medium break-all">{dbUser?.email || user?.primaryEmailAddress?.emailAddress || "Not provided"}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-4 hover:bg-white/[0.02] rounded-2xl transition-colors cursor-default group">
                  <div className="flex items-center gap-4 sm:w-1/3">
                    <Crown className="w-4 h-4 text-white/40" />
                    <span className="text-sm text-white/50">Plan</span>
                  </div>
                  <div className="flex items-center justify-between sm:w-2/3 sm:pl-4 min-w-0">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                      isProPlan
                        ? "bg-amber-300/15 text-amber-200 border border-amber-300/20"
                        : "bg-white/5 text-white/70 border border-white/5"
                    }`}>
                      {isProPlan && <Crown className="h-3 w-3" />}
                      {userPlan}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-4 hover:bg-white/[0.02] rounded-2xl transition-colors cursor-default group">
                  <div className="flex items-center gap-4 sm:w-1/3">
                    <Calendar className="w-4 h-4 text-white/40" />
                    <span className="text-sm text-white/50">Member Since</span>
                  </div>
                  <div className="flex items-center justify-between sm:w-2/3 sm:pl-4 min-w-0">
                    <span className="text-sm text-white/90 font-medium">{memberSinceDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            VIEW 1: NEW DASHBOARD (Screenshot UI)
        ======================================================== */}
        {currentView === "dashboard" && (
          <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto w-full space-y-5 sm:space-y-6 relative z-10 animate-in fade-in duration-500">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Welcome back, {userName} 👋</h1>
                <p className="text-sm text-white/50">Edit, enhance and create stunning images with the power of AI.</p>
              </div>
              <button onClick={() => setShowNewProjectModal(true)} className="flex w-full sm:w-auto items-center justify-center gap-2 bg-gradient-to-r from-cyan-400 to-purple-500 hover:opacity-90 text-white px-5 py-2.5 rounded-xl font-medium transition-all active:scale-95">
                <Plus className="w-2 h-2" /> Create New Project
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-[#11131a] border border-white/5 rounded-2xl p-5 flex items-center justify-between relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div>
                  <p className="text-white/50 text-xs font-medium mb-1">Total Projects</p>
                  <h3 className="text-3xl font-bold text-white mb-2">{animatedTotalProjects}</h3>
                  <p className="text-[10px] text-emerald-400 flex items-center gap-1">↑ 12% <span className="text-white/30">from last month</span></p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <Folder className="w-5 h-5 text-purple-400" />
                </div>
              </div>

              <div className="bg-[#11131a] border border-white/5 rounded-2xl p-5 flex items-center justify-between relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div>
                  <p className="text-white/50 text-xs font-medium mb-1">Images Edited</p>
                  <h3 className="text-3xl font-bold text-white mb-2">{animatedImagesEdited}</h3>
                  <p className="text-[10px] text-emerald-400 flex items-center gap-1">↑ 18% <span className="text-white/30">from last month</span></p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                  <Edit3 className="w-5 h-5 text-pink-400" />
                </div>
              </div>

              <div className="bg-[#11131a] border border-white/5 rounded-2xl p-5 flex items-center justify-between relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div>
                  <p className="text-white/50 text-xs font-medium mb-1">Storage Used</p>
                  <h3 className="text-3xl font-bold text-white mb-2">{animatedStorageUsed} <span className="text-lg text-white/50">GB</span></h3>
                  <p className="text-[10px] text-emerald-400 flex items-center gap-1">↑ 8% <span className="text-white/30">from last month</span></p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Cloud className="w-5 h-5 text-blue-400" />
                </div>
              </div>

              <div className="bg-[#11131a] border border-white/5 rounded-2xl p-5 flex items-center justify-between relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div>
                  <p className="text-white/50 text-xs font-medium mb-1">Time Saved</p>
                  <h3 className="text-3xl font-bold text-white mb-2">{animatedTimeSaved} <span className="text-lg text-white/50">hrs</span></h3>
                  <p className="text-[10px] text-emerald-400 flex items-center gap-1">↑ 22% <span className="text-white/30">from last month</span></p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
            </div>

            <div 
              onClick={() => setShowNewProjectModal(true)}
              className="w-full bg-[#0d1017] border-2 border-dashed border-white/10 hover:border-cyan-500/50 rounded-3xl py-6 sm:py-8 px-4 sm:px-10 flex flex-col items-center justify-center text-center transition-colors cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-b from-[#1c2230] to-[#12151c] border border-white/5 flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform">
                <UploadCloud className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-white mb-1">Upload New Project</h3>
              <p className="text-white/40 text-xs mb-4">Drag and drop your image here, or click to browse</p>
              <button className="flex items-center gap-2 bg-gradient-to-r from-[#00c6ff] to-[#0072ff] text-white px-5 py-2 rounded-xl text-sm font-medium transition-all group-hover:shadow-[0_0_15px_rgba(0,198,255,0.4)]">
                <ImageIcon className="w-4 h-4" /> Browse Files
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Recent Projects</h3>
                <button onClick={() => setCurrentView("projects")} className="text-sm text-white/50 hover:text-white flex items-center gap-1 transition-colors">
                  View All <span className="text-lg">›</span>
                </button>
              </div>
              
              {isLoading ? (
                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
                  {Array(6).fill(0).map((_, i) => (
                    <div key={i} className="h-40 bg-white/5 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : recentProjectsDashboard.length > 0 ? (
                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 pb-4">
                  {recentProjectsDashboard.map((project) => (
                    <div 
                      key={project._id} 
                      onClick={() => router.push(`/editor/${project._id}`)}
                      className="relative bg-[#11131a] border border-white/5 rounded-2xl p-2.5 hover:bg-[#161a24] hover:border-white/10 transition-all cursor-pointer group"
                    >
                      <div className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-3 relative bg-slate-900 flex items-center justify-center">
                        {project.thumbnailUrl || project.currentImageUrl || project.originalImageUrl ? (
                          <img src={project.thumbnailUrl || project.currentImageUrl || project.originalImageUrl} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-white/10" />
                        )}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                      <div className="flex justify-between items-center px-1">
                        <div className="overflow-hidden">
                          <h4 className="text-xs font-semibold text-white/90 truncate pr-2">{project.title}</h4>
                          <p className="text-[10px] text-white/40 mt-0.5 truncate">Edited {formatDistanceToNow(new Date(project.updatedAt))} ago</p>
                        </div>
                        
                        <button 
                          onClick={(e) => { e.stopPropagation(); setOpenMenuId(project._id); }}
                          className="p-1 rounded-md text-white/30 hover:text-white hover:bg-white/10 transition-colors z-20"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>

                      {openMenuId === project._id && (
                        <div 
                          className="absolute right-2 bottom-10 w-36 bg-slate-800 border border-white/10 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-200"
                          onClick={(e) => e.stopPropagation()} 
                        >
                          <button 
                            onClick={() => router.push(`/editor/${project._id}`)} 
                            className="w-full text-left px-3 py-2 text-xs text-white hover:bg-white/10 flex items-center gap-2 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Edit Project
                          </button>
                          <button 
                            onClick={() => { setProjectToMove(project); setOpenMenuId(null); }} 
                            className="w-full text-left px-3 py-2 text-xs text-white hover:bg-white/10 flex items-center gap-2 transition-colors"
                          >
                            <FolderInput className="w-3.5 h-3.5" /> Move to Folder
                          </button>
                          <div className="h-px w-full bg-white/10 my-1"></div>
                          <button 
                            onClick={() => { handleDeleteProject(project._id); setOpenMenuId(null); }} 
                            className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-400/10 flex items-center gap-2 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-white/5 border border-white/10 rounded-2xl">
                  <p className="text-white/40 text-sm">No recent projects found. Upload an image to get started!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            VIEW 2: PROJECTS MANAGER (Old Dashboard Code)
        ======================================================== */}
        {currentView === "projects" && (
          <div className="p-6 md:p-8 relative z-10 animate-in fade-in duration-500">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-900/40 p-8 lg:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-2xl mb-8"
            >
              <div className="pointer-events-none absolute -right-20 top-0 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl animate-[pulse_6s_ease-in-out_infinite]" />
              
              <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-medium text-cyan-300 mb-4">
                    <Sparkles className="h-4 w-4" /> Premium Workspace
                  </div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 pb-2 leading-tight">
                    Manage your creativity with AI precision.
                  </h1>
                  <p className="mt-2 text-sm sm:text-base text-slate-400 leading-relaxed font-light">
                    Stay organized, launch new designs faster, and elevate your editing workflow.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full lg:w-[35rem]">
                  {statCards.map((stat, i) => (
                    <div key={i} className="group relative rounded-2xl border border-white/10 bg-slate-950/50 p-4 backdrop-blur-md overflow-hidden hover:border-white/20 hover:bg-slate-900/80 transition-all">
                      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.color} opacity-0 blur-2xl group-hover:opacity-20 rounded-full transition-opacity`} />
                      <p className={`text-[10px] font-bold uppercase tracking-widest bg-clip-text text-transparent bg-gradient-to-r ${stat.color}`}>{stat.label}</p>
                      <p className="mt-2 text-2xl font-bold text-white">{stat.value}</p>
                      <p className="mt-1 text-xs text-slate-400 truncate">{stat.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr] xl:grid-cols-[280px_1fr]">
              <motion.div 
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                className={`${mobileFiltersOpen ? "block" : "hidden"} lg:block sticky top-24 h-fit rounded-3xl border border-white/10 bg-slate-900/30 p-5 backdrop-blur-xl shadow-2xl flex flex-col z-20`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                      <Folder className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Collections</h3>
                      <p className="text-xs text-slate-400">{folderCount} Folders</p>
                    </div>
                  </div>
                  <button onClick={() => setMobileFiltersOpen(false)} className="lg:hidden p-1 hover:bg-white/10 rounded">
                    <X className="h-5 w-5 text-slate-400" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar max-h-[40vh]">
                  <div
                    onClick={() => { setSelectedFolderId(""); setMobileFiltersOpen(false); }}
                    className={`group relative flex items-center justify-between cursor-pointer rounded-xl border px-4 py-3 transition-all duration-300 text-base ${
                      selectedFolderId === ""
                        ? "border-cyan-500/50 bg-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                        : "border-white/5 bg-slate-950/50 hover:border-white/20 hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <GalleryVerticalEnd className={`h-4 w-4 shrink-0 ${selectedFolderId === "" ? "text-cyan-400" : "text-slate-400"}`} />
                      <p className={`font-medium truncate ${selectedFolderId === "" ? "text-cyan-100" : "text-slate-300"}`}>All Projects</p>
                    </div>
                    <div className="text-[10px] font-bold text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded-md border border-cyan-500/30">
                      {projectCount}
                    </div>
                  </div>

                  {foldersLoading ? (
                    Array(3).fill(0).map((_, i) => <div key={i} className="h-10 w-full bg-slate-800/50 animate-pulse rounded-xl mb-2" />)
                  ) : folders?.length > 0 ? (
                    folders.map((folder) => (
                      <div
                        key={folder._id}
                        onClick={() => { setSelectedFolderId(folder._id); setMobileFiltersOpen(false); }}
                        className={`group relative flex items-center justify-between cursor-pointer rounded-xl border px-4 py-3 transition-all duration-300 text-base ${
                          selectedFolderId === folder._id
                            ? "border-cyan-500/50 bg-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                            : "border-white/5 bg-slate-950/50 hover:border-white/20 hover:bg-slate-800/50"
                        }`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <Folder className={`h-4 w-4 shrink-0 ${selectedFolderId === folder._id ? "text-cyan-400" : "text-slate-400"}`} />
                          <p className={`font-medium truncate ${selectedFolderId === folder._id ? "text-cyan-100" : "text-slate-300"}`}>{folder.name}</p>
                        </div>
                        <button
                          className="text-rose-400 hover:bg-rose-500/20 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-all scale-90 hover:scale-100 rounded flex items-center justify-center"
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (!confirm(`Delete folder ${folder.name}?`)) return;
                            await deleteFolder({ folderId: folder._id });
                            if (selectedFolderId === folder._id) setSelectedFolderId("");
                          }}
                          disabled={isDeletingFolder}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))
                  ) : null}
                </div>

                <div className="mt-6 pt-5 border-t border-white/10 space-y-3">
                  <Input
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    placeholder="New folder name..."
                    className="text-sm bg-slate-950/50 border-white/10 text-white focus:border-cyan-500/50 focus:ring-cyan-500/20 rounded-xl h-10"
                  />
                  <Button
                    onClick={async () => {
                      if (!folderName.trim()) return;
                      await createFolder({ name: folderName.trim() });
                      setFolderName("");
                      toast.success("Folder created!");
                    }}
                    disabled={isCreatingFolder || !folderName.trim()}
                    className="w-full bg-white text-slate-900 hover:bg-slate-200 rounded-xl font-semibold shadow-lg transition-transform active:scale-95"
                  >
                    {isCreatingFolder ? "Creating..." : "Create Folder"}
                  </Button>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex flex-col gap-6 mb-8">
                  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div>
                      <h2 className="text-3xl font-extrabold text-white mb-2 flex items-center gap-2">
                        <LayoutGrid className="text-cyan-400 w-8 h-8" /> 
                        {selectedFolderId ? folderMap[selectedFolderId]?.name : "All Projects"}
                      </h2>
                      <p className="text-slate-400">Design, edit, and manage your AI generations.</p>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)} className="lg:hidden p-3 bg-slate-800 hover:bg-slate-700 text-white border border-white/10 rounded-xl flex items-center gap-2">
                        <Menu className="h-4 w-4" /> Filters
                      </button>
                      <Button onClick={() => setShowNewProjectModal(true)} className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-xl gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] px-4">
                        <Plus className="h-5 w-5" /> New
                      </Button>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-900/40 border border-white/5 backdrop-blur-md flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center gap-1 p-1 bg-slate-950/50 rounded-xl border border-white/5 overflow-x-auto w-full">
                      {["recent", "name", "oldest"].map((option) => (
                        <button key={option} onClick={() => setSortBy(option)} className={`capitalize flex-1 px-5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${sortBy === option ? "bg-slate-800 text-cyan-400 shadow-md" : "text-slate-400 hover:text-white hover:bg-slate-800/50"}`}>
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {Array(6).fill(0).map((_, i) => (
                      <div key={i} className="rounded-2xl bg-slate-900/50 border border-white/5 p-4 animate-pulse h-64 flex flex-col">
                        <div className="w-full h-40 bg-slate-800/50 rounded-xl mb-4" />
                        <div className="h-4 w-3/4 bg-slate-800/50 rounded-md mb-2" />
                      </div>
                    ))}
                  </div>
                ) : filteredProjects && filteredProjects.length > 0 ? (
                  <ProjectGrid 
                    projects={filteredProjects} 
                    folderMap={folderMap} 
                    onMoveProject={(project) => setProjectToMove(project)} 
                  />
                ) : (
                  <EmptyState onCreateProject={() => setShowNewProjectModal(true)} hasFilters={searchQuery !== "" || selectedFolderId !== ""} />
                )}
              </motion.div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================
          MODALS (Shared)
      ======================================================== */}
      
      <NewProjectModal isOpen={showNewProjectModal} onClose={() => setShowNewProjectModal(false)} />

      <Dialog open={!!projectToMove} onOpenChange={() => setProjectToMove(null)}>
        <DialogContent className="max-w-md bg-[#0a0c10]/95 backdrop-blur-3xl border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-3xl p-0 overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-cyan-400 to-blue-500"></div>
          <div className="p-6">
            <DialogHeader className="mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/30">
                  <FolderInput className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-white tracking-tight">Move to Folder</DialogTitle>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">Organize <span className="text-cyan-300">"{projectToMove?.title}"</span></p>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-3 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2 pb-2">
              <button
                onClick={() => handleMoveProject("none")}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
                  !projectToMove?.folderId 
                    ? "bg-cyan-500/10 border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.1)]" 
                    : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  <LayoutGrid className={`w-5 h-5 ${!projectToMove?.folderId ? "text-cyan-400" : "text-slate-400"}`} />
                  <span className={`font-medium ${!projectToMove?.folderId ? "text-cyan-100" : "text-slate-300"}`}>No Folder (Main Dashboard)</span>
                </div>
                {!projectToMove?.folderId && <CheckCircle2 className="w-5 h-5 text-cyan-400" />}
              </button>

              {folders?.map((folder) => {
                const isCurrent = projectToMove?.folderId === folder._id;
                return (
                  <button
                    key={folder._id}
                    onClick={() => handleMoveProject(folder._id)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 group ${
                      isCurrent 
                        ? "bg-cyan-500/10 border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.1)]" 
                        : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Folder className={`w-5 h-5 ${isCurrent ? "text-cyan-400" : "text-slate-400 group-hover:text-cyan-300 transition-colors"}`} />
                      <span className={`font-medium ${isCurrent ? "text-cyan-100" : "text-slate-300"}`}>{folder.name}</span>
                    </div>
                    {isCurrent ? (
                      <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-cyan-400 transition-colors" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ========================================================
          EDIT PROFILE MODAL
      ======================================================== */}
      <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
        <DialogContent className="max-w-md bg-[#0a0c10]/95 backdrop-blur-3xl border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-3xl p-0 overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-[#22d3ee] to-[#a855f7]"></div>
          <div className="p-6">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-xl font-bold text-white tracking-tight">Edit Profile</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/50 mb-1.5 block font-medium">Full Name</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-white/30"><User className="w-4 h-4"/></span>
                  <Input 
                    value={editForm.name} 
                    onChange={e => setEditForm({...editForm, name: e.target.value})} 
                    placeholder="Enter your full name"
                    className="bg-white/5 border-white/10 text-white focus:border-cyan-500/50 pl-9" 
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-white/50 mb-1.5 block font-medium">Username</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-white/30"><AtSign className="w-4 h-4"/></span>
                  <Input 
                    value={editForm.username} 
                    onChange={e => setEditForm({...editForm, username: e.target.value})} 
                    placeholder="username"
                    className="bg-white/5 border-white/10 text-white focus:border-cyan-500/50 pl-9" 
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-white/50 mb-1.5 block font-medium">Profile Prompt / Bio</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-white/30"><Pencil className="w-4 h-4"/></span>
                  <Input 
                    value={editForm.jobTitle} 
                    onChange={e => setEditForm({...editForm, jobTitle: e.target.value})} 
                    placeholder="e.g. Photo Editor & Retoucher"
                    className="bg-white/5 border-white/10 text-white focus:border-cyan-500/50 pl-9" 
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="mt-8 gap-3 sm:gap-0">
              <Button onClick={() => setShowEditProfile(false)} variant="ghost" className="text-white/50 hover:text-white hover:bg-white/5">
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateProfile} 
                disabled={isUpdatingProfile} 
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-lg"
              >
                {isUpdatingProfile ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : null}
                Save Changes
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}

// ==========================================
// EMPTY STATE COMPONENT
// ==========================================
function EmptyState({ onCreateProject, hasFilters }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-24 px-4 text-center border border-white/5 border-dashed rounded-3xl bg-slate-900/20 backdrop-blur-sm mt-4">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-cyan-500/20 blur-2xl rounded-full animate-pulse" />
        <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center shadow-2xl">
          <ImageIcon className="h-10 w-10 text-cyan-400" />
        </div>
      </div>
      <h3 className="text-2xl font-bold text-white mb-3">{hasFilters ? "No matches found" : "Your canvas is empty"}</h3>
      <p className="text-base text-slate-400 mb-8 max-w-sm mx-auto">
        {hasFilters ? "Try adjusting your search terms or folder filters." : "Start your creative journey by uploading an image or creating a blank canvas."}
      </p>
      {!hasFilters && (
        <Button onClick={onCreateProject} className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl px-8 h-12 gap-2 shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all hover:-translate-y-1">
          <Sparkles className="h-5 w-5" /> Start Creating Now
        </Button>
      )}
    </motion.div>
  );
}