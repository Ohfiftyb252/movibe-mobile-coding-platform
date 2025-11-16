/**
 * Minimal real-world demo: One Durable Object instance per entity (User, ChatBoard), with Indexes for listing.
 */
import { IndexedEntity } from "./core-utils";
import type { User, Chat, ChatMessage, Project, ProjectFile } from "@shared/types";
import { MOCK_CHAT_MESSAGES, MOCK_CHATS, MOCK_USERS } from "@shared/mock-data";
// USER ENTITY: one DO instance per user
export class UserEntity extends IndexedEntity<User> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: User = { id: "", name: "" };
  static seedData = MOCK_USERS;
}
// CHAT BOARD ENTITY: one DO instance per chat board, stores its own messages
export type ChatBoardState = Chat & { messages: ChatMessage[] };
const SEED_CHAT_BOARDS: ChatBoardState[] = MOCK_CHATS.map(c => ({
  ...c,
  messages: MOCK_CHAT_MESSAGES.filter(m => m.chatId === c.id),
}));
export class ChatBoardEntity extends IndexedEntity<ChatBoardState> {
  static readonly entityName = "chat";
  static readonly indexName = "chats";
  static readonly initialState: ChatBoardState = { id: "", title: "", messages: [] };
  static seedData = SEED_CHAT_BOARDS;
  async listMessages(): Promise<ChatMessage[]> {
    const { messages } = await this.getState();
    return messages;
  }
  async sendMessage(userId: string, text: string): Promise<ChatMessage> {
    const msg: ChatMessage = { id: crypto.randomUUID(), chatId: this.id, userId, text, ts: Date.now() };
    await this.mutate(s => ({ ...s, messages: [...s.messages, msg] }));
    return msg;
  }
}
// MOVIBE PROJECT ENTITY
const DEFAULT_PROJECT_FILES: Record<string, ProjectFile> = {
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
const SEED_PROJECTS: Project[] = [
  {
    id: 'default-project',
    name: 'Default Project',
    files: DEFAULT_PROJECT_FILES,
  },
];
export class ProjectEntity extends IndexedEntity<Project> {
  static readonly entityName = "project";
  static readonly indexName = "projects";
  static readonly initialState: Project = { id: "", name: "New Project", files: {} };
  static seedData = SEED_PROJECTS;
}