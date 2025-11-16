import { useEffect } from 'react';
import { useProjectStore } from '@/stores/project-store';
export function useProjectLoader(projectId: string) {
  const loadProject = useProjectStore((s) => s.loadProject);
  const isLoading = useProjectStore((s) => s.isLoading);
  const error = useProjectStore((s) => s.error);
  const project = useProjectStore((s) => s.project);
  useEffect(() => {
    // Only load if there's no project loaded yet
    if (!project) {
      loadProject(projectId);
    }
  }, [projectId, loadProject, project]);
  return { isLoading, error };
}