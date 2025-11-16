import { useProjectStore } from '@/stores/project-store';
import { useMemo } from 'react';
export function useBuildPreview() {
  const files = useProjectStore((s) => s.project?.files ?? {});
  const srcDoc = useMemo(() => {
    const htmlFile = Object.values(files).find((f) => f.language === 'html');
    const cssFiles = Object.values(files).filter((f) => f.language === 'css');
    const jsFiles = Object.values(files).filter((f) => f.language === 'javascript');
    if (!htmlFile) {
      return '<html><body><h1>No index.html file found.</h1></body></html>';
    }
    let htmlContent = htmlFile.content;
    // Inject CSS
    const cssContent = cssFiles.map((f) => `<style>${f.content}</style>`).join('\n');
    htmlContent = htmlContent.replace('</head>', `${cssContent}</head>`);
    // Inject JS
    const jsContent = jsFiles.map((f) => `<script>${f.content}</script>`).join('\n');
    htmlContent = htmlContent.replace('</body>', `${jsContent}</body>`);
    return htmlContent;
  }, [files]);
  return srcDoc;
}