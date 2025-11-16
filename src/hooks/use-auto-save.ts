import { useProjectStore } from '@/stores/project-store';
import { useDebounce } from 'react-use';
export function useAutoSave() {
  const project = useProjectStore((s) => s.project);
  const updateProject = useProjectStore((s) => s.updateProject);
  useDebounce(
    () => {
      if (project) {
        updateProject();
      }
    },
    1000,
    [project]
  );
}