import {
  createBookmark,
  deleteBookmark,
  listBookmarksForUser,
} from '../services/bookmark-service.js';

export default async function bookmarkRoutes(fastify) {
  fastify.get(
    '/api/bookmarks',
    { preHandler: fastify.authenticate },
    async (request) => {
      const items = await listBookmarksForUser(fastify.db, request.user.id);
      return { items };
    }
  );

  fastify.post(
    '/api/bookmarks',
    { preHandler: fastify.authenticate },
    async (request, reply) => {
      try {
        const bookmark = await createBookmark(fastify.db, request.user.id, request.body);
        reply.code(201);
        return bookmark;
      } catch (error) {
        if (error.statusCode) {
          reply.code(error.statusCode);
          return { message: error.message };
        }

        throw error;
      }
    }
  );

  fastify.delete(
    '/api/bookmarks/:id',
    { preHandler: fastify.authenticate },
    async (request, reply) => {
      const removed = await deleteBookmark(fastify.db, request.user.id, request.params.id);
      if (!removed) {
        reply.code(404);
        return { message: 'Bookmark not found' };
      }

      reply.code(204);
      return null;
    }
  );
}
