export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
// Minimal real-world chat example types (shared by frontend and worker)
export interface User {
  id: string;
  name: string;
}
export interface Chat {
  id: string;
  title: string;
}
export interface ChatMessage {
  id: string;
  chatId: string;
  userId: string;
  text: string;
  ts: number; // epoch millis
}
// Movibe Project Types
export interface ProjectFile {
  id: string;
  name: string;
  content: string;
  language: 'html' | 'css' | 'javascript';
}
export interface Project {
  id: string;
  name: string;
  files: Record<string, ProjectFile>;
}