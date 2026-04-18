import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { OVWLayout } from '@/components/OVWLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Users, Terminal, Megaphone, TrendingDown, Eye, AlertCircle } from 'lucide-react';
import { usePlayerStore } from '@/stores/player-store';
import { cn } from '@/lib/utils';
const CATEGORIES = {
  WIN_SPIKE: [
    "DOPAMINE ALERT: User_777 hit jackpot (+12,400 OVC) in The Glitch.",
    "WHALE WATCH: @BigSpender just liquidated a 5,000 OVC position in Crypto Carnival.",
    "LUCK OVERFLOW: Someone just cleared 5 waves in Quarantine. Rare competence detected.",
    "WINNER: User_888 just tonked the house for 1,200 OVC. The Vulture is displeased."
  ],
  CRASH_STORY: [
    "LIQUIDATION: User lost everything chasing a fake jackpot. Biometrics seized.",
    "RUG PULL: 42k OVC drained from The Carnival. House algorithms functioning perfectly.",
    "BEYOND BROKE: Player 'DebtLord' just hit 1,000,000 OVC in liabilities. Achievement unlocked: Asset.",
    "CRITICAL FAILURE: User attempted to smash terminal... broke own hand instead. Fine deducted."
  ],
  REGRET_EVENT: [
    "PSYCHOLOGICAL TORMENT: Player ignored 3 Near-Misses in a row. Statistics laugh at you.",
    "MISSED OPPORTUNITY: Jackpot trap was right there. You lacked the greed to click.",
    "REGRET: User cashed out at +1. Machine immediately rolled a Triple 7. Tragic.",
    "SYSTEM TAUNT: That '7' you saw? It was real. You just weren't the chosen one."
  ],
  SYSTEM_WHISPER: [
    "WHISPER: Reality stability at 12%. Please refrain from thinking about your losses.",
    "SYSTEM: Current social reputation 'Fresh Meat' detected. Increasing taunt frequency.",
    "WHISPER: The machine misses your touch. Don't leave it lonely.",
    "WHISPER: Your debt is your legacy. Make it legendary."
  ]
};
const BILLBOARDS = [
  "LOW INTEREST LOANS! (Start at 800% APR)",
  "DON'T NEED THAT SECOND KIDNEY? WE DO.",
  "RECOVER YOUR LOSSES BY LOSING MORE!",
  "THE HOUSE IS ALWAYS DUE. PULL AGAIN.",
  "BUY THE DIP. IT'S DEFINITELY NOT A CRATER."
];
export function GlitchSquarePage() {
  const player = usePlayerStore((s) => s.player);
  const debt = usePlayerStore((s) => s.player?.debt ?? 0);
  const corruption = usePlayerStore((s) => s.player?.corruption ?? 0);
  const regrets = usePlayerStore((s) => s.player?.totalRegrets ?? 0);
  const title = usePlayerStore((s) => s.player?.title ?? 'Fresh Meat');
  const [messages, setMessages] = useState<string[]>([]);
  const [onlineCount, setOnlineCount] = useState(42069);
  const [billboardIndex, setBillboardIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef({ debt, corruption, regrets, name: player?.name, title });
  useEffect(() => {
    statsRef.current = { debt, corruption, regrets, name: player?.name, title };
  }, [debt, corruption, regrets, player?.name, title]);
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const triggerMessage = () => {
      setMessages(prev => {
        const types = Object.keys(CATEGORIES);
        const selectedType = types[Math.floor(Math.random() * types.length)] as keyof typeof CATEGORIES;
        let msg = CATEGORIES[selectedType][Math.floor(Math.random() * CATEGORIES[selectedType].length)];
        const stats = statsRef.current;
        if (Math.random() < 0.35) {
          if (stats.regrets > 5 && Math.random() < 0.4) {
            msg = `REGRET ALERT: ${stats.name || 'User'} (${stats.title}) is officially a 'Regret Magnet' with ${stats.regrets} missed opportunities.`;
          } else if (stats.debt > 20000 && Math.random() < 0.4) {
            msg = `DEBT WATCH: ${stats.name || 'User'}'s soul is now 65% owned by O.V. Corp. Debt: ${stats.debt.toLocaleString()}.`;
          } else if (stats.corruption > 85 && Math.random() < 0.4) {
            msg = `SYSTEM WARNING: ${stats.name || 'User'} is leaking corruption into the feed. Termination recommended.`;
          }
        }
        return [msg, ...prev].slice(0, 40);
      });
      const nextInterval = Math.floor(Math.random() * 6000) + 1000;
      timeoutId = setTimeout(triggerMessage, nextInterval);
    };
    triggerMessage();
    const countInterval = setInterval(() => {
      setOnlineCount(p => p + (Math.random() > 0.5 ? Math.floor(Math.random() * 8) : -Math.floor(Math.random() * 8)));
    }, 2500);
    const bbInterval = setInterval(() => {
      setBillboardIndex(prev => (prev + 1) % BILLBOARDS.length);
    }, 5000);
    return () => {
      clearTimeout(timeoutId);
      clearInterval(countInterval);
      clearInterval(bbInterval);
    };
  }, []);
  const publicShame = Math.min(100, (debt / 500) + (corruption / 2));
  const degenTier = debt > 50000 ? "Systemic Error" : debt > 10000 ? "Liquidity Provider" : "Statistic in Waiting";
  return (
    <OVWLayout>
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-20">
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-7xl font-display font-bold uppercase glitch-text" data-text="The Glitch Square">
            The Glitch Square
          </h1>
          <div className="flex items-center justify-center gap-4 text-ov-green font-bold">
            <Users className="w-5 h-5 animate-pulse" />
            <span className="text-2xl tracking-tighter tabular-nums">
              {onlineCount.toLocaleString()} DEGENS ONLINE
            </span>
          </div>
        </div>
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-8">
            <Card className="bg-black/90 border-ov-primary/30 h-[600px] flex flex-col overflow-hidden relative shadow-2xl">
              <div className="absolute inset-0 scanline opacity-10 pointer-events-none" />
              <CardHeader className="border-b border-ov-primary/20 py-4 bg-ov-primary/5 backdrop-blur-md">
                <CardTitle className="text-sm uppercase tracking-[0.3em] text-ov-primary flex items-center gap-3">
                  <Terminal className="w-5 h-5" /> LIVE_TRAGEDY_FEED_V5.0
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto font-mono text-sm p-8 space-y-4 scroll-smooth" ref={scrollRef}>
                <AnimatePresence initial={false}>
                  {messages.map((msg, i) => {
                    const isSpike = msg.includes("JACKPOT") || msg.includes("DOPAMINE") || msg.includes("WINNER");
                    const isCrash = msg.includes("LIQUIDATION") || msg.includes("RUG") || msg.includes("DEBT") || msg.includes("WARNING");
                    const isRegret = msg.includes("REGRET") || msg.includes("OPPORTUNITY") || msg.includes("TAUNT") || msg.includes("WHISPER");
                    return (
                      <motion.div
                        key={i + msg}
                        initial={{ opacity: 0, x: -30, filter: "blur(10px)" }}
                        animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                        className={cn(
                          "flex gap-4 p-4 rounded-lg border-l-4 bg-white/5 transition-all hover:bg-white/10",
                          isSpike && "border-ov-green text-ov-green bg-ov-green/5 shadow-[0_0_15px_rgba(0,255,156,0.1)]",
                          isCrash && "border-red-500 text-red-400 bg-red-500/5",
                          isRegret && "border-ov-primary text-ov-primary bg-ov-primary/5",
                          !isSpike && !isCrash && !isRegret && "border-ov-gray/20 text-ov-gray"
                        )}
                      >
                        <span className="opacity-40 font-bold shrink-0">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                        <span className="leading-relaxed">{msg}</span>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </CardContent>
            </Card>
            <Card className="bg-ov-primary/5 border-ov-primary/40 relative overflow-hidden h-40 flex items-center justify-center group cursor-help">
              <div className="absolute top-3 left-4 text-[11px] uppercase text-ov-primary/60 font-black flex items-center gap-2 tracking-widest">
                <Megaphone className="w-4 h-4 animate-bounce" /> SPONSORED_DESPAIR
              </div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={billboardIndex}
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.05, y: -10 }}
                  className="text-3xl md:text-4xl font-display uppercase text-center px-12 text-ov-primary leading-tight drop-shadow-[0_0_10px_rgba(255,0,229,0.3)]"
                >
                  {BILLBOARDS[billboardIndex]}
                </motion.p>
              </AnimatePresence>
            </Card>
          </div>
          <div className="space-y-6">
            <Card className="bg-black/80 border-ov-primary/20 p-6 space-y-6 sticky top-32">
              <div className="space-y-4">
                <h3 className="text-xs uppercase font-black text-ov-gray tracking-[0.2em] flex items-center gap-2">
                   <AlertCircle className="w-4 h-4" /> Public Profile
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] uppercase text-ov-gray">Social Rep</span>
                    <span className="text-ov-primary font-bold">{title}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] uppercase text-ov-gray">Degen Tier</span>
                    <span className="text-ov-green font-bold">{degenTier}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4 pt-4 border-t border-ov-primary/10">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] uppercase font-bold text-red-500">
                    <span>Public Shame Meter</span>
                    <span>{Math.floor(publicShame)}%</span>
                  </div>
                  <Progress value={publicShame} className="h-2 bg-red-950/50" />
                  <p className="text-[9px] text-ov-gray italic text-center">"The community is watching your downfall."</p>
                </div>
              </div>
              <div className="space-y-4 pt-4 border-t border-ov-primary/10">
                <h3 className="text-xs uppercase font-black text-ov-gray tracking-[0.2em]">Market Indices</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-ov-gray">Despair Index</span>
                    <span className="text-red-500 font-bold animate-pulse">EXTREME</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-ov-gray">Regret Yield</span>
                    <span className="text-ov-primary font-bold">{(regrets * 1.5).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full border-ov-primary/40 text-ov-primary hover:bg-ov-primary hover:text-black transition-all group h-14">
                <Eye className="w-5 h-5 mr-3 group-hover:rotate-12" /> REPLAY_TRAGEDY
              </Button>
            </Card>
          </div>
        </div>
        <div className="text-center pt-12">
          <Button asChild variant="link" className="text-ov-primary hover:text-white uppercase tracking-[0.5em] text-sm group">
            <Link to="/">
              <ArrowLeft className="mr-3 h-5 w-5 group-hover:-translate-x-2 transition-transform" />
              TERMINATE_SOCIAL_SIM
            </Link>
          </Button>
        </div>
      </div>
    </OVWLayout>
  );
}