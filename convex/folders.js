import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const getUserFolders = query({
  handler: async (ctx) => {
    // Ye query users.js se user ka data layegi. Logged out hone par ye 'null' return karegi.
    const user = await ctx.runQuery(internal.users.getCurrentUser);

    // FIX: Agar user logged in nahi hai (null hai), toh direct empty array[] bhej do.
    // Isse frontend crash nahi hoga aur "Not authenticated" error bhi nahi aayega.
    if (!user) {
      return[]; 
    }

    return await ctx.db
      .query("folders")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const createFolder = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);

    // FIX: Agar bina login ke koi folder create karne ka try kare, toh error show karo backend par hi
    if (!user) {
      throw new Error("You must be logged in to create a folder");
    }

    const folderId = await ctx.db.insert("folders", {
      name: args.name,
      userId: user._id,
      createdAt: Date.now(),
    });

    return await ctx.db.get(folderId);
  },
});

export const deleteFolder = mutation({
  args: {
    folderId: v.id("folders"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    
    // FIX: Agar user null hai toh permission denied bolo
    if (!user) {
      throw new Error("You must be logged in to delete a folder");
    }

    const folder = await ctx.db.get(args.folderId);

    if (!folder || folder.userId !== user._id) {
      throw new Error("Folder not found or access denied");
    }

    const projectsInFolder = await ctx.db
      .query("projects")
      .withIndex("by_folder", (q) => q.eq("folderId", args.folderId))
      .collect();

    for (const project of projectsInFolder) {
      await ctx.db.patch(project._id, { folderId: undefined });
    }

    await ctx.db.delete(args.folderId);
    return { success: true };
  },
});