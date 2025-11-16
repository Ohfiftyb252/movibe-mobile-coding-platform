import { PanelLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SheetTrigger } from '@/components/ui/sheet';
import { useProjectStore } from '@/stores/project-store';
type HeaderProps = {
  isMobile: boolean;
};
function SavingIndicator() {
  const isSaving = useProjectStore((s) => s.isSaving);
  if (!isSaving) return null;
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground animate-fade-in">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>Saving...</span>
    </div>
  );
}
export function Header({ isMobile }: HeaderProps) {
  return (
    <header className="flex items-center justify-between h-14 px-4 border-b bg-background z-10">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600" />
        <h1 className="text-lg font-semibold text-foreground">Movibe</h1>
      </div>
      <div className="absolute left-1/2 -translate-x-1/2">
        <SavingIndicator />
      </div>
      {isMobile && (
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle File Tree</span>
          </Button>
        </SheetTrigger>
      )}
    </header>
  );
}