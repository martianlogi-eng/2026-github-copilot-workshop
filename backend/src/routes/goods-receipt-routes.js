import { listGoodsReceipts } from '../services/goods-receipt-service.js';

export default async function goodsReceiptRoutes(fastify) {
  fastify.get('/api/goods-receipts', async (request, reply) => {
    const items = await listGoodsReceipts(fastify.db);
    return { items };
  });
}
