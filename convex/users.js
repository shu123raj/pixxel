import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Helper function to log authentication events
async function logAuthEvent(ctx, userId, eventType, success = true, errorMessage = null, additionalData = {}) {
  const record = {
    userId,
    eventType,
    timestamp: Date.now(),
    success,
  };

  if (errorMessage) record.errorMessage = errorMessage;
  if (additionalData.signOutTime !== undefined) record.signOutTime = additionalData.signOutTime;
  if (additionalData.sessionDuration !== undefined) record.sessionDuration = additionalData.sessionDuration;
  if (additionalData.ipAddress !== undefined) record.ipAddress = additionalData.ipAddress;
  if (additionalData.location !== undefined) record.location = additionalData.location;
  if (additionalData.userAgent !== undefined) record.userAgent = additionalData.userAgent;

  await ctx.db.insert("authHistory", record);
}

export const store = mutation({
  args: {
    ipAddress: v.optional(v.string()),
    location: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const clerkImageUrl = args.imageUrl || identity.pictureUrl;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (user !== null) {
      const updateData = { lastActiveAt: Date.now() };

      if (user.name !== identity.name) updateData.name = identity.name;
      if (user.email !== identity.email) updateData.email = identity.email;
      if (clerkImageUrl && user.imageUrl !== clerkImageUrl) updateData.imageUrl = clerkImageUrl;

      await ctx.db.patch(user._id, updateData);

      await logAuthEvent(ctx, user._id, "sign_in", true, null, {
        ipAddress: args.ipAddress,
        location: args.location,
        userAgent: args.userAgent,
      });

      return user._id;
    }

    const userId = await ctx.db.insert("users", {
      name: identity.name ?? "Anonymous",
      tokenIdentifier: identity.tokenIdentifier,
      email: identity.email,
      imageUrl: clerkImageUrl,
      plan: "free",
      projectsUsed: 0,
      exportsThisMonth: 0,
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
    });

    await logAuthEvent(ctx, userId, "sign_up", true, null, {
      ipAddress: args.ipAddress,
      location: args.location,
      userAgent: args.userAgent,
    });

    return userId;
  },
});

export const getCurrentUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    return user || null;
  },
});

export const signUp = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
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
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!existingUser) return null;

    const updateData = {};
    if (args.name !== undefined) updateData.name = args.name;
    if (args.email !== undefined) updateData.email = args.email;
    if (args.imageUrl !== undefined) updateData.imageUrl = args.imageUrl;
    if (args.firstName !== undefined) updateData.firstName = args.firstName;
    if (args.lastName !== undefined) updateData.lastName = args.lastName;
    if (args.phone !== undefined) updateData.phone = args.phone;
    if (args.dateOfBirth !== undefined) updateData.dateOfBirth = args.dateOfBirth;
    if (args.streetAddress !== undefined) updateData.streetAddress = args.streetAddress;
    if (args.city !== undefined) updateData.city = args.city;
    if (args.state !== undefined) updateData.state = args.state;
    if (args.zipCode !== undefined) updateData.zipCode = args.zipCode;
    if (args.country !== undefined) updateData.country = args.country;
    if (args.company !== undefined) updateData.company = args.company;
    if (args.jobTitle !== undefined) updateData.jobTitle = args.jobTitle;
    if (args.newsletter !== undefined) updateData.newsletter = args.newsletter;
    if (args.marketingEmails !== undefined) updateData.marketingEmails = args.marketingEmails;

    await ctx.db.patch(existingUser._id, updateData);
    await logAuthEvent(ctx, existingUser._id, "sign_up");
    return await ctx.db.get(existingUser._id);
  },
});

export const signIn = mutation({
  args: {
    ipAddress: v.optional(v.string()),
    location: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    let user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (user) {
      await ctx.db.patch(user._id, { lastActiveAt: Date.now() });
      await logAuthEvent(ctx, user._id, "sign_in", true, null, {
        ipAddress: args.ipAddress,
        location: args.location,
        userAgent: args.userAgent,
      });
      return await ctx.db.get(user._id);
    }
    return null;
  },
});

export const signOut = mutation({
  args: { signInTime: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { success: true };

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) return { success: true };

    const now = Date.now();
    const sessionDuration = args.signInTime ? now - args.signInTime : undefined;

    await logAuthEvent(ctx, user._id, "sign_out", true, null, {
      signOutTime: now,
      sessionDuration: sessionDuration,
    });
    return { success: true };
  },
});

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", args.email)).unique();
  },
});

export const updateUserProfile = mutation({
  args: {
    name: v.optional(v.string()),
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
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) return null;

    const updateData = {};
    if (args.name !== undefined) updateData.name = args.name;
    if (args.imageUrl !== undefined) updateData.imageUrl = args.imageUrl;
    if (args.firstName !== undefined) updateData.firstName = args.firstName;
    if (args.lastName !== undefined) updateData.lastName = args.lastName;
    if (args.phone !== undefined) updateData.phone = args.phone;
    if (args.dateOfBirth !== undefined) updateData.dateOfBirth = args.dateOfBirth;
    if (args.streetAddress !== undefined) updateData.streetAddress = args.streetAddress;
    if (args.city !== undefined) updateData.city = args.city;
    if (args.state !== undefined) updateData.state = args.state;
    if (args.zipCode !== undefined) updateData.zipCode = args.zipCode;
    if (args.country !== undefined) updateData.country = args.country;
    if (args.company !== undefined) updateData.company = args.company;
    if (args.jobTitle !== undefined) updateData.jobTitle = args.jobTitle;
    if (args.newsletter !== undefined) updateData.newsletter = args.newsletter;
    if (args.marketingEmails !== undefined) updateData.marketingEmails = args.marketingEmails;

    await ctx.db.patch(user._id, updateData);
    return await ctx.db.get(user._id);
  },
});

export const getAllUsers = query({
  handler: async (ctx) => {
    return await ctx.db.query("users").order("desc").collect();
  },
});

// ==========================================
// UPGRADED: UPDATE USER PLAN (Duplicate Fix)
// ==========================================
export const updateUserPlan = mutation({
  args: {
    plan: v.union(v.literal("free"), v.literal("pro")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      return null; 
    }

    // 🚀 SMART FIX: Agar user ka plan pehle se hi 'pro' hai (ya same hai), 
    // toh aage ka code mat chalao, wahin se wapas laut jao.
    // Isse duplicate notifications kabhi nahi aayenge!
    if (user.plan === args.plan) {
      return user._id;
    }

    // 1. User ka plan update karo
    await ctx.db.patch(user._id, { plan: args.plan });

    // 2. Agar plan 'pro' hua hai, toh automatic Notification bhej do
    if (args.plan === "pro") {
      await ctx.db.insert("notifications", {
        userId: user._id,
        title: "👑 Welcome to Pro!",
        message: "You are now a PRO user! Enjoy unlimited projects, ultra-fast background removals, and exclusive premium AI tools.",
        isRead: false,
        createdAt: Date.now(),
        link: "/dashboard",
      });
    }

    return await ctx.db.get(user._id);
  },
});

export const incrementExportUsage = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) throw new Error("User not found");

    if (user.plan !== "pro" && (user.exportsThisMonth || 0) >= 20) {
      throw new Error("Free plan is limited to 20 exports per month. Upgrade to Pro for unlimited exports.");
    }

    const exportsThisMonth = (user.exportsThisMonth || 0) + 1;
    await ctx.db.patch(user._id, {
      exportsThisMonth,
      lastActiveAt: Date.now(),
    });

    return exportsThisMonth;
  },
});

export const getAuthHistory = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) return [];

    return await ctx.db
      .query("authHistory")
      .withIndex("by_user_timestamp", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const getRecentAuthEvents = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    return await ctx.db
      .query("authHistory")
      .withIndex("by_timestamp")
      .order("desc")
      .take(limit);
  },
});

export const getAuthStats = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) return null;

    const history = await ctx.db
      .query("authHistory")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const signIns = history.filter(event => event.eventType === "sign_in").length;
    const signUps = history.filter(event => event.eventType === "sign_up").length;
    const signOuts = history.filter(event => event.eventType === "sign_out").length;
    
    const lastSignIn = history.filter(event => event.eventType === "sign_in").sort((a, b) => b.timestamp - a.timestamp)[0];
    const lastSignOut = history.filter(event => event.eventType === "sign_out").sort((a, b) => b.timestamp - a.timestamp)[0];

    const signOutEvents = history.filter(event => event.eventType === "sign_out");
    const avgSessionDuration = signOutEvents.length > 0
      ? signOutEvents.reduce((sum, event) => sum + (event.sessionDuration || 0), 0) / signOutEvents.length
      : null;

    return {
      totalSignIns: signIns,
      totalSignUps: signUps,
      totalSignOuts: signOuts,
      lastSignIn: lastSignIn ? lastSignIn.timestamp : null,
      lastSignOut: lastSignOut ? lastSignOut.timestamp : null,
      averageSessionDuration: avgSessionDuration,
    };
  },
});

export const logSignOutBackground = mutation({
  args: {
    clerkUserId: v.string(),
    signInTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const users = await ctx.db.query("users").collect();
    const user = users.find(u => u.tokenIdentifier && u.tokenIdentifier.includes(args.clerkUserId));

    if (!user) return { success: false };

    const now = Date.now();
    const sessionDuration = args.signInTime ? now - args.signInTime : undefined;

    await ctx.db.insert("authHistory", {
      userId: user._id,
      eventType: "sign_out",
      timestamp: now,
      success: true,
      signOutTime: now,             
      sessionDuration: sessionDuration 
    });

    return { success: true };
  },
});
