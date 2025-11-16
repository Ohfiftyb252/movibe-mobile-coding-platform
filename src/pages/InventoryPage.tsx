import { Link } from 'react-router-dom';
import { OVWLayout } from '@/components/OVWLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, PartyPopper } from 'lucide-react';
import { usePlayerStore } from '@/stores/player-store';
const hatIcons: { [key: string]: React.ElementType } = {
  "Pity Party": PartyPopper,
};
export function InventoryPage() {
  const player = usePlayerStore((s) => s.player);
  const hats = player?.inventory.hats || [];
  return (
    <OVWLayout>
      <div className="text-center animate-fade-in">
        <h1 className="text-4xl md:text-6xl font-display font-bold uppercase glitch-text" data-text="Inventory">
          Inventory
        </h1>
        <p className="mt-4 text-lg text-ov-gray max-w-xl mx-auto">
          A collection of digital trinkets earned through questionable life choices.
        </p>
      </div>
      <Card className="mt-8 max-w-4xl mx-auto bg-black/50 border-ov-primary/20 animate-slide-up">
        <CardHeader>
          <CardTitle className="text-center text-ov-primary font-display uppercase tracking-widest">
            Your Hats
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hats.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {hats.map((hat) => {
                const Icon = hatIcons[hat] || PartyPopper;
                return (
                  <div key={hat} className="flex flex-col items-center gap-2 p-4 border border-ov-primary/30 rounded-lg bg-ov-dark/50">
                    <Icon className="w-16 h-16 text-ov-primary" />
                    <span className="text-center text-ov-foreground">{hat}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-ov-gray">
              Your head is bare. Go lose all your money to get a free hat.
            </p>
          )}
        </CardContent>
      </Card>
      <Button asChild variant="link" className="mt-8 text-ov-primary hover:text-white transition-colors">
        <Link to="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Return to the Dive Bar
        </Link>
      </Button>
    </OVWLayout>
  );
}