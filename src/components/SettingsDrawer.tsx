import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  User, 
  MapPin, 
  Package, 
  Languages, 
  Sun, 
  Moon, 
  ShieldAlert, 
  LogIn, 
  LogOut, 
  ChevronRight, 
  Sliders,
  Store,
  Grid,
  Heart,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage, Language } from '../context/LanguageContext';
import { useWishlist } from '../context/WishlistContext';

export type AppView = 'home' | 'categories' | 'wishlist' | 'orders' | 'profile' | 'bills' | 'settings' | 'admin';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  onOpenLocationModal: () => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  onClose,
  currentView,
  setCurrentView,
  onOpenLocationModal
}) => {
  const { user, userProfile, logout, openAuthModal } = useAuth();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { wishlist } = useWishlist();

  const isGuest = !user || !userProfile || user.uid.startsWith('shopper-guest-');
  const isAdmin = userProfile?.role === 'admin';

  const navigateTo = (view: AppView) => {
    setCurrentView(view);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
            onClick={onClose} 
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 left-0 max-w-full flex pr-10 sm:pr-0 z-50">
            <motion.div
              id="settings-drawer-panel"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 260 }}
              className="w-screen max-w-xs sm:max-w-sm bg-white dark:bg-zinc-900 shadow-2xl flex flex-col border-r border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 overflow-y-auto"
            >
              
              {/* 1. Header with Circular Icon showing User Name & Mobile Number */}
              <div className="p-4 sm:p-5 border-b border-zinc-200/90 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900 sticky top-0 z-10">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center font-extrabold text-base shadow-sm shrink-0">
                    {!isGuest && userProfile?.name ? (
                      userProfile.name.charAt(0).toUpperCase()
                    ) : (
                      <User className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    {!isGuest && userProfile ? (
                      <>
                        <h3 className="font-extrabold text-sm sm:text-base text-zinc-900 dark:text-white truncate">
                          {userProfile.name}
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium truncate mt-0.5">
                          {userProfile.phone || userProfile.phoneNumber || userProfile.email || 'Logged in shopper'}
                        </p>
                      </>
                    ) : (
                      <>
                        <h3 className="font-extrabold text-sm sm:text-base text-zinc-900 dark:text-white truncate">
                          Guest User
                        </h3>
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            openAuthModal('signin');
                          }}
                          className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 mt-0.5 cursor-pointer"
                        >
                          <span>Log in to your account</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <button
                  id="close-settings-drawer-btn"
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition cursor-pointer shrink-0 ml-2"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 3. Sub-options arranged one by one vertically below each other */}
              <div className="flex-1 p-3 sm:p-4 space-y-1 overflow-y-auto">
                
                {/* Store Home */}
                <button
                  type="button"
                  onClick={() => navigateTo('home')}
                  className="w-full flex items-center justify-between p-3 rounded-2xl text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Store className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs sm:text-sm font-medium">{t('home')} (Fresh Store)</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-400" />
                </button>

                {/* Explore Categories */}
                <button
                  type="button"
                  onClick={() => navigateTo('categories')}
                  className="w-full flex items-center justify-between p-3 rounded-2xl text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Grid className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <span className="text-xs sm:text-sm font-medium block">{t('allCategories')}</span>
                      <span className="text-[10px] text-zinc-400">All grocery departments</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-400" />
                </button>

                {/* Wishlist in Menu Bar */}
                <button
                  type="button"
                  onClick={() => navigateTo('wishlist')}
                  className="w-full flex items-center justify-between p-3 rounded-2xl text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                    <div>
                      <span className="text-xs sm:text-sm font-medium block">{t('myWishlist')}</span>
                      <span className="text-[10px] text-zinc-400">{wishlist.length} saved favorites</span>
                    </div>
                  </div>
                  {wishlist.length > 0 && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-600">
                      {wishlist.length}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-zinc-400" />
                </button>

                {/* Profile & Personal Details */}
                <button
                  type="button"
                  onClick={() => navigateTo('profile')}
                  className="w-full flex items-center justify-between p-3 rounded-2xl text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <span className="text-xs sm:text-sm font-medium block">{t('profile')}</span>
                      <span className="text-[10px] text-zinc-400">Name, Phone, Email & Gender</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-400" />
                </button>

                {/* My Past Orders & Track */}
                <button
                  type="button"
                  onClick={() => navigateTo('orders')}
                  className="w-full flex items-center justify-between p-3 rounded-2xl text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Package className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <span className="text-xs sm:text-sm font-medium block">{t('orders')}</span>
                      <span className="text-[10px] text-zinc-400">Order history & live tracking</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-400" />
                </button>

                {/* Separate Bills & Invoices Option */}
                <button
                  type="button"
                  onClick={() => navigateTo('bills')}
                  className="w-full flex items-center justify-between p-3 rounded-2xl text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <span className="text-xs sm:text-sm font-medium block">{t('bills')}</span>
                      <span className="text-[10px] text-zinc-400">Tax receipts & invoices</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-400" />
                </button>

                {/* Separate Settings Option */}
                <button
                  type="button"
                  onClick={() => navigateTo('settings')}
                  className="w-full flex items-center justify-between p-3 rounded-2xl text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <span className="text-xs sm:text-sm font-medium block">{t('settingsTitle')}</span>
                      <span className="text-[10px] text-zinc-400">App settings & preferences</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-400" />
                </button>

                {/* Admin Hub (if admin) */}
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => navigateTo('admin')}
                    className="w-full flex items-center justify-between p-3 rounded-2xl text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <ShieldAlert className="w-4 h-4 text-amber-500" />
                      <div>
                        <span className="text-xs sm:text-sm font-medium block">Admin Dashboard</span>
                        <span className="text-[10px] text-zinc-400">Catalog, Orders & Inventory</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-400" />
                  </button>
                )}

                {/* Divider */}
                <div className="pt-2 pb-1">
                  <div className="border-t border-zinc-100 dark:border-zinc-800" />
                </div>

                {/* Sub-option: Theme Toggle */}
                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 space-y-2">
                  <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 block uppercase tracking-wider">
                    {t('themeMode')}
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTheme('light')}
                      className={`p-2 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition border cursor-pointer ${
                        theme === 'light'
                          ? 'bg-white dark:bg-zinc-900 text-amber-600 border-amber-400 shadow-xs'
                          : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60'
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5" />
                      <span>{t('lightMode')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTheme('dark')}
                      className={`p-2 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition border cursor-pointer ${
                        theme === 'dark'
                          ? 'bg-zinc-900 text-emerald-400 border-emerald-500 shadow-xs'
                          : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60'
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5" />
                      <span>{t('darkMode')}</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* 4. Footer Login / Logout Button */}
              <div className="p-4 border-t border-zinc-200/90 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 sticky bottom-0">
                {isGuest ? (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      openAuthModal('signin');
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{t('login')} / Sign Up</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      onClose();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('logout')}</span>
                  </button>
                )}
              </div>

            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
