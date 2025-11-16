import { useProjectStore } from '@/stores/project-store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FileCode2 } from 'lucide-react';
type FileTreeProps = {
  onFileSelect?: () => void;
};
export function FileTree({ onFileSelect }: FileTreeProps) {
  const files = useProjectStore((s) => (s.project ? Object.values(s.project.files) : []));
  const activeFileId = useProjectStore((s) => s.activeFileId);
  const setActiveFile = useProjectStore((s) => s.setActiveFile);
  return (
    <div className="p-2 space-y-1">
      <h2 className="text-sm font-semibold text-muted-foreground px-2 mb-2">Files</h2>
      {files.map((file) => (
        <Button
          key={file.id}
          variant="ghost"
          className={cn(
            'w-full justify-start text-sm',
            activeFileId === file.id && 'bg-accent text-accent-foreground'
          )}
          onClick={() => {
            setActiveFile(file.id);
            onFileSelect?.();
          }}
        >
          <FileCode2 className="h-4 w-4 mr-2" />
          {file.name}
        </Button>
      ))}
    </div>
  );
}