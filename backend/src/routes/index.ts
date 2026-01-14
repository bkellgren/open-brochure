import type { FastifyPluginAsync } from 'fastify';
import { authPlugin } from '../middleware/auth.js';

const routes: FastifyPluginAsync = async (fastify) => {
  // Register auth plugin
  await fastify.register(authPlugin);

  // Register route modules
  await fastify.register(import('./auth.js'), { prefix: '/auth' });
  await fastify.register(import('./brochures.js'), { prefix: '/brochures' });
  await fastify.register(import('./panels.js'), { prefix: '/brochures' });
  await fastify.register(import('./upload.js'), { prefix: '/upload' });
  await fastify.register(import('./share.js'));
  await fastify.register(import('./embed.js'));
  await fastify.register(import('./downloads.js'));
};

export default routes;
