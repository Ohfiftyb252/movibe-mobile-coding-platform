import { Hono } from "hono";
import type { Env } from './core-utils';
import { UserEntity, ChatBoardEntity, ProjectEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import type { Project, ProjectFile } from "@shared/types";
const DEFAULT_PROJECT_FILES: Record<string, ProjectFile> = {
  'index.html': {
    id: 'index.html',
    name: 'index.html',
    language: 'html',
    content: `<!DOCTYPE html>
<html>
  <head>
    <title>Movibe Project</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <h1>Welcome to your new project!</h1>
    <p>This is your mobile coding environment.</p>
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
  padding: 2rem;
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
// Your JavaScript code here
`,
  },
};
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  app.get('/api/test', (c) => c.json({ success: true, data: { name: 'CF Workers Demo' }}));
  // MOVIBE PROJECTS
  app.get('/api/projects', async (c) => {
    await ProjectEntity.ensureSeed(c.env);
    const page = await ProjectEntity.list(c.env);
    return ok(c, page);
  });
  app.get('/api/projects/:id', async (c) => {
    await ProjectEntity.ensureSeed(c.env);
    const { id } = c.req.param();
    const project = new ProjectEntity(c.env, id);
    if (!(await project.exists())) {
      return notFound(c, 'Project not found');
    }
    return ok(c, await project.getState());
  });
  app.post('/api/projects', async (c) => {
    const { name } = (await c.req.json()) as Partial<Project>;
    if (!isStr(name)) return bad(c, 'Project name is required');
    const newProject: Project = {
      id: crypto.randomUUID(),
      name,
      files: DEFAULT_PROJECT_FILES,
    };
    await ProjectEntity.create(c.env, newProject);
    return ok(c, newProject);
  });
  app.put('/api/projects/:id', async (c) => {
    const { id } = c.req.param();
    const projectData = (await c.req.json()) as Partial<Project>;
    const project = new ProjectEntity(c.env, id);
    if (!(await project.exists())) {
      return notFound(c, 'Project not found');
    }
    await project.patch(projectData);
    return ok(c, await project.getState());
  });
  app.delete('/api/projects/:id', async (c) => {
    const { id } = c.req.param();
    const deleted = await ProjectEntity.delete(c.env, id);
    if (!deleted) {
      return notFound(c, 'Project not found');
    }
    return ok(c, { id, deleted: true });
  });
  // USERS
  app.get('/api/users', async (c) => {
    await UserEntity.ensureSeed(c.env);
    const cq = c.req.query('cursor');
    const lq = c.req.query('limit');
    const page = await UserEntity.list(c.env, cq ?? null, lq ? Math.max(1, (Number(lq) | 0)) : undefined);
    return ok(c, page);
  });
  app.post('/api/users', async (c) => {
    const { name } = (await c.req.json()) as { name?: string };
    if (!name?.trim()) return bad(c, 'name required');
    return ok(c, await UserEntity.create(c.env, { id: crypto.randomUUID(), name: name.trim() }));
  });
  // CHATS
  app.get('/api/chats', async (c) => {
    await ChatBoardEntity.ensureSeed(c.env);
    const cq = c.req.query('cursor');
    const lq = c.req.query('limit');
    const page = await ChatBoardEntity.list(c.env, cq ?? null, lq ? Math.max(1, (Number(lq) | 0)) : undefined);
    return ok(c, page);
  });
  app.post('/api/chats', async (c) => {
    const { title } = (await c.req.json()) as { title?: string };
    if (!title?.trim()) return bad(c, 'title required');
    const created = await ChatBoardEntity.create(c.env, { id: crypto.randomUUID(), title: title.trim(), messages: [] });
    return ok(c, { id: created.id, title: created.title });
  });
  // MESSAGES
  app.get('/api/chats/:chatId/messages', async (c) => {
    const chat = new ChatBoardEntity(c.env, c.req.param('chatId'));
    if (!await chat.exists()) return notFound(c, 'chat not found');
    return ok(c, await chat.listMessages());
  });
  app.post('/api/chats/:chatId/messages', async (c) => {
    const chatId = c.req.param('chatId');
    const { userId, text } = (await c.req.json()) as { userId?: string; text?: string };
    if (!isStr(userId) || !text?.trim()) return bad(c, 'userId and text required');
    const chat = new ChatBoardEntity(c.env, chatId);
    if (!await chat.exists()) return notFound(c, 'chat not found');
    return ok(c, await chat.sendMessage(userId, text.trim()));
  });
  // DELETE: Users
  app.delete('/api/users/:id', async (c) => ok(c, { id: c.req.param('id'), deleted: await UserEntity.delete(c.env, c.req.param('id')) }));
  app.post('/api/users/deleteMany', async (c) => {
    const { ids } = (await c.req.json()) as { ids?: string[] };
    const list = ids?.filter(isStr) ?? [];
    if (list.length === 0) return bad(c, 'ids required');
    return ok(c, { deletedCount: await UserEntity.deleteMany(c.env, list), ids: list });
  });
  // DELETE: Chats
  app.delete('/api/chats/:id', async (c) => ok(c, { id: c.req.param('id'), deleted: await ChatBoardEntity.delete(c.env, c.req.param('id')) }));
  app.post('/api/chats/deleteMany', async (c) => {
    const { ids } = (await c.req.json()) as { ids?: string[] };
    const list = ids?.filter(isStr) ?? [];
    if (list.length === 0) return bad(c, 'ids required');
    return ok(c, { deletedCount: await ChatBoardEntity.deleteMany(c.env, list), ids: list });
  });
}