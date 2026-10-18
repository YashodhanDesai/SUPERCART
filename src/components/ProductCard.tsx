import React from 'react';
import { motion } from 'motion/react';
import { Plus, Minus, Star, Leaf, AlertCircle, Heart } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useLanguage } from '../context/LanguageContext';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { items, addItem, updateQuantity } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { t } = useLanguage();

  const cartItem = items.find((item) => item.product.id === product.id);
  const qty = cartItem ? cartItem.quantity : 0;
  const isWishlisted = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      id={`product-card-${product.id}`}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="group relative flex flex-col justify-between bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl p-2 sm:p-3.5 border border-zinc-200/90 dark:border-zinc-800 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 shadow-xs hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 overflow-hidden"
    >
      {/* Top badges & Wishlist Button */}
      <div className="relative w-full aspect-square rounded-xl sm:rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 overflow-hidden mb-1.5 sm:mb-2.5 flex items-center justify-center">
        {/* Product Image */}
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
          onClick={() => onQuickView && onQuickView(product)}
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Top Left Badges */}
        <div className="absolute top-1 left-1 sm:top-2 sm:left-2 flex flex-col gap-1 z-10">
          {discountPercent > 0 && (
            <span className="px-1.5 py-0.5 rounded-md text-[8.5px] sm:text-[10px] font-black uppercase tracking-wider bg-amber-400 text-emerald-950 shadow-xs">
              {discountPercent}% OFF
            </span>
          )}
          {product.organic && (
            <span className="px-1.5 py-0.5 rounded-md text-[8.5px] sm:text-[10px] font-bold bg-emerald-600 text-white flex items-center gap-0.5 shadow-xs">
              <Leaf className="w-2.5 h-2.5" />
              Organic
            </span>
          )}
        </div>

        {/* Top Right Wishlist Heart Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-1.5 right-1.5 sm:top-2 sm:right-2 p-1.5 rounded-full backdrop-blur-md transition-all shadow-xs z-10 cursor-pointer ${
            isWishlisted
              ? 'bg-rose-500 text-white scale-105'
              : 'bg-white/80 dark:bg-zinc-900/80 text-zinc-400 hover:text-rose-500 hover:scale-110'
          }`}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-white' : ''}`} />
        </button>

        {/* Stock Alert Badge */}
        {isOutOfStock ? (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-2 text-center">
            <span className="px-2 py-1 bg-red-600 text-white text-[10px] sm:text-xs font-bold rounded-lg sm:rounded-xl shadow-lg">
              {t('outOfStock')}
            </span>
          </div>
        ) : isLowStock ? (
          <span className="absolute bottom-1 left-1 sm:bottom-1.5 sm:left-1.5 px-1.5 py-0.5 rounded text-[8.5px] sm:text-[9.5px] font-bold bg-red-500/90 text-white backdrop-blur-xs flex items-center gap-0.5">
            <AlertCircle className="w-2.5 h-2.5" />
            {product.stock} left
          </span>
        ) : null}
      </div>

      {/* Product Details */}
      <div className="flex-1 flex flex-col">
        {/* Unit & Category */}
        <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-zinc-400 dark:text-zinc-500 font-medium mb-1">
          <span className="truncate">{product.category}</span>
          <span className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.2 rounded text-zinc-600 dark:text-zinc-400 font-mono">
            {product.unit}
          </span>
        </div>

        {/* Product Title */}
        <h4
          onClick={() => onQuickView && onQuickView(product)}
          className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors line-clamp-2 cursor-pointer mb-1 leading-tight min-h-[2rem]"
          title={product.name}
        >
          {product.name}
        </h4>

        {/* Rating and Reviews */}
        <div className="flex items-center gap-1 mb-1.5 sm:mb-2">
          <div className="flex items-center text-amber-400 text-xs">
            <Star className="w-3 h-3 fill-amber-400" />
            <span className="ml-1 font-bold text-zinc-700 dark:text-zinc-300 text-[10px] sm:text-xs">
              {product.rating || 4.9}
            </span>
          </div>
          <span className="text-[9px] sm:text-[10px] text-zinc-400">
            ({product.reviewCount || 95})
          </span>
        </div>

        {/* Price & Add to Cart Controls */}
        <div className="mt-auto pt-1 sm:pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-1">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-extrabold text-xs sm:text-base text-zinc-900 dark:text-white">
                ₹{product.price.toFixed(2)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-[9px] sm:text-xs text-zinc-400 line-through">
                  ₹{product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* Cart Stepper / Add Button */}
          {isOutOfStock ? (
            <button
              disabled
              className="py-1 px-2 rounded-lg sm:rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 text-[10px] sm:text-xs font-semibold cursor-not-allowed"
            >
              {t('outOfStock')}
            </button>
          ) : qty === 0 ? (
            <button
              id={`add-btn-${product.id}`}
              onClick={() => addItem(product, 1)}
              className="py-1 px-2 sm:py-1.5 sm:px-3 rounded-lg sm:rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-600 dark:hover:text-white border border-emerald-300 dark:border-emerald-700/60 font-extrabold text-[10px] sm:text-xs shadow-xs active:scale-95 transition-all flex items-center gap-0.5 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>{t('addToCart')}</span>
            </button>
          ) : (
            <div className="flex items-center bg-emerald-600 text-white rounded-lg sm:rounded-xl shadow-md shadow-emerald-600/20 p-0.5">
              <button
                id={`decrement-btn-${product.id}`}
                onClick={() => updateQuantity(product.id, qty - 1)}
                className="w-6 h-6 flex items-center justify-center hover:bg-emerald-700 rounded-md active:scale-90 transition cursor-pointer"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-5 text-center text-xs font-black font-mono">
                {qty}
              </span>
              <button
                id={`increment-btn-${product.id}`}
                onClick={() => updateQuantity(product.id, qty + 1)}
                disabled={qty >= product.stock}
                className="w-6 h-6 flex items-center justify-center hover:bg-emerald-700 rounded-md active:scale-90 transition disabled:opacity-50 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
