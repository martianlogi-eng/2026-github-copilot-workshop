import {
  createBookmark,
  deleteBookmark,
  listBookmarks,
} from '../services/bookmark-service.js';
import { MISSING_USER_RESPONSE, getUserId } from '../utils/current-user.js';

export default async function bookmarkRoutes(fastify) {
  fastify.get('/api/bookmarks', async (request, reply) => {
    const userId = getUserId(request);
    if (!userId) {
      reply.code(401);
      return MISSING_USER_RESPONSE;
    }

    const items = await listBookmarks(fastify.db, userId);
    return { items };
  });

  fastify.post('/api/bookmarks', async (request, reply) => {
    const userId = getUserId(request);
    if (!userId) {
      reply.code(401);
      return MISSING_USER_RESPONSE;
    }

    try {
      const result = await createBookmark(fastify.db, userId, request.body);
      reply.code(result.created ? 201 : 200);
      return result.bookmark;
    } catch (error) {
      if (error.statusCode) {
        reply.code(error.statusCode);
        return { message: error.message };
      }

      throw error;
    }
  });

  fastify.delete('/api/bookmarks/:itemType/:itemId', async (request, reply) => {
    const userId = getUserId(request);
    if (!userId) {
      reply.code(401);
      return MISSING_USER_RESPONSE;
    }

    try {
      const removed = await deleteBookmark(
        fastify.db,
        userId,
        request.params.itemType,
        request.params.itemId
      );

      if (!removed) {
        reply.code(404);
        return { message: 'Bookmark not found' };
      }

      return { removed: true };
    } catch (error) {
      if (error.statusCode) {
        reply.code(error.statusCode);
        return { message: error.message };
      }

      throw error;
    }
  });
}
