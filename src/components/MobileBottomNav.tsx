import React from 'react';
import { 
  Home, 
  LayoutGrid, 
  Package, 
  Sliders, 
  ShieldAlert,
  Heart
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useWishlist } from '../context/WishlistContext';
import { AppView } from './SettingsDrawer';

interface MobileBottomNavProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  onOpenLocationModal?: () => void;
  onSelectCategoriesTab?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  setCurrentView
}) => {
  const { userProfile } = useAuth();
  const { wishlist } = useWishlist();
  const { t } = useLanguage();
  const isAdmin = userProfile?.role === 'admin' || userProfile?.email?.toLowerCase().trim() === 'yashodhandesai94@gmail.com';

  return (
    <nav
      id="mobile-bottom-navbar"
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-lg border-t border-zinc-200/80 dark:border-zinc-800 transition-colors shadow-[0_-4px_20px_rgba(0,0,0,0.06)] print:hidden"
    >
      <div className="max-w-md mx-auto px-2 py-1.5 flex items-center justify-around">
        
        {/* 1. Home */}
        <button
          id="mobile-nav-home"
          type="button"
          onClick={() => setCurrentView('home')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition min-w-[56px] cursor-pointer ${
            currentView === 'home'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800'
          }`}
        >
          <div className={`p-1 rounded-xl transition ${currentView === 'home' ? 'bg-emerald-50 dark:bg-emerald-950/70' : ''}`}>
            <Home className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">{t('home')}</span>
        </button>

        {/* 2. Categories (Flipkart Style Dedicated Page) */}
        <button
          id="mobile-nav-categories"
          type="button"
          onClick={() => setCurrentView('categories')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition min-w-[56px] cursor-pointer ${
            currentView === 'categories'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800'
          }`}
        >
          <div className={`p-1 rounded-xl transition ${currentView === 'categories' ? 'bg-emerald-50 dark:bg-emerald-950/70' : ''}`}>
            <LayoutGrid className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">{t('categories')}</span>
        </button>

        {/* 3. Wishlist */}
        <button
          id="mobile-nav-wishlist"
          type="button"
          onClick={() => setCurrentView('wishlist')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition min-w-[56px] cursor-pointer relative ${
            currentView === 'wishlist'
              ? 'text-rose-600 dark:text-rose-400 font-bold'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800'
          }`}
        >
          <div className={`p-1 rounded-xl transition relative ${currentView === 'wishlist' ? 'bg-rose-50 dark:bg-rose-950/70' : ''}`}>
            <Heart className={`w-5 h-5 ${wishlist.length > 0 ? 'text-rose-500 fill-rose-500' : ''}`} />
            {wishlist.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[8px] font-black flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">{t('myWishlist')}</span>
        </button>

        {/* 4. Orders */}
        <button
          id="mobile-nav-orders"
          type="button"
          onClick={() => setCurrentView('orders')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition min-w-[56px] cursor-pointer ${
            currentView === 'orders'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800'
          }`}
        >
          <div className={`p-1 rounded-xl transition ${currentView === 'orders' ? 'bg-emerald-50 dark:bg-emerald-950/70' : ''}`}>
            <Package className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">{t('orders')}</span>
        </button>

        {/* 5. Settings (or Admin if admin user) */}
        {isAdmin ? (
          <button
            id="mobile-nav-admin"
            type="button"
            onClick={() => setCurrentView('admin')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition min-w-[56px] cursor-pointer ${
              currentView === 'admin'
                ? 'text-amber-500 font-bold'
                : 'text-amber-600/80 dark:text-amber-400/80'
            }`}
          >
            <div className={`p-1 rounded-xl transition ${currentView === 'admin' ? 'bg-amber-50 dark:bg-amber-950/70' : ''}`}>
              <ShieldAlert className="w-5 h-5 text-amber-500" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">Admin</span>
          </button>
        ) : (
          <button
            id="mobile-nav-settings"
            type="button"
            onClick={() => setCurrentView('settings')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition min-w-[56px] cursor-pointer ${
              currentView === 'settings'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800'
            }`}
          >
            <div className={`p-1 rounded-xl transition ${currentView === 'settings' ? 'bg-emerald-50 dark:bg-emerald-950/70' : ''}`}>
              <Sliders className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">{t('settingsTitle')}</span>
          </button>
        )}

      </div>
    </nav>
  );
};
