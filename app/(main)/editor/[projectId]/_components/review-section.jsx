"use client";

import React, { useState, useEffect } from "react";
import { useConvexQuery } from "@/hooks/use-convex-query";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Star, Trash2, Send, ThumbsUp } from "lucide-react";

export default function ReviewSection({ projectId }) {
  const [rating, setRating] = useState(5);
  const[hoverRating, setHoverRating] = useState(0); // 🌟 Naya Hover State
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Queries
  const { data: reviews =[] } = useConvexQuery(
    api.reviews.getProjectReviews,
    { projectId }
  );

  const { data: stats = {} } = useConvexQuery(
    api.reviews.getProjectReviewStats,
    { projectId }
  );

  const { data: userReview = null } = useConvexQuery(
    api.reviews.getUserProjectReview,
    { projectId }
  );

  // Mutations
  const createReview = useMutation(api.reviews.createReview);
  const deleteReview = useMutation(api.reviews.deleteReview);

  // 🌟 Agar User ka Pehle se Review hai, toh form auto-fill kar dena
  useEffect(() => {
    if (userReview) {
      setRating(userReview.rating);
      setTitle(userReview.title);
      setComment(userReview.comment);
    }
  }, [userReview]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!title.trim() || !comment.trim()) {
      alert("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await createReview({
        projectId,
        rating,
        title,
        comment,
      });

      // Form clear nahi karenge agar edit ho raha hai taaki user ko pata rahe ki update ho gaya
      if (!userReview) {
        setTitle("");
        setComment("");
        setRating(5);
      }
      
      // ❌ Yahan se refetchReviews() HATA DIYA GAYA HAI - Convex isko auto update karega

    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (confirm("Are you sure you want to delete your review?")) {
      try {
        await deleteReview({ reviewId });
        
        // Reset form to default state after delete
        setTitle("");
        setComment("");
        setRating(5);

        // ❌ Yahan se bhi refetchReviews() HATA DIYA GAYA HAI
      } catch (error) {
        console.error("Error deleting review:", error);
        alert("Failed to delete review");
      }
    }
  };

  // 🌟 Behtareen Interactive Stars
  const renderInteractiveStars = () => {
    return (
      <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            className="cursor-pointer hover:scale-110 transition-transform focus:outline-none"
          >
            <Star
              size={18}
              className={`transition-colors duration-200 ${
                star <= (hoverRating || rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-600 hover:text-yellow-200"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  // Static Stars (For viewing reviews)
  const renderStaticStars = (ratingValue) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={12}
            className={
              star <= ratingValue
                ? "fill-yellow-400 text-yellow-400"
                : "text-slate-600"
            }
          />
        ))}
      </div>
    );
  };

  return (
    <div className="w-full px-2 md:px-4">
      <div className="w-full bg-slate-900/70 border border-white/10 rounded-2xl shadow-xl">
        <div className="p-3 md:p-4">
          
          <h2 className="text-base md:text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Star className="text-yellow-400 fill-yellow-400" size={18} />
            User Reviews
          </h2>

          {/* Review Statistics */}
          {stats.totalReviews > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              {/* Average Rating */}
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 rounded-xl p-4 border border-white/5 flex flex-col items-center justify-center text-center">
                <div className="text-4xl font-extrabold text-white mb-2 drop-shadow-md">
                  {stats.averageRating}
                </div>
                <div className="mb-1">{renderStaticStars(Math.round(stats.averageRating))}</div>
                <div className="text-white/50 text-xs font-medium">
                  Based on {stats.totalReviews} {stats.totalReviews === 1 ? "review" : "reviews"}
                </div>
              </div>

              {/* Rating Distribution */}
              <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = stats.ratingDistribution?.[star] || 0;
                    const percentage = stats.totalReviews > 0 
                      ? ((count / stats.totalReviews) * 100).toFixed(0) 
                      : 0;
                      
                    return (
                      <div key={star} className="flex items-center gap-3 group">
                        <span className="text-white/70 text-xs w-6 font-medium group-hover:text-yellow-400 transition-colors">
                          {star} ★
                        </span>
                        <div className="flex-1 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                          <div
                            className="h-full bg-gradient-to-r from-yellow-500 to-yellow-300 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-white/40 text-[10px] w-6 text-right">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Review Form Box */}
          <div className={`rounded-xl p-4 border mb-5 transition-colors duration-300 ${userReview ? 'bg-cyan-900/10 border-cyan-500/30' : 'bg-slate-800/50 border-white/10'}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white text-sm font-semibold flex items-center gap-2">
                {userReview ? "✨ Update Your Review" : "✍️ Write a Review"}
              </h3>
              {userReview && (
                <span className="bg-cyan-500/20 text-cyan-300 text-[10px] px-2 py-0.5 rounded-full font-medium">
                  Editing Mode
                </span>
              )}
            </div>

            <form onSubmit={handleSubmitReview} className="flex flex-col gap-3">
              {/* Rating Component */}
              <div className="flex items-center gap-3 bg-slate-900/40 p-2 rounded-lg border border-white/5 w-max">
                <label className="text-white/60 text-xs font-medium pl-1">Rating:</label>
                {renderInteractiveStars()}
              </div>

              {/* Title Input */}
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Summarize your experience (e.g. Great App!)"
                className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50 transition-all"
                disabled={isSubmitting}
              />

              {/* Comment Textarea & Submit */}
              <div className="flex flex-col md:flex-row gap-3">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What did you like or dislike?"
                  rows="2"
                  className="w-full md:flex-1 bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50 transition-all resize-none custom-scrollbar"
                  disabled={isSubmitting}
                ></textarea>

                <button
                  type="submit"
                  disabled={isSubmitting || !title.trim() || !comment.trim()}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-cyan-500/20 md:h-[auto]"
                >
                  <Send size={16} />
                  {isSubmitting ? "Saving..." : userReview ? "Update" : "Publish"}
                </button>
              </div>
            </form>
          </div>

          {/* Reviews List */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-3 border-b border-white/10 pb-2">
              Recent Reviews <span className="text-white/40 font-normal text-xs ml-1">({reviews.length})</span>
            </h3>

            {reviews.length === 0 ? (
              <div className="text-center py-8 bg-slate-800/30 rounded-xl border border-white/5 border-dashed">
                <p className="text-white/50 text-sm mb-1">No reviews yet.</p>
                <p className="text-white/30 text-xs">Be the first to share your thoughts!</p>
              </div>
            ) : (
              /* Added custom scrollbar class here */
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {reviews.map((review) => (
                  <div
                    key={review._id}
                    className={`rounded-xl p-4 border transition duration-200 ${
                      userReview?._id === review._id 
                      ? "bg-cyan-900/10 border-cyan-500/30 shadow-md shadow-cyan-900/20" 
                      : "bg-slate-800/40 border-white/5 hover:border-white/10"
                    }`}
                  >
                    {/* Review Header */}
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        {review.userImage ? (
                          <img
                            src={review.userImage}
                            alt={review.userName}
                            className="w-8 h-8 rounded-full border border-white/10 object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white/50 font-bold text-xs">
                            {review.userName?.charAt(0) || "U"}
                          </div>
                        )}
                        <div>
                          <p className="text-white text-xs font-semibold">
                            {review.userName}
                            {userReview?._id === review._id && (
                              <span className="ml-2 text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded">You</span>
                            )}
                          </p>
                          <p className="text-white/40 text-[10px] mt-0.5">
                            {new Date(review.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric', month: 'short', day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        {renderStaticStars(review.rating)}
                        
                        {/* Delete Button for User */}
                        {userReview?._id === review._id && (
                          <button
                            onClick={() => handleDeleteReview(review._id)}
                            className="group flex items-center gap-1 text-red-400/70 hover:text-red-400 text-[10px] transition font-medium"
                          >
                            <Trash2 size={12} className="group-hover:scale-110 transition-transform" />
                            Remove
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Review Content */}
                    <div className="pl-11">
                      <h4 className="text-white/90 text-sm font-semibold mb-1">
                        {review.title}
                      </h4>
                      <p className="text-white/60 text-xs leading-relaxed mb-3">
                        {review.comment}
                      </p>
                      
                      {/* Helpful Action (Visual Only) */}
                      {userReview?._id !== review._id && (
                        <button className="flex items-center gap-1.5 text-white/30 hover:text-white/60 text-[10px] transition font-medium">
                          <ThumbsUp size={12} />
                          Helpful
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}