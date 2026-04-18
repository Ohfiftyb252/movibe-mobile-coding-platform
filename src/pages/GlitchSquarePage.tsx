import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { OVWLayout } from '@/components/OVWLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Terminal, Megaphone, TrendingDown, Eye } from 'lucide-react';
import { usePlayerStore } from '@/stores/player-store';
import { cn } from '@/lib/utils';
const FAKE_EVENTS = [
  "User_829 just lost 45,000 OVC on 'Monkey JPEG #4' flip.",
  "DEBT ALERT: Player 'BrokeBoy' has officially reached 'Slave Labor' status.",
  "RUG PULL: 1.2M OVC liquidated in The Crypto Carnival. House wins.",
  "WHALE WATCH: Someone just dropped 200k in The Glitch. Machine remains hungry.",
  "NEWS: Organ prices up 12%. Check your donor status at the bar.",
  "Player_XYZ survived Wave 4 in Quarantine. Payout: 12 OVC. Pathetic.",
  "TONK: 'The Vulture' just took another soul. Card counting detected... and ignored.",
  "NEW TITLE: 'Financial Black Hole' awarded to User_001.",
  "Player hit jackpot... and lost it all in exactly 2 spins. Tragic.",
  "Ignored cash out at +4 Luck in Gander Gallery... public execution by statistics.",
  "3 glitches in a row for User_99... impressive level of systemic failure.",
  "Transaction rejected: User conscience detected. Deducting fine.",
];
const BILLBOARDS = [
  "LOW INTEREST LOANS! (Start at 800% APR)",
  "DON'T NEED THAT SECOND KIDNEY? WE DO.",
  "RECOVER YOUR LOSSES BY LOSING MORE!",
  "THE HOUSE IS ALWAYS DUE. PULL AGAIN.",
  "BUY THE DIP. IT'S DEFINITELY NOT A CRATER.",
];
export function GlitchSquarePage() {
  const player = usePlayerStore((s) => s.player);
  const corruption = player?.corruption ?? 0;
  const debt = player?.debt ?? 0;
  const [messages, setMessages] = useState<string[]>([]);
  const [onlineCount, setOnlineCount] = useState(42069);
  const [billboardIndex, setBillboardIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const triggerMessage = () => {
      setMessages(prev => {
        let msg = FAKE_EVENTS[Math.floor(Math.random() * FAKE_EVENTS.length)];
        // Occasional personalized callout
        if (Math.random() < 0.3 && player) {
          if (corruption > 50) msg = `SYSTEM WATCH: Corruption detected in Sector 0. Looking at you, ${player.name || 'User'}.`;
          else if (debt > 5000) msg = `NOTICE: ${player.name || 'User'}'s debt profile has been sold to Sector 4 collection agents.`;
        }
        const next = [msg, ...prev];
        return next.slice(0, 25);
      });
      // Randomized interval 10-30s
      const nextInterval = Math.floor(Math.random() * 20000) + 10000;
      setTimeout(triggerMessage, nextInterval);
    };
    const initialTimeout = setTimeout(triggerMessage, 2000);
    const countInterval = setInterval(() => {
      setOnlineCount(prev => {
        const flicker = Math.random() > 0.8 ? (Math.random() > 0.5 ? 500 : -500) : (Math.random() > 0.5 ? 1 : -1);
        return prev + flicker;
      });
    }, 1000);
    const bbInterval = setInterval(() => {
      setBillboardIndex(prev => (prev + 1) % BILLBOARDS.length);
    }, 5000);
    return () => { 
      clearTimeout(initialTimeout);
      clearInterval(countInterval); 
      clearInterval(bbInterval); 
    };
  }, [player, corruption, debt]);
  return (
    <OVWLayout>
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-display font-bold uppercase glitch-text" data-text="The Glitch Square">
            The Glitch Square
          </h1>
          <div className="flex items-center justify-center gap-2 text-ov-green font-bold">
            <Users className="w-5 h-5 animate-pulse" />
            <span className="text-xl tracking-tighter">
              <motion.span
                key={onlineCount}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.1 }}
              >
                {onlineCount.toLocaleString()}
              </motion.span> DEGENS ONLINE
            </span>
          </div>
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-black/80 border-ov-primary/30 h-[500px] flex flex-col overflow-hidden">
              <CardHeader className="border-b border-ov-primary/10 py-3 bg-ov-primary/5">
                <CardTitle className="text-xs uppercase tracking-widest text-ov-primary flex items-center gap-2">
                  <Terminal className="w-4 h-4" /> Live Tragedy Feed
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto font-mono text-sm p-6 space-y-4" ref={scrollRef}>
                <AnimatePresence initial={false}>
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i + msg}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={cn(
                        "flex gap-4 p-2 border-l-2",
                        msg.includes("ALERT") || msg.includes("RUG") || msg.includes("WATCH") ? "border-red-500 text-red-400" : "border-ov-primary/20 text-ov-gray"
                      )}
                    >
                      <span className="opacity-30">[{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                      <span>{msg}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {messages.length === 0 && (
                  <div className="text-ov-gray/20 text-center mt-20 italic">WAITING FOR DESTRUCTION...</div>
                )}
              </CardContent>
            </Card>
            <Card className="bg-ov-primary/5 border-ov-primary/40 relative overflow-hidden h-32 flex items-center justify-center">
              <div className="absolute top-2 left-2 text-[10px] uppercase text-ov-primary/50 flex items-center gap-1">
                <Megaphone className="w-3 h-3" /> SPONSORED CONTENT
              </div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={billboardIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-2xl md:text-3xl font-display uppercase text-center px-8 text-ov-primary"
                >
                  {BILLBOARDS[billboardIndex]}
                </motion.p>
              </AnimatePresence>
            </Card>
          </div>
          <div className="space-y-6">
            <Card className="bg-black/60 border-red-500/20">
              <CardHeader><CardTitle className="text-xs uppercase text-red-500">Market Sentiment</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-ov-gray text-xs">Despair Index</span>
                  <span className="text-red-400 font-bold">CRITICAL</span>
                </div>
                <div className="h-2 bg-red-950 rounded-full overflow-hidden">
                  <div className="h-full bg-red-600 w-[94%]" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-ov-gray text-xs">Hopium Levels</span>
                  <span className="text-ov-primary font-bold">0.02%</span>
                </div>
                <div className="h-2 bg-ov-primary/10 rounded-full overflow-hidden">
                  <div className="h-full bg-ov-primary w-[2%]" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-black/60 border-ov-green/20">
              <CardHeader><CardTitle className="text-xs uppercase text-ov-green">Recent Big Wins</CardTitle></CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="flex justify-between border-b border-ov-green/10 pb-2">
                  <span className="text-ov-gray">@LUCKY_RAT</span>
                  <span className="text-ov-green">+12,500 OVC</span>
                </div>
                <div className="flex justify-between border-b border-ov-green/10 pb-2">
                  <span className="text-ov-gray">@HOUSE_PLANT</span>
                  <span className="text-ov-green">+4,200 OVC</span>
                </div>
                <div className="p-2 bg-ov-green/5 rounded text-ov-green italic text-[10px]">
                  "It's about time. I only lost 50,000 to get this."
                </div>
              </CardContent>
            </Card>
            <Button variant="ghost" className="w-full border border-ov-primary/20 hover:bg-ov-primary/10 group h-12">
              <Eye className="w-4 h-4 mr-2 group-hover:animate-bounce" /> WATCH REPLAYS
            </Button>
          </div>
        </div>
        <div className="text-center pt-8">
          <Button asChild variant="link" className="text-ov-primary hover:text-white uppercase tracking-[0.5em] text-xs">
            <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> RETREAT TO HUB</Link>
          </Button>
        </div>
      </div>
    </OVWLayout>
  );
}