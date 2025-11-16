import { Hono } from "hono";
import type { Env } from './core-utils';
import { PlayerEntity } from "./entities";
import { ok, bad, notFound } from './core-utils';
import type { Player } from "@shared/types";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // Ensure player one exists on startup
  app.use('/api/*', async (c, next) => {
    await PlayerEntity.ensureSeed(c.env);
    await next();
  });
  // Get Player Data
  app.get('/api/player/:id', async (c) => {
    const { id } = c.req.param();
    const player = new PlayerEntity(c.env, id);
    if (!(await player.exists())) {
      return notFound(c, 'Player not found');
    }
    return ok(c, await player.getState());
  });
  // Update Player Data
  app.post('/api/player/:id', async (c) => {
    const { id } = c.req.param();
    const updates = (await c.req.json()) as Partial<Player>;
    const player = new PlayerEntity(c.env, id);
    if (!(await player.exists())) {
      return notFound(c, 'Player not found');
    }
    await player.patch(updates);
    return ok(c, await player.getState());
  });
}