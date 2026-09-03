import Fastify from 'fastify';
import cors from '@fastify/cors';
import dbPlugin from './plugins/db.js';
import authPlugin from './plugins/auth.js';
import requisitionRoutes from './routes/requisition-routes.js';
import purchaseOrderRoutes from './routes/purchase-order-routes.js';
import goodsReceiptRoutes from './routes/goods-receipt-routes.js';
import authRoutes from './routes/auth-routes.js';
import bookmarkRoutes from './routes/bookmark-routes.js';

export function buildApp() {
  const app = Fastify({ logger: true });

  app.register(cors, {
    origin: true,
  });

  app.register(dbPlugin);
  app.register(authPlugin);
  app.register(requisitionRoutes);
  app.register(purchaseOrderRoutes);
  app.register(goodsReceiptRoutes);
  app.register(authRoutes);
  app.register(bookmarkRoutes);

  app.get('/health', async () => ({ status: 'ok' }));

  app.setErrorHandler((error, request, reply) => {
    request.log.error(error);
    if (reply.sent) {
      return;
    }

    reply.code(500).send({ message: 'Internal server error' });
  });

  return app;
}
