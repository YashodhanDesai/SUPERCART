import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Navigation, FileText, ShoppingBag, X, Sparkles } from 'lucide-react';
import { Order } from '../types';
import { OrderFeedbackSection } from './OrderFeedbackSection';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
  onTrackOrder: (order: Order) => void;
  onViewInvoice: (order: Order) => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  onTrackOrder,
  onViewInvoice
}) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <motion.div
        id="order-success-modal"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-7 text-center text-zinc-900 dark:text-zinc-100 overflow-y-auto max-h-[92vh] my-auto"
      >
        {/* Animated Success Icon */}
        <div className="relative mx-auto w-14 h-14 sm:w-16 sm:h-16 mb-3 sm:mb-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
            className="w-full h-full rounded-3xl bg-emerald-600 text-white flex items-center justify-center shadow-xl shadow-emerald-600/30"
          >
            <CheckCircle2 className="w-8 h-8 sm:w-9 sm:h-9" />
          </motion.div>
        </div>

        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-400 text-emerald-950 mb-1.5 shadow-2xs">
          <Sparkles className="w-3 h-3 mr-1" />
          Order Confirmed • Cash on Delivery
        </span>

        <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
          SuperCart Order Placed!
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          Fulfillment team has received your order and is selecting fresh groceries now.
        </p>

        {/* Order Details box */}
        <div className="my-4 p-3.5 sm:p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 text-left space-y-2 text-xs shadow-2xs">
          <div className="flex justify-between">
            <span className="text-zinc-400">Order Reference:</span>
            <span className="font-mono font-bold text-zinc-900 dark:text-white">
              #{order.id.slice(0, 10).toUpperCase()}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-zinc-400">Estimated Delivery:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              ~20 mins (Express)
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-zinc-400">Total Amount:</span>
            <span className="font-mono font-bold text-zinc-900 dark:text-white">
              ₹{order.total.toFixed(2)} ({order.paymentMethod})
            </span>
          </div>

          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700/80 space-y-1">
            {order.customerPhone && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400">Contact Mobile:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {order.customerPhone}
                </span>
              </div>
            )}
            <div>
              <span className="text-[11px] text-zinc-400 block">Delivering to:</span>
              <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 line-clamp-2">
                {order.deliveryAddress}
              </span>
            </div>
          </div>
        </div>

        {/* Post-Order Feedback Section Connected to Supabase */}
        <div className="my-4">
          <OrderFeedbackSection order={order} />
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <button
            id="track-order-modal-btn"
            onClick={() => {
              onClose();
              onTrackOrder(order);
            }}
            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-extrabold text-xs shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Navigation className="w-4 h-4" />
            <span>Track Order Live</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onClose();
                onViewInvoice(order);
              }}
              className="py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tax Invoice</span>
            </button>

            <button
              onClick={onClose}
              className="py-2.5 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition cursor-pointer"
            >
              Keep Shopping
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
