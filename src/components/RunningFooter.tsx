import React from 'react';
import { Sparkles, ShieldCheck, Zap, HeartHandshake, Leaf, Truck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const RunningFooter: React.FC = () => {
  const { t } = useLanguage();

  const tickerItems = [
    { icon: Zap, text: t('runningLive1') },
    { icon: Leaf, text: t('runningLive2') },
    { icon: Sparkles, text: t('runningLive3') },
    { icon: ShieldCheck, text: t('runningLive4') },
  ];

  return (
    <footer id="running-app-footer" className="mt-auto border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden pb-16 sm:pb-4 transition-colors">
      
      {/* 1. Live Continuous Running Ticker Bar */}
      <div className="bg-emerald-600 dark:bg-emerald-700 py-2 text-white overflow-hidden whitespace-nowrap select-none">
        <div className="flex animate-marquee gap-8 items-center text-xs sm:text-sm font-bold">
          {tickerItems.concat(tickerItems).map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-center gap-2 shrink-0 px-4">
                <Icon className="w-4 h-4 text-amber-300 shrink-0" />
                <span>{item.text}</span>
                <span className="text-emerald-300 mx-3">•</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Structured Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-zinc-600 dark:text-zinc-400 text-xs">
          
          {/* Brand Col */}
          <div className="space-y-2">
            <span className="font-black text-base text-zinc-900 dark:text-white tracking-tight">
              Super<span className="text-emerald-600 dark:text-emerald-400">Cart</span>
            </span>
            <p className="leading-relaxed">
              India's fastest farm-to-table organic grocery service. Bringing fresh seasonal harvest straight to your kitchen in 15 minutes.
            </p>
          </div>

          {/* Sourcing */}
          <div className="space-y-1.5">
            <span className="font-bold text-zinc-900 dark:text-white uppercase tracking-wider text-[11px] block">
              Direct Sourcing
            </span>
            <p>• Ratnagiri GI Alphonso Groves</p>
            <p>• Mahabaleshwar Strawberry Valleys</p>
            <p>• Nashik Organic Vegetable Clusters</p>
            <p>• Desi Gir Cow A2 Dairy Pastures</p>
          </div>

          {/* Quality Promises */}
          <div className="space-y-1.5">
            <span className="font-bold text-zinc-900 dark:text-white uppercase tracking-wider text-[11px] block">
              100% Quality Promises
            </span>
            <p>• Zero Chemical Preservatives</p>
            <p>• Rigorous Daily Pesticide Testing</p>
            <p>• Cold-Chain Temperature Controlled</p>
            <p>• Instant Doorstep No-Questions Return</p>
          </div>

          {/* Coverage in India */}
          <div className="space-y-1.5">
            <span className="font-bold text-zinc-900 dark:text-white uppercase tracking-wider text-[11px] block">
              Pan-India Locations
            </span>
            <p>Mumbai, Pune, Nagpur, Nashik, Bengaluru, Delhi NCR, Hyderabad, Chennai, Kolkata, Ahmedabad & 50+ Cities across India.</p>
          </div>

        </div>

        <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-zinc-500">
          <p>© {new Date().getFullYear()} SuperCart India Technologies Pvt Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>FSSAI Certified #10022022000543</span>
            <span>Made with ❤️ in India</span>
          </div>
        </div>
      </div>

    </footer>
  );
};
