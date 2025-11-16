import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from '@/components/ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { Header } from '@/components/movibe/Header';
import { FileTree } from '@/components/movibe/FileTree';
import { CodeEditor } from '@/components/movibe/Editor';
import { Preview } from '@/components/movibe/Preview';
import { useState } from 'react';
export function HomePage() {
  const isMobile = useIsMobile();
  const [isSheetOpen, setSheetOpen] = useState(false);
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
              <TabsList className="grid w-full grid-cols-2 rounded-none">
                <TabsTrigger value="editor">Editor</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
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
          <Panel defaultSize={80}>
            <PanelGroup direction="horizontal">
              <Panel defaultSize={50} minSize={30}>
                <CodeEditor />
              </Panel>
              <PanelResizeHandle className="w-1 bg-border hover:bg-primary transition-colors" />
              <Panel defaultSize={50} minSize={30}>
                <Preview />
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </main>
    </div>
  );
}