import fp from 'fastify-plugin';
import { getUserByToken } from '../services/auth-service.js';

// Decorates the app with an `authenticate` preHandler that routes can opt
// into via `{ preHandler: fastify.authenticate }`. On success it attaches
// the resolved user to `request.user`.
async function authPlugin(fastify) {
  fastify.decorate('authenticate', async (request, reply) => {
    const header = request.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      reply.code(401).send({ message: 'Authentication required' });
      return reply;
    }

    const user = await getUserByToken(fastify.db, token);
    if (!user) {
      reply.code(401).send({ message: 'Invalid or expired token' });
      return reply;
    }

    request.user = user;
  });
}

export default fp(authPlugin);
