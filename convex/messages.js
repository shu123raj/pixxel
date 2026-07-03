import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const sendMessage = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    // Insert the message into the database
    const messageId = await ctx.db.insert("messages", {
      name: args.name,
      email: args.email,
      message: args.message,
      createdAt: Date.now(),
      status: "unread",
    });

    return messageId;
  },
});

export const getMessages = query({
  handler: async (ctx) => {
    // This would typically be protected for admin access only
    // For now, returning all messages (in production, add auth checks)
    return await ctx.db.query("messages").order("desc").collect();
  },
});

export const markAsRead = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.messageId, { status: "read" });
  },
});