import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, 
  ShoppingBag, 
  MapPin, 
  Search, 
  Package, 
  Sliders, 
  ShieldAlert, 
  User, 
  LogIn, 
  Camera, 
  Mic, 
  ChevronDown, 
  Home, 
  X, 
  Sparkles, 
  Volume2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { SettingsDrawer, AppView } from './SettingsDrawer';
import { MediaSearchModal, MediaSearchType } from './MediaSearchModal';

interface NavbarProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  onOpenLocationModal: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  onOpenLocationModal,
  searchQuery,
  setSearchQuery,
}) => {
  const { user, userProfile, openAuthModal } = useAuth();
  const { itemCount, subtotal, setIsCartOpen } = useCart();
  const { t } = useLanguage();

  const [isSettingsDrawerOpen, setIsSettingsDrawerOpen] = useState(false);
  const [mediaModalType, setMediaModalType] = useState<MediaSearchType | null>(null);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const isGuest = !user || !userProfile || user.uid.startsWith('shopper-guest-');
  const isAdmin = userProfile?.role === 'admin' || (userProfile?.email || user?.email)?.toLowerCase().trim() === 'yashodhandesai94@gmail.com';
  const deliveryAddress = userProfile?.address ? userProfile.address : 'Select delivery location';

  // Toggle inline speech-to-text recognition directly in search bar
  const handleToggleVoiceSearch = () => {
    if (isVoiceListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsVoiceListening(false);
      setVoiceNotice(null);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Fallback to voice helper modal if browser engine lacks native Web Speech
      setMediaModalType('voice');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN'; // Optimized for Indian English / Hinglish

      recognition.onstart = () => {
        setIsVoiceListening(true);
        setVoiceNotice('Listening... speak now (e.g. "Mango", "Milk")');
        if (currentView !== 'home' && currentView !== 'categories') {
          setCurrentView('home');
        }
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setSearchQuery(transcript);
        setVoiceNotice(`Heard: "${transcript}"`);
      };

      recognition.onerror = (event: any) => {
        console.warn('Inline voice recognition event:', event.error);
        setIsVoiceListening(false);
        if (event.error === 'not-allowed') {
          setVoiceNotice('Microphone permission required.');
        } else {
          setVoiceNotice(null);
        }
      };

      recognition.onend = () => {
        setIsVoiceListening(false);
        setTimeout(() => setVoiceNotice(null), 2500);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('Speech recognition error:', err);
      setMediaModalType('voice');
    }
  };

  // Rotating search placeholders like Flipkart / Quick Commerce
  const searchPlaceholders = [
    'Search "Ratnagiri Alphonso Mangoes"...',
    'Search "Desi Gir Cow A2 Milk & Ghee"...',
    'Search "Mahabaleshwar Strawberries"...',
    'Search "Farm Fresh Organic Spinach"...',
    'Search "Artisan Sourdough Loaf"...',
    'Search "Roasted Himalayan Makhana"...',
    'Search "Lakadong High-Curcumin Haldi"...'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % searchPlaceholders.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [searchPlaceholders.length]);

  return (
    <>
      {/* 1. Slide-out Settings Drawer (3 horizontal lines menu) */}
      <SettingsDrawer
        isOpen={isSettingsDrawerOpen}
        onClose={() => setIsSettingsDrawerOpen(false)}
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenLocationModal={onOpenLocationModal}
      />

      {/* 2. Interactive Camera, Voice Mic, and QR Barcode Scanner Modal */}
      <MediaSearchModal
        isOpen={mediaModalType !== null}
        type={mediaModalType}
        onClose={() => setMediaModalType(null)}
        onSelectQuery={(query) => {
          setSearchQuery(query);
          if (currentView !== 'home' && currentView !== 'categories') {
            setCurrentView('home');
          }
        }}
      />

      {/* 3. Main Sticky Navbar Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800 transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3 space-y-2">
          
          {/* ROW 1: TOP BAR with 3 Horizontal Lines (Top Left), SuperCart Logo, Location on Desktop, and Top Right Actions */}
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            
            {/* Left Section: 3 Horizontal Lines Settings Menu + SuperCart Brand */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              
              {/* 3 Horizontal Lines Settings Icon at TOP LEFT CORNER */}
              <button
                id="top-left-settings-menu-btn"
                type="button"
                onClick={() => setIsSettingsDrawerOpen(true)}
                className="p-2 sm:p-2.5 rounded-2xl bg-zinc-100 hover:bg-emerald-50 active:scale-95 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 hover:text-emerald-700 dark:text-zinc-200 dark:hover:text-emerald-300 border border-zinc-200 dark:border-zinc-700 transition cursor-pointer shadow-xs"
                title="Settings & Menu"
                aria-label="Open Settings and Menu"
              >
                <Menu className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
              </button>

              {/* Brand Logo & Name */}
              <button
                id="brand-logo-btn"
                onClick={() => setCurrentView('home')}
                className="flex items-center gap-2.5 focus:outline-none shrink-0 group text-left cursor-pointer"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-md shadow-emerald-600/25 group-hover:scale-105 transition-transform overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="scNavGrad" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#10B981" />
                        <stop offset="1" stopColor="#047857" />
                      </linearGradient>
                      <linearGradient id="scBolt" x1="15" y1="7" x2="21" y2="20" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#FDE047" />
                        <stop offset="1" stopColor="#F59E0B" />
                      </linearGradient>
                    </defs>
                    <rect width="32" height="32" rx="9" fill="url(#scNavGrad)" />
                    <path d="M7 9.5H9.5L12.5 19.5H23L25 12H11" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="13.5" cy="23" r="1.6" fill="white" />
                    <circle cx="22" cy="23" r="1.6" fill="white" />
                    <path d="M19 7.5L15 13.5H18.5L16.5 18.5L22 12.5H18.5L19 7.5Z" fill="url(#scBolt)" stroke="#047857" strokeWidth="0.5"/>
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-base sm:text-xl tracking-tight text-zinc-900 dark:text-white">
                      Super<span className="text-emerald-600 dark:text-emerald-400">Cart</span>
                    </span>
                  </div>
                </div>
              </button>
            </div>

            {/* Desktop Location Pill (Shown in Row 1 on wide screens) */}
            <div className="hidden lg:flex items-center flex-1 max-w-md mx-2">
              <button
                id="desktop-location-bar-btn"
                type="button"
                onClick={onOpenLocationModal}
                className="w-full flex items-center justify-between gap-2 px-3.5 py-1.5 rounded-2xl bg-zinc-50 hover:bg-emerald-50/60 dark:bg-zinc-800/80 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 transition cursor-pointer group text-left shadow-xs"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0 ${
                    userProfile?.address
                      ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80'
                      : 'text-amber-800 dark:text-amber-300 bg-amber-200 dark:bg-amber-950/80'
                  }`}>
                    <Home className="w-3 h-3" />
                    <span>{userProfile?.address ? 'HOME' : 'LOCATION'}</span>
                  </div>
                  <span className={`text-xs font-bold truncate ${
                    userProfile?.address
                      ? 'text-zinc-800 dark:text-zinc-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-300'
                      : 'text-amber-800 dark:text-amber-300'
                  }`}>
                    {userProfile?.address || 'Location Not Set — Select on Maps'}
                  </span>
                </div>
                {!userProfile?.address ? (
                  <span className="px-2.5 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] shrink-0 shadow-xs">
                    Set Location
                  </span>
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400 group-hover:text-emerald-600 shrink-0" />
                )}
              </button>
            </div>

            {/* Right Action Controls: Admin Hub -> Past Orders -> Login/Profile -> Cart */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              
              {/* Admin Hub link if admin */}
              {isAdmin && (
                <button
                  id="admin-nav-toggle-btn"
                  onClick={() => setCurrentView(currentView === 'admin' ? 'home' : 'admin')}
                  className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    currentView === 'admin'
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                      : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 hover:bg-amber-200'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>{currentView === 'admin' ? 'Customer' : 'Admin'}</span>
                </button>
              )}

              {/* Past Orders */}
              <button
                id="past-orders-nav-btn"
                onClick={() => setCurrentView('orders')}
                className={`hidden md:flex p-2 px-3 py-2 rounded-2xl border text-xs font-semibold items-center gap-1.5 transition cursor-pointer ${
                  currentView === 'orders'
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold'
                    : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200'
                }`}
                title="Orders & Bills"
              >
                <Package className="w-4 h-4" />
                <span>{t('orders')}</span>
              </button>

              {/* Login / Profile */}
              {isGuest ? (
                <button
                  id="mobile-login-nav-btn"
                  onClick={() => openAuthModal('signin')}
                  className="flex items-center gap-1 sm:gap-1.5 py-1.5 px-2.5 sm:px-3 sm:py-2 rounded-xl sm:rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/70 dark:hover:bg-emerald-900/80 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition active:scale-95 shadow-xs shrink-0 cursor-pointer"
                  title="Login to your account"
                >
                  <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{t('login')}</span>
                </button>
              ) : (
                <button
                  id="mobile-profile-nav-btn"
                  onClick={() => setCurrentView('profile')}
                  className={`flex items-center gap-1 sm:gap-1.5 py-1.5 px-2.5 sm:px-3 sm:py-2 rounded-xl sm:rounded-2xl border text-xs font-semibold transition active:scale-95 shrink-0 cursor-pointer ${
                    currentView === 'profile'
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold'
                      : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200'
                  }`}
                  title="Account Profile"
                >
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0" />
                  <span className="hidden sm:inline">{userProfile?.name?.split(' ')[0] || t('profile')}</span>
                </button>
              )}

              {/* Cart Button */}
              <button
                id="nav-cart-btn"
                onClick={() => setIsCartOpen(true)}
                className="relative py-1.5 px-2.5 sm:px-3.5 sm:py-2 rounded-xl sm:rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/25 transition flex items-center gap-1.5 sm:gap-2 shrink-0 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-amber-300 shrink-0" />
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <span className="hidden sm:inline">{t('cart')}</span>
                  {itemCount > 0 && (
                    <span className="bg-amber-400 text-emerald-950 text-[10px] sm:text-[11px] font-black px-1.5 py-0.2 rounded-full">
                      {itemCount}
                    </span>
                  )}
                  {subtotal > 0 && (
                    <span className="hidden md:inline font-mono font-medium text-emerald-100 border-l border-emerald-400/40 pl-1.5">
                      ₹{subtotal.toFixed(2)}
                    </span>
                  )}
                </div>
              </button>

            </div>
          </div>

          {/* ROW 2: PROMINENT LOCATION PILL ON MOBILE */}
          <div className="lg:hidden w-full">
            <button
              id="mobile-location-bar-btn"
              type="button"
              onClick={onOpenLocationModal}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-2xl bg-zinc-100 hover:bg-emerald-50 active:scale-[0.99] dark:bg-zinc-800/90 dark:hover:bg-zinc-800 border border-zinc-200/90 dark:border-zinc-700/80 transition cursor-pointer text-left shadow-xs"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0 ${
                  userProfile?.address
                    ? 'text-emerald-800 dark:text-emerald-300 bg-emerald-200/80 dark:bg-emerald-950'
                    : 'text-amber-800 dark:text-amber-300 bg-amber-200/80 dark:bg-amber-950'
                }`}>
                  <Home className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                  <span>{userProfile?.address ? 'HOME' : 'LOCATION'}</span>
                </div>
                <span className={`text-xs font-bold truncate block ${
                  userProfile?.address ? 'text-zinc-900 dark:text-zinc-100' : 'text-amber-800 dark:text-amber-300'
                }`}>
                  {userProfile?.address || 'Location Not Set — Select on Maps'}
                </span>
              </div>
              {!userProfile?.address ? (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-black text-xs shadow-xs shrink-0">
                  Set Location
                </span>
              ) : (
                <ChevronDown className="w-4 h-4 text-zinc-500 dark:text-zinc-400 shrink-0" />
              )}
            </button>
          </div>

          {/* ROW 3: PROMINENT SEARCH BAR BELOW SUPERCART APP NAME */}
          <div id="quick-commerce-search-container" className="w-full pt-0.5">
            <div className="relative flex items-center w-full bg-white dark:bg-zinc-800 rounded-2xl sm:rounded-3xl border-2 border-zinc-200 hover:border-emerald-500 focus-within:border-emerald-600 dark:border-zinc-700 dark:focus-within:border-emerald-500 shadow-sm transition-all">
              
              {/* Search Icon */}
              <div className="pl-3.5 sm:pl-4 pr-1 text-zinc-500 dark:text-zinc-400 flex items-center pointer-events-none">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              </div>

              {/* Search Input with Full Visibility of Text and Rotating Placeholders */}
              <input
                id="global-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isVoiceListening ? '🎙️ Listening... speak product name now' : searchPlaceholders[placeholderIndex]}
                className={`flex-1 py-2 sm:py-3 px-2 text-xs sm:text-sm font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none bg-transparent ${
                  isVoiceListening ? 'placeholder:text-rose-500 placeholder:animate-pulse font-semibold' : ''
                }`}
              />

              {/* Clear button if search query typed */}
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-white mr-1.5 transition cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Right Action Icons in Search Bar: Camera + Voice Mic */}
              <div className="flex items-center gap-1 sm:gap-1.5 pr-2.5 sm:pr-3 shrink-0">
                
                {/* Camera / Visual Search Icon - Opens Camera Mode */}
                <button
                  type="button"
                  id="camera-search-btn"
                  onClick={() => setMediaModalType('camera')}
                  className="p-1.5 sm:p-2 rounded-xl text-zinc-500 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition cursor-pointer"
                  title="Open Camera to photograph products & match catalog"
                  aria-label="Open Camera"
                >
                  <Camera className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                </button>

                {/* Voice Search Mic - Real-time Voice to Text */}
                <button
                  type="button"
                  id="voice-search-btn"
                  onClick={handleToggleVoiceSearch}
                  className={`p-1.5 sm:p-2 rounded-xl transition cursor-pointer flex items-center gap-1 ${
                    isVoiceListening
                      ? 'bg-rose-600 text-white shadow-md animate-pulse'
                      : 'text-zinc-500 hover:text-amber-500 dark:text-zinc-400 dark:hover:text-amber-400 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                  }`}
                  title={isVoiceListening ? 'Click to stop voice recognition' : 'Click to speak and search with voice recognition'}
                  aria-label="Voice Recognition"
                >
                  <Mic className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${isVoiceListening ? 'animate-bounce' : ''}`} />
                  {isVoiceListening && (
                    <span className="text-[10px] font-extrabold pr-1 hidden sm:inline">
                      Listening...
                    </span>
                  )}
                </button>

              </div>
            </div>

            {/* Live voice feedback toast */}
            <AnimatePresence>
              {voiceNotice && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="mt-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center justify-between shadow-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    <span>{voiceNotice}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMediaModalType('voice')}
                    className="text-[10px] underline hover:text-rose-900 dark:hover:text-white cursor-pointer"
                  >
                    Open Voice Assistant
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </header>
    </>
  );
};
