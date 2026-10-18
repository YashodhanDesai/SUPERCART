import React from 'react';
import { motion } from 'motion/react';
import { X, Printer, Download, ShoppingBag, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Order } from '../types';

interface InvoiceModalProps {
  order: Order | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceDate = order.createdAt?.toDate
    ? order.createdAt.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white">
      <motion.div
        id="invoice-modal-content"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 text-zinc-900 dark:text-zinc-100 overflow-hidden print:border-none print:shadow-none print:p-0 print:max-w-none"
      >
        {/* Modal controls - hidden in print */}
        <div className="flex items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800 print:hidden">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-base text-zinc-900 dark:text-white">
              Official Tax Invoice
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Sheet */}
        <div className="py-6 space-y-6">
          {/* Header Branding */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                  SuperCart Technologies Inc.
                </h2>
                <p className="text-xs text-zinc-400">
                  Fast & Fresh Grocery Delivery Network
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs">
              <span className="font-mono font-bold text-sm text-zinc-800 dark:text-zinc-200 block">
                INVOICE #{order.id.slice(0, 8).toUpperCase()}
              </span>
              <span className="text-zinc-400 block">{invoiceDate}</span>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                STATUS: {order.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Customer & Delivery Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-850/60 border border-zinc-200/70 dark:border-zinc-800 text-xs">
            <div>
              <span className="font-bold text-zinc-400 uppercase tracking-wider text-[10px] block mb-1">
                Billed To Customer:
              </span>
              <p className="font-bold text-zinc-900 dark:text-white">
                {order.customerName}
              </p>
              <p className="text-zinc-500 dark:text-zinc-400">{order.customerEmail}</p>
              <p className="text-zinc-500 dark:text-zinc-400">{order.customerPhone}</p>
            </div>

            <div>
              <span className="font-bold text-zinc-400 uppercase tracking-wider text-[10px] block mb-1">
                Delivery Destination:
              </span>
              <p className="text-zinc-800 dark:text-zinc-200 font-medium">
                {order.deliveryAddress}
              </p>
              <p className="text-zinc-400 text-[11px] mt-1">
                Payment: {order.paymentMethod}
              </p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-2">Item Description</th>
                  <th className="py-2.5 px-2 text-center">Unit</th>
                  <th className="py-2.5 px-2 text-center">Qty</th>
                  <th className="py-2.5 px-2 text-right">Price</th>
                  <th className="py-2.5 px-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {order.items.map(({ product, quantity }) => (
                  <tr key={product.id}>
                    <td className="py-3 px-2 font-medium text-zinc-900 dark:text-zinc-100">
                      {product.name}
                    </td>
                    <td className="py-3 px-2 text-center text-zinc-400 font-mono">
                      {product.unit}
                    </td>
                    <td className="py-3 px-2 text-center font-bold font-mono">
                      {quantity}
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-zinc-600 dark:text-zinc-400">
                      ₹{product.price.toFixed(2)}
                    </td>
                    <td className="py-3 px-2 text-right font-mono font-bold text-zinc-900 dark:text-white">
                      ₹{(product.price * quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown */}
          <div className="flex justify-end pt-2">
            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                <span>Subtotal:</span>
                <span className="font-mono">₹{order.subtotal.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Discount ({order.discountCode || 'Promo'}):</span>
                  <span className="font-mono">-₹{order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                <span>Express Delivery:</span>
                <span className="font-mono">
                  {order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                <span>GST / Taxes (5%):</span>
                <span className="font-mono">₹{order.tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-zinc-200 dark:border-zinc-700 pt-2 flex justify-between font-extrabold text-sm sm:text-base text-zinc-900 dark:text-white">
                <span>Total Amount:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">
                  ₹{order.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Digitally verified & secure checkout
            </span>
            <span>Thank you for shopping with SuperCart!</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
