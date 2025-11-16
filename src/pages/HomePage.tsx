import { Link } from 'react-router-dom';
import { OVWLayout } from '@/components/OVWLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dices, Gem, Trash2 } from 'lucide-react';
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
    description: 'Step right up! Lose your life savings on digital tulips and monkey JPEGs.',
    icon: Gem,
    glitchText: 'CRYPT0_C@RNIVAL',
  },
  {
    to: '/location/data-dump',
    title: 'The Data Dump',
    description: 'Bet on the next corporate data breach. Insider trading is encouraged.',
    icon: Trash2,
    glitchText: 'D@TA_DUMP',
  },
];
export function HomePage() {
  return (
    <OVWLayout>
      <div className="text-center animate-fade-in">
        <h1 className="text-5xl md:text-7xl font-display font-bold uppercase glitch-text" data-text="O.V. World">
          O.V. World
        </h1>
        <p className="mt-4 text-lg md:text-xl text-ov-gray max-w-2xl mx-auto">
          Your premier digital dive bar for consequence-free bad decisions.
        </p>
      </div>
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 animate-slide-up">
        {locations.map((loc) => (
          <Card key={loc.to} className="bg-black/50 border-ov-primary/20 hover:border-ov-primary/60 transition-all duration-300 transform hover:-translate-y-1 group">
            <CardHeader className="flex-row items-center gap-4 space-y-0">
              <loc.icon className="w-8 h-8 text-ov-primary" />
              <CardTitle className="text-ov-primary font-display uppercase tracking-widest glitch-text" data-text={loc.glitchText}>
                {loc.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-ov-gray mb-6">{loc.description}</p>
              <Button asChild variant="outline" className="w-full bg-transparent border-ov-primary/50 text-ov-primary hover:bg-ov-primary hover:text-black transition-colors duration-300 group-hover:shadow-[0_0_15px_rgba(255,0,229,0.6)]">
                <Link to={loc.to}>Enter</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </OVWLayout>
  );
}