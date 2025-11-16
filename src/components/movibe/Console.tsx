import { useState, useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Trash2, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';
type LogLevel = 'log' | 'error' | 'warn' | 'info';
interface LogMessage {
  level: LogLevel;
  message: string;
  timestamp: string;
}
export function Console() {
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.source === 'movibe-console') {
        const { level, message } = event.data;
        setLogs((prevLogs) => [
          ...prevLogs,
          {
            level,
            message,
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [logs]);
  const getLogColor = (level: LogLevel) => {
    switch (level) {
      case 'error':
        return 'text-red-500';
      case 'warn':
        return 'text-yellow-500';
      case 'info':
        return 'text-blue-500';
      default:
        return 'text-foreground';
    }
  };
  return (
    <div className="flex flex-col h-full bg-[#2d2d2d] text-white font-mono text-sm">
      <header className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold">Console</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setLogs([])} className="h-7 w-7 hover:bg-gray-700">
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Clear console</span>
        </Button>
      </header>
      <ScrollArea className="flex-1 p-2" ref={scrollAreaRef}>
        <div className="space-y-1">
          {logs.map((log, index) => (
            <div key={index} className={cn('flex gap-2 items-start', getLogColor(log.level))}>
              <span className="text-gray-500 select-none">{log.timestamp}</span>
              <span className="flex-1 whitespace-pre-wrap break-words">{log.message}</span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}