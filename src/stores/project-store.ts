import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Project, ProjectFile } from '@shared/types';
import { api } from '@/lib/api-client';
export type ProjectState = {
  project: Project | null;
  activeFileId: string | null;
  isLoading: boolean;
  error: string | null;
};
export type ProjectActions = {
  setActiveFile: (fileId: string) => void;
  updateFileContent: (fileId: string, content: string) => void;
  loadProject: (projectId: string) => Promise<void>;
  updateProject: () => Promise<void>;
};
export const useProjectStore = create<ProjectState & ProjectActions>()(
  immer((set, get) => ({
    project: null,
    activeFileId: null,
    isLoading: true,
    error: null,
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
      try {
        await api(`/api/projects/${project.id}`, {
          method: 'PUT',
          body: JSON.stringify(project),
        });
      } catch (error) {
        console.error('Failed to save project:', error);
        // Optionally set an error state here
      }
    },
  }))
);