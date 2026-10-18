import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Grid, 
  Search, 
  SlidersHorizontal, 
  ArrowLeft, 
  Sparkles, 
  ChevronRight, 
  Flame, 
  Filter,
  Check,
  Leaf,
  ArrowDownUp,
  Star,
  RotateCcw,
  Layers,
  LayoutGrid,
  X
} from 'lucide-react';
import { Product } from '../types';
import { CATEGORY_METADATA } from '../data/seedProducts';
import { ProductCard } from './ProductCard';
import { HorizontalProductRow } from './HorizontalProductRow';
import { useLanguage } from '../context/LanguageContext';

export type FilterCriterion = 'all' | 'organic' | 'bestsellers' | 'rating';
export type SortCriterion = 'none' | 'price-asc' | 'price-desc' | 'rating';

export const isProductOrganic = (p: Product): boolean => {
  if (p.organic === true) return true;
  const name = (p.name || '').toLowerCase();
  const desc = (p.description || '').toLowerCase();
  const badge = (p.badge || '').toLowerCase();
  return (
    name.includes('organic') ||
    desc.includes('organic') ||
    badge.includes('organic') ||
    name.includes('desi') ||
    desc.includes('desi') ||
    badge.includes('vedic') ||
    Boolean(p.ingredients && p.ingredients.some(i => i.toLowerCase().includes('organic')))
  );
};

export const isProductBestseller = (p: Product): boolean => {
  if (p.isFeatured) return true;
  const badge = (p.badge || '').toLowerCase();
  return (
    badge.includes('bestseller') ||
    badge.includes('king') ||
    badge.includes('star') ||
    badge.includes('staple') ||
    badge.includes('fresh') ||
    badge.includes('crunch') ||
    badge.includes('popular') ||
    (p.rating || 0) >= 4.85 ||
    (p.reviewCount || 0) >= 150
  );
};

export const isProductTopRated = (p: Product): boolean => {
  return (p.rating || 0) >= 4.8;
};

interface CategorySectionRowProps {
  id?: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  products: Product[];
  onQuickView: (product: Product) => void;
  onSeeAll?: () => void;
  globalFilter: FilterCriterion;
  globalSort: SortCriterion;
  isSingleCategoryView?: boolean;
}

const CategorySectionRow: React.FC<CategorySectionRowProps> = ({
  id,
  title,
  subtitle,
  icon,
  products,
  onQuickView,
  onSeeAll,
  globalFilter,
  globalSort,
  isSingleCategoryView = false
}) => {
  // Local section filter/sort state initialized from global
  const [sectionFilter, setSectionFilter] = useState<FilterCriterion>(globalFilter);
  const [sectionSort, setSectionSort] = useState<SortCriterion>(globalSort);
  const [viewMode, setViewMode] = useState<'carousel' | 'grid'>('carousel');

  // Synchronize when global category filter changes
  useEffect(() => {
    setSectionFilter(globalFilter);
  }, [globalFilter]);

  useEffect(() => {
    setSectionSort(globalSort);
  }, [globalSort]);

  // Section item counts
  const counts = useMemo(() => {
    const total = products.length;
    const organic = products.filter(isProductOrganic).length;
    const bestsellers = products.filter(isProductBestseller).length;
    const topRated = products.filter(isProductTopRated).length;
    return { total, organic, bestsellers, topRated };
  }, [products]);

  // Dynamically filter and sort products in this category section
  const displayedProducts = useMemo(() => {
    let list = [...products];

    if (sectionFilter === 'organic') {
      list = list.filter(isProductOrganic);
    } else if (sectionFilter === 'bestsellers') {
      list = list.filter(isProductBestseller);
    } else if (sectionFilter === 'rating') {
      list = list.filter(isProductTopRated);
    }

    if (sectionSort === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sectionSort === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sectionSort === 'rating') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return list;
  }, [products, sectionFilter, sectionSort]);

  const handleToggleFilter = (filterType: FilterCriterion) => {
    if (filterType === 'all') {
      setSectionFilter('all');
      setSectionSort('none');
    } else {
      setSectionFilter((prev) => (prev === filterType ? 'all' : filterType));
    }
  };

  const handleToggleSort = (sortType: SortCriterion) => {
    setSectionSort((prev) => (prev === sortType ? 'none' : sortType));
  };

  const isFiltered = sectionFilter !== 'all' || sectionSort !== 'none';

  // Render Filter Chips at the top of this category section
  const filterChipsNode = (
    <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none">
      <div className="flex items-center gap-1.5 shrink-0 flex-nowrap">
        {/* Chip: All */}
        <button
          type="button"
          onClick={() => handleToggleFilter('all')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
            sectionFilter === 'all' && sectionSort === 'none'
              ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-xs'
              : 'bg-zinc-100 hover:bg-zinc-200/90 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
          }`}
          aria-label={`Show all items in ${title}`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>All</span>
          <span className="text-[10px] opacity-80 font-medium">({counts.total})</span>
        </button>

        {/* Chip: Price: Low to High */}
        <button
          type="button"
          onClick={() => handleToggleSort('price-asc')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
            sectionSort === 'price-asc'
              ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-xs'
              : 'bg-zinc-100 hover:bg-zinc-200/90 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
          }`}
          aria-label={`Sort ${title} price low to high`}
        >
          <ArrowDownUp className="w-3.5 h-3.5" />
          <span>Price: Low to High</span>
          {sectionSort === 'price-asc' && <Check className="w-3 h-3 text-white stroke-[2.5]" />}
        </button>

        {/* Chip: Organic */}
        <button
          type="button"
          onClick={() => handleToggleFilter('organic')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
            sectionFilter === 'organic'
              ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-xs'
              : 'bg-zinc-100 hover:bg-zinc-200/90 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
          }`}
          aria-label={`Filter ${title} by organic produce`}
        >
          <Leaf className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 group-hover:scale-110" />
          <span>Organic</span>
          <span className="text-[10px] opacity-80 font-medium">({counts.organic})</span>
          {sectionFilter === 'organic' && <Check className="w-3 h-3 text-white stroke-[2.5]" />}
        </button>

        {/* Chip: Bestsellers */}
        <button
          type="button"
          onClick={() => handleToggleFilter('bestsellers')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
            sectionFilter === 'bestsellers'
              ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-xs'
              : 'bg-zinc-100 hover:bg-zinc-200/90 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
          }`}
          aria-label={`Filter ${title} by bestsellers`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          <span>Bestsellers</span>
          <span className="text-[10px] opacity-80 font-medium">({counts.bestsellers})</span>
          {sectionFilter === 'bestsellers' && <Check className="w-3 h-3 text-white stroke-[2.5]" />}
        </button>

        {/* Chip: Price: High to Low */}
        <button
          type="button"
          onClick={() => handleToggleSort('price-desc')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
            sectionSort === 'price-desc'
              ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-xs'
              : 'bg-zinc-100 hover:bg-zinc-200/90 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
          }`}
          aria-label={`Sort ${title} price high to low`}
        >
          <ArrowDownUp className="w-3.5 h-3.5" />
          <span>Price: High to Low</span>
          {sectionSort === 'price-desc' && <Check className="w-3 h-3 text-white stroke-[2.5]" />}
        </button>

        {/* Chip: Top Rated */}
        <button
          type="button"
          onClick={() => handleToggleFilter('rating')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
            sectionFilter === 'rating'
              ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-xs'
              : 'bg-zinc-100 hover:bg-zinc-200/90 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
          }`}
          aria-label={`Filter ${title} by top customer rating`}
        >
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>Top Rated (4.8★+)</span>
          <span className="text-[10px] opacity-80 font-medium">({counts.topRated})</span>
          {sectionFilter === 'rating' && <Check className="w-3 h-3 text-white stroke-[2.5]" />}
        </button>

        {/* Reset Chip if local filter is active */}
        {isFiltered && (
          <button
            type="button"
            onClick={() => {
              setSectionFilter('all');
              setSectionSort('none');
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white bg-zinc-200/70 dark:bg-zinc-700 hover:bg-zinc-300/80 transition cursor-pointer shrink-0"
            title="Reset filter on this section"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Grid vs Carousel Layout Toggle for single category view */}
      {isSingleCategoryView && (
        <div className="hidden sm:flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-xl border border-zinc-200 dark:border-zinc-700 shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('carousel')}
            className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              viewMode === 'carousel'
                ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400'
            }`}
            title="Horizontal scroll row"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400'
            }`}
            title="Grid view"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );

  // If in Grid view mode (available when single subcategory is selected)
  if (isSingleCategoryView && viewMode === 'grid') {
    return (
      <section id={id || `category-row-${title.toLowerCase().replace(/\s+/g, '-')}`} className="space-y-3 py-1">
        {/* Header */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5 min-w-0">
            {icon && (
              <div className="text-xl sm:text-2xl shrink-0 flex items-center justify-center">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-white tracking-tight truncate">
                  {title}
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 shrink-0">
                  {displayedProducts.length} {displayedProducts.length === 1 ? 'item' : 'items'}
                </span>
              </div>
              {subtitle && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <button
              type="button"
              onClick={() => setViewMode('carousel')}
              className="p-1.5 rounded-lg text-xs font-bold transition cursor-pointer text-zinc-500 hover:text-zinc-800 dark:text-zinc-400"
              title="Horizontal scroll row"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className="p-1.5 rounded-lg text-xs font-bold transition cursor-pointer bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-2xs"
              title="Grid view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Filter Chips at the top of category section */}
        <div className="px-1">
          {filterChipsNode}
        </div>

        {/* Grid List */}
        {displayedProducts.length === 0 ? (
          <div className="py-8 px-4 text-center rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-dashed border-zinc-200 dark:border-zinc-700">
            <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
              No products in {title} match the selected filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSectionFilter('all');
                setSectionSort('none');
              }}
              className="mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              Reset filters to show all {products.length} products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-1">
            {displayedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={onQuickView}
              />
            ))}
          </div>
        )}
      </section>
    );
  }

  // Standard Horizontal Product Row with Filter Chips at Top of Section
  return (
    <HorizontalProductRow
      id={id}
      title={title}
      subtitle={subtitle}
      icon={icon}
      products={displayedProducts}
      onQuickView={onQuickView}
      onSeeAll={onSeeAll}
      filterChips={filterChipsNode}
      emptyMessage={`No products in ${title} match the selected filter (${sectionFilter !== 'all' ? sectionFilter : sectionSort}).`}
    />
  );
};

interface CategoriesViewProps {
  products: Product[];
  onQuickView: (product: Product) => void;
  onNavigateHome: () => void;
  initialCategory?: string;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  products,
  onQuickView,
  onNavigateHome,
  initialCategory
}) => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialCategory || CATEGORY_METADATA[0].id
  );
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('All');
  const [categorySearch, setCategorySearch] = useState<string>('');
  
  // Category-wide filter & sort criteria
  const [globalFilter, setGlobalFilter] = useState<FilterCriterion>('all');
  const [globalSort, setGlobalSort] = useState<SortCriterion>('none');

  const activeCategoryMeta = useMemo(() => {
    return (
      CATEGORY_METADATA.find((c) => c.id === selectedCategory) ||
      CATEGORY_METADATA[0]
    );
  }, [selectedCategory]);

  // Base products for the active category (filtered by search query if any)
  const categoryProducts = useMemo(() => {
    let list = products.filter((p) => p.category === selectedCategory);

    if (categorySearch.trim()) {
      const q = categorySearch.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.badge && p.badge.toLowerCase().includes(q))
      );
    }

    return list;
  }, [products, selectedCategory, categorySearch]);

  // Category-wide item metrics
  const categoryMetrics = useMemo(() => {
    const total = categoryProducts.length;
    const organic = categoryProducts.filter(isProductOrganic).length;
    const bestsellers = categoryProducts.filter(isProductBestseller).length;
    const topRated = categoryProducts.filter(isProductTopRated).length;
    return { total, organic, bestsellers, topRated };
  }, [categoryProducts]);

  // Handle global filter chip clicks
  const handleGlobalFilter = (filterType: FilterCriterion) => {
    if (filterType === 'all') {
      setGlobalFilter('all');
      setGlobalSort('none');
    } else {
      setGlobalFilter((prev) => (prev === filterType ? 'all' : filterType));
    }
  };

  const handleGlobalSort = (sortType: SortCriterion) => {
    setGlobalSort((prev) => (prev === sortType ? 'none' : sortType));
  };

  const isGlobalFiltered = globalFilter !== 'all' || globalSort !== 'none';

  return (
    <div className="w-full space-y-4 sm:space-y-6 animate-fade-in">
      {/* 1. Header Bar with Back Button & Breadcrumbs */}
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
              <Grid className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>{t('exploreCategories')}</span>
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Browse departmental stores with 15-minute quick delivery
            </p>
          </div>
        </div>

        {/* Quick Search inside Categories */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
            placeholder={`Search in ${activeCategoryMeta.name}...`}
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700 rounded-2xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>
      </div>

      {/* 2. Main Flipkart-Style Layout: Left Category Nav + Right Products Area */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-start">
        
        {/* Categories Navigation: Horizontal scrolling chips bar on mobile, vertical sidebar on desktop */}
        <div className="md:col-span-4 lg:col-span-3 bg-white dark:bg-zinc-900 p-2 sm:p-3 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-1.5 md:sticky md:top-28">
          <div className="hidden md:flex px-3 py-2 border-b border-zinc-100 dark:border-zinc-800 items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">
              {t('allCategories')}
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              {CATEGORY_METADATA.length} Departments
            </span>
          </div>

          <div className="flex md:flex-col overflow-x-auto md:overflow-x-visible gap-1.5 p-1 pb-2 md:pb-0 scrollbar-none scroll-smooth">
            {CATEGORY_METADATA.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const productCount = products.filter((p) => p.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setSelectedSubCategory('All');
                    setCategorySearch('');
                    setGlobalFilter('all');
                    setGlobalSort('none');
                  }}
                  className={`shrink-0 md:w-full flex items-center justify-between px-3 py-2 md:p-3 rounded-2xl text-left transition cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 font-bold'
                      : 'bg-zinc-50 dark:bg-zinc-800/60 md:bg-transparent md:dark:bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-2 md:gap-2.5 min-w-0">
                    <span className="text-base sm:text-lg">{cat.icon}</span>
                    <div className="min-w-0">
                      <span className="text-xs sm:text-sm block truncate">
                        {cat.name}
                      </span>
                      <span className={`text-[10px] hidden md:block ${isSelected ? 'text-emerald-100' : 'text-zinc-400'}`}>
                        {productCount} items
                      </span>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 hidden md:block ${isSelected ? 'text-white' : 'text-zinc-400'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Dynamic Products & Department Content */}
        <div className="md:col-span-8 lg:col-span-9 space-y-4">
          
          {/* Active Category Hero Card */}
          <div className="relative rounded-3xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800 bg-zinc-900 text-white min-h-[140px] sm:min-h-[160px] flex flex-col justify-end p-5 sm:p-6 shadow-md">
            <img
              src={activeCategoryMeta.bannerImg}
              alt={activeCategoryMeta.name}
              className="absolute inset-0 w-full h-full object-cover opacity-35"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            
            <div className="relative z-10 space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/30 backdrop-blur-md border border-emerald-400/40 text-emerald-300 text-xs font-bold">
                <span>{activeCategoryMeta.icon}</span>
                <span>{activeCategoryMeta.name}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {activeCategoryMeta.name} Store
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300 max-w-xl">
                {activeCategoryMeta.description}
              </p>
            </div>
          </div>

          {/* Sub-Category Pills & Category-Wide Filter Chips Bar */}
          <div className="bg-white dark:bg-zinc-900 p-3 sm:p-4 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 space-y-3 shadow-xs">
            
            {/* Top Row: Sub-categories tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider mr-1 hidden sm:inline shrink-0">
                Department:
              </span>
              <button
                type="button"
                onClick={() => setSelectedSubCategory('All')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                  selectedSubCategory === 'All'
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                All Sub-types
              </button>
              {activeCategoryMeta.subcategories.map((sub) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSelectedSubCategory(sub)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                    selectedSubCategory === sub
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>

            {/* Bottom Row: Category-Wide Quick Filter Chips */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none flex-nowrap">
                <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1 shrink-0 mr-1">
                  <Filter className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Filter All:</span>
                </span>

                {/* All */}
                <button
                  type="button"
                  onClick={() => handleGlobalFilter('all')}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                    globalFilter === 'all' && globalSort === 'none'
                      ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-xs'
                      : 'bg-zinc-100 hover:bg-zinc-200/90 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <span>All ({categoryMetrics.total})</span>
                </button>

                {/* Price: Low to High */}
                <button
                  type="button"
                  onClick={() => handleGlobalSort('price-asc')}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                    globalSort === 'price-asc'
                      ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-xs'
                      : 'bg-zinc-100 hover:bg-zinc-200/90 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <ArrowDownUp className="w-3 h-3" />
                  <span>Price: Low to High</span>
                  {globalSort === 'price-asc' && <Check className="w-3 h-3 text-white" />}
                </button>

                {/* Organic */}
                <button
                  type="button"
                  onClick={() => handleGlobalFilter('organic')}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                    globalFilter === 'organic'
                      ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-xs'
                      : 'bg-zinc-100 hover:bg-zinc-200/90 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <Leaf className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                  <span>Organic ({categoryMetrics.organic})</span>
                  {globalFilter === 'organic' && <Check className="w-3 h-3 text-white" />}
                </button>

                {/* Bestsellers */}
                <button
                  type="button"
                  onClick={() => handleGlobalFilter('bestsellers')}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                    globalFilter === 'bestsellers'
                      ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-xs'
                      : 'bg-zinc-100 hover:bg-zinc-200/90 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <Flame className="w-3 h-3 text-amber-500" />
                  <span>Bestsellers ({categoryMetrics.bestsellers})</span>
                  {globalFilter === 'bestsellers' && <Check className="w-3 h-3 text-white" />}
                </button>

                {/* Price: High to Low */}
                <button
                  type="button"
                  onClick={() => handleGlobalSort('price-desc')}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                    globalSort === 'price-desc'
                      ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-xs'
                      : 'bg-zinc-100 hover:bg-zinc-200/90 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <ArrowDownUp className="w-3 h-3" />
                  <span>Price: High to Low</span>
                  {globalSort === 'price-desc' && <Check className="w-3 h-3 text-white" />}
                </button>
              </div>

              {/* Reset Global Filters */}
              {isGlobalFiltered && (
                <button
                  type="button"
                  onClick={() => {
                    setGlobalFilter('all');
                    setGlobalSort('none');
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition cursor-pointer shrink-0 self-start sm:self-auto"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset All</span>
                </button>
              )}
            </div>
          </div>

          {/* Product Category Sections */}
          {categoryProducts.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-2xl">
                🔍
              </div>
              <h3 className="font-extrabold text-base text-zinc-900 dark:text-white">
                No items match your search
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Try searching for a different keyword or switch to another category in the sidebar.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedSubCategory('All');
                  setCategorySearch('');
                  setGlobalFilter('all');
                  setGlobalSort('none');
                }}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-emerald-500 cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : selectedSubCategory === 'All' ? (
            <div className="space-y-6">
              {/* Show products by subcategory section with filter chips at top of each section */}
              {activeCategoryMeta.subcategories.map((sub) => {
                const subProds = categoryProducts.filter((p) => {
                  const s = sub.toLowerCase();
                  return (
                    p.name.toLowerCase().includes(s) ||
                    p.description.toLowerCase().includes(s) ||
                    (p.badge && p.badge.toLowerCase().includes(s))
                  );
                });

                if (subProds.length === 0) return null;

                return (
                  <CategorySectionRow
                    key={sub}
                    title={sub}
                    subtitle={`Fresh ${sub} in ${activeCategoryMeta.name}`}
                    products={subProds}
                    onQuickView={onQuickView}
                    onSeeAll={() => setSelectedSubCategory(sub)}
                    globalFilter={globalFilter}
                    globalSort={globalSort}
                  />
                );
              })}

              {/* All Category Groceries Section with filter chips at top of section */}
              <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800">
                <CategorySectionRow
                  title={`All ${activeCategoryMeta.name} Groceries`}
                  subtitle={`Every item available under ${activeCategoryMeta.name}`}
                  icon={<span>{activeCategoryMeta.icon}</span>}
                  products={categoryProducts}
                  onQuickView={onQuickView}
                  globalFilter={globalFilter}
                  globalSort={globalSort}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Single Subcategory View with filter chips at top of section & Grid toggle */}
              {(() => {
                const subProds = categoryProducts.filter((p) => {
                  const s = selectedSubCategory.toLowerCase();
                  return (
                    p.name.toLowerCase().includes(s) ||
                    p.description.toLowerCase().includes(s) ||
                    (p.badge && p.badge.toLowerCase().includes(s))
                  );
                });

                return (
                  <CategorySectionRow
                    title={`${selectedSubCategory} in ${activeCategoryMeta.name}`}
                    subtitle={`Browse all items in ${selectedSubCategory}`}
                    icon={<span>{activeCategoryMeta.icon}</span>}
                    products={subProds.length > 0 ? subProds : categoryProducts}
                    onQuickView={onQuickView}
                    globalFilter={globalFilter}
                    globalSort={globalSort}
                    isSingleCategoryView={true}
                  />
                );
              })()}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
