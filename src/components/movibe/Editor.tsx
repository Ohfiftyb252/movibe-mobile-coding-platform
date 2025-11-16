import React from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/themes/prism-tomorrow.css';
import { useProjectStore } from '@/stores/project-store';
export function CodeEditor() {
  const activeFileId = useProjectStore((s) => s.activeFileId);
  const activeFile = useProjectStore((s) => (s.activeFileId ? s.files[s.activeFileId] : null));
  const updateFileContent = useProjectStore((s) => s.updateFileContent);
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
  const highlightWithLineNumbers = (code: string, language: any) =>
    highlight(code, language, language.name)
      .split('\n')
      .map((line, i) => `<span class='editorLineNumber'>${i + 1}</span>${line}`)
      .join('\n');
  return (
    <div className="relative h-full w-full font-mono text-sm overflow-auto">
      <Editor
        value={activeFile.content}
        onValueChange={handleValueChange}
        highlight={(code) => highlight(code, languages[activeFile.language], activeFile.language)}
        padding={10}
        className="h-full w-full bg-[#2d2d2d] text-white"
        style={{
          fontFamily: '"Fira Code", "Fira Mono", monospace',
          fontSize: 14,
        }}
      />
    </div>
  );
}