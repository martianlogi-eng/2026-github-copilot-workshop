import { describe, test, expect, jest } from '@jest/globals';
import { listGoodsReceipts } from '../../src/services/goods-receipt-service.js';

function mockDb(queryImpl) {
  return { query: jest.fn(queryImpl) };
}

describe('goods-receipt-service', () => {
  test('listGoodsReceipts returns mapped header fields', async () => {
    const db = mockDb(() => ({
      rows: [
        {
          id: 'gr-1',
          gr_number: 'GR-2026-0001',
          status: 'POSTED',
          po_id: 'po-1',
          po_number: 'PO-2026-0001',
          receipt_date: '2026-05-01',
          created_at: '2026-05-01T10:00:00.000Z',
          updated_at: '2026-05-01T10:00:00.000Z',
        },
      ],
    }));

    const result = await listGoodsReceipts(db);

    expect(db.query).toHaveBeenCalledTimes(1);
    expect(result).toEqual([
      {
        id: 'gr-1',
        grNumber: 'GR-2026-0001',
        status: 'POSTED',
        poId: 'po-1',
        poNumber: 'PO-2026-0001',
        receiptDate: '2026-05-01',
        createdAt: '2026-05-01T10:00:00.000Z',
        updatedAt: '2026-05-01T10:00:00.000Z',
      },
    ]);
  });
});
