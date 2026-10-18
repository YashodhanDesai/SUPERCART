import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Leaf, 
  Zap, 
  ShieldCheck, 
  Search, 
  ChevronLeft,
  ChevronRight,
  Percent,
  LayoutGrid,
  Apple,
  Carrot,
  Milk,
  Croissant,
  Coffee,
  Fish,
  Utensils,
  Flame,
  CheckCircle2,
  X,
  Star,
  MapPin,
  ArrowRight
} from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { HorizontalProductRow } from './HorizontalProductRow';
import { CATEGORIES } from '../data/seedProducts';
import { useLanguage } from '../context/LanguageContext';

interface StoreHomeProps {
  products: Product[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onQuickView: (product: Product) => void;
}

interface CategoryMeta {
  name: string;
  label: string;
  emoji: string;
  icon: React.ComponentType<{ className?: string }>;
  tagline: string;
  color: string;
}

const CATEGORY_METADATA: Record<string, CategoryMeta> = {
  All: {
    name: 'All',
    label: 'All Groceries',
    emoji: '🛒',
    icon: LayoutGrid,
    tagline: 'Farm-fresh groceries, seasonal harvest & daily staples',
    color: 'from-emerald-600 to-teal-700'
  },
  Fruits: {
    name: 'Fruits',
    label: 'Fruits',
    emoji: '🥭',
    icon: Apple,
    tagline: 'Authentic Ratnagiri Hapus, Mahabaleshwar berries & citrus',
    color: 'from-amber-500 to-rose-600'
  },
  Vegetables: {
    name: 'Vegetables',
    label: 'Vegetables',
    emoji: '🥬',
    icon: Carrot,
    tagline: 'Dawn-harvested organic greens, palak & fresh vegetables',
    color: 'from-emerald-600 to-green-700'
  },
  Dairy: {
    name: 'Dairy',
    label: 'Dairy & Ghee',
    emoji: '🥛',
    icon: Milk,
    tagline: 'Pure Desi Gir Cow A2 milk & Vedic Bilona clarified ghee',
    color: 'from-blue-500 to-cyan-600'
  },
  Bakery: {
    name: 'Bakery',
    label: 'Bakery',
    emoji: '🍞',
    icon: Croissant,
    tagline: 'Artisan sourdough loaves & freshly baked morning goods',
    color: 'from-amber-600 to-yellow-600'
  },
  'Snacks & Drinks': {
    name: 'Snacks & Drinks',
    label: 'Snacks & Drinks',
    emoji: '🥥',
    icon: Coffee,
    tagline: 'Coastal tender coconuts, cold-pressed juices & healthy snacks',
    color: 'from-purple-500 to-indigo-600'
  },
  'Meat & Seafood': {
    name: 'Meat & Seafood',
    label: 'Meat & Seafood',
    emoji: '🐟',
    icon: Fish,
    tagline: 'Sustainably sourced salmon portions & prime cuts',
    color: 'from-red-600 to-rose-700'
  },
  'Staples & Spices': {
    name: 'Staples & Spices',
    label: 'Staples & Spices',
    emoji: '🌾',
    icon: Utensils,
    tagline: 'Single-origin grains, pure spices & cold-pressed oils',
    color: 'from-orange-600 to-amber-700'
  },
  'Organic & Gourmet': {
    name: 'Organic & Gourmet',
    label: 'Organic & Gourmet',
    emoji: '🥑',
    icon: Leaf,
    tagline: '100% certified pesticide-free gourmet superfoods',
    color: 'from-teal-600 to-emerald-700'
  }
};

export const StoreHome: React.FC<StoreHomeProps> = ({
  products,
  searchQuery,
  setSearchQuery,
  onQuickView,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [onlyOrganic, setOnlyOrganic] = useState<boolean>(false);
  const categoriesScrollRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const scrollCategories = (dir: 'left' | 'right') => {
    if (categoriesScrollRef.current) {
      const scrollAmount = dir === 'left' ? -200 : 200;
      categoriesScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Seasonal Harvest items
  const seasonalHarvestProducts = products.filter(p => p.season || p.isFeatured || p.badge);

  // Filter products based on search, category, and organic filter
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.season && product.season.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.origin && product.origin.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'All' || product.category === selectedCategory;

    const matchesOrganic = !onlyOrganic || product.organic;

    return matchesSearch && matchesCategory && matchesOrganic;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
  });

  const activeCategoryMeta = CATEGORY_METADATA[selectedCategory] || CATEGORY_METADATA.All;

  return (
    <div id="store-home-view" className="space-y-4 sm:space-y-8 pb-10">
      
      {/* 1. ENHANCED SEASONAL HARVEST HERO SHOWCASE WITH REALISTIC INDIAN PRODUCE */}
      {!searchQuery && (
        <section className="relative rounded-3xl overflow-hidden shadow-xl border border-emerald-500/20 bg-linear-to-r from-emerald-950 via-teal-950 to-zinc-950 text-white">
          {/* Subtle decorative glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 p-5 sm:p-8 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Left Copy */}
            <div className="lg:col-span-6 space-y-3 sm:space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{t('seasonalFoods')}</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white">
                Fresh Harvest Direct from <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-emerald-400">Indian Farms</span>
              </h1>

              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-lg">
                {t('seasonalSubtitle')}. Authentic GI-tagged Ratnagiri Hapus Mangoes, Mahabaleshwar Strawberries & A2 Desi Dairy delivered in 15 minutes.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-semibold text-emerald-200">
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-xs">
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  {t('instantDelivery')}
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-xs">
                  <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                  {t('organicCertified')}
                </span>
              </div>
            </div>

            {/* Right: Interactive Seasonal Food Showcase Cards */}
            <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
              {seasonalHarvestProducts.slice(0, 3).map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ y: -3 }}
                  onClick={() => onQuickView(item)}
                  className="bg-white/10 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl p-2.5 border border-white/15 hover:border-emerald-400/50 transition cursor-pointer flex flex-col justify-between group shadow-lg"
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-2 bg-black/20">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-bold bg-amber-500 text-zinc-950">
                      {item.badge || 'Fresh'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-[11px] sm:text-xs font-bold text-white line-clamp-1 group-hover:text-amber-300 transition">
                      {item.name}
                    </h3>
                    <p className="text-[10px] text-zinc-300 line-clamp-1">{item.unit}</p>
                    <div className="flex items-center justify-between mt-1 pt-1 border-t border-white/10">
                      <span className="text-xs font-black text-amber-300 font-mono">₹{item.price}</span>
                      <span className="text-[10px] text-emerald-300 font-semibold group-hover:underline">View</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

          </div>
        </section>
      )}

      {/* 2. CATEGORIES SELECTOR BAR */}
      <div id="categories-filter-bar" className="relative">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm sm:text-lg font-extrabold text-zinc-900 dark:text-white tracking-tight">
              {t('categories')}
            </h2>
          </div>

          {/* Arrow controls */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => scrollCategories('left')}
              className="p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollCategories('right')}
              className="p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Categories List */}
        <div
          ref={categoriesScrollRef}
          className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none scroll-smooth"
        >
          {CATEGORIES.map((catName) => {
            const meta = CATEGORY_METADATA[catName] || CATEGORY_METADATA.All;
            const isSelected = selectedCategory === catName;
            return (
              <button
                key={catName}
                type="button"
                onClick={() => setSelectedCategory(catName)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap active:scale-95 cursor-pointer border ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                    : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200/80 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <span>{meta.emoji}</span>
                <span>{catName === 'All' ? t('all') : meta.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. FILTER BAR & SORTING CONTROLS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800 text-xs">
        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
          <span className="font-bold text-zinc-900 dark:text-white">
            {sortedProducts.length} {sortedProducts.length === 1 ? 'Product' : 'Products'}
          </span>
          <span>•</span>
          <span className="truncate">{activeCategoryMeta.tagline}</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* Organic Filter Toggle */}
          <button
            type="button"
            onClick={() => setOnlyOrganic(!onlyOrganic)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
              onlyOrganic
                ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-500'
                : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
            }`}
          >
            <Leaf className="w-3.5 h-3.5 text-emerald-600" />
            <span>Organic Only</span>
          </button>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-800 dark:text-zinc-200 outline-none cursor-pointer"
          >
            <option value="featured">Featured First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {/* 4. PRODUCTS IN EACH CATEGORY IN HORIZONTAL MANNER */}
      {sortedProducts.length === 0 ? (
        <div className="py-16 text-center text-zinc-400">
          <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-3">
            <Search className="w-8 h-8 text-zinc-300 dark:text-zinc-600" />
          </div>
          <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
            No fresh items match your filter
          </h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
            Try clearing search keywords or selecting another category above.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setOnlyOrganic(false);
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : selectedCategory === 'All' ? (
        <div className="space-y-6 sm:space-y-8">
          {CATEGORIES.filter((c) => c !== 'All').map((catName) => {
            const catProducts = sortedProducts.filter((p) => p.category === catName);
            if (catProducts.length === 0) return null;
            const meta = CATEGORY_METADATA[catName] || CATEGORY_METADATA.All;

            return (
              <HorizontalProductRow
                key={catName}
                title={meta.label || catName}
                subtitle={meta.tagline}
                icon={<span>{meta.emoji}</span>}
                products={catProducts}
                onQuickView={onQuickView}
                onSeeAll={() => setSelectedCategory(catName)}
              />
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          <HorizontalProductRow
            title={activeCategoryMeta.label || selectedCategory}
            subtitle={activeCategoryMeta.tagline}
            icon={<span>{activeCategoryMeta.emoji}</span>}
            products={sortedProducts}
            onQuickView={onQuickView}
          />
        </div>
      )}

    </div>
  );
};
