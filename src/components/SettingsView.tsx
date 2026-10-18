import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Edit3, 
  FileText, 
  Package, 
  Languages, 
  Sun, 
  Moon, 
  Check, 
  Save, 
  Receipt,
  Download,
  Eye,
  ChevronRight,
  Sparkles,
  Database
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage, Language } from '../context/LanguageContext';
import { subscribeToUserOrders } from '../lib/firebase';
import { Order } from '../types';
import { InvoiceModal } from './InvoiceModal';
import { SupabaseDatabaseModal } from './SupabaseDatabaseModal';
import { SUPABASE_PROJECT_ID } from '../lib/supabase';

interface SettingsViewProps {
  onTrackOrder?: (order: Order) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onTrackOrder }) => {
  const { user, userProfile, updateUserProfileInfo } = useAuth();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [name, setName] = useState(userProfile?.name || '');
  const [email, setEmail] = useState(userProfile?.email || '');
  const [phone, setPhone] = useState(userProfile?.phone || userProfile?.phoneNumber || '');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | 'Prefer not to say'>(userProfile?.gender || 'Prefer not to say');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Orders and Invoices
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Order | null>(null);

  useEffect(() => {
    if (user) {
      const unsub = subscribeToUserOrders(
        user.uid,
        (userOrders) => {
          setOrders(userOrders);
        }
      );
      return () => unsub();
    }
  }, [user]);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || '');
      setEmail(userProfile.email || '');
      setPhone(userProfile.phone || userProfile.phoneNumber || '');
      if (userProfile.gender) setGender(userProfile.gender);
    }
  }, [userProfile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.trim().length > 3 ? phone.trim() : null;
    await updateUserProfileInfo({
      name: name.trim(),
      phone: cleanPhone,
      ...(gender ? { gender } : {})
    } as any);
    setIsEditingProfile(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div id="settings-page-view" className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      
      {/* Invoice Modal viewer */}
      <InvoiceModal
        order={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
          {t('settingsTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          {t('settingsSubtitle')}
        </p>
      </div>

      {saveSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm font-bold flex items-center gap-2"
        >
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{t('profileUpdated')}</span>
        </motion.div>
      )}

      {/* 1. Profile & Edit Profile (with Gender Option) */}
      <section className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
                {t('profile')}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Personal shopper credentials & demographic details
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 font-bold text-xs transition cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditingProfile ? 'Cancel' : t('editProfile')}</span>
          </button>
        </div>

        {isEditingProfile ? (
          <form onSubmit={handleSaveProfile} className="pt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  {t('fullName')}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm text-zinc-900 dark:text-white outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  {t('emailAddress')}
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  {t('phoneNumber')}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter 10-digit mobile number"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm text-zinc-900 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>

              {/* Gender Selector Option */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  {t('gender')}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Male', 'Female', 'Other', 'Prefer not to say'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`px-2.5 py-2 rounded-xl text-xs font-bold transition border text-center cursor-pointer ${
                        gender === g
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
                      }`}
                    >
                      {g === 'Male' ? t('male') : g === 'Female' ? t('female') : g === 'Other' ? t('other') : t('preferNotToSay')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{t('saveChanges')}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
              <span className="text-[11px] font-bold text-zinc-400 block">{t('fullName')}</span>
              <span className="text-xs sm:text-sm font-extrabold text-zinc-900 dark:text-white mt-0.5 block truncate">
                {userProfile?.name || 'Guest User'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
              <span className="text-[11px] font-bold text-zinc-400 block">{t('emailAddress')}</span>
              <span className="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5 block truncate">
                {userProfile?.email || 'guest@supercart.com'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
              <span className="text-[11px] font-bold text-zinc-400 block">{t('phoneNumber')}</span>
              <span className="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5 block">
                {userProfile?.phone || userProfile?.phoneNumber || 'Not provided (null)'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
              <span className="text-[11px] font-bold text-zinc-400 block">{t('gender')}</span>
              <span className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                {gender === 'Male' ? t('male') : gender === 'Female' ? t('female') : gender === 'Other' ? t('other') : t('preferNotToSay')}
              </span>
            </div>
          </div>
        )}
      </section>

      {/* Theme Mood Toggle */}
      <section className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400">
            {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
              {t('themeMode')}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {t('themeSubtitle')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-4 rounded-2xl border text-left flex items-center justify-between transition active:scale-[0.98] cursor-pointer ${
              theme === 'light'
                ? 'bg-amber-50 dark:bg-zinc-800 border-amber-500 ring-2 ring-amber-500/20'
                : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-sm text-zinc-900 dark:text-white block">
                  {t('lightMode')}
                </span>
                <span className="text-xs text-zinc-500">Crisp high-contrast daylight theme</span>
              </div>
            </div>
            {theme === 'light' && <Check className="w-5 h-5 text-amber-600" />}
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-2xl border text-left flex items-center justify-between transition active:scale-[0.98] cursor-pointer ${
              theme === 'dark'
                ? 'bg-zinc-800 border-emerald-500 ring-2 ring-emerald-500/20'
                : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-zinc-700 text-amber-300">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-sm text-zinc-900 dark:text-white block">
                  {t('darkMode')}
                </span>
                <span className="text-xs text-zinc-400">Eye-safe night mode atmosphere</span>
              </div>
            </div>
            {theme === 'dark' && <Check className="w-5 h-5 text-emerald-400" />}
          </button>
        </div>
      </section>

      {/* Supabase Database Backend Section */}
      <section className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
                  Supabase Database
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Connected
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Postgres backend connected for orders, catalog, and profiles
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsSupabaseModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-xs flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Database Setup & SQL</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-750">
            <span className="font-bold text-zinc-400 uppercase text-[10px] block mb-0.5">Project ID</span>
            <span className="font-mono font-bold text-zinc-900 dark:text-white">{SUPABASE_PROJECT_ID}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-750">
            <span className="font-bold text-zinc-400 uppercase text-[10px] block mb-0.5">Tables Status</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">orders • products • users</span>
          </div>
        </div>
      </section>

      {/* Supabase Database Setup & Health Modal */}
      <SupabaseDatabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />
    </div>
  );
};
