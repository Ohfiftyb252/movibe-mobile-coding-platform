import { useBuildPreview } from '@/hooks/use-build-preview';
import { useDebounce } from 'react-use';
import { useState, useEffect } from 'react';
export function Preview() {
  const srcDoc = useBuildPreview();
  const [debouncedSrcDoc, setDebouncedSrcDoc] = useState(srcDoc);
  useDebounce(
    () => {
      setDebouncedSrcDoc(srcDoc);
    },
    500,
    [srcDoc]
  );
  return (
    <div className="h-full w-full bg-white">
      <iframe
        srcDoc={debouncedSrcDoc}
        title="Preview"
        sandbox="allow-scripts allow-same-origin"
        frameBorder="0"
        width="100%"
        height="100%"
      />
    </div>
  );
}