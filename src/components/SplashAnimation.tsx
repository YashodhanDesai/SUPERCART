import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SplashProps {
  onComplete: () => void;
}

export const SplashAnimation: React.FC<SplashProps> = ({ onComplete }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Initiate smooth exit fade at 3.65s to conclude at exactly 4.0s
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 3650);

    // Complete transition and mount main storefront at exactly 4.0s
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 4000);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          id="splash-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center select-none overflow-hidden bg-[#060a08] text-white"
        >
          {/* Ambient Background Lighting & Radial Atmospheric Glow */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_45%,rgba(16,185,129,0.18),transparent_65%)]" />
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: [0.85, 1.1, 1], opacity: [0, 0.35, 0.22] }}
            transition={{ duration: 1.7, ease: 'easeOut' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[340px] blur-[120px] rounded-full pointer-events-none bg-emerald-500/25"
          />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/50 via-transparent to-black/90" />

          {/* Main Center Brand Typography */}
          <div className="relative z-10 w-full max-w-xl px-6 flex flex-col items-center justify-center text-center my-auto">
            {/* Slow, Cinematic SuperCart Name Reveal */}
            <div className="relative flex items-center justify-center overflow-visible py-2">
              <div className="flex items-center text-5xl sm:text-7xl font-black tracking-tight font-display">
                {/* "Super" enters slowly & smoothly from the left with gentle unblur */}
                <motion.span
                  initial={{ x: -100, opacity: 0, filter: 'blur(8px)' }}
                  animate={{
                    x: 0,
                    opacity: 1,
                    filter: 'blur(0px)',
                  }}
                  transition={{
                    duration: 0.95,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)] inline-block"
                >
                  Super
                </motion.span>

                {/* "Cart" enters slowly & smoothly from the right with emerald glow */}
                <motion.span
                  initial={{ x: 100, opacity: 0, filter: 'blur(8px)' }}
                  animate={{
                    x: 0,
                    opacity: 1,
                    filter: 'blur(0px)',
                  }}
                  transition={{
                    duration: 0.95,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="text-emerald-400 font-black tracking-tight drop-shadow-[0_0_35px_rgba(52,211,153,0.7)] inline-block ml-1"
                >
                  Cart
                </motion.span>
              </div>
            </div>
          </div>

          {/* Full Screen Width Road & Small Realistic Delivery Bike Animation (Runs completely from Left to Right) */}
          <div className="absolute bottom-10 sm:bottom-14 left-0 right-0 w-full h-24 overflow-hidden pointer-events-none z-20">
            
            {/* Full-width Asphalt Road Track */}
            <div className="absolute bottom-2 left-0 right-0 h-1 bg-zinc-800/80">
              {/* Glowing active center road line */}
              <motion.div
                initial={{ opacity: 0.3 }}
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
                className="h-full w-full bg-gradient-to-r from-emerald-500/20 via-emerald-400/50 to-emerald-500/20"
              />
            </div>

            {/* Road Dash Markers sweeping along */}
            <div className="absolute bottom-1.5 left-0 right-0 flex justify-around px-2 opacity-30">
              {[...Array(16)].map((_, i) => (
                <div key={i} className="w-6 sm:w-10 h-0.5 bg-emerald-400 rounded-full" />
              ))}
            </div>

            {/* Delivery Boy on Bike: Rides smoothly across from offscreen left (-120px) to offscreen right (100vw + 120px) over 3.4s */}
            <motion.div
              initial={{ x: '-120px' }}
              animate={{ x: 'calc(100vw + 120px)' }}
              transition={{
                duration: 3.4,
                delay: 0.15,
                ease: [0.25, 0.46, 0.45, 0.94], // Gentle cruise across 4 seconds
              }}
              className="absolute bottom-2 left-0 flex items-center"
            >
              {/* Exhaust Smoke Puffs */}
              <div className="absolute left-[4px] bottom-[10px] pointer-events-none z-0">
                <motion.div
                  animate={{
                    scale: [0.3, 1.1, 0],
                    opacity: [0.7, 0.3, 0],
                    x: [-2, -14],
                    y: [-1, -5],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.18,
                    ease: 'easeOut',
                  }}
                  className="absolute w-2.5 h-2.5 rounded-full bg-zinc-300/40 blur-[1px]"
                />
                <motion.div
                  animate={{
                    scale: [0.3, 1.2, 0],
                    opacity: [0.6, 0.2, 0],
                    x: [-3, -18],
                    y: [0, -7],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.18,
                    delay: 0.06,
                    ease: 'easeOut',
                  }}
                  className="absolute w-3 h-3 rounded-full bg-emerald-200/30 blur-[1.5px]"
                />
              </div>

              {/* Speed Wind Streaks */}
              <div className="absolute right-full mr-1.5 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-80 pointer-events-none">
                <motion.div 
                  animate={{ opacity: [0.3, 0.9, 0.3] }} 
                  transition={{ duration: 0.2, repeat: Infinity }}
                  className="w-7 h-0.5 bg-gradient-to-l from-emerald-400 to-transparent rounded-full" 
                />
                <motion.div 
                  animate={{ opacity: [0.5, 1, 0.5] }} 
                  transition={{ duration: 0.2, delay: 0.06, repeat: Infinity }}
                  className="w-11 h-0.5 bg-gradient-to-l from-teal-300 via-emerald-400 to-transparent rounded-full ml-2" 
                />
                <motion.div 
                  animate={{ opacity: [0.2, 0.8, 0.2] }} 
                  transition={{ duration: 0.2, delay: 0.12, repeat: Infinity }}
                  className="w-5 h-0.5 bg-gradient-to-l from-emerald-500 to-transparent rounded-full" 
                />
              </div>

              {/* Small, Realistic Delivery Boy & Scooter (Proportionally Compact) */}
              <motion.div
                animate={{
                  y: [0, -1.5, 0, -1, 0, -1.5, 0],
                  rotate: [0, -0.3, 0.3, -0.2, 0.4, -0.2, 0],
                }}
                transition={{
                  duration: 3.4,
                  times: [0, 0.18, 0.36, 0.54, 0.72, 0.9, 1],
                  ease: 'easeInOut',
                }}
                className="relative drop-shadow-[0_6px_16px_rgba(16,185,129,0.3)]"
              >
                <svg
                  width="100"
                  height="62"
                  viewBox="0 0 100 62"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="overflow-visible"
                >
                  {/* Subtle Headlight Beam Projection */}
                  <polygon
                    points="78,38 108,24 108,54 78,46"
                    fill="url(#headlightBeamMini)"
                    opacity="0.45"
                  />

                  {/* --- REAR CARGO DELIVERY BAG & FRESH GROCERIES --- */}
                  {/* Thermal Insulated Delivery Backpack / Box */}
                  <rect
                    x="10"
                    y="16"
                    width="26"
                    height="23"
                    rx="4"
                    fill="#064e3b"
                    stroke="#10b981"
                    strokeWidth="1.4"
                  />
                  {/* High-visibility Reflective Stripe */}
                  <rect x="11" y="26" width="24" height="2.8" fill="#34d399" opacity="0.9" rx="0.5" />
                  <rect x="11" y="31" width="24" height="1.2" fill="#6ee7b7" opacity="0.6" rx="0.3" />

                  {/* Groceries peeking out realistically */}
                  {/* Brown paper grocery bag top */}
                  <path d="M15 16 L17 7 L25 7 L27 16 Z" fill="#d97706" stroke="#b45309" strokeWidth="0.8" />
                  {/* Baguette bread top */}
                  <path d="M23 11 L29 3 L32 5 L26 13 Z" fill="#f59e0b" stroke="#d97706" strokeWidth="0.7" />
                  {/* Fresh carrot with green leafy top */}
                  <path d="M27 15 L32 7 L30 6 Z" fill="#ea580c" stroke="#c2410c" strokeWidth="0.7" />
                  <path d="M31 6 L34 3 M32 7 L35 5" stroke="#22c55e" strokeWidth="1.2" strokeLinecap="round" />
                  {/* Green fresh apple */}
                  <circle cx="18" cy="7" r="3.2" fill="#84cc16" stroke="#65a30d" strokeWidth="0.7" />
                  <path d="M18 3.8 Q19 2 20 3" stroke="#713f12" strokeWidth="0.8" strokeLinecap="round" />
                  {/* Milk bottle top */}
                  <rect x="21" cy="5" y="4" width="4" height="10" rx="1" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.7" />
                  <rect x="22" y="3" width="2.2" height="1.5" rx="0.3" fill="#38bdf8" />

                  {/* --- REALISTIC DELIVERY BOY RIDER --- */}
                  {/* Body & Rider Jacket leaning slightly forward */}
                  <path
                    d="M36 28 L43 21 L53 23 L51 42 L39 42 Z"
                    fill="#047857"
                    stroke="#10b981"
                    strokeWidth="1.2"
                  />
                  {/* Hi-Vis Vest Stripe */}
                  <path d="M42 23 L48 25 L46 39 L40 38 Z" fill="#34d399" opacity="0.9" />
                  {/* Rider Legs & Trousers */}
                  <path
                    d="M45 40 L53 40 L60 49 L53 49 L46 44 Z"
                    fill="#0f172a"
                    stroke="#1e293b"
                    strokeWidth="1"
                  />
                  {/* Shoe */}
                  <path d="M58 49 L66 49 L66 51 L58 51 Z" fill="#10b981" rx="0.5" />

                  {/* Rider Arms extending to Handlebars */}
                  <path
                    d="M47 27 L65 31"
                    stroke="#059669"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M61 30 L66 31"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* Rider Head & Protective Helmet */}
                  <circle cx="48" cy="13" r="7.5" fill="#065f46" stroke="#34d399" strokeWidth="1.4" />
                  {/* Helmet Visor with Blue Specular Highlight */}
                  <path
                    d="M50 8 C55 9 56 14 53 18 C50 18 48 16 50 8 Z"
                    fill="#0f172a"
                    stroke="#38bdf8"
                    strokeWidth="0.8"
                  />

                  {/* --- SCOOTER BODYWORK & CHASSIS --- */}
                  {/* Main Chassis Base */}
                  <path
                    d="M20 43 L38 43 L50 43 L64 37 L76 37 L78 43 L68 47 L34 47 Z"
                    fill="#09090b"
                    stroke="#27272a"
                    strokeWidth="1.5"
                  />
                  {/* Front Apron Fairing */}
                  <path
                    d="M62 37 L70 26 L76 26 L78 38 L68 45 Z"
                    fill="#059669"
                    stroke="#34d399"
                    strokeWidth="1.3"
                  />
                  {/* Front Mudguard */}
                  <path
                    d="M71 44 C75 40 85 40 89 44"
                    stroke="#10b981"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                  />
                  {/* Rear Mudguard */}
                  <path
                    d="M13 44 C17 40 27 40 31 44"
                    stroke="#10b981"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                  />

                  {/* Handlebars & Mirror */}
                  <path d="M66 26 L71 20 L66 19" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="66" cy="18.5" r="1.6" fill="#38bdf8" stroke="#0284c7" strokeWidth="0.5" />

                  {/* Headlight bulb */}
                  <ellipse cx="76" cy="32" rx="1.8" ry="2.4" fill="#fef08a" stroke="#f59e0b" strokeWidth="0.7" />

                  {/* --- WHEELS (Realistic Scale) --- */}
                  {/* Rear Wheel */}
                  <circle cx="22" cy="49" r="9.5" fill="#09090b" stroke="#27272a" strokeWidth="3" />
                  <circle cx="22" cy="49" r="4.5" fill="#047857" stroke="#34d399" strokeWidth="1.2" />
                  <circle cx="22" cy="49" r="1.5" fill="#e2e8f0" />

                  {/* Front Wheel */}
                  <circle cx="80" cy="49" r="9.5" fill="#09090b" stroke="#27272a" strokeWidth="3" />
                  <circle cx="80" cy="49" r="4.5" fill="#047857" stroke="#34d399" strokeWidth="1.2" />
                  <circle cx="80" cy="49" r="1.5" fill="#e2e8f0" />

                  {/* Exhaust tip */}
                  <path d="M29 48 L10 49 L8 47" stroke="#64748b" strokeWidth="2.2" strokeLinecap="round" />

                  {/* Gradient definitions */}
                  <defs>
                    <linearGradient id="headlightBeamMini" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
                      <stop offset="50%" stopColor="#6ee7b7" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Spinning Wheel Spokes Accents */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.1, ease: 'linear' }}
                  className="absolute bottom-[6px] left-[17px] w-2.5 h-2.5 rounded-full border-t border-r border-emerald-300 pointer-events-none"
                />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.1, ease: 'linear' }}
                  className="absolute bottom-[6px] right-[15px] w-2.5 h-2.5 rounded-full border-t border-r border-emerald-300 pointer-events-none"
                />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
