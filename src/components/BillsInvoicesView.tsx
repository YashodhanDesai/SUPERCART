import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Receipt, 
  FileText, 
  Download, 
  Eye, 
  ArrowLeft, 
  CheckCircle2, 
  Calendar, 
  ShoppingBag,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { subscribeToUserOrders } from '../lib/firebase';
import { Order } from '../types';
import { InvoiceModal } from './InvoiceModal';

interface BillsInvoicesViewProps {
  onBackToHome?: () => void;
}

export const BillsInvoicesView: React.FC<BillsInvoicesViewProps> = ({ onBackToHome }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Order | null>(null);

  useEffect(() => {
    const userId = user?.uid || 'shopper-guest-01';
    const timer = setTimeout(() => setLoading(false), 1200);
    const unsub = subscribeToUserOrders(
      userId,
      (userOrders) => {
        clearTimeout(timer);
        setOrders(userOrders);
        setLoading(false);
      }
    );
    return () => {
      clearTimeout(timer);
      unsub();
    };
  }, [user]);

  return (
    <div id="bills-invoices-page-view" className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Invoice Modal Preview */}
      <InvoiceModal
        order={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
        <div className="flex items-center gap-3">
          {onBackToHome && (
            <button
              type="button"
              onClick={onBackToHome}
              className="p-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition cursor-pointer flex items-center gap-1.5 text-xs sm:text-sm font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('backToHome')}</span>
            </button>
          )}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                {t('bills')}
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {t('billsSubtitle')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices List */}
      <section className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 p-5 sm:p-6 shadow-sm space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-zinc-400 font-medium">Loading your invoices...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-zinc-400 space-y-2">
            <FileText className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-600 opacity-60" />
            <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">{t('noBillsFound')}</h3>
            <p className="text-xs max-w-sm mx-auto">
              Place an order from the fresh store to generate your official GST tax invoices and receipts.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {orders.map((ord) => (
              <div
                key={ord.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 -mx-2 px-3 rounded-2xl transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      INV-{ord.id.slice(-8).toUpperCase()}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-zinc-400" />
                      {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold">
                      {ord.status}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-2 pt-0.5">
                    <span>{ord.items.length} items</span>
                    <span>•</span>
                    <span className="font-bold text-zinc-900 dark:text-white">₹{ord.total.toFixed(2)}</span>
                    <span>•</span>
                    <span className="capitalize">{ord.paymentMethod}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedInvoice(ord)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold transition cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t('viewInvoice')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedInvoice(ord)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{t('downloadPdf')}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
