import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  ExternalLink, 
  RefreshCw, 
  X, 
  Server, 
  Layers, 
  UploadCloud, 
  ArrowRight,
  ShieldCheck,
  Code2
} from 'lucide-react';
import { 
  checkSupabaseConnection, 
  SUPABASE_PROJECT_ID, 
  SUPABASE_URL, 
  SUPABASE_ANON_KEY, 
  SUPABASE_SCHEMA_SQL, 
  saveProductToSupabase,
  SupabaseHealth 
} from '../lib/supabase';
import { INITIAL_PRODUCTS } from '../data/seedProducts';

interface SupabaseDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseDatabaseModal: React.FC<SupabaseDatabaseModalProps> = ({
  isOpen,
  onClose
}) => {
  const [health, setHealth] = useState<SupabaseHealth | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [syncingProducts, setSyncingProducts] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'status' | 'sql' | 'sync'>('status');

  const runHealthCheck = async () => {
    setLoading(true);
    setSyncFeedback(null);
    try {
      const res = await checkSupabaseConnection();
      setHealth(res);
    } catch {
      // Handled in helper
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runHealthCheck();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopySql = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 3000);
    }
  };

  const handleSyncCatalog = async () => {
    setSyncingProducts(true);
    setSyncFeedback(null);
    let successCount = 0;
    try {
      for (const prod of INITIAL_PRODUCTS) {
        const ok = await saveProductToSupabase(prod);
        if (ok) successCount++;
      }
      setSyncFeedback(`Successfully synchronized ${successCount} products to Supabase "products" table!`);
      runHealthCheck();
    } catch (e: any) {
      setSyncFeedback(`Note: Make sure "products" table is created in Supabase first. Error: ${e.message}`);
    } finally {
      setSyncingProducts(false);
    }
  };

  const sqlEditorUrl = `https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql/new`;

  return (
    <div 
      id="supabase-database-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/65 backdrop-blur-md overflow-y-auto"
    >
      <motion.div
        id="supabase-database-modal-card"
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        transition={{ duration: 0.22 }}
        className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-[28px] shadow-2xl border border-zinc-200/80 dark:border-zinc-800 p-6 sm:p-8 overflow-hidden text-zinc-900 dark:text-zinc-100 my-auto"
      >
        {/* Top Accent Line (Supabase Green gradient) */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-xs">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
                Supabase Database Setup
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                Connected
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Live Postgres storage for Orders, Products, and User Profiles
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 mb-6 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('status')}
            className={`flex-1 py-2 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'status'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Server className="w-3.5 h-3.5 text-emerald-500" />
            <span>Connection & Status</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sql')}
            className={`flex-1 py-2 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'sql'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-blue-500" />
            <span>Schema SQL (1-Click)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sync')}
            className={`flex-1 py-2 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'sync'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5 text-amber-500" />
            <span>Sync Catalog</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: CONNECTION & STATUS                                                */}
        {/* ========================================================================= */}
        {activeTab === 'status' && (
          <div className="space-y-4">
            {/* Credentials Card */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-500 uppercase tracking-wider">Project ID</span>
                <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                  {SUPABASE_PROJECT_ID}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-500 uppercase tracking-wider">REST Endpoint</span>
                <span className="font-mono text-xs text-zinc-700 dark:text-zinc-300 truncate max-w-[240px]">
                  {SUPABASE_URL}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-500 uppercase tracking-wider">API Key (Publishable)</span>
                <span className="font-mono text-[11px] text-zinc-400">
                  {SUPABASE_ANON_KEY.substring(0, 16)}...
                </span>
              </div>
            </div>

            {/* Tables Status Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/70 text-center space-y-1">
                <p className="text-[11px] font-bold text-zinc-500 uppercase">orders</p>
                <div className="flex items-center justify-center gap-1">
                  {health?.tables.orders ? (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Pending SQL
                    </span>
                  )}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/70 text-center space-y-1">
                <p className="text-[11px] font-bold text-zinc-500 uppercase">products</p>
                <div className="flex items-center justify-center gap-1">
                  {health?.tables.products ? (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Pending SQL
                    </span>
                  )}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/70 text-center space-y-1">
                <p className="text-[11px] font-bold text-zinc-500 uppercase">users</p>
                <div className="flex items-center justify-center gap-1">
                  {health?.tables.users ? (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Pending SQL
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2.5 pt-2">
              <button
                type="button"
                onClick={runHealthCheck}
                disabled={loading}
                className="py-2.5 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs flex items-center gap-2 transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-500 ${loading ? 'animate-spin' : ''}`} />
                <span>Test Connection</span>
              </button>

              <a
                href={sqlEditorUrl}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition shadow-xs cursor-pointer ml-auto"
              >
                <span>Open Supabase SQL Editor</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: SCHEMA SQL SCRIPT                                                  */}
        {/* ========================================================================= */}
        {activeTab === 'sql' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Run this SQL in your Supabase SQL Editor to create tables & policies:
              </p>
              <button
                type="button"
                onClick={handleCopySql}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy SQL'}</span>
              </button>
            </div>

            <div className="relative">
              <pre className="p-4 rounded-2xl bg-zinc-900 text-zinc-200 text-[11px] font-mono overflow-x-auto max-h-64 leading-relaxed border border-zinc-800 select-all">
                {SUPABASE_SCHEMA_SQL}
              </pre>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Ready to execute in your dashboard!</span>
              </div>
              <a
                href={sqlEditorUrl}
                target="_blank"
                rel="noreferrer"
                className="font-bold underline flex items-center gap-1 hover:text-emerald-700 dark:hover:text-emerald-300"
              >
                <span>Open Editor</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: SYNC CATALOG                                                       */}
        {/* ========================================================================= */}
        {activeTab === 'sync' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/70 space-y-2">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Upload Catalog to Supabase</span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Sync all {INITIAL_PRODUCTS.length} seed grocery items (fresh vegetables, dairy, fruits, bakery, snacks) directly into your Supabase <code className="text-emerald-600 dark:text-emerald-400 font-bold">products</code> table.
              </p>
            </div>

            {syncFeedback && (
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-xs text-emerald-800 dark:text-emerald-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{syncFeedback}</span>
              </div>
            )}

            <button
              type="button"
              disabled={syncingProducts}
              onClick={handleSyncCatalog}
              className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/20 active:scale-[0.99] transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {syncingProducts ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Syncing products to Supabase...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Sync {INITIAL_PRODUCTS.length} Products to Supabase Now</span>
                </>
              )}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
