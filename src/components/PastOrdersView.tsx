import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { 
  Package, 
  Clock, 
  MapPin, 
  FileText, 
  Navigation, 
  RotateCcw, 
  CheckCircle2, 
  Truck, 
  ChevronRight,
  ShoppingBag,
  ArrowLeft,
  RefreshCw,
  Phone
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { subscribeToUserOrders } from '../lib/firebase';

interface PastOrdersViewProps {
  onTrackOrder: (order: Order) => void;
  onViewInvoice: (order: Order) => void;
  onContinueShopping: () => void;
}

export const PastOrdersView: React.FC<PastOrdersViewProps> = ({
  onTrackOrder,
  onViewInvoice,
  onContinueShopping
}) => {
  const { user } = useAuth();
  const { addItem, setIsCartOpen } = useCart();
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const fetchOrders = useCallback(() => {
    const userId = user?.uid || 'shopper-guest-01';
    
    // Check local storage immediately
    try {
      const local = localStorage.getItem(`supercart_orders_${userId}`);
      if (local) {
        setOrders(JSON.parse(local));
      }
    } catch {}

    // Safety timeout: ensure loading stops within 1.2s even if network is slow
    const timeout = setTimeout(() => {
      setLoading(false);
      setIsRefreshing(false);
    }, 1200);

    const unsubscribe = subscribeToUserOrders(userId, (data) => {
      clearTimeout(timeout);
      setOrders(data);
      setLoading(false);
      setIsRefreshing(false);
    });

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, [user]);

  useEffect(() => {
    const unsub = fetchOrders();
    return () => {
      if (unsub) unsub();
    };
  }, [fetchOrders]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    fetchOrders();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleReorder = (order: Order) => {
    order.items.forEach(({ product, quantity }) => {
      addItem(product, quantity);
    });
    setIsCartOpen(true);
  };

  const filteredOrders = orders.filter((o) => {
    if (filter === 'active') return o.status !== 'Delivered' && o.status !== 'Cancelled';
    if (filter === 'completed') return o.status === 'Delivered';
    return true;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Placed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300">Order Placed</span>;
      case 'Confirmed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">Order Confirmed</span>;
      case 'Packed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300">Items Packed</span>;
      case 'Processing':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300">Packing Items</span>;
      case 'Out for Delivery':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 animate-pulse">Out for Delivery</span>;
      case 'Delivered':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">Delivered</span>;
      case 'Cancelled':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-zinc-100 text-zinc-700">{status}</span>;
    }
  };

  return (
    <div id="past-orders-page" className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 animate-fade-in">
      {/* Top Heading with Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            id="orders-back-to-store-btn"
            onClick={onContinueShopping}
            className="p-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition cursor-pointer flex items-center gap-1.5 text-xs sm:text-sm font-bold shrink-0"
            title="Back to Store"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('backToStore')}</span>
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>{t('orders')} & Invoices</span>
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Track active dispatches, view item receipts, or reorder favorite groceries
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          {/* Refresh Button */}
          <button
            type="button"
            id="orders-refresh-btn"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="p-2.5 px-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-bold flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
            title="Refresh Orders"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          {/* Filter Pills: Only shown if user has order history */}
          {orders.length > 0 && (
            <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl shrink-0">
              {(['all', 'active', 'completed'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition cursor-pointer ${
                    filter === f
                      ? 'bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  {f === 'all' ? 'All' : f === 'active' ? 'In-Transit' : 'Delivered'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs text-zinc-400">Loading your SuperCart order history...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 mx-auto flex items-center justify-center mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
            No order history yet
          </h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto mb-6">
            You haven't placed any grocery delivery orders yet. Place your first order or refresh to check for updates!
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs transition cursor-pointer flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Orders</span>
            </button>
            <button
              onClick={onContinueShopping}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer"
            >
              Start Shopping Groceries
            </button>
          </div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-10 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
            No orders found matching '{filter}' filter.
          </p>
          <button
            onClick={() => setFilter('all')}
            className="mt-3 text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
          >
            View all orders
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const dateStr = order.createdAt?.toDate
              ? order.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : 'Recent Order';

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 sm:p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 hover:border-emerald-500/40 shadow-sm transition"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-zinc-900 dark:text-white">
                          Order #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Placed on {dateStr} • {order.items.length} items
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewInvoice(order)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Invoice</span>
                    </button>

                    {order.status !== 'Delivered' && (
                      <button
                        onClick={() => onTrackOrder(order)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Live Tracking</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Items preview */}
                <div className="py-4 flex flex-wrap items-center gap-3">
                  {order.items.slice(0, 5).map(({ product, quantity }) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-100 dark:border-zinc-800"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-8 h-8 rounded-lg object-cover bg-white dark:bg-zinc-800"
                        referrerPolicy="no-referrer"
                      />
                      <div className="text-left">
                        <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 line-clamp-1 max-w-[120px]">
                          {product.name}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          x{quantity}
                        </span>
                      </div>
                    </div>
                  ))}

                  {order.items.length > 5 && (
                    <span className="text-xs text-zinc-400 font-medium">
                      +{order.items.length - 5} more
                    </span>
                  )}
                </div>

                {/* Bottom address & phone & reorder footer */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-zinc-500 dark:text-zinc-400 min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate max-w-xs sm:max-w-md">{order.deliveryAddress}</span>
                    </div>
                    {order.customerPhone && (
                      <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-mono font-semibold shrink-0">
                        <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{order.customerPhone}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                    <div className="text-right">
                      <span className="text-[11px] text-zinc-400 block">Total Paid</span>
                      <span className="font-extrabold text-sm text-zinc-900 dark:text-white font-mono">
                        ₹{order.total.toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={() => handleReorder(order)}
                      className="px-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-emerald-500 text-zinc-700 dark:text-zinc-200 hover:text-emerald-600 dark:hover:text-emerald-400 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reorder</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
