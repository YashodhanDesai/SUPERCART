import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface HorizontalProductRowProps {
  id?: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  products: Product[];
  onQuickView: (product: Product) => void;
  onSeeAll?: () => void;
  filterChips?: React.ReactNode;
  emptyMessage?: string;
}

export const HorizontalProductRow: React.FC<HorizontalProductRowProps> = ({
  id,
  title,
  subtitle,
  icon,
  products,
  onQuickView,
  onSeeAll,
  filterChips,
  emptyMessage
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (products.length === 0 && !filterChips) return null;

  return (
    <section id={id || `category-row-${title.toLowerCase().replace(/\s+/g, '-')}`} className="space-y-2 py-1">
      {/* Category Row Header */}
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
                {products.length} {products.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            {subtitle && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Action Controls: Left/Right arrows + See All */}
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {onSeeAll && (
            <button
              type="button"
              onClick={onSeeAll}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1 mr-1 sm:mr-2 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {products.length > 0 && (
            <>
              <button
                type="button"
                onClick={() => handleScroll('left')}
                className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition active:scale-90 cursor-pointer shadow-2xs"
                aria-label={`Scroll ${title} left`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleScroll('right')}
                className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition active:scale-90 cursor-pointer shadow-2xs"
                aria-label={`Scroll ${title} right`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter Chips at the top of this category section */}
      {filterChips && (
        <div className="px-1">
          {filterChips}
        </div>
      )}

      {/* Horizontal Scroll Area or Filter Empty State */}
      {products.length === 0 ? (
        <div className="mx-1 py-5 px-4 text-center rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-dashed border-zinc-200 dark:border-zinc-700">
          <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
            {emptyMessage || `No products match this filter in ${title}.`}
          </p>
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="flex gap-2.5 sm:gap-3.5 overflow-x-auto pb-3 pt-1 px-1 scrollbar-none scroll-smooth snap-x snap-mandatory"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="w-[150px] sm:w-[195px] md:w-[215px] shrink-0 snap-start"
            >
              <ProductCard
                product={product}
                onQuickView={onQuickView}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
