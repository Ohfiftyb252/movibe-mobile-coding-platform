import { Link } from 'react-router-dom';
import { OVWLayout } from '@/components/OVWLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
interface LocationPageProps {
  title: string;
}
export function LocationPage({ title }: LocationPageProps) {
  return (
    <OVWLayout>
      <div className="text-center animate-fade-in">
        <h1 className="text-4xl md:text-6xl font-display font-bold uppercase glitch-text" data-text={title}>
          {title}
        </h1>
        <p className="mt-6 text-2xl text-ov-primary animate-flicker">
          -- COMING SOON --
        </p>
        <p className="mt-4 text-lg text-ov-gray max-w-xl mx-auto">
          Construction is underway. Our contractors are busy installing the rigging for the games. Please check back later.
        </p>
        <Button asChild variant="link" className="mt-8 text-ov-primary hover:text-white transition-colors">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to the Dive Bar
          </Link>
        </Button>
      </div>
    </OVWLayout>
  );
}