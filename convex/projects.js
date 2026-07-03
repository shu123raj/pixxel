import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";


const FREE_PROJECT_LIMIT = 3;

async function safeDeleteStorage(ctx, storageId, label = "file") {
  if (!storageId) return;

  try {
    await ctx.storage.delete(storageId);
  } catch (error) {
    console.error(`Error deleting old ${label}:`, error);
  }
}

async function resolveProjectUrls(ctx, project) {
  const currentImageUrl = project.currentImageStorageId
    ? await ctx.storage.getUrl(project.currentImageStorageId)
    : project.currentImageUrl;

  const thumbnailUrl = project.thumbnailStorageId
    ? await ctx.storage.getUrl(project.thumbnailStorageId)
    : project.thumbnailUrl;

  const originalImageUrl = project.originalImageStorageId
    ? await ctx.storage.getUrl(project.originalImageStorageId)
    : project.originalImageUrl;

  const canvasStateUrl = project.canvasStateStorageId
    ? await ctx.storage.getUrl(project.canvasStateStorageId)
    : null;

  return {
    ...project,
    currentImageUrl,
    thumbnailUrl,
    originalImageUrl,
    canvasStateUrl,
    canvasStateStorageUrl: canvasStateUrl,
  };
}

const isDataUrl = (value) => {
  return typeof value === "string" && value.startsWith("data:");
};

const assertNotDataUrl = (value, fieldName, storageFieldName) => {
  if (isDataUrl(value)) {
    throw new Error(
      `${fieldName} is a base64 data URL. Upload it to Convex storage first, then pass ${storageFieldName}.`
    );
  }
};

export const generateUploadUrl = mutation(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");

  return await ctx.storage.generateUploadUrl();
});

export const getCanvasStateUploadUrl = mutation(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");

  return await ctx.storage.generateUploadUrl();
});

export const registerCanvasStateStorage = mutation({
  args: {
    projectId: v.id("projects"),
    canvasStateStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.runQuery(internal.users.getCurrentUser);
    if (!user) throw new Error("User not found");

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");
    if (project.userId !== user._id) throw new Error("Access denied");

    const oldCanvasStateStorageId = project.canvasStateStorageId;

    await ctx.db.patch(args.projectId, {
      canvasStateStorageId: args.canvasStateStorageId,
      canvasState: undefined,
      updatedAt: Date.now(),
    });

    await ctx.db.patch(user._id, { lastActiveAt: Date.now() });

    if (
      oldCanvasStateStorageId &&
      oldCanvasStateStorageId !== args.canvasStateStorageId
    ) {
      await safeDeleteStorage(ctx, oldCanvasStateStorageId, "canvas state");
    }

    return { success: true, storageId: args.canvasStateStorageId };
  },
});

export const getUserProjects = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.runQuery(internal.users.getCurrentUser);
    if (!user) return [];

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_user_updated", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    return await Promise.all(projects.map((p) => resolveProjectUrls(ctx, p)));
  },
});

export const getProjectState = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const getCanvasState = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const getFileUrl = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    originalImageUrl: v.optional(v.string()),
    originalImageStorageId: v.optional(v.id("_storage")),
    currentImageUrl: v.optional(v.string()),
    currentImageStorageId: v.optional(v.id("_storage")),
    thumbnailUrl: v.optional(v.string()),
    thumbnailStorageId: v.optional(v.id("_storage")),
    width: v.number(),
    height: v.number(),
    canvasState: v.optional(v.any()),
    canvasStateStorageId: v.optional(v.id("_storage")),
    folderId: v.optional(v.id("folders")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.runQuery(internal.users.getCurrentUser);
    if (!user) throw new Error("User not found");

    const existingProjectCount = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    if (user.plan !== "pro" && existingProjectCount.length >= FREE_PROJECT_LIMIT) {
      throw new Error("Free plan is limited to 3 projects. Upgrade to Pro for unlimited projects.");
    }

    if (args.folderId) {
      const folder = await ctx.db.get(args.folderId);
      if (!folder || folder.userId !== user._id) {
        throw new Error("Invalid folder selection");
      }
    }

    if (args.originalImageUrl) {
      assertNotDataUrl(args.originalImageUrl, "originalImageUrl", "originalImageStorageId");
    }

    if (args.currentImageUrl) {
      assertNotDataUrl(args.currentImageUrl, "currentImageUrl", "currentImageStorageId");
    }

    if (args.thumbnailUrl) {
      assertNotDataUrl(args.thumbnailUrl, "thumbnailUrl", "thumbnailStorageId");
    }

    const projectId = await ctx.db.insert("projects", {
      title: args.title,
      userId: user._id,
      originalImageUrl: args.originalImageStorageId ? undefined : args.originalImageUrl,
      originalImageStorageId: args.originalImageStorageId,
      currentImageUrl: args.currentImageStorageId ? undefined : args.currentImageUrl,
      currentImageStorageId: args.currentImageStorageId,
      thumbnailUrl: args.thumbnailStorageId ? undefined : args.thumbnailUrl,
      thumbnailStorageId: args.thumbnailStorageId,
      width: args.width,
      height: args.height,
      canvasState: args.canvasStateStorageId ? undefined : args.canvasState,
      canvasStateStorageId: args.canvasStateStorageId,
      folderId: args.folderId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    await ctx.db.patch(user._id, {
      projectsUsed: (user.projectsUsed || 0) + 1,
      lastActiveAt: Date.now(),
    });

    return projectId;
  },
});

export const getAllProjects = query({
  handler: async (ctx) => {
    const projects = await ctx.db.query("projects").order("desc").take(50);

    const projectsWithUrls = await Promise.all(
      projects.map((p) => resolveProjectUrls(ctx, p))
    );

    return projectsWithUrls.filter(
      (p) => p.thumbnailUrl !== undefined || p.thumbnailStorageId !== undefined
    );
  },
});

export const deleteProject = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.runQuery(internal.users.getCurrentUser);
    if (!user) throw new Error("User not found");

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");
    if (project.userId !== user._id) throw new Error("Access denied");

    if (project.originalImageStorageId) {
      await safeDeleteStorage(ctx, project.originalImageStorageId, "original image");
    }

    if (project.currentImageStorageId) {
      await safeDeleteStorage(ctx, project.currentImageStorageId, "current image");
    }

    if (project.thumbnailStorageId) {
      await safeDeleteStorage(ctx, project.thumbnailStorageId, "thumbnail");
    }

    if (project.canvasStateStorageId) {
      await safeDeleteStorage(ctx, project.canvasStateStorageId, "canvas state");
    }

    await ctx.db.delete(args.projectId);

    await ctx.db.patch(user._id, {
      projectsUsed: Math.max(0, (user.projectsUsed || 0) - 1),
      lastActiveAt: Date.now(),
    });

    return { success: true };
  },
});

export const getProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.runQuery(internal.users.getCurrentUser);
    if (!user) return null;

    const project = await ctx.db.get(args.projectId);
    if (!project) return null; // Return null instead of throwing, so UI can handle gracefully
    if (project.userId !== user._id) throw new Error("Access denied");

    return await resolveProjectUrls(ctx, project);
  },
});

export const updateProject = mutation({
  args: {
    projectId: v.id("projects"),
    canvasState: v.optional(v.any()),
    canvasStateStorageId: v.optional(v.id("_storage")),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    currentImageUrl: v.optional(v.string()),
    currentImageStorageId: v.optional(v.id("_storage")),
    thumbnailUrl: v.optional(v.string()),
    thumbnailStorageId: v.optional(v.id("_storage")),
    activeTransformations: v.optional(v.string()),
    backgroundRemoved: v.optional(v.boolean()),
    folderId: v.optional(v.id("folders")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.runQuery(internal.users.getCurrentUser);
    if (!user) throw new Error("User not found");

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");
    if (project.userId !== user._id) throw new Error("Access denied");

    const updateData = { updatedAt: Date.now() };

    const oldCanvasStateStorageId = project.canvasStateStorageId;
    const oldCurrentImageStorageId = project.currentImageStorageId;
    const oldThumbnailStorageId = project.thumbnailStorageId;

    if (args.folderId !== undefined) {
      const folder = await ctx.db.get(args.folderId);
      if (!folder || folder.userId !== user._id) {
        throw new Error("Invalid folder selection");
      }
      updateData.folderId = args.folderId;
    }

    if (args.width !== undefined) updateData.width = args.width;
    if (args.height !== undefined) updateData.height = args.height;

    if (args.activeTransformations !== undefined) {
      updateData.activeTransformations = args.activeTransformations;
    }

    if (args.backgroundRemoved !== undefined) {
      updateData.backgroundRemoved = args.backgroundRemoved;
    }

    if (args.canvasStateStorageId !== undefined) {
      updateData.canvasStateStorageId = args.canvasStateStorageId;
      updateData.canvasState = undefined;
    } else if (args.canvasState !== undefined) {
      // ✨ Size limit hata di gayi hai! Future users ke liye unlimited.
      updateData.canvasState = args.canvasState;
      updateData.canvasStateStorageId = undefined;
    }

    if (args.currentImageStorageId !== undefined) {
      updateData.currentImageStorageId = args.currentImageStorageId;
      updateData.currentImageUrl = undefined;
    } else if (args.currentImageUrl !== undefined) {
      assertNotDataUrl(args.currentImageUrl, "currentImageUrl", "currentImageStorageId");
      updateData.currentImageUrl = args.currentImageUrl;
      updateData.currentImageStorageId = undefined;
    }

    if (args.thumbnailStorageId !== undefined) {
      updateData.thumbnailStorageId = args.thumbnailStorageId;
      updateData.thumbnailUrl = undefined;
    } else if (args.thumbnailUrl !== undefined) {
      assertNotDataUrl(args.thumbnailUrl, "thumbnailUrl", "thumbnailStorageId");
      updateData.thumbnailUrl = args.thumbnailUrl;
      updateData.thumbnailStorageId = undefined;
    }

    await ctx.db.patch(args.projectId, updateData);
    await ctx.db.patch(user._id, { lastActiveAt: Date.now() });

    if (
      args.canvasStateStorageId &&
      oldCanvasStateStorageId &&
      args.canvasStateStorageId !== oldCanvasStateStorageId
    ) {
      await safeDeleteStorage(ctx, oldCanvasStateStorageId, "canvas state");
    }

    if (
      args.currentImageStorageId &&
      oldCurrentImageStorageId &&
      args.currentImageStorageId !== oldCurrentImageStorageId
    ) {
      await safeDeleteStorage(ctx, oldCurrentImageStorageId, "current image");
    }

    if (
      args.thumbnailStorageId &&
      oldThumbnailStorageId &&
      args.thumbnailStorageId !== oldThumbnailStorageId
    ) {
      await safeDeleteStorage(ctx, oldThumbnailStorageId, "thumbnail");
    }

    return args.projectId;
  },
});
