import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, CheckCircle2, MessageSquare, Send, ThumbsUp, Sparkles, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Order } from '../types';
import { submitOrderFeedbackToSupabase, OrderFeedback } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface OrderFeedbackSectionProps {
  order: Order;
  onSubmitted?: () => void;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Poor experience 😞',
  2: 'Could be better 😐',
  3: 'Average service 🙂',
  4: 'Great experience! 😊',
  5: 'Outstanding delivery! 🌟'
};

const FEEDBACK_TAGS = [
  '⚡ Super Fast Delivery',
  '🥦 Fresh & Crisp Items',
  '📦 Neat Packaging',
  '💵 Smooth Cash on Delivery',
  '🤝 Courteous Delivery Agent',
  '📱 Seamless App Experience'
];

export const OrderFeedbackSection: React.FC<OrderFeedbackSectionProps> = ({ order, onSubmitted }) => {
  const { user, userProfile } = useAuth();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>(['⚡ Super Fast Delivery', '🥦 Fresh & Crisp Items']);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  // Check if feedback was already submitted for this order
  useEffect(() => {
    try {
      const existing = localStorage.getItem(`supercart_feedback_${order.id}`);
      if (existing) {
        const parsed = JSON.parse(existing);
        setRating(parsed.rating || 5);
        if (parsed.tags) setSelectedTags(parsed.tags);
        if (parsed.comment) setComment(parsed.comment);
        setIsSubmitted(true);
      }
    } catch (e) {}
  }, [order.id]);

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return;
    setIsSubmitting(true);
    setFeedbackError(null);

    const feedbackPayload: OrderFeedback = {
      orderId: order.id,
      userId: order.userId || user?.uid || null,
      customerName: order.customerName || userProfile?.name || 'Customer',
      customerEmail: order.customerEmail || userProfile?.email || user?.email || null,
      rating,
      deliveryRating: rating,
      tags: selectedTags,
      comment: comment.trim(),
      createdAt: new Date().toISOString()
    };

    try {
      await submitOrderFeedbackToSupabase(feedbackPayload);

      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 }
        });
      } catch (e) {}

      setIsSubmitted(true);
      if (onSubmitted) {
        onSubmitted();
      }
    } catch (err: any) {
      console.warn('Feedback submit note:', err);
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/80 text-center space-y-2 shadow-xs"
      >
        <div className="w-10 h-10 mx-auto rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div className="flex items-center justify-center gap-1 text-amber-500">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-4 h-4 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-300 dark:text-zinc-700'}`}
            />
          ))}
        </div>
        <h4 className="text-sm font-extrabold text-emerald-950 dark:text-emerald-200">
          Thank you for your feedback!
        </h4>
        <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-snug">
          Your rating helps us keep delivery fast, accurate, and delighting every SuperCart doorstep across India.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-zinc-50 dark:bg-zinc-850/80 border border-zinc-200 dark:border-zinc-750 space-y-3.5 text-left shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-zinc-900 dark:text-white">
              Rate Your Order Experience
            </h4>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Order #{order.id.slice(0, 8).toUpperCase()} • Delivered via SuperCart
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
          Live Feedback
        </span>
      </div>

      {/* 5-Star Rating Control */}
      <div className="p-3 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex flex-col items-center justify-center space-y-1.5 shadow-2xs">
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 hover:scale-125 transition-transform cursor-pointer focus:outline-none"
              aria-label={`Rate ${star} star`}
            >
              <Star
                className={`w-6 h-6 sm:w-7 sm:h-7 transition-colors ${
                  star <= (hoverRating || rating)
                    ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                    : 'text-zinc-300 dark:text-zinc-600'
                }`}
              />
            </button>
          ))}
        </div>
        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
          {RATING_LABELS[hoverRating || rating]}
        </span>
      </div>

      {/* Quick Tag Pills */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 block">
          What went great?
        </span>
        <div className="flex flex-wrap gap-1.5">
          {FEEDBACK_TAGS.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => handleToggleTag(tag)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer select-none ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:border-emerald-400'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Comments Area */}
      <div className="space-y-1">
        <label htmlFor="order-feedback-comment" className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 block">
          Additional comments (Optional):
        </label>
        <textarea
          id="order-feedback-comment"
          rows={2}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell us what you loved or how we can improve..."
          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-emerald-500 transition resize-none"
        />
      </div>

      {feedbackError && (
        <p className="text-[11px] text-red-600 dark:text-red-400 font-semibold">{feedbackError}</p>
      )}

      {/* Submit Button */}
      <button
        id="submit-order-feedback-btn"
        type="button"
        onClick={handleSubmitFeedback}
        disabled={isSubmitting}
        className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
      >
        <Send className="w-3.5 h-3.5" />
        <span>{isSubmitting ? 'Sending to SuperCart...' : 'Submit Feedback to SuperCart'}</span>
      </button>
    </div>
  );
};
