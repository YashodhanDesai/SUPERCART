import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Package, 
  DollarSign, 
  ShoppingBag, 
  TrendingUp, 
  Search, 
  Filter, 
  X, 
  Check, 
  AlertTriangle,
  RefreshCw,
  Layers,
  ArrowRight,
  ShieldCheck,
  Bike,
  Clock,
  Eye,
  SlidersHorizontal,
  ChevronDown,
  Database,
  Phone,
  AlertCircle
} from 'lucide-react';
import { Product, Order, OrderStatus } from '../types';
import { 
  subscribeToProducts, 
  subscribeToAllOrders, 
  addProductToFirestore, 
  updateProductInFirestore, 
  deleteProductFromFirestore, 
  updateOrderStatusInFirestore 
} from '../lib/firebase';
import { supabase } from '../lib/supabase';
import { CATEGORIES } from '../data/seedProducts';
import { useAuth } from '../context/AuthContext';
import { SupabaseDatabaseModal } from './SupabaseDatabaseModal';

export const AdminDashboard: React.FC = () => {
  const { userProfile, updateRole } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders'>('inventory');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [statusErrorMessage, setStatusErrorMessage] = useState<string | null>(null);
  
  // Product search & category filters
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Order status filter
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('All');

  // Product Add / Edit Modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Form values
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<string>('Fruits & Veggies');
  const [formPrice, setFormPrice] = useState<number>(49);
  const [formOriginalPrice, setFormOriginalPrice] = useState<number>(65);
  const [formStock, setFormStock] = useState<number>(25);
  const [formUnit, setFormUnit] = useState('500g');
  const [formImage, setFormImage] = useState('https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80');
  const [formDescription, setFormDescription] = useState('Fresh hand-picked produce from local organic farms.');
  const [formOrganic, setFormOrganic] = useState(true);
  const [formSaving, setFormSaving] = useState(false);

  // Selected Order for detail preview
  const [inspectingOrder, setInspectingOrder] = useState<Order | null>(null);

  // Quick inline price editing state
  const [quickPriceEditId, setQuickPriceEditId] = useState<string | null>(null);
  const [quickPriceVal, setQuickPriceVal] = useState<number>(0);

  // Sync notification feedback state
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsubProds = subscribeToProducts((items) => {
      setProducts(items);
    });

    const unsubOrders = subscribeToAllOrders((allOrders) => {
      setOrders(allOrders);
    });

    return () => {
      unsubProds();
      unsubOrders();
    };
  }, []);

  const openAddProductModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategory('Fruits & Veggies');
    setFormPrice(49);
    setFormOriginalPrice(65);
    setFormStock(20);
    setFormUnit('500g');
    setFormImage('https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80');
    setFormDescription('Farm fresh premium grocery item sourced responsibly.');
    setFormOrganic(false);
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (prod: Product) => {
    setEditingProduct(prod);
    setFormName(prod.name);
    setFormCategory(prod.category);
    setFormPrice(prod.price);
    setFormOriginalPrice(prod.originalPrice || prod.price);
    setFormStock(prod.stock);
    setFormUnit(prod.unit);
    setFormImage(prod.image);
    setFormDescription(prod.description);
    setFormOrganic(!!prod.organic);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSaving(true);
    try {
      const payload: Omit<Product, 'id'> = {
        name: formName,
        category: formCategory,
        price: Number(formPrice),
        originalPrice: Number(formOriginalPrice),
        stock: Number(formStock),
        unit: formUnit,
        image: formImage,
        description: formDescription,
        organic: formOrganic,
        rating: editingProduct?.rating || 4.9,
        reviewCount: editingProduct?.reviewCount || 10
      };

      if (editingProduct) {
        const fullProd: Product = { ...editingProduct, ...payload };
        // Immediately reflect on admin dashboard and web page
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? fullProd : p));
        await updateProductInFirestore(editingProduct.id, payload, fullProd);
        setSyncMessage(`Product "${payload.name}" updated on web page and synced with Supabase database!`);
      } else {
        const newId = await addProductToFirestore(payload);
        const newProd: Product = { id: newId, ...payload };
        // Immediately reflect on admin dashboard and web page
        setProducts(prev => [newProd, ...prev.filter(p => p.id !== newId)]);
        setSyncMessage(`Product "${payload.name}" added to catalog and recorded in Supabase database!`);
      }
      setIsProductModalOpen(false);
      setTimeout(() => setSyncMessage(null), 4000);
    } catch (err) {
      console.error('Save product error:', err);
    } finally {
      setFormSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    const target = products.find(p => p.id === id);
    if (confirm(`Are you sure you want to remove "${target?.name || 'this product'}" from the catalog?`)) {
      // Immediately reflect on admin dashboard and web page
      setProducts(prev => prev.filter(p => p.id !== id));
      await deleteProductFromFirestore(id);
      setSyncMessage('Product removed from web page and Supabase database.');
      setTimeout(() => setSyncMessage(null), 4000);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    const existingOrder = orders.find(o => o.id === orderId);
    if (!existingOrder) return;
    const previousStatus = existingOrder.status;
    if (previousStatus === newStatus) return;

    setUpdatingOrderId(orderId);
    setStatusErrorMessage(null);

    try {
      // 1. Update in Supabase database and sync
      const supaSuccess = await updateOrderStatusInFirestore(orderId, newStatus);
      
      if (!supaSuccess) {
        // Real Supabase error: keep previous status in UI and alert user
        setStatusErrorMessage(`Failed to update status for Order #${orderId.slice(0, 8).toUpperCase()} in Supabase database. Previous status restored.`);
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: previousStatus } : o));
        setTimeout(() => setStatusErrorMessage(null), 5000);
        return;
      }

      // 2. Explicit Verification: Read the updated order back from Supabase
      const { data: verifiedOrder, error: readErr } = await supabase
        .from('orders')
        .select('id, status, updatedAt')
        .eq('id', orderId)
        .maybeSingle();

      if (readErr) {
        console.warn('Supabase read-back check note:', readErr.message);
      }

      const confirmedStatus = (verifiedOrder?.status as OrderStatus) || newStatus;

      // 3. Update React state with verified status from Supabase
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: confirmedStatus } : o));
      setSyncMessage(`Order #${orderId.slice(0, 8).toUpperCase()} status verified & saved in Supabase as "${confirmedStatus}"!`);
      setTimeout(() => setSyncMessage(null), 4000);
    } catch (err: any) {
      console.error('Supabase order status error:', err);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: previousStatus } : o));
      setStatusErrorMessage(`Supabase update error: ${err.message || 'Could not save status to database.'}`);
      setTimeout(() => setStatusErrorMessage(null), 5000);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleSaveQuickPrice = async (id: string) => {
    if (quickPriceVal > 0) {
      const match = products.find(p => p.id === id);
      // Immediately reflect on admin dashboard and web page
      setProducts(prev => prev.map(p => p.id === id ? { ...p, price: quickPriceVal } : p));
      await updateProductInFirestore(id, { price: quickPriceVal }, match ? { ...match, price: quickPriceVal } : undefined);
      setSyncMessage(`Price updated to ₹${quickPriceVal} and synced with Supabase database!`);
      setTimeout(() => setSyncMessage(null), 4000);
    }
    setQuickPriceEditId(null);
  };

  // Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? o.total : 0), 0);
  const activeOrders = orders.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled');
  const lowStockCount = products.filter((p) => p.stock <= 5).length;

  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(productSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter === 'All') return true;
    return o.status === orderStatusFilter;
  });

  return (
    <div id="admin-dashboard-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-zinc-900 text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-zinc-950 text-xs font-black uppercase tracking-wider">
              Admin Portal
            </span>
            <span className="text-xs text-zinc-400">Real-Time Store Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            SuperCart Inventory & Operations
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Live catalog updates, pricing controls, order fulfillment status, and analytics
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsSupabaseModalOpen(true)}
            className="px-3.5 py-2.5 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs transition flex items-center gap-2 border border-zinc-200 dark:border-zinc-700 shadow-2xs cursor-pointer active:scale-95"
            title="Supabase Database Status & Setup"
          >
            <Database className="w-4 h-4 text-emerald-500" />
            <span className="hidden sm:inline">Supabase DB</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>

          <button
            onClick={openAddProductModal}
            className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Real-time synchronization notice banner */}
      <AnimatePresence>
        {syncMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm font-bold flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{syncMessage}</span>
            </div>
            <button
              onClick={() => setSyncMessage(null)}
              className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-emerald-100 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {statusErrorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs sm:text-sm font-bold flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>{statusErrorMessage}</span>
            </div>
            <button
              onClick={() => setStatusErrorMessage(null)}
              className="text-rose-700 dark:text-rose-400 hover:text-rose-950 dark:hover:text-rose-100 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
              Total Gross Sales
            </span>
            <span className="text-2xl font-extrabold font-mono text-zinc-900 dark:text-white">
              ₹{totalRevenue.toFixed(2)}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
              Active In-Transit
            </span>
            <span className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              {activeOrders.length} orders
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600">
            <Bike className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
              Total Catalog SKUs
            </span>
            <span className="text-2xl font-extrabold font-mono text-zinc-900 dark:text-white">
              {products.length} products
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
              Low Stock Alerts
            </span>
            <span className="text-2xl font-extrabold font-mono text-amber-600 dark:text-amber-400">
              {lowStockCount} items
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Tab Controller */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-4 px-6 font-bold text-sm border-b-2 transition flex items-center gap-2 ${
            activeTab === 'inventory'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Product Catalog & Stock ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-4 px-6 font-bold text-sm border-b-2 transition flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Customer Orders & Dispatch ({orders.length})</span>
        </button>
      </div>

      {/* TAB 1: INVENTORY MANAGEMENT */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search products by title..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {['All', ...CATEGORIES.filter((c) => c !== 'All')].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-850/50 text-zinc-400 uppercase text-[10px] font-bold tracking-wider">
                    <th className="py-3 px-4">Product Info</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Unit / Weight</th>
                    <th className="py-3 px-4">Price (₹)</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {filteredProducts.map((prod) => (
                    <tr key={prod.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-850/50 transition">
                      {/* Name and Image */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-10 h-10 rounded-xl object-cover bg-zinc-100 dark:bg-zinc-800 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <span className="font-bold text-zinc-900 dark:text-white block line-clamp-1">
                              {prod.name}
                            </span>
                            {prod.organic && (
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                                Organic
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-zinc-600 dark:text-zinc-300">
                        {prod.category}
                      </td>

                      {/* Unit */}
                      <td className="py-3 px-4 font-mono text-zinc-500">
                        {prod.unit}
                      </td>

                      {/* Real-time Price editor */}
                      <td className="py-3 px-4">
                        {quickPriceEditId === prod.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              step="0.01"
                              value={quickPriceVal}
                              onChange={(e) => setQuickPriceVal(Number(e.target.value))}
                              className="w-16 px-1.5 py-1 rounded border border-emerald-500 text-xs font-mono font-bold"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveQuickPrice(prod.id)}
                              className="p-1 rounded bg-emerald-600 text-white"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => {
                              setQuickPriceEditId(prod.id);
                              setQuickPriceVal(prod.price);
                            }}
                            className="cursor-pointer group flex items-center gap-1 font-mono font-bold text-zinc-900 dark:text-white hover:text-emerald-600"
                            title="Click to edit price directly"
                          >
                            <span>₹{prod.price.toFixed(2)}</span>
                            <Edit3 className="w-3 h-3 text-zinc-300 group-hover:text-emerald-500 opacity-0 group-hover:opacity-100 transition" />
                          </div>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold font-mono text-[11px] ${
                            prod.stock <= 0
                              ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                              : prod.stock <= 5
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          {prod.stock <= 0 ? 'Out of Stock' : `${prod.stock} units`}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditProductModal(prod)}
                            className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition"
                            title="Edit Product Details"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-600 transition"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GLOBAL ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Order Status Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {['All', 'Placed', 'Confirmed', 'Packed', 'Processing', 'Out for Delivery', 'Delivered', 'Cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setOrderStatusFilter(status)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition cursor-pointer ${
                  orderStatusFilter === status
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Orders Table */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-850/50 text-zinc-400 uppercase text-[10px] font-bold tracking-wider">
                    <th className="py-3 px-4">Order ID & Date</th>
                    <th className="py-3 px-4">Customer & Phone</th>
                    <th className="py-3 px-4">Destination</th>
                    <th className="py-3 px-4">Items / Total</th>
                    <th className="py-3 px-4">Change Status</th>
                    <th className="py-3 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {filteredOrders.map((order) => {
                    const dateStr = order.createdAt?.toDate
                      ? order.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                      : 'Just Now';
                    const isRowUpdating = updatingOrderId === order.id;

                    return (
                      <tr key={order.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-850/50 transition">
                        {/* ID */}
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-zinc-900 dark:text-white block">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </span>
                          <span className="text-[11px] text-zinc-400">{dateStr}</span>
                        </td>

                        {/* Customer */}
                        <td className="py-3 px-4">
                          <span className="font-bold text-zinc-900 dark:text-white block">
                            {order.customerName}
                          </span>
                          <span className="text-[11px] text-zinc-400 block">{order.customerEmail}</span>
                          {order.customerPhone ? (
                            <a
                              href={`tel:${order.customerPhone}`}
                              className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 mt-0.5"
                              title="Call customer contact"
                            >
                              <Phone className="w-3 h-3 text-emerald-500 shrink-0" />
                              <span>{order.customerPhone}</span>
                            </a>
                          ) : (
                            <span className="text-[10px] text-zinc-400 italic block mt-0.5">No phone</span>
                          )}
                        </td>

                        {/* Destination */}
                        <td className="py-3 px-4 text-zinc-600 dark:text-zinc-300 max-w-[160px] truncate">
                          {order.deliveryAddress}
                        </td>

                        {/* Total */}
                        <td className="py-3 px-4">
                          <span className="font-bold font-mono text-zinc-900 dark:text-white block">
                            ₹{order.total.toFixed(2)}
                          </span>
                          <span className="text-[11px] text-zinc-400">
                            {order.items.length} items • {order.paymentMethod}
                          </span>
                        </td>

                        {/* Real-time Status dropdown with Supabase persistence */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <select
                              value={order.status}
                              disabled={isRowUpdating}
                              onChange={(e) => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
                              className={`px-3 py-1 rounded-xl text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer disabled:opacity-60 ${
                                order.status === 'Placed'
                                  ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200'
                                  : order.status === 'Confirmed'
                                  ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200'
                                  : order.status === 'Packed' || order.status === 'Processing'
                                  ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200'
                                  : order.status === 'Out for Delivery'
                                  ? 'bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200'
                                  : order.status === 'Delivered'
                                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200'
                                  : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                              }`}
                            >
                              <option value="Placed">Placed</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Packed">Packed</option>
                              <option value="Processing">Processing</option>
                              <option value="Out for Delivery">Out for Delivery</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                            {isRowUpdating && (
                              <RefreshCw className="w-3.5 h-3.5 text-emerald-500 animate-spin shrink-0" />
                            )}
                          </div>
                        </td>

                        {/* View Breakdown */}
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setInspectingOrder(order)}
                            className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition cursor-pointer"
                            title="Inspect Order Breakdown"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 text-zinc-900 dark:text-zinc-100 my-8"
          >
            <button
              onClick={() => setIsProductModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">
              {editingProduct ? 'Edit Grocery Product' : 'Add New Grocery Product'}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
              Product details will immediately sync with user storefronts via Firestore.
            </p>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Product Name / Title
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Fresh Organic Blueberries (Pack of 2)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs focus:ring-2 focus:ring-emerald-500"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Unit / Size
                  </label>
                  <input
                    type="text"
                    required
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    placeholder="e.g. 500g, 1L, 12 pcs"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Selling Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Original Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formOriginalPrice}
                    onChange={(e) => setFormOriginalPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Stock Units
                  </label>
                  <input
                    type="number"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Image URL (Unsplash or direct CDN link)
                </label>
                <input
                  type="url"
                  required
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Item Description
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="organic-check"
                  checked={formOrganic}
                  onChange={(e) => setFormOrganic(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 cursor-pointer"
                />
                <label htmlFor="organic-check" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                  Mark as 100% Organic Produce
                </label>
              </div>

              <button
                type="submit"
                disabled={formSaving}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition disabled:opacity-60"
              >
                {formSaving ? 'Saving to Database...' : editingProduct ? 'Update Product' : 'Add to Live Catalog'}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Inspect Order Modal */}
      {inspectingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 text-zinc-900 dark:text-zinc-100"
          >
            <button
              onClick={() => setInspectingOrder(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-extrabold text-base text-zinc-900 dark:text-white mb-1">
              Order Breakdown #{inspectingOrder.id.slice(0, 8).toUpperCase()}
            </h3>
            <p className="text-xs text-zinc-400 mb-3">
              Payment: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{inspectingOrder.paymentMethod}</span> • Status: <span className="font-bold text-emerald-600 dark:text-emerald-400">{inspectingOrder.status}</span>
            </p>

            {/* Customer Details Box */}
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 text-xs mb-3 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <span className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider block">Customer:</span>
                  <span className="font-bold text-zinc-900 dark:text-white text-sm">{inspectingOrder.customerName}</span>
                  <span className="text-zinc-400 block text-[11px]">{inspectingOrder.customerEmail}</span>
                </div>
                {inspectingOrder.customerPhone && (
                  <a
                    href={`tel:${inspectingOrder.customerPhone}`}
                    className="self-start sm:self-center px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{inspectingOrder.customerPhone}</span>
                  </a>
                )}
              </div>

              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700/80">
                <span className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider block mb-0.5">Delivery Address:</span>
                <p className="text-zinc-800 dark:text-zinc-200 font-medium leading-relaxed">{inspectingOrder.deliveryAddress}</p>
              </div>
            </div>

            <div className="max-h-52 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800 mb-3">
              {inspectingOrder.items.map(({ product, quantity }) => (
                <div key={product.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <img src={product.image} className="w-8 h-8 rounded-lg object-cover" alt="" referrerPolicy="no-referrer" />
                    <div>
                      <span className="font-bold block text-zinc-900 dark:text-zinc-100">{product.name}</span>
                      <span className="text-zinc-400">Qty: {quantity} • ₹{product.price.toFixed(2)} / {product.unit}</span>
                    </div>
                  </div>
                  <span className="font-bold font-mono text-zinc-900 dark:text-white">₹{(product.price * quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 flex justify-between font-extrabold text-sm">
              <span>Grand Total:</span>
              <span className="text-emerald-600 font-mono text-base">₹{inspectingOrder.total.toFixed(2)}</span>
            </div>
          </motion.div>
        </div>
      )}

      {/* Supabase Database Setup & Health Modal */}
      <SupabaseDatabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />
    </div>
  );
};
