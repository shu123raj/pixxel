import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Like / Unlike Toggle
export const toggleLike = mutation({
  args: {
    projectId: v.string(),
    userId: v.string(),
    userName: v.string(),
    userImage: v.string()
  },
  handler: async (ctx, args) => {
    // Check agar user ne pehle se like kiya hai
    const existingLike = await ctx.db
      .query("likes")
      .withIndex("by_user_project", (q) => q.eq("userId", args.userId).eq("projectId", args.projectId))
      .unique();

    if (existingLike) {
      // Agar pehle se liked hai, toh unlike (delete) kar do
      await ctx.db.delete(existingLike._id);
      return { liked: false };
    } else {
      // Naya like add karo
      await ctx.db.insert("likes", {
        projectId: args.projectId,
        userId: args.userId,
        userName: args.userName,
        userImage: args.userImage,
        timestamp: Date.now()
      });
      return { liked: true };
    }
  }
});

// Naya Comment Add karna
export const addComment = mutation({
  args: {
    projectId: v.string(),
    userId: v.string(),
    userName: v.string(),
    userImage: v.string(),
    text: v.string()
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("comments", {
      projectId: args.projectId,
      userId: args.userId,
      userName: args.userName,
      userImage: args.userImage,
      text: args.text,
      createdAt: Date.now()
    });
  }
});

// Saare Likes aur Comments ek sath lana (Fast Loading ke liye)
export const getLikesAndComments = query({
  handler: async (ctx) => {
    const likes = await ctx.db.query("likes").collect();
    const comments = await ctx.db.query("comments").order("asc").collect();
    return { likes, comments };
  }
});