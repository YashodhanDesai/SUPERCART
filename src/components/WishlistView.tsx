import React from 'react';
import { Heart, ArrowLeft, ShoppingBag, Trash2 } from 'lucide-react';
import { Product } from '../types';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { ProductCard } from './ProductCard';
import { HorizontalProductRow } from './HorizontalProductRow';
import { CATEGORIES } from '../data/seedProducts';
import { useLanguage } from '../context/LanguageContext';

interface WishlistViewProps {
  onQuickView: (product: Product) => void;
  onNavigateHome: () => void;
}

export const WishlistView: React.FC<WishlistViewProps> = ({
  onQuickView,
  onNavigateHome
}) => {
  const { wishlist, clearWishlist } = useWishlist();
  const { addItem, setIsCartOpen } = useCart();
  const { t } = useLanguage();

  const handleAddAllToCart = () => {
    wishlist.forEach((product) => {
      addItem(product, 1);
    });
    setIsCartOpen(true);
  };

  return (
    <div className="w-full space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onNavigateHome}
            className="p-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition cursor-pointer flex items-center gap-1.5 text-xs sm:text-sm font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('backToStore')}</span>
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
              <span>{t('myWishlist')}</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                {wishlist.length}
              </span>
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {t('wishlistSubtitle')}
            </p>
          </div>
        </div>

        {wishlist.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAddAllToCart}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add All to Cart</span>
            </button>
            <button
              type="button"
              onClick={clearWishlist}
              className="p-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950/60 text-zinc-500 hover:text-rose-600 dark:text-zinc-400 transition cursor-pointer"
              title="Clear Wishlist"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Wishlist Grid */}
      {wishlist.length === 0 ? (
        <div className="p-12 sm:p-16 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-500">
            <Heart className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-black text-zinc-900 dark:text-white">
              {t('wishlistEmpty')}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-500 max-w-sm mx-auto">
              Explore our farm fresh fruits, veggies, and daily staples and tap the heart icon on any product to save it here.
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateHome}
            className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer"
          >
            {t('exploreSeasonal')}
          </button>
        </div>
      ) : (
        <div className="space-y-6 sm:space-y-8">
          {CATEGORIES.filter((c) => c !== 'All').map((catName) => {
            const catProducts = wishlist.filter((p) => p.category === catName);
            if (catProducts.length === 0) return null;

            return (
              <HorizontalProductRow
                key={catName}
                title={`${catName} Favorites`}
                subtitle={`Saved items in ${catName}`}
                products={catProducts}
                onQuickView={onQuickView}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
