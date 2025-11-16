import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from 'react-resizable-panels';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Header } from '@/components/movibe/Header';
import { FileTree } from '@/components/movibe/FileTree';
import { CodeEditor } from '@/components/movibe/Editor';
import { Preview } from '@/components/movibe/Preview';
import { Console } from '@/components/movibe/Console';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useProjectLoader } from '@/hooks/use-project-loader';
import { useAutoSave } from '@/hooks/use-auto-save';
import { useParams } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
function IDEContent() {
  const isMobile = useIsMobile();
  const [isFileTreeOpen, setFileTreeOpen] = useState(false);
  useAutoSave();
  if (isMobile) {
    return (
      <Sheet open={isFileTreeOpen} onOpenChange={setFileTreeOpen}>
        <div className="flex flex-col h-full">
          <Header isMobile={isMobile} />
          <main className="flex-1 overflow-hidden">
            <Tabs defaultValue="editor" className="h-full flex flex-col">
              <TabsContent value="editor" className="flex-1 overflow-hidden">
                <CodeEditor />
              </TabsContent>
              <TabsContent value="preview" className="flex-1 overflow-hidden">
                <Preview />
              </TabsContent>
              <TabsContent value="console" className="flex-1 overflow-hidden">
                <Console />
              </TabsContent>
              <TabsList className="grid w-full grid-cols-3 rounded-none">
                <TabsTrigger value="editor">Editor</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="console">Console</TabsTrigger>
              </TabsList>
            </Tabs>
          </main>
        </div>
        <SheetContent side="left" className="p-0">
          <FileTree onFileSelect={() => setFileTreeOpen(false)} />
        </SheetContent>
      </Sheet>
    );
  }
  return (
    <div className="flex flex-col h-full">
      <Header isMobile={isMobile} />
      <main className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal" className="h-full">
          <Panel defaultSize={20} minSize={15} className="min-w-[180px]">
            <FileTree />
          </Panel>
          <PanelResizeHandle className="w-1 bg-border hover:bg-primary transition-colors" />
          <Panel defaultSize={80}>
            <PanelGroup direction="horizontal">
              <Panel defaultSize={55} minSize={30}>
                <CodeEditor />
              </Panel>
              <PanelResizeHandle className="w-1 bg-border hover:bg-primary transition-colors" />
              <Panel defaultSize={45} minSize={30}>
                <PanelGroup direction="vertical">
                  <Panel defaultSize={60} minSize={20}>
                    <Preview />
                  </Panel>
                  <PanelResizeHandle className="h-1 bg-border hover:bg-primary transition-colors" />
                  <Panel defaultSize={40} minSize={20}>
                    <Console />
                  </Panel>
                </PanelGroup>
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </main>
    </div>
  );
}
export function IDEPage() {
  const { projectId } = useParams<{ projectId: string }>();
  // Ensure projectId is not undefined before passing to the hook
  const { isLoading, error } = useProjectLoader(projectId ?? 'default-project');
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background text-foreground">
        <div className="w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center animate-pulse">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
        <h1 className="text-2xl font-semibold">Loading Project...</h1>
        <p className="text-muted-foreground">Please wait while we set up your workspace.</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background text-destructive-foreground p-4">
        <h1 className="text-2xl font-semibold">Error</h1>
        <p>{error}</p>
      </div>
    );
  }
  return (
    <>
      <IDEContent />
      <Toaster richColors />
    </>
  );
}