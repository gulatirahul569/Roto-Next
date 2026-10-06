"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FiCheckCircle, FiStar, FiTrash2 } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import {
  deleteProductReview,
  fetchProductReviews,
  submitProductReview,
} from "../../services/productService";

const emptySummary = {
  average: 0,
  count: 0,
  distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
};

const ratingLabels = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

function formatDate(value) {
  if (!value) return "";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function StarRow({ value, size = 16 }) {
  return (
    <div className="flex items-center" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <FiStar
          key={index}
          size={size}
          className={
            index < value ? "fill-[#FFA41C] text-[#FFA41C]" : "text-zinc-300"
          }
        />
      ))}
    </div>
  );
}

export default function ProductReviews({ productId, onSummaryChange }) {
  const { user, token } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(emptySummary);
  const [isLoading, setIsLoading] = useState(true);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Lets the parent update its stars without re-triggering our load effect.
  const onSummaryChangeRef = useRef(onSummaryChange);

  useEffect(() => {
    onSummaryChangeRef.current = onSummaryChange;
  }, [onSummaryChange]);

  const myReview = reviews.find((review) => review.isMine);

  const applyData = (data) => {
    const nextSummary = data?.summary || emptySummary;

    setReviews(Array.isArray(data?.reviews) ? data.reviews : []);
    setSummary(nextSummary);
    onSummaryChangeRef.current?.(nextSummary);
  };

  useEffect(() => {
    let isCancelled = false;

    async function loadReviews() {
      try {
        setIsLoading(true);
        const data = await fetchProductReviews(productId, token);

        if (!isCancelled) {
          applyData(data);
        }
      } catch (requestError) {
        console.error("Review loading error:", requestError);

        if (!isCancelled) {
          setError("Unable to load reviews right now.");
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    if (productId) {
      loadReviews();
    }

    return () => {
      isCancelled = true;
    };
  }, [productId, token]);

  // When the customer already reviewed this product, fill the form to edit it.
  useEffect(() => {
    if (myReview) {
      setRating(myReview.rating);
      setTitle(myReview.title || "");
      setComment(myReview.comment || "");
    } else {
      setRating(0);
      setTitle("");
      setComment("");
    }
  }, [myReview?._id, myReview?.updatedAt]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!rating) {
      setError("Please choose a star rating.");
      return;
    }

    try {
      setIsSubmitting(true);

      await submitProductReview(productId, { rating, title, comment }, token);

      const data = await fetchProductReviews(productId, token);
      applyData(data);

      setMessage(
        myReview
          ? "Your review has been updated."
          : "Thank you! Your review has been posted."
      );
    } catch (requestError) {
      setError(requestError.message || "Unable to save your review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setError("");
    setMessage("");

    try {
      setIsSubmitting(true);

      await deleteProductReview(productId, token);

      const data = await fetchProductReviews(productId, token);
      applyData(data);

      setMessage("Your review has been deleted.");
    } catch (requestError) {
      setError(requestError.message || "Unable to delete your review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const shownRating = hoverRating || rating;

  return (
    <section id="reviews" className="mt-12 scroll-mt-6 border-t border-zinc-200 pt-8">
      <h2 className="text-2xl font-bold text-zinc-950">Customer reviews</h2>

      <div className="mt-6 grid gap-10 lg:grid-cols-12">
        {/* Summary and form */}
        <div className="lg:col-span-4">
          <div className="flex items-center gap-3">
            <StarRow value={Math.round(summary.average)} size={22} />
            <p className="text-lg font-medium text-zinc-950">
              {summary.count > 0
                ? `${summary.average.toFixed(1)} out of 5`
                : "No ratings yet"}
            </p>
          </div>

          <p className="mt-1 text-sm text-zinc-500">
            {summary.count} global rating{summary.count === 1 ? "" : "s"}
          </p>

          <div className="mt-4 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const starCount = summary.distribution?.[star] || 0;
              const percentage =
                summary.count > 0
                  ? Math.round((starCount / summary.count) * 100)
                  : 0;

              return (
                <div key={star} className="flex items-center gap-3 text-sm">
                  <span className="w-12 text-[#007185]">{star} star</span>

                  <div className="h-4 flex-1 overflow-hidden rounded-sm border border-zinc-300 bg-zinc-100">
                    <div
                      className="h-full bg-[#FFA41C]"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <span className="w-10 text-right text-[#007185]">
                    {percentage}%
                  </span>
                </div>
              );
            })}
          </div>

          <hr className="my-6 border-zinc-200" />

          <h3 className="text-lg font-bold text-zinc-950">
            {myReview ? "Edit your review" : "Review this product"}
          </h3>

          <p className="mt-1 text-sm text-zinc-600">
            Share your thoughts with other customers.
          </p>

          {!user ? (
            <Link
              href={`/login?next=/product/${productId}`}
              className="mt-4 flex h-10 w-full items-center justify-center rounded-full border border-zinc-300 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50"
            >
              Log in to write a review
            </Link>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <div
                  className="flex items-center gap-1"
                  onMouseLeave={() => setHoverRating(0)}
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      aria-label={`${star} star${star === 1 ? "" : "s"}`}
                      className="p-0.5"
                    >
                      <FiStar
                        size={28}
                        className={
                          star <= shownRating
                            ? "fill-[#FFA41C] text-[#FFA41C]"
                            : "text-zinc-300"
                        }
                      />
                    </button>
                  ))}

                  {shownRating > 0 && (
                    <span className="ml-2 text-sm font-medium text-zinc-700">
                      {ratingLabels[shownRating]}
                    </span>
                  )}
                </div>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-zinc-800">
                  Headline
                </span>

                <input
                  type="text"
                  value={title}
                  maxLength={120}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="What's most important to know?"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none transition focus:border-zinc-950"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-zinc-800">
                  Written review
                </span>

                <textarea
                  rows={5}
                  value={comment}
                  maxLength={1500}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="What did you like or dislike? How is the fit and quality?"
                  className="w-full resize-y rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none transition focus:border-zinc-950"
                />
              </label>

              {error && (
                <p className="text-sm font-semibold text-[#B12704]">{error}</p>
              )}

              {message && (
                <p className="flex items-center gap-1.5 text-sm font-semibold text-[#007600]">
                  <FiCheckCircle size={15} />
                  {message}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-10 flex-1 rounded-full bg-[#FFD814] text-sm font-medium text-zinc-950 transition hover:bg-[#F7CA00] disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500"
                >
                  {isSubmitting
                    ? "Saving..."
                    : myReview
                      ? "Update review"
                      : "Submit review"}
                </button>

                {myReview && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isSubmitting}
                    aria-label="Delete your review"
                    className="grid size-10 place-items-center rounded-full border border-zinc-300 text-zinc-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  >
                    <FiTrash2 size={16} />
                  </button>
                )}
              </div>
            </form>
          )}

          {!user && error && (
            <p className="mt-3 text-sm font-semibold text-[#B12704]">{error}</p>
          )}
        </div>

        {/* Review list */}
        <div className="lg:col-span-8">
          {isLoading ? (
            <p className="text-sm text-zinc-500">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center">
              <p className="font-bold text-zinc-950">No reviews yet</p>
              <p className="mt-1 text-sm text-zinc-500">
                Be the first to review this product.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-200">
              {reviews.map((review) => (
                <article key={review._id} className="py-5 first:pt-0">
                  <div className="flex items-center gap-2">
                    <span className="grid size-8 place-items-center rounded-full bg-zinc-200 text-xs font-bold uppercase text-zinc-700">
                      {(review.userName || "R").charAt(0)}
                    </span>

                    <span className="text-sm font-medium text-zinc-900">
                      {review.userName}
                    </span>

                    {review.isMine && (
                      <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-zinc-600">
                        You
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <StarRow value={review.rating} size={15} />

                    {review.title && (
                      <h3 className="text-sm font-bold text-zinc-950">
                        {review.title}
                      </h3>
                    )}
                  </div>

                  <p className="mt-1 text-xs text-zinc-500">
                    Reviewed on {formatDate(review.createdAt)}
                  </p>

                  {review.isVerifiedPurchase && (
                    <p className="mt-1 text-xs font-bold text-[#C45500]">
                      Verified purchase
                    </p>
                  )}

                  {review.comment && (
                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-zinc-800">
                      {review.comment}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}