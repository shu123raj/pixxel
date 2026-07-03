// File Path: convex/notifications.js
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getUserNotifications = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) return [];

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(30);

    return notifications;
  },
});

export const markAllAsRead = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) return;

    const unreadNotifs = await ctx.db
      .query("notifications")
      .withIndex("by_user_unread", (q) => q.eq("userId", user._id).eq("isRead", false))
      .collect();

    for (const notif of unreadNotifs) {
      await ctx.db.patch(notif._id, { isRead: true });
    }
  },
});

export const sendNotification = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    message: v.string(),
    link: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("notifications", {
      userId: args.userId,
      title: args.title,
      message: args.message,
      isRead: false,
      createdAt: Date.now(),
      link: args.link,
    });
  },
});

export const sendToAll = mutation({
  args: {
    title: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const users = await ctx.db.query("users").collect();
    for (const user of users) {
      await ctx.db.insert("notifications", {
        userId: user._id,
        title: args.title,
        message: args.message,
        isRead: false,
        createdAt: Date.now(),
      });
    }
  },
});