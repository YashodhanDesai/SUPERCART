import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { WishlistProvider } from './context/WishlistContext';
import { APIProvider } from '@vis.gl/react-google-maps';
import { GOOGLE_MAPS_API_KEY } from './lib/googleMaps';
import { SplashAnimation } from './components/SplashAnimation';
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { StoreHome } from './components/StoreHome';
import { CategoriesView } from './components/CategoriesView';
import { WishlistView } from './components/WishlistView';
import { ProductQuickView } from './components/ProductQuickView';
import { CartDrawer } from './components/CartDrawer';
import { LocationModal } from './components/LocationModal';
import { OrderTrackingView } from './components/OrderTrackingView';
import { PastOrdersView } from './components/PastOrdersView';
import { InvoiceModal } from './components/InvoiceModal';
import { AuthModal } from './components/AuthModal';
import { ProfileView } from './components/ProfileView';
import { SettingsView } from './components/SettingsView';
import { BillsInvoicesView } from './components/BillsInvoicesView';
import { AdminDashboard } from './components/AdminDashboard';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { RunningFooter } from './components/RunningFooter';
import { AppView } from './components/SettingsDrawer';
import { Product, Order } from './types';
import { subscribeToProducts } from './lib/firebase';

function SuperCartContent() {
  const { user, userProfile } = useAuth();
  const { setIsCartOpen } = useCart();
  const [splashFinished, setSplashFinished] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Active View states
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);

  // Subscribe to live products
  useEffect(() => {
    const unsubscribe = subscribeToProducts(
      (items) => {
        setProducts(items);
        setLoadingProducts(false);
      },
      (err) => {
        console.warn('Products load note:', err);
        setLoadingProducts(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Automatic view routing based on role when admin is selected
  useEffect(() => {
    const isTargetAdmin = userProfile?.role === 'admin' || userProfile?.email?.toLowerCase().trim() === 'yashodhandesai94@gmail.com';
    if (currentView === 'admin' && !isTargetAdmin) {
      setCurrentView('home');
    }
  }, [userProfile, currentView]);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans transition-colors overflow-x-hidden w-full">
      {/* 1. Mobile & Initial Splash Animation */}
      {!splashFinished && (
        <SplashAnimation onComplete={() => setSplashFinished(true)} />
      )}

      {/* 2. Global Modals */}
      <LocationModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
      />

      <ProductQuickView
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

      <CartDrawer
        onOpenLocationModal={() => setLocationModalOpen(true)}
        onOrderSuccess={(order) => {
          setSuccessOrder(order);
        }}
      />

      <OrderSuccessModal
        order={successOrder}
        onClose={() => setSuccessOrder(null)}
        onTrackOrder={(ord) => {
          setTrackingOrder(ord);
          setCurrentView('orders');
        }}
        onViewInvoice={(ord) => {
          setInvoiceOrder(ord);
        }}
      />

      <InvoiceModal
        order={invoiceOrder}
        onClose={() => setInvoiceOrder(null)}
      />

      <AuthModal />

      {/* 3. Global Sticky Navigation */}
      <Navbar
        currentView={currentView}
        setCurrentView={(view) => {
          setTrackingOrder(null);
          setCurrentView(view);
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenLocationModal={() => setLocationModalOpen(true)}
      />

      {/* 4. Main Body Content Switcher */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-6 pb-20 sm:pb-12">
        {/* Admin Dashboard */}
        {currentView === 'admin' && userProfile?.role === 'admin' ? (
          <AdminDashboard />
        ) : trackingOrder ? (
          <OrderTrackingView
            order={trackingOrder}
            onBack={() => setTrackingOrder(null)}
            onViewInvoice={(ord) => setInvoiceOrder(ord)}
          />
        ) : currentView === 'categories' ? (
          <CategoriesView
            products={products}
            onQuickView={(p) => setQuickViewProduct(p)}
          />
        ) : currentView === 'wishlist' ? (
          <WishlistView
            onQuickView={(p) => setQuickViewProduct(p)}
            onContinueShopping={() => setCurrentView('home')}
          />
        ) : currentView === 'orders' ? (
          <PastOrdersView
            onTrackOrder={(ord) => setTrackingOrder(ord)}
            onViewInvoice={(ord) => setInvoiceOrder(ord)}
            onContinueShopping={() => setCurrentView('home')}
          />
        ) : currentView === 'profile' ? (
          <ProfileView
            onOpenLocationModal={() => setLocationModalOpen(true)}
            onNavigateOrders={() => setCurrentView('orders')}
            onNavigateHome={() => setCurrentView('home')}
          />
        ) : currentView === 'bills' ? (
          <BillsInvoicesView
            onBackToHome={() => setCurrentView('home')}
          />
        ) : currentView === 'settings' ? (
          <SettingsView
            onTrackOrder={(ord) => {
              setTrackingOrder(ord);
              setCurrentView('orders');
            }}
          />
        ) : (
          <StoreHome
            products={products}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onQuickView={(p) => setQuickViewProduct(p)}
          />
        )}
      </main>

      {/* 5. Mobile Thumb Bottom Navigation */}
      <MobileBottomNav
        currentView={currentView}
        setCurrentView={(view) => {
          setTrackingOrder(null);
          setCurrentView(view);
        }}
        onOpenLocationModal={() => setLocationModalOpen(true)}
      />

      {/* 6. Running Marquee Footer with Quality Promises & Indian Sourcing */}
      <RunningFooter />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <APIProvider apiKey={GOOGLE_MAPS_API_KEY} solutionChannel="GMP_visgl_reactgooglemaps_v1.9.0">
                <SuperCartContent />
              </APIProvider>
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
