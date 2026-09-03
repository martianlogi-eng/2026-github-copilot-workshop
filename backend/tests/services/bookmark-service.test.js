import { describe, test, expect, jest } from '@jest/globals';
import {
  createBookmark,
  deleteBookmark,
  listBookmarksForUser,
} from '../../src/services/bookmark-service.js';

function mockDb(queryImpl) {
  return { query: jest.fn(queryImpl) };
}

describe('bookmark-service', () => {
  test('listBookmarksForUser aggregates bookmarks across PR, PO and GR', async () => {
    const db = mockDb((sql) => {
      if (sql.includes('purchase_requisitions')) {
        return {
          rows: [
            {
              id: 'bm-1',
              entity_type: 'PR',
              entity_id: 'pr-1',
              created_at: '2026-01-02T00:00:00.000Z',
              entity_number: 'PR-2026-0001',
              entity_label: 'Spare parts',
              entity_status: 'APPROVED',
            },
          ],
        };
      }
      if (sql.includes('purchase_orders')) {
        return {
          rows: [
            {
              id: 'bm-2',
              entity_type: 'PO',
              entity_id: 'po-1',
              created_at: '2026-01-03T00:00:00.000Z',
              entity_number: 'PO-2026-0001',
              entity_label: 'PT Supplier Jaya',
              entity_status: 'DRAFT',
            },
          ],
        };
      }
      return { rows: [] };
    });

    const result = await listBookmarksForUser(db, 'user-1');

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ id: 'bm-2', entityType: 'PO', detailRoute: '/purchase-orders/po-1' });
    expect(result[1]).toMatchObject({ id: 'bm-1', entityType: 'PR', detailRoute: '/requisitions/pr-1' });
  });

  test('createBookmark rejects an unsupported entity type', async () => {
    const db = mockDb(() => ({ rows: [], rowCount: 0 }));

    await expect(
      createBookmark(db, 'user-1', { entityType: 'XX', entityId: 'item-1' })
    ).rejects.toMatchObject({ statusCode: 422 });
    expect(db.query).not.toHaveBeenCalled();
  });

  test('createBookmark rejects a missing entityId', async () => {
    const db = mockDb(() => ({ rows: [], rowCount: 0 }));

    await expect(
      createBookmark(db, 'user-1', { entityType: 'PR' })
    ).rejects.toMatchObject({ statusCode: 422 });
  });

  test('createBookmark returns 404 when the referenced item does not exist', async () => {
    const db = mockDb(() => ({ rows: [], rowCount: 0 }));

    await expect(
      createBookmark(db, 'user-1', { entityType: 'PR', entityId: 'missing' })
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  test('createBookmark inserts a bookmark once the item is confirmed to exist', async () => {
    const db = mockDb((sql) => {
      if (sql.startsWith('SELECT id FROM')) {
        return { rows: [{ id: 'pr-1' }], rowCount: 1 };
      }
      if (sql.startsWith('INSERT')) {
        return { rows: [], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    });

    const result = await createBookmark(db, 'user-1', { entityType: 'PR', entityId: 'pr-1' });

    expect(result).toMatchObject({ entityType: 'PR', entityId: 'pr-1' });
  });

  test('createBookmark surfaces a 409 on duplicate bookmarks', async () => {
    const db = mockDb((sql) => {
      if (sql.startsWith('SELECT id FROM')) {
        return { rows: [{ id: 'pr-1' }], rowCount: 1 };
      }
      const err = new Error('duplicate key value violates unique constraint');
      err.code = '23505';
      throw err;
    });

    await expect(
      createBookmark(db, 'user-1', { entityType: 'PR', entityId: 'pr-1' })
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  test('deleteBookmark returns true when a row was removed', async () => {
    const db = mockDb(() => ({ rows: [], rowCount: 1 }));

    const result = await deleteBookmark(db, 'user-1', 'bm-1');

    expect(result).toBe(true);
  });

  test('deleteBookmark returns false when nothing matched', async () => {
    const db = mockDb(() => ({ rows: [], rowCount: 0 }));

    const result = await deleteBookmark(db, 'user-1', 'bm-1');

    expect(result).toBe(false);
  });
});
