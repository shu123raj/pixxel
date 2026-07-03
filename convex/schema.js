// File Path: convex/schema.js
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    tokenIdentifier: v.string(),
    imageUrl: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    phone: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    streetAddress: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    country: v.optional(v.string()),
    company: v.optional(v.string()),
    jobTitle: v.optional(v.string()),
    newsletter: v.optional(v.boolean()),
    marketingEmails: v.optional(v.boolean()),
    plan: v.union(v.literal("free"), v.literal("pro")),
    projectsUsed: v.number(),
    exportsThisMonth: v.number(),
    createdAt: v.number(),
    lastActiveAt: v.number(),
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_email", ["email"])
    .searchIndex("search_name", { searchField: "name" })
    .searchIndex("search_email", { searchField: "email" }),

  projects: defineTable({
    title: v.string(),
    userId: v.id("users"),
    canvasState: v.optional(v.any()),
    canvasStateStorageId: v.optional(v.id("_storage")),
    width: v.number(),
    height: v.number(),
    originalImageUrl: v.optional(v.string()),
    currentImageUrl: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    activeTransformations: v.optional(v.string()),
    backgroundRemoved: v.optional(v.boolean()),
    folderId: v.optional(v.id("folders")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_updated", ["userId", "updatedAt"])
    .index("by_folder", ["folderId"]),

  folders: defineTable({
    name: v.string(),
    userId: v.id("users"),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  messages: defineTable({
    name: v.string(),
    email: v.string(),
    message: v.string(),
    createdAt: v.number(),
    status: v.union(v.literal("unread"), v.literal("read"), v.literal("replied")),
  })
    .index("by_status", ["status"])
    .index("by_created", ["createdAt"]),

  authHistory: defineTable({
    userId: v.id("users"),
    eventType: v.union(v.literal("sign_in"), v.literal("sign_up"), v.literal("sign_out")),
    timestamp: v.number(),
    signOutTime: v.optional(v.number()),
    sessionDuration: v.optional(v.number()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    location: v.optional(v.string()),
    success: v.boolean(),
    errorMessage: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_user_timestamp", ["userId", "timestamp"])
    .index("by_timestamp", ["timestamp"])
    .index("by_event_type", ["eventType"]),

  reviews: defineTable({
    projectId: v.id("projects"),
    userId: v.id("users"),
    rating: v.number(),
    title: v.string(),
    comment: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_user", ["userId"])
    .index("by_project_created", ["projectId", "createdAt"])
    .searchIndex("search_comment", { searchField: "comment" }),

    // =======================================
  // INTERACTIONS (Likes & Comments)
  // =======================================
  likes: defineTable({
    projectId: v.string(), // Image ki ID (demo ya real)
    userId: v.string(),    // Like karne wale user ki Clerk ID
    userName: v.string(),  // Like karne wale ka naam
    userImage: v.string(), // Like karne wale ki photo
    timestamp: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_user_project", ["userId", "projectId"]),

  comments: defineTable({
    projectId: v.string(), 
    userId: v.string(),
    userName: v.string(),
    userImage: v.string(),
    text: v.string(),
    createdAt: v.number(),
  }).index("by_project", ["projectId"]),

  // NOTIFICATIONS TABLE
  notifications: defineTable({
    userId: v.id("users"),
    title: v.string(),
    message: v.string(),
    isRead: v.boolean(),
    createdAt: v.number(),
    link: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_user_unread", ["userId", "isRead"]),
});