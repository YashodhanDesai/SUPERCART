import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Home, 
  Briefcase, 
  Building, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  CheckCircle2,
  Sparkles, 
  ArrowRight, 
  LogOut, 
  ShoppingBag, 
  Truck, 
  Clock, 
  FileText, 
  KeyRound,
  Lock,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PhoneVerificationModal } from './PhoneVerificationModal';
import { updateUserProfileDoc } from '../lib/firebase';

interface ProfileViewProps {
  onOpenLocationModal: () => void;
  onNavigateOrders: () => void;
  onNavigateHome?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  onOpenLocationModal,
  onNavigateOrders,
  onNavigateHome
}) => {
  const { 
    user, 
    userProfile, 
    updateRole, 
    logout, 
    addSavedAddress, 
    deleteSavedAddress,
    selectSavedAddress,
    openAuthModal, 
    deleteAccount 
  } = useAuth();
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userProfile?.name || '');
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddrLabel, setNewAddrLabel] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [newAddrStreet, setNewAddrStreet] = useState('');
  const [newAddrCity, setNewAddrCity] = useState('Bengaluru');
  const [newAddrPostal, setNewAddrPostal] = useState('560038');
  const [addressActionMsg, setAddressActionMsg] = useState<string | null>(null);

  const isGuest = !user || !userProfile || user.uid.startsWith('shopper-guest-');

  const handleSaveName = async () => {
    if (!nameInput.trim() || !user) return;
    await updateUserProfileDoc(user.uid, { name: nameInput.trim() });
    setIsEditingName(false);
  };

  const handleSaveNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrStreet.trim()) return;
    await addSavedAddress(newAddrLabel, newAddrStreet.trim(), newAddrCity, newAddrPostal);
    setNewAddrStreet('');
    setShowAddAddress(false);
  };

  // =========================================================================
  // GUEST ACCOUNT VIEW (RENDERED WHEN USER IS SIGNED OUT OR GUEST)
  // This prevents the screen from ever going blank!
  // =========================================================================
  if (isGuest) {
    return (
      <div id="guest-profile-page-view" className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
        {/* Hero Welcome Card */}
        <div className="relative overflow-hidden p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white shadow-xl shadow-emerald-950/10">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold text-emerald-100 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>SuperCart Shopper Hub</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Welcome to SuperCart
            </h1>
            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed">
              Sign in to track your live 15-minute grocery deliveries, save your multiple delivery addresses, access GST tax invoices, and manage your account.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                id="guest-signin-primary-btn"
                onClick={() => openAuthModal('signin')}
                className="py-3 px-6 rounded-full bg-white text-emerald-900 hover:bg-emerald-50 font-black text-sm tracking-wide shadow-lg active:scale-95 transition flex items-center gap-2"
              >
                <User className="w-4 h-4 text-emerald-700" />
                <span>Sign In or Register</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {onNavigateHome && (
                <button
                  id="guest-explore-store-btn"
                  onClick={onNavigateHome}
                  className="py-3 px-5 rounded-full bg-emerald-800/80 hover:bg-emerald-800 text-white font-bold text-sm border border-emerald-500/30 transition flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4 text-amber-300" />
                  <span>Browse Groceries</span>
                </button>
              )}
            </div>
          </div>

          {/* Decorative Background Circles */}
          <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-emerald-500/20 blur-2xl pointer-events-none" />
          <div className="absolute right-10 top-6 w-32 h-32 rounded-full bg-amber-400/10 blur-xl pointer-events-none" />
        </div>

        {/* Benefits & Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white">15-Min Express Dispatch</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Real-time delivery from nearest micro-fulfillment centers straight to your doorstep.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Saved Multi-Addresses</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Save Home, Work, and Custom addresses with 1-tap checkout selection.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white">GST Tax Invoices & Receipts</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Download and print GST compliant tax invoices with complete itemized breakdown.
            </p>
          </div>
        </div>

        {/* Quick Test Demo Sign In Bar */}
        <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-center space-y-3">
          <p className="text-xs uppercase tracking-widest font-extrabold text-zinc-400">
            Instant Test Login Options
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => openAuthModal('signin')}
              className="py-2.5 px-5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              <span>Customer Sign In</span>
            </button>
            <button
              onClick={() => openAuthModal('phone')}
              className="py-2.5 px-5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mobile OTP (+91)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // LOGGED IN USER PROFILE VIEW
  // =========================================================================
  return (
    <div id="profile-page-view" className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      <PhoneVerificationModal
        isOpen={phoneModalOpen}
        onClose={() => setPhoneModalOpen(false)}
        onSuccess={() => {
          // Phone verified and synced
        }}
      />

      {/* Top Banner Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-6">
          <img
            src={userProfile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid || 'user'}`}
            alt="Profile Avatar"
            className="w-20 h-20 rounded-3xl object-cover bg-emerald-100 dark:bg-emerald-900/60 ring-4 ring-emerald-500/20 shrink-0"
            referrerPolicy="no-referrer"
          />

          <div>
            <div className="flex flex-wrap items-center gap-2">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="px-3 py-1 rounded-xl border border-emerald-500 bg-white dark:bg-zinc-800 text-sm font-bold"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white">
                    {userProfile?.name || 'Valued Customer'}
                  </h1>
                  <button
                    onClick={() => {
                      setNameInput(userProfile?.name || '');
                      setIsEditingName(true);
                    }}
                    className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1"
                    title="Edit Name"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                userProfile?.role === 'admin'
                  ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                  : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
              }`}>
                {userProfile?.role || 'user'}
              </span>
            </div>

            <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              {userProfile?.email || user?.email || 'No email attached'}
            </p>
          </div>
        </div>

        <div className="flex sm:flex-col gap-2">
          {userProfile?.role === 'admin' ? (
            <div className="px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span>Store Administrator</span>
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 text-xs font-medium flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-zinc-400" />
              <span>Customer Account</span>
            </div>
          )}
        </div>
      </div>

      {/* Account Verification & Security Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Phone Verification with OTP card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Verified Phone Number
              </span>
              {userProfile?.phone ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Verified
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                  Unverified (null)
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200/70 dark:border-zinc-800 mb-4">
              <div className="p-2 rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-mono font-bold text-zinc-900 dark:text-white">
                  {userProfile?.phone || userProfile?.phoneNumber || 'No mobile number (null)'}
                </p>
                <p className="text-[11px] text-zinc-400">
                  {userProfile?.phone ? 'Used for delivery SMS updates and instant order OTP' : 'Verify mobile number with OTP to link your phone number'}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setPhoneModalOpen(true)}
            className="w-full py-2.5 px-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-bold text-xs transition flex items-center justify-center gap-2"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-500" />
            <span>{userProfile?.phone ? 'Update Phone Number' : 'Verify Mobile Number'}</span>
          </button>
        </div>

        {/* Quick Past Orders Summary */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3 block">
              Order History & Invoices
            </span>
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              Track live 15-minute grocery deliveries
            </p>
            <p className="text-xs text-zinc-400 mt-1 mb-4">
              View your past grocery receipts, download official GST tax invoices, and easily reorder staple goods.
            </p>
          </div>

          <button
            onClick={onNavigateOrders}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
            <span>View All Past Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

        {/* Saved Addresses Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-extrabold text-base text-zinc-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Saved Delivery Addresses</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Click any address to choose it as your active delivery destination
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddAddress(!showAddAddress)}
            className="px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-xs font-bold flex items-center gap-1.5 transition self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Address</span>
          </button>
        </div>

        {/* Action feedback message */}
        {addressActionMsg && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{addressActionMsg}</span>
          </motion.div>
        )}

        {/* Add Address Form */}
        {showAddAddress && (
          <form onSubmit={handleSaveNewAddress} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-3" autoComplete="off">
            <div className="flex gap-2">
              {(['Home', 'Work', 'Other'] as const).map((lbl) => (
                <button
                  type="button"
                  key={lbl}
                  onClick={() => setNewAddrLabel(lbl)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    newAddrLabel === lbl
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
                  }`}
                >
                  {lbl}
                </button>
              ))}
            </div>

            <div>
              <input
                type="text"
                required
                autoComplete="off"
                placeholder="Street address, building, apartment number"
                value={newAddrStreet}
                onChange={(e) => setNewAddrStreet(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="City"
                autoComplete="off"
                value={newAddrCity}
                onChange={(e) => setNewAddrCity(e.target.value)}
                className="px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-white"
              />
              <input
                type="text"
                placeholder="PIN / Postal Code"
                autoComplete="off"
                value={newAddrPostal}
                onChange={(e) => setNewAddrPostal(e.target.value)}
                className="px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddAddress(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer transition shadow-xs"
              >
                Save Address
              </button>
            </div>
          </form>
        )}

        {/* Addresses Grid */}
        {(!userProfile?.savedAddresses || userProfile.savedAddresses.length === 0) ? (
          <div className="text-center py-8 px-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-dashed border-zinc-200 dark:border-zinc-700 space-y-2">
            <MapPin className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto" />
            <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">No saved addresses yet</p>
            <p className="text-[11px] text-zinc-400 max-w-xs mx-auto">
              Add your home, office, or secondary delivery address to enable quick 1-tap checkout.
            </p>
            <button
              type="button"
              onClick={() => setShowAddAddress(true)}
              className="mt-2 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Your First Address</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {userProfile.savedAddresses.map((addr) => {
              const Icon = addr.label === 'Home' ? Home : addr.label === 'Work' ? Briefcase : Building;
              const isSelected = !!addr.isDefault || (userProfile.address && userProfile.address.includes(addr.street));

              return (
                <div
                  key={addr.id}
                  onClick={async () => {
                    await selectSavedAddress(addr.id);
                    setAddressActionMsg(`"${addr.label}" set as active delivery address!`);
                    setTimeout(() => setAddressActionMsg(null), 3000);
                  }}
                  className={`p-4 rounded-2xl border transition cursor-pointer flex items-start justify-between gap-3 relative group ${
                    isSelected
                      ? 'border-emerald-500 dark:border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/70'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`p-2.5 rounded-xl mt-0.5 shrink-0 transition ${
                      isSelected
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-zinc-900 dark:text-white">
                          {addr.label}
                        </span>
                        {isSelected ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600 text-white font-extrabold flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Active Delivery
                          </span>
                        ) : (
                          <span className="text-[10px] text-zinc-400 group-hover:text-emerald-600 transition font-medium">
                            Click to select
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-zinc-700 dark:text-zinc-300 font-medium line-clamp-2">
                        {addr.street}
                      </p>
                      <p className="text-[11px] text-zinc-400">
                        {addr.city}{addr.postalCode ? ` - ${addr.postalCode}` : ''}
                      </p>
                    </div>
                  </div>

                  {/* Delete Address Action Button */}
                  <button
                    type="button"
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (window.confirm(`Delete "${addr.label}" address?`)) {
                        await deleteSavedAddress(addr.id);
                        setAddressActionMsg(`Removed "${addr.label}" address.`);
                        setTimeout(() => setAddressActionMsg(null), 3000);
                      }
                    }}
                    title="Delete Address"
                    className="p-2 rounded-xl text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Account Session & Management */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4">
        <h3 className="font-extrabold text-base text-zinc-900 dark:text-white">
          Account & Authentication
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Manage your active Firebase session, switch accounts, or remove profile data.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            id="profile-open-auth-btn"
            onClick={() => openAuthModal('signin')}
            className="py-2.5 px-5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-extrabold text-xs tracking-wide shadow-md hover:opacity-90 active:scale-95 transition flex items-center gap-2"
          >
            <User className="w-4 h-4" />
            <span>Switch Account</span>
          </button>

          <button
            id="profile-logout-btn"
            onClick={logout}
            className="py-2.5 px-5 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-xs transition flex items-center gap-2"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            <span>Sign Out</span>
          </button>

          <button
            id="profile-delete-account-btn"
            onClick={async () => {
              if (window.confirm('Are you sure you want to permanently delete your account and profile data? This action cannot be undone.')) {
                await deleteAccount();
              }
            }}
            className="py-2.5 px-5 rounded-full bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/40 font-bold text-xs transition flex items-center gap-2 ml-auto"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
