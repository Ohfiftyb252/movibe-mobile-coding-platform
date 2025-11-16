import React from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/themes/prism-tomorrow.css'; // Dark theme
import { useProjectStore } from '@/stores/project-store';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';
export function CodeEditor() {
  const activeFileId = useProjectStore((s) => s.activeFileId);
  const activeFile = useProjectStore((s) =>
    s.project && s.activeFileId ? s.project.files[s.activeFileId] : null
  );
  const updateFileContent = useProjectStore((s) => s.updateFileContent);
  const { isDark } = useTheme();
  const handleValueChange = (code: string) => {
    if (activeFileId) {
      updateFileContent(activeFileId, code);
    }
  };
  if (!activeFile) {
    return (
      <div className="flex items-center justify-center h-full bg-muted/20 text-muted-foreground">
        Select a file to start editing.
      </div>
    );
  }
  return (
    <div
      className={cn(
        'relative h-full w-full font-mono text-sm overflow-auto',
        isDark ? 'dark-theme-editor' : 'light-theme-editor'
      )}
    >
      <Editor
        value={activeFile.content}
        onValueChange={handleValueChange}
        highlight={(code) => highlight(code, languages[activeFile.language], activeFile.language)}
        padding={10}
        className={cn(
          'h-full w-full',
          isDark ? 'bg-[#2d2d2d] text-white' : 'bg-white text-black'
        )}
        style={{
          fontFamily: '"Fira Code", "Fira Mono", monospace',
          fontSize: 14,
        }}
      />
    </div>
  );
}