import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Project, ProjectFile } from '@shared/types';
import { api } from '@/lib/api-client';
export type ProjectState = {
  project: Project | null;
  activeFileId: string | null;
  isLoading: boolean;
  error: string | null;
  isSaving: boolean;
};
export type ProjectActions = {
  setActiveFile: (fileId: string) => void;
  updateFileContent: (fileId: string, content: string) => void;
  loadProject: (projectId: string) => Promise<void>;
  updateProject: () => Promise<void>;
  createFile: (fileName: string) => void;
  deleteFile: (fileId: string) => void;
  renameProject: (newName: string) => void;
};
export const useProjectStore = create<ProjectState & ProjectActions>()(
  immer((set, get) => ({
    project: null,
    activeFileId: null,
    isLoading: true,
    error: null,
    isSaving: false,
    loadProject: async (projectId) => {
      set({ isLoading: true, error: null });
      try {
        const project = await api<Project>(`/api/projects/${projectId}`);
        const firstFileId = Object.keys(project.files)[0] || null;
        set({
          project,
          activeFileId: firstFileId,
          isLoading: false,
        });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Failed to load project',
          isLoading: false,
        });
      }
    },
    setActiveFile: (fileId) => {
      set((state) => {
        if (state.project?.files[fileId]) {
          state.activeFileId = fileId;
        }
      });
    },
    updateFileContent: (fileId, content) => {
      set((state) => {
        if (state.project?.files[fileId]) {
          state.project.files[fileId].content = content;
        }
      });
    },
    updateProject: async () => {
      const { project } = get();
      if (!project) return;
      set({ isSaving: true });
      try {
        await api(`/api/projects/${project.id}`, {
          method: 'PUT',
          body: JSON.stringify(project),
        });
      } catch (error) {
        console.error('Failed to save project:', error);
      } finally {
        set({ isSaving: false });
      }
    },
    createFile: (fileName) => {
      set((state) => {
        if (!state.project) return;
        if (state.project.files[fileName]) {
          // Simple alert for now, could be a more robust notification
          alert(`File "${fileName}" already exists.`);
          return;
        }
        const extension = fileName.split('.').pop()?.toLowerCase();
        let language: ProjectFile['language'] = 'javascript';
        if (extension === 'html') language = 'html';
        if (extension === 'css') language = 'css';
        const newFile: ProjectFile = {
          id: fileName,
          name: fileName,
          content: '',
          language,
        };
        state.project.files[fileName] = newFile;
        state.activeFileId = fileName;
      });
    },
    deleteFile: (fileId) => {
      set((state) => {
        if (!state.project || !state.project.files[fileId]) return;
        delete state.project.files[fileId];
        if (state.activeFileId === fileId) {
          const remainingFiles = Object.keys(state.project.files);
          state.activeFileId = remainingFiles.length > 0 ? remainingFiles[0] : null;
        }
      });
    },
    renameProject: (newName) => {
      set((state) => {
        if (state.project) {
          state.project.name = newName;
        }
      });
    },
  }))
);