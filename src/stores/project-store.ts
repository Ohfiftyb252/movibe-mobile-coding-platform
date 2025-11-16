import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
export type VFSFile = {
  id: string;
  name: string;
  content: string;
  language: 'html' | 'css' | 'javascript';
};
export type ProjectState = {
  files: Record<string, VFSFile>;
  activeFileId: string | null;
};
export type ProjectActions = {
  setActiveFile: (fileId: string) => void;
  updateFileContent: (fileId: string, content: string) => void;
};
const initialFiles: Record<string, VFSFile> = {
  'index.html': {
    id: 'index.html',
    name: 'index.html',
    language: 'html',
    content: `<!DOCTYPE html>
<html>
  <head>
    <title>Movibe</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <h1>Welcome to Movibe!</h1>
    <p>Your mobile coding environment.</p>
    <script src="script.js"></script>
  </body>
</html>`,
  },
  'style.css': {
    id: 'style.css',
    name: 'style.css',
    language: 'css',
    content: `body {
  font-family: sans-serif;
  background-color: #f0f0f0;
  color: #333;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  margin: 0;
}
h1 {
  color: #4f46e5;
}`,
  },
  'script.js': {
    id: 'script.js',
    name: 'script.js',
    language: 'javascript',
    content: `console.log('Hello from Movibe!');
const heading = document.querySelector('h1');
heading.addEventListener('click', () => {
  alert('You clicked the heading!');
});`,
  },
};
export const useProjectStore = create<ProjectState & ProjectActions>()(
  immer((set) => ({
    files: initialFiles,
    activeFileId: 'index.html',
    setActiveFile: (fileId) => {
      set((state) => {
        if (state.files[fileId]) {
          state.activeFileId = fileId;
        }
      });
    },
    updateFileContent: (fileId, content) => {
      set((state) => {
        if (state.files[fileId]) {
          state.files[fileId].content = content;
        }
      });
    },
  }))
);