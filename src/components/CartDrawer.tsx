import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Tag, 
  MapPin, 
  CreditCard, 
  Banknote, 
  Wallet, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Phone,
  ShieldAlert,
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { createOrder } from '../lib/firebase';
import { supabase } from '../lib/supabase';
import { Order } from '../types';

interface CartDrawerProps {
  onOpenLocationModal: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onOpenLocationModal,
  onOrderSuccess
}) => {
  const { 
    isCartOpen, 
    setIsCartOpen, 
    items, 
    updateQuantity, 
    clearCart,
    subtotal, 
    discount, 
    deliveryFee, 
    tax, 
    total,
    appliedCoupon,
    applyCoupon,
    removeCoupon
  } = useCart();

  const { user, userProfile, isLoggedIn, openAuthModal, updateUserProfileInfo } = useAuth();
  const { t } = useLanguage();

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'Cash on Delivery' | 'Credit / Debit Card' | 'UPI / Net Banking' | 'SuperCart Wallet'>('Cash on Delivery');
  const [orderNotes, setOrderNotes] = useState('');
  // Store clean 10-digit mobile number for reliable display and validation
  const [phoneInput, setPhoneInput] = useState<string>(() => {
    const raw = userProfile?.phone || '';
    let digits = raw.replace(/\D/g, '');
    if (digits.length > 10 && digits.startsWith('91')) digits = digits.slice(2);
    if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
    return digits.slice(-10);
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Sync phone input when profile updates only if phoneInput is empty or matches profile
  useEffect(() => {
    if (userProfile?.phone) {
      let cleanDigits = userProfile.phone.replace(/\D/g, '');
      if (cleanDigits.length > 10 && cleanDigits.startsWith('91')) cleanDigits = cleanDigits.slice(2);
      if (cleanDigits.length === 11 && cleanDigits.startsWith('0')) cleanDigits = cleanDigits.slice(1);
      const clean10 = cleanDigits.slice(-10);
      if (clean10 && (!phoneInput || phoneInput.length !== 10)) {
        setPhoneInput(clean10);
      }
    }
  }, [userProfile?.phone]);

  const handlePhoneChange = (val: string) => {
    // Intelligently strip formatting, +91, 91, or leading 0
    let digits = val.replace(/\D/g, '');
    if (digits.length > 10 && digits.startsWith('91')) {
      digits = digits.slice(2);
    }
    if (digits.length === 11 && digits.startsWith('0')) {
      digits = digits.slice(1);
    }
    const clean10 = digits.slice(0, 10);
    setPhoneInput(clean10);
    if (checkoutError && clean10.length === 10) {
      setCheckoutError(null);
    }
  };

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    if (res.success) {
      setCouponFeedback({ type: 'success', text: res.message });
      setCouponInput('');
    } else {
      setCouponFeedback({ type: 'error', text: res.message });
    }
  };

  const handleCheckout = async () => {
    setCheckoutError(null);
    setIsSubmitting(true);

    try {
      // 1. Mandatory Supabase Authentication Check
      const { data: { user: authUser }, error: authErr } = await supabase.auth.getUser();
      if (!authUser || authErr) {
        setCheckoutError('Login required: Please sign in or create an account to place your order.');
        setIsSubmitting(false);
        openAuthModal('signin');
        return;
      }

      // 2. Delivery Address Check
      const currentAddress = userProfile?.address;
      if (!currentAddress || currentAddress.trim().length < 5) {
        setCheckoutError('Please select a delivery address in India before placing an order.');
        setIsSubmitting(false);
        onOpenLocationModal();
        return;
      }

      // 3. Contact Phone Number Check (Must be at least 10 digits)
      const cleanPhone = phoneInput.trim();
      const digitsOnly = cleanPhone.replace(/\D/g, '');
      if (!cleanPhone || digitsOnly.length < 10) {
        setCheckoutError('Please enter a valid 10-digit mobile phone number for delivery contact.');
        setIsSubmitting(false);
        return;
      }

      // 4. Cart Check
      if (items.length === 0) {
        setCheckoutError(t('cartEmpty'));
        setIsSubmitting(false);
        return;
      }

      // Save updated phone to user profile in background
      if (cleanPhone !== userProfile?.phone) {
        updateUserProfileInfo({ phone: cleanPhone }).catch(() => {});
      }

      // 5. Construct order payload with authenticated Supabase user ID
      const orderPayload: Omit<Order, 'id' | 'createdAt'> = {
        userId: authUser.id,
        customerName: userProfile?.name || authUser.user_metadata?.name || authUser.user_metadata?.full_name || (authUser.email ? authUser.email.split('@')[0] : 'SuperCart Shopper'),
        customerEmail: authUser.email || userProfile?.email || 'customer@supercart.com',
        customerPhone: cleanPhone,
        deliveryAddress: currentAddress,
        deliveryCoords: userProfile?.deliveryCoords || undefined,
        addressDetails: userProfile?.addressDetails || undefined,
        items,
        subtotal,
        discount,
        discountCode: appliedCoupon || undefined,
        deliveryFee,
        tax,
        total,
        paymentMethod,
        status: 'Placed',
        notes: orderNotes.trim() || undefined
      };

      const orderId = await createOrder(orderPayload);

      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {}

      const fullCreatedOrder: Order = {
        ...orderPayload,
        id: orderId,
        createdAt: new Date().toISOString(),
        estimatedDeliveryTime: new Date(Date.now() + 20 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        driverName: 'Ramesh Patil',
        driverPhone: '+91 98230 45678',
        driverVehicle: 'SuperCart Electric Express (MH-12-EK-4040)'
      };

      clearCart();
      setIsCartOpen(false);
      onOrderSuccess(fullCreatedOrder);
    } catch (err: any) {
      console.error('Checkout error:', err);
      if (err.message?.toLowerCase().includes('authentication') || err.message?.toLowerCase().includes('sign in') || err.message?.toLowerCase().includes('log in')) {
        setCheckoutError('Please log in with Google or Email to place your order.');
        openAuthModal('signin');
      } else {
        setCheckoutError(err.message || 'Could not place order. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={() => setIsCartOpen(false)} />

      <motion.div
        id="cart-drawer-panel"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-8"
      >
        <div className="w-screen max-w-full sm:max-w-md bg-white dark:bg-zinc-900 shadow-2xl flex flex-col border-l border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
          
          {/* Top Cart Header */}
          <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
                <ShoppingBag className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-zinc-900 dark:text-white">
                  {t('yourCart')}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-300">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <button
                  id="clear-cart-btn"
                  onClick={clearCart}
                  className="text-xs text-zinc-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400 font-semibold transition px-2 py-1 cursor-pointer"
                >
                  Clear
                </button>
              )}
              <button
                id="close-cart-drawer-btn"
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-full text-zinc-500 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 bg-white dark:bg-zinc-900">
            
            {/* Authentication & Delivery Address Section */}
            {!isLoggedIn ? (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/80 space-y-3">
                <div className="flex items-start gap-2.5 text-amber-900 dark:text-amber-200">
                  <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider">Login Required for Checkout</h4>
                    <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5 leading-snug">
                      Please sign in with Google or Email to verify your account before placing an order.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  id="cart-signin-cta-btn"
                  onClick={() => openAuthModal('signin')}
                  className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-amber-950 font-extrabold text-xs shadow-sm flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Sign In / Create Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/60 space-y-3">
                {/* Delivery Address Status */}
                {!userProfile?.address ? (
                  <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700/80 space-y-2.5">
                    <div className="flex items-center justify-between gap-2 text-amber-900 dark:text-amber-200">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span className="text-xs font-black uppercase tracking-wider">Delivery Location Not Set</span>
                      </div>
                      <button
                        id="cart-set-location-badge-btn"
                        type="button"
                        onClick={onOpenLocationModal}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xs shadow-xs transition cursor-pointer"
                      >
                        Set Location
                      </button>
                    </div>
                    <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-snug">
                      Please select your location on Google Maps to confirm delivery availability.
                    </p>
                    <button
                      id="cart-set-location-maps-btn"
                      type="button"
                      onClick={onOpenLocationModal}
                      className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-extrabold text-xs shadow-sm flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Set Location on Google Maps</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
                          {t('deliverTo')}:
                        </span>
                        <span className="text-xs font-bold text-zinc-900 dark:text-white truncate block">
                          {userProfile.address}
                        </span>
                      </div>
                    </div>
                    <button
                      id="change-address-in-cart-btn"
                      onClick={onOpenLocationModal}
                      type="button"
                      className="text-xs font-bold text-emerald-700 dark:text-emerald-300 underline shrink-0 hover:text-emerald-800 dark:hover:text-emerald-200 ml-2 cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                )}

                {/* Contact Phone Number Input with +91 Country Code and clear digit counter */}
                <div className="pt-2 border-t border-emerald-200/80 dark:border-emerald-800/80">
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="cart-phone-input" className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span>Contact Mobile (Required):</span>
                    </label>
                    {phoneInput.length === 10 ? (
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Valid 10 Digits
                      </span>
                    ) : (
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                        {phoneInput.length}/10 digits
                      </span>
                    )}
                  </div>

                  <div className="flex items-center rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-zinc-850 overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 shadow-2xs">
                    <span className="px-2.5 py-2.5 bg-emerald-100/70 dark:bg-zinc-800 text-emerald-900 dark:text-emerald-200 font-bold text-xs border-r border-emerald-200 dark:border-zinc-700 flex items-center gap-1 select-none shrink-0">
                      <span>🇮🇳</span>
                      <span>+91</span>
                    </span>
                    <input
                      id="cart-phone-input"
                      type="tel"
                      inputMode="numeric"
                      maxLength={16}
                      autoComplete="tel-national"
                      value={phoneInput}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="flex-1 min-w-0 px-3 py-2.5 bg-transparent text-sm sm:text-base font-mono font-bold text-zinc-900 dark:text-white outline-none placeholder:text-zinc-400 placeholder:font-normal"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Error message */}
            {checkoutError && (
              <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/70 border border-red-300 dark:border-red-800 text-xs font-semibold text-red-800 dark:text-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{checkoutError}</span>
              </div>
            )}

            {/* Items List without delete button */}
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-500 dark:text-zinc-400">
                <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
                  <ShoppingBag className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
                </div>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                  {t('cartEmpty')}
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-[220px]">
                  {t('emptyCartPrompt')}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 block">
                  {t('itemDetails')} ({items.length})
                </span>
                
                {items.map(({ product, quantity }) => (
                  <div
                    key={product.id}
                    className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 flex items-center gap-3 shadow-xs"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-14 h-14 rounded-xl object-cover bg-white dark:bg-zinc-700 shrink-0"
                      referrerPolicy="no-referrer"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                        {product.name}
                      </h4>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                        ₹{product.price.toFixed(2)} / {product.unit}
                      </p>
                      <span className="font-black text-xs text-emerald-600 dark:text-emerald-400">
                        ₹{(product.price * quantity).toFixed(2)}
                      </span>
                    </div>

                    {/* Quantity controls only (Delete button removed per explicit user requirement) */}
                    <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 rounded-xl p-1 border border-zinc-200 dark:border-zinc-700 shadow-sm">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition active:scale-90 cursor-pointer"
                        title="Reduce quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center text-xs font-black font-mono text-zinc-900 dark:text-zinc-100">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        disabled={quantity >= product.stock}
                        className="w-7 h-7 flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition active:scale-90 disabled:opacity-40 cursor-pointer"
                        title="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Coupon Code Section */}
            {items.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Apply Savings Coupon</span>
                  </span>
                  {appliedCoupon && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                      {appliedCoupon}
                    </span>
                  )}
                </div>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-xs">
                    <span className="font-bold text-emerald-700 dark:text-emerald-300">
                      {t('appliedCoupon')}: -₹{discount.toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-bold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="e.g. FRESH10, HARVEST20"
                      className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-900 dark:text-white uppercase placeholder:normal-case placeholder:font-normal placeholder-zinc-400 outline-none focus:border-emerald-500"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-700 hover:bg-zinc-800 text-white text-xs font-bold transition"
                    >
                      Apply
                    </button>
                  </form>
                )}

                {couponFeedback && (
                  <p className={`text-[11px] font-semibold ${couponFeedback.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                    {couponFeedback.text}
                  </p>
                )}
              </div>
            )}

            {/* Payment Method Selector */}
            {items.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 space-y-2.5">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
                  {t('paymentMethod')}
                </span>
                
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'UPI / Net Banking', label: t('upiNetBanking'), icon: Wallet },
                    { id: 'Credit / Debit Card', label: t('cardPayment'), icon: CreditCard },
                    { id: 'Cash on Delivery', label: t('cashOnDelivery'), icon: Banknote },
                  ].map((method) => {
                    const Icon = method.icon;
                    const isSelected = paymentMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id as any)}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold shadow-xs'
                            : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'}`} />
                        <span className="text-[11px] leading-tight line-clamp-1">{method.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bill Summary - High contrast dark mode styling */}
            {items.length > 0 && (
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700 space-y-2.5">
                <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-700 dark:text-zinc-200 block">
                  {t('bills')}
                </span>
                
                <div className="flex justify-between text-xs text-zinc-700 dark:text-zinc-300">
                  <span>{t('subtotal')}</span>
                  <span className="font-mono font-bold text-zinc-900 dark:text-white">₹{subtotal.toFixed(2)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                    <span>{t('discount')}</span>
                    <span className="font-mono">-₹{discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-xs text-zinc-700 dark:text-zinc-300">
                  <span>{t('deliveryCharge')}</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {deliveryFee === 0 ? t('freeDelivery') : `₹${deliveryFee.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between text-xs text-zinc-700 dark:text-zinc-300">
                  <span>{t('taxAndFees')} (5% GST)</span>
                  <span className="font-mono font-bold text-zinc-900 dark:text-white">₹{tax.toFixed(2)}</span>
                </div>

                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700 flex justify-between items-baseline">
                  <span className="text-sm font-extrabold text-zinc-900 dark:text-white">{t('totalToPay')}</span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    ₹{total.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Checkout CTA */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
              {!isLoggedIn ? (
                <button
                  id="place-order-login-btn"
                  type="button"
                  onClick={() => openAuthModal('signin')}
                  className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-amber-950 font-extrabold text-sm shadow-lg shadow-amber-500/20 flex items-center justify-between transition cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    <span>Sign In to Place Order</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono">
                    <span>₹{total.toFixed(2)}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              ) : (
                <button
                  id="place-order-btn"
                  type="button"
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-between transition disabled:opacity-75 cursor-pointer"
                >
                  <span>{isSubmitting ? 'Verifying & Placing Order...' : t('placeOrder')}</span>
                  <div className="flex items-center gap-1.5 font-mono">
                    <span>₹{total.toFixed(2)}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              )}
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
};
