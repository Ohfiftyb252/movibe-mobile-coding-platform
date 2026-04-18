import React from 'react';
import { motion } from 'framer-motion';
import { usePlayerStore } from '@/stores/player-store';
const GLOBAL_NEWS = [
  "DEBT WATCH: Biometric assets are being liquidated in Sector 7.",
  "MARKET UPDATE: Organ prices up 12%. Check your donor status at the bar.",
  "PSA: Synthetic luck algorithms currently 98% rigged for 'Fairness'.",
  "NEWS: Local gambler ignores +4 Luck streak. Tragedy ensues.",
  "WEATHER: 100% chance of financial ruin with localized dopamine spikes.",
  "ALERT: The House reminds you that walking away is a sign of weakness.",
  "REPORT: 84% of players believe they are 'Due'. 100% are wrong.",
  "HEALTH: Sleep is just a bug in the productivity kernel. Pull the lever.",
];
export function SatiricalTicker() {
  const player = usePlayerStore((s) => s.player);
  const debt = player?.debt ?? 0;
  const corruption = player?.corruption ?? 0;
  const personalizedNews = React.useMemo(() => {
    const news = [...GLOBAL_NEWS];
    if (debt > 10000) {
      news.push(`FINANCIAL CRITICAL: Player liabilities exceed ${debt.toLocaleString()} OVC. Outstanding.`);
    }
    if (corruption > 80) {
      news.push("SYSTEM ALERT: High corruption levels detected. Reality stability failing.");
    }
    return [...news, ...news]; // Double for seamless scroll
  }, [debt, corruption]);
  return (
    <div className="w-full bg-black/40 border-y border-ov-primary/10 overflow-hidden py-1 select-none pointer-events-none">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: [0, -1000] }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {personalizedNews.map((text, i) => (
          <span
            key={i}
            className="text-[10px] uppercase tracking-[0.2em] text-ov-primary/30 font-bold px-12"
          >
            {text}
          </span>
        ))}
      </motion.div>
    </div>
  );
}