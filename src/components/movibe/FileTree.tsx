import { useState } from 'react';
import { useProjectStore } from '@/stores/project-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { FileCode2, Plus, Trash2 } from 'lucide-react';
type FileTreeProps = {
  onFileSelect?: () => void;
};
export function FileTree({ onFileSelect }: FileTreeProps) {
  const files = useProjectStore((s) => (s.project ? Object.values(s.project.files) : []));
  const activeFileId = useProjectStore((s) => s.activeFileId);
  const setActiveFile = useProjectStore((s) => s.setActiveFile);
  const createFile = useProjectStore((s) => s.createFile);
  const deleteFile = useProjectStore((s) => s.deleteFile);
  const [newFileName, setNewFileName] = useState('');
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const handleCreateFile = () => {
    if (newFileName.trim()) {
      createFile(newFileName.trim());
      setNewFileName('');
      setCreateDialogOpen(false);
    }
  };
  return (
    <div className="p-2 space-y-1 h-full flex flex-col">
      <div className="flex items-center justify-between px-2 mb-2">
        <h2 className="text-sm font-semibold text-muted-foreground">Files</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New File</DialogTitle>
              <DialogDescription>Enter a name for your new file, including the extension (e.g., `app.js`).</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                id="name"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="e.g., index.html"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateFile()}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">Cancel</Button>
              </DialogClose>
              <Button type="submit" onClick={handleCreateFile}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex-1 overflow-y-auto">
        {files.map((file) => (
          <div key={file.id} className="group flex items-center">
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start text-sm flex-1',
                activeFileId === file.id && 'bg-accent text-accent-foreground'
              )}
              onClick={() => {
                setActiveFile(file.id);
                onFileSelect?.();
              }}
            >
              <FileCode2 className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">{file.name}</span>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the file "{file.name}".
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteFile(file.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))}
      </div>
    </div>
  );
}