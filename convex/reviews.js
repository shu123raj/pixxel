import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Get all reviews for a specific project
export const getProjectReviews = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    // Get all reviews for the project, ordered by most recent
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_project_created", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();

    // Enrich reviews with user information
    const enrichedReviews = await Promise.all(
      reviews.map(async (review) => {
        const user = await ctx.db.get(review.userId);
        return {
          ...review,
          userName: user?.name || "Anonymous",
          userEmail: user?.email || "",
          userImage: user?.imageUrl || "",
        };
      })
    );

    return enrichedReviews;
  },
});

// Get latest reviews across all projects (for homepage)
export const getLatestReviews = query({
  args: {
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    // Get latest reviews ordered by creation date
    const reviews = await ctx.db
      .query("reviews")
      .order("desc")
      .take(args.limit || 3);

    // Enrich reviews with user information
    const enrichedReviews = await Promise.all(
      reviews.map(async (review) => {
        const user = await ctx.db.get(review.userId);
        const project = await ctx.db.get(review.projectId);
        return {
          ...review,
          userName: user?.name || "Anonymous",
          userEmail: user?.email || "",
          userImage: user?.imageUrl || "",
          projectTitle: project?.title || "Project",
        };
      })
    );

    return enrichedReviews;
  },
});

// Get review statistics for a project
export const getProjectReviewStats = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    if (reviews.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }

    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalRating = 0;

    reviews.forEach((review) => {
      ratingDistribution[review.rating]++;
      totalRating += review.rating;
    });

    return {
      totalReviews: reviews.length,
      averageRating: Math.round((totalRating / reviews.length) * 10) / 10,
      ratingDistribution,
    };
  },
});

// Create a new review
export const createReview = mutation({
  args: {
    projectId: v.id("projects"),
    rating: v.number(),
    title: v.string(),
    comment: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);

    // Validate project exists
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Validate rating is between 1-5
    if (args.rating < 1 || args.rating > 5 || !Number.isInteger(args.rating)) {
      throw new Error("Rating must be an integer between 1 and 5");
    }

    // Check if user already reviewed this project
    const existingReview = await ctx.db
      .query("reviews")
      .filter(
        (q) =>
          q.and(
            q.eq(q.field("projectId"), args.projectId),
            q.eq(q.field("userId"), user._id)
          )
      )
      .first();

    if (existingReview) {
      // Update existing review
      await ctx.db.patch(existingReview._id, {
        rating: args.rating,
        title: args.title,
        comment: args.comment,
        updatedAt: Date.now(),
      });
      return existingReview._id;
    }

    // Create new review
    const reviewId = await ctx.db.insert("reviews", {
      projectId: args.projectId,
      userId: user._id,
      rating: args.rating,
      title: args.title,
      comment: args.comment,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return reviewId;
  },
});

// Delete a review
export const deleteReview = mutation({
  args: {
    reviewId: v.id("reviews"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);

    const review = await ctx.db.get(args.reviewId);
    if (!review) {
      throw new Error("Review not found");
    }

    // Only the review author can delete their review
    if (review.userId !== user._id) {
      throw new Error("Access denied");
    }

    await ctx.db.delete(args.reviewId);
  },
});

// Get user's review for a specific project (if exists)
export const getUserProjectReview = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);

    const review = await ctx.db
      .query("reviews")
      .filter(
        (q) =>
          q.and(
            q.eq(q.field("projectId"), args.projectId),
            q.eq(q.field("userId"), user._id)
          )
      )
      .first();

    return review || null;
  },
});
