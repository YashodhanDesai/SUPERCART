import React from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  Star, 
  Leaf, 
  Plus, 
  Minus, 
  ShieldCheck, 
  Truck, 
  RefreshCw, 
  Activity, 
  Flame, 
  Dna, 
  Wheat, 
  MapPin, 
  Sparkles 
} from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

interface ProductQuickViewProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductQuickView: React.FC<ProductQuickViewProps> = ({ product, onClose }) => {
  const { items, addItem, updateQuantity } = useCart();
  const { t } = useLanguage();

  if (!product) return null;

  const cartItem = items.find((item) => item.product.id === product.id);
  const qty = cartItem ? cartItem.quantity : 0;
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <motion.div
        id="product-quick-view-modal"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden text-zinc-900 dark:text-zinc-100 max-h-[92vh] flex flex-col"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-30 p-2 rounded-full bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white transition shadow-md cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 overflow-y-auto">
          {/* Image side */}
          <div className="md:col-span-5 relative aspect-square md:aspect-auto bg-zinc-100 dark:bg-zinc-800/50 flex items-center justify-center overflow-hidden min-h-[260px] md:min-h-full">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {product.organic && (
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-600 text-white flex items-center gap-1 shadow-md">
                <Leaf className="w-3.5 h-3.5" />
                {t('organicCertified')}
              </span>
            )}
            {product.badge && (
              <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-500 text-white shadow-md flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                {product.badge}
              </span>
            )}
          </div>

          {/* Details side */}
          <div className="md:col-span-7 p-5 sm:p-7 flex flex-col justify-between space-y-4">
            <div>
              {/* Category & Unit */}
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                  {product.category}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                  {product.unit}
                </span>
                {product.season && (
                  <span className="text-xs px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 font-semibold">
                    {product.season}
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-2">
                {product.name}
              </h2>

              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center text-amber-400 text-sm">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span className="ml-1 font-bold text-zinc-800 dark:text-zinc-200">
                    {product.rating || 4.9}
                  </span>
                </div>
                <span className="text-xs text-zinc-400">
                  ({product.reviewCount || 120} reviews)
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  • {product.stock > 0 ? t('inStock') : t('outOfStock')}
                </span>
              </div>

              {product.origin && (
                <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-300 mb-3 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('origin')}: {product.origin}</span>
                </div>
              )}

              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4">
                {product.description}
              </p>

              {/* 1. NUTRITION BREAKDOWN (Protein, Carbs, Calories, Fats, Fiber) */}
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 space-y-2 mb-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-white">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span>{t('nutritionalInfo')}</span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-center pt-1">
                  <div className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-700/50 shadow-xs">
                    <span className="text-[10px] text-zinc-400 block font-medium">{t('calories')}</span>
                    <span className="text-xs sm:text-sm font-extrabold text-amber-600 dark:text-amber-400">
                      {product.nutrition?.calories ?? 55} <span className="text-[10px] font-normal">kcal</span>
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-700/50 shadow-xs">
                    <span className="text-[10px] text-zinc-400 block font-medium">{t('protein')}</span>
                    <span className="text-xs sm:text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                      {product.nutrition?.protein ?? 1.2}g
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-700/50 shadow-xs">
                    <span className="text-[10px] text-zinc-400 block font-medium">{t('carbohydrates')}</span>
                    <span className="text-xs sm:text-sm font-extrabold text-blue-600 dark:text-blue-400">
                      {product.nutrition?.carbs ?? 12.5}g
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-700/50 shadow-xs">
                    <span className="text-[10px] text-zinc-400 block font-medium">{t('fat')}</span>
                    <span className="text-xs sm:text-sm font-extrabold text-rose-600 dark:text-rose-400">
                      {product.nutrition?.fat ?? 0.3}g
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-700/50 shadow-xs col-span-3 sm:col-span-1">
                    <span className="text-[10px] text-zinc-400 block font-medium">{t('fiber')}</span>
                    <span className="text-xs sm:text-sm font-extrabold text-purple-600 dark:text-purple-400">
                      {product.nutrition?.fiber ?? 2.1}g
                    </span>
                  </div>
                </div>

                {product.nutrition?.keyVitamins && (
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 pt-1">
                    <span className="font-bold text-zinc-700 dark:text-zinc-300">{t('keyVitamins')}:</span> {product.nutrition.keyVitamins}
                  </p>
                )}
              </div>

              {/* 2. INGREDIENTS LIST */}
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 text-xs mb-4">
                <span className="font-bold text-zinc-900 dark:text-white block mb-1">
                  {t('ingredients')}:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(product.ingredients || ['100% Naturally Farm-Grown Produce', 'Zero Artificial Preservatives']).map((ing, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-[11px] font-medium"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Price & Action */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <div>
                <span className="text-xs text-zinc-400 block">Price</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-zinc-900 dark:text-white">
                    ₹{product.price.toFixed(2)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-sm text-zinc-400 line-through">
                      ₹{product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              {isOutOfStock ? (
                <button
                  disabled
                  className="px-6 py-3 rounded-2xl bg-zinc-200 dark:bg-zinc-800 text-zinc-400 font-bold text-sm cursor-not-allowed"
                >
                  {t('outOfStock')}
                </button>
              ) : qty === 0 ? (
                <button
                  onClick={() => addItem(product, 1)}
                  className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 active:scale-95 transition flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('addToCart')}</span>
                </button>
              ) : (
                <div className="flex items-center bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-600/20 p-1">
                  <button
                    onClick={() => updateQuantity(product.id, qty - 1)}
                    className="w-9 h-9 flex items-center justify-center hover:bg-emerald-700 rounded-xl active:scale-90 transition cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-black font-mono">
                    {qty}
                  </span>
                  <button
                    onClick={() => updateQuantity(product.id, qty + 1)}
                    disabled={qty >= product.stock}
                    className="w-9 h-9 flex items-center justify-center hover:bg-emerald-700 rounded-xl active:scale-90 transition disabled:opacity-50 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
