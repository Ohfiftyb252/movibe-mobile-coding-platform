import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { usePlayerStore } from '@/stores/player-store';
import { cn } from '@/lib/utils';
const GLOBAL_NEWS = [
  "DEBT WATCH: Biometric assets are being liquidated in Sector 7.",
  "MARKET UPDATE: Organ prices up 12%. Check your donor status at the bar.",
  "PSA: Synthetic luck algorithms currently 98% rigged for 'Fairness'.",
  "NEWS: Local gambler ignores +4 Luck streak. Tragedy ensues.",
  "WEATHER: 100% chance of financial ruin with localized dopamine spikes.",
  "ALERT: The House reminds you that walking away is a sign of weakness.",
  "REPORT: 84% of players believe they are 'Due'. 100% are wrong.",
  "HEALTH: Sleep is just a bug in the productivity kernel. Pull the lever.",
  "REGRET: The 7 was right there. You just didn't want it enough.",
  "PSA: Your wallet is too heavy. Let us help you with that.",
  "NEWS: Market spikes detected in 'The Glitch'. Someone just Mooned. Was it you? No.",
];
export function SatiricalTicker() {
  const debt = usePlayerStore((s) => s.player?.debt ?? 0);
  const corruption = usePlayerStore((s) => s.player?.corruption ?? 0);
  const heat = usePlayerStore((s) => s.player?.heat ?? 0);
  const regrets = usePlayerStore((s) => s.player?.totalRegrets ?? 0);
  const personalizedNews = useMemo(() => {
    const news = [...GLOBAL_NEWS];
    if (debt > 25000) {
      news.push(`FINANCIAL CRITICAL: Player liabilities exceed ${debt.toLocaleString()} OVC. Outstanding performance.`);
    }
    if (corruption > 85) {
      news.push("SYSTEM ALERT: High corruption detected. Reality stability failing. Please hold your breath.");
    }
    if (regrets > 10) {
      news.push(`REGRET ARCHIVE: User has recorded ${regrets} near-misses. A masterpiece of hesitation.`);
    }
    return [...news, ...news, ...news]; // Triple for seamless scroll on wide screens
  }, [debt, corruption, regrets]);
  // Speed up based on heat (min 15s, max speed scaling from 60s)
  const duration = Math.max(15, 60 - (heat / 4));
  return (
    <div className="w-full bg-black/60 border-y border-ov-primary/20 overflow-hidden py-1.5 select-none pointer-events-none backdrop-blur-sm">
      <motion.div
        className="flex whitespace-nowrap"
        style={{ willChange: 'transform' }}
        animate={{ x: [0, -4000] }}
        transition={{
          duration: duration,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {personalizedNews.map((text, i) => {
          const isCrash = text.includes("CRITICAL") || text.includes("ALERT") || text.includes("REGRET");
          return (
            <span
              key={i}
              className={cn(
                "text-[10px] uppercase tracking-[0.3em] font-black px-16",
                isCrash ? "text-red-500/50" : "text-ov-primary/30"
              )}
            >
              {text}
            </span>
          );
        })}
      </motion.div>
    </div>
  );
}