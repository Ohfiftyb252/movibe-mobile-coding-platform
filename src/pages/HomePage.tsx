import { Link } from 'react-router-dom';
import { OVWLayout } from '@/components/OVWLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dices, Gem, Trash2, Bird, Crosshair, Bot, Biohazard, Users, Terminal, Share2 } from 'lucide-react';
import { toast } from 'sonner';
const locations = [
  {
    to: '/location/back-alley',
    title: 'The Back Alley Arena',
    description: 'Fixed fights. Scripted drama. The only thing real is the debt.',
    icon: Dices,
    glitchText: 'B@CK_A11EY',
  },
  {
    to: '/location/crypto-carnival',
    title: 'The Crypto Carnival',
    description: 'Lose your life savings on digital tulips and monkey JPEGs.',
    icon: Gem,
    glitchText: 'CRYPT0_C@RNIVAL',
  },
  {
    to: '/location/glitch-square',
    title: 'The Glitch Square',
    description: 'Witness the public downfall of your peers. Fake news, real losses.',
    icon: Users,
    glitchText: 'GL1TCH_SQU@RE',
  },
  {
    to: '/location/data-dump',
    title: 'The Data Dump',
    description: 'Bet on corporate data breaches. Insider trading is encouraged.',
    icon: Trash2,
    glitchText: 'D@TA_DUMP',
  },
  {
    to: '/location/vultures-nest',
    title: "The Vulture's Nest",
    description: 'A friendly game of Tonk. Watch your back, and your cards.',
    icon: Bird,
    glitchText: 'VU1TUR3_N3ST',
  },
  {
    to: '/location/gander-gallery',
    title: 'The Gander Gallery',
    description: 'Shoot pixelated ducks for fun and profit.',
    icon: Crosshair,
    glitchText: 'G@NDER_G@LLERY',
  },
  {
    to: '/location/the-glitch',
    title: 'The Glitch',
    description: 'A slot machine that is definitely not a memory leak.',
    icon: Bot,
    glitchText: 'TH3_GL!TCH',
  },
  {
    to: '/location/zombie-outbreak',
    title: 'The Quarantine Zone',
    description: 'Wave survival. Only thing worse than the zombies is the pay.',
    icon: Biohazard,
    glitchText: 'Z0MBIE_0UTBREAK',
  },
];
export function HomePage() {
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("URL PERSISTED", { description: "Tell them what you saw. Spread the plague." });
  };

  return (
    <OVWLayout>
      <div className="max-w-7xl mx-auto">
        <div className="text-center animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-display font-bold uppercase glitch-text" data-text="O.V. World">
            O.V. World
          </h1>
          <p className="mt-4 text-lg md:text-xl text-ov-gray max-w-2xl mx-auto">
            Your premier digital dive bar for consequence-free bad decisions.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
          <Card className="md:col-span-2 bg-black/50 border-ov-primary/20">
             <CardHeader className="py-3 border-b border-ov-primary/10">
                <CardTitle className="text-xs uppercase tracking-widest text-ov-primary flex items-center gap-2">
                   <Terminal className="w-4 h-4" /> TRAGEDY_LOG_RECAP
                </CardTitle>
             </CardHeader>
             <CardContent className="py-4">
                <div className="flex items-center justify-between text-xs font-mono text-ov-gray">
                   <span>[LATEST] User hit jackpot... lost it all in 2 spins.</span>
                   <Link to="/location/glitch-square" className="text-ov-primary hover:underline">VIEW FULL FEED</Link>
                </div>
             </CardContent>
          </Card>
          <Card className="bg-ov-primary/5 border-ov-primary/20 flex flex-col justify-center p-4 relative group">
             <Button onClick={handleShare} variant="ghost" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-ov-primary">
               <Share2 className="w-4 h-4" />
             </Button>
             <p className="text-[10px] uppercase text-ov-primary font-bold tracking-widest">Global Status</p>
             <p className="text-xl text-ov-foreground font-display">UNSTABLE</p>
          </Card>
        </div>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
          {locations.map((loc) => (
            <Card key={loc.to} className="bg-black/50 border-ov-primary/20 hover:border-ov-primary/60 transition-all group flex flex-col">
              <CardHeader className="flex-row items-center gap-4 space-y-0">
                <loc.icon className="w-8 h-8 text-ov-primary" />
                <CardTitle className="text-ov-primary font-display uppercase tracking-widest glitch-text" data-text={loc.glitchText}>
                  {loc.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col flex-1">
                <p className="text-ov-gray mb-6 flex-1 text-sm">{loc.description}</p>
                <Button asChild variant="outline" className="w-full bg-transparent border-ov-primary/50 text-ov-primary hover:bg-ov-primary hover:text-black">
                  <Link to={loc.to}>Enter</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </OVWLayout>
  );
}