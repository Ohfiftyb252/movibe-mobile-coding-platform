import {
  ResizablePanel as Panel,
  ResizablePanelGroup as PanelGroup,
  ResizableHandle as PanelResizeHandle,
} from '@/components/ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { Header } from '@/components/movibe/Header';
import { FileTree } from '@/components/movibe/FileTree';
import { CodeEditor } from '@/components/movibe/Editor';
import { Preview } from '@/components/movibe/Preview';
import { Console } from '@/components/movibe/Console';
import { useState } from 'react';
import { useProjectLoader } from '@/hooks/use-project-loader';
import { useAutoSave } from '@/hooks/use-auto-save';
export function HomePage() {
  const isMobile = useIsMobile();
  const [isSheetOpen, setSheetOpen] = useState(false);
  const { isLoading, error } = useProjectLoader('default-project');
  useAutoSave();
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 animate-spin" />
          <p className="text-muted-foreground">Loading Movibe...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-foreground">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-destructive-foreground bg-destructive p-4 rounded-md">
            Error Loading Project
          </h2>
          <p className="mt-4 text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }
  if (isMobile) {
    return (
      <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
        <div className="flex flex-col h-screen bg-background text-foreground">
          <Header isMobile={isMobile} />
          <main className="flex-1 overflow-hidden">
            <Tabs defaultValue="editor" className="h-full flex flex-col">
              <TabsContent value="editor" className="flex-1 overflow-auto">
                <CodeEditor />
              </TabsContent>
              <TabsContent value="preview" className="flex-1 overflow-auto bg-white">
                <Preview />
              </TabsContent>
              <TabsContent value="console" className="flex-1 overflow-auto">
                <Console />
              </TabsContent>
              <TabsList className="grid w-full grid-cols-3 rounded-none h-12">
                <TabsTrigger value="editor">Editor</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="console">Console</TabsTrigger>
              </TabsList>
            </Tabs>
          </main>
        </div>
        <SheetContent side="left" className="p-0 w-72">
          <FileTree onFileSelect={() => setSheetOpen(false)} />
        </SheetContent>
      </Sheet>
    );
  }
  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <Header isMobile={isMobile} />
      <main className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal" className="h-full">
          <Panel defaultSize={20} minSize={15} className="min-w-[200px]">
            <FileTree />
          </Panel>
          <PanelResizeHandle className="w-1 bg-border hover:bg-primary transition-colors" />
          <Panel defaultSize={40} minSize={30}>
            <CodeEditor />
          </Panel>
          <PanelResizeHandle className="w-1 bg-border hover:bg-primary transition-colors" />
          <Panel defaultSize={40} minSize={30}>
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
      </main>
    </div>
  );
}