import { useProjectStore } from '@/stores/project-store';
import { useMemo } from 'react';
const consoleInterceptor = `
  <script>
    const originalConsole = { ...window.console };
    const formatArg = (arg) => {
      if (arg instanceof Error) {
        return arg.stack || arg.message;
      }
      if (typeof arg === 'object' && arg !== null) {
        try {
          return JSON.stringify(arg, null, 2);
        } catch (e) {
          return 'Unserializable Object';
        }
      }
      return String(arg);
    };
    const postMessageToParent = (level, args) => {
      const message = args.map(formatArg).join(' ');
      parent.postMessage({ source: 'movibe-console', level, message }, '*');
    };
    window.console.log = (...args) => {
      originalConsole.log(...args);
      postMessageToParent('log', args);
    };
    window.console.error = (...args) => {
      originalConsole.error(...args);
      postMessageToParent('error', args);
    };
    window.console.warn = (...args) => {
      originalConsole.warn(...args);
      postMessageToParent('warn', args);
    };
    window.console.info = (...args) => {
      originalConsole.info(...args);
      postMessageToParent('info', args);
    };
    window.addEventListener('error', (e) => {
      postMessageToParent('error', [e.message]);
    });
  </script>
`;
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
    // Inject Console Interceptor
    htmlContent = htmlContent.replace('</head>', `${consoleInterceptor}</head>`);
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