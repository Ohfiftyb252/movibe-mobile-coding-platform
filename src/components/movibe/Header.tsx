import { useState, useEffect, useRef } from 'react';
import { PanelLeft, Loader2, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SheetTrigger } from '@/components/ui/sheet';
import { useProjectStore } from '@/stores/project-store';
import { toast } from 'sonner';
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
function EditableProjectName() {
  const projectName = useProjectStore((s) => s.project?.name ?? 'Untitled Project');
  const renameProject = useProjectStore((s) => s.renameProject);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(projectName);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    setName(projectName);
  }, [projectName]);
  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);
  const handleSave = () => {
    if (name.trim() && name.trim() !== projectName) {
      renameProject(name.trim());
    } else {
      setName(projectName);
    }
    setIsEditing(false);
  };
  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave();
          if (e.key === 'Escape') {
            setName(projectName);
            setIsEditing(false);
          }
        }}
        className="h-8 text-lg font-semibold"
      />
    );
  }
  return (
    <h1
      className="text-lg font-semibold text-foreground cursor-pointer hover:bg-accent p-1 rounded-md"
      onClick={() => setIsEditing(true)}
    >
      {projectName}
    </h1>
  );
}
export function Header({ isMobile }: HeaderProps) {
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Project link copied to clipboard!');
  };
  return (
    <header className="flex items-center justify-between h-14 px-4 border-b bg-background z-10">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600" />
        <EditableProjectName />
      </div>
      <div className="absolute left-1/2 -translate-x-1/2">
        <SavingIndicator />
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={handleShare}>
          <Share2 className="h-5 w-5" />
          <span className="sr-only">Share Project</span>
        </Button>
        {isMobile && (
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <PanelLeft className="h-5 w-5" />
              <span className="sr-only">Toggle File Tree</span>
            </Button>
          </SheetTrigger>
        )}
      </div>
    </header>
  );
}