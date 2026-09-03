import { jest, describe, test, expect } from '@jest/globals';
import {
  attachBookmarkFlags,
  createBookmark,
  deleteBookmark,
  listBookmarks,
} from '../../src/services/bookmark-service.js';

function mockDb(queryFn) {
  return { query: jest.fn(queryFn) };
}

describe('listBookmarks', () => {
  test('returns mapped bookmarks for the current user', async () => {
    const db = mockDb(() => ({
      rows: [
        {
          id: 'bookmark-1',
          item_type: 'PR',
          item_id: 'pr-1',
          item_number: 'PR-2026-0001',
          item_title: 'Monthly MRO replenishment',
          item_status: 'APPROVED',
          created_at: '2026-01-01T00:00:00.000Z',
        },
      ],
      rowCount: 1,
    }));

    const items = await listBookmarks(db, 'workshop-user');

    expect(db.query).toHaveBeenCalledWith(expect.stringContaining('UNION ALL'), ['workshop-user']);
    expect(items).toEqual([
      {
        id: 'bookmark-1',
        itemType: 'PR',
        itemId: 'pr-1',
        itemNumber: 'PR-2026-0001',
        itemTitle: 'Monthly MRO replenishment',
        itemStatus: 'APPROVED',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ]);
  });
});

describe('createBookmark', () => {
  test('rejects an unsupported item type', async () => {
    const db = mockDb(() => ({ rows: [], rowCount: 0 }));

    await expect(
      createBookmark(db, 'workshop-user', { itemType: 'XX', itemId: 'pr-1' })
    ).rejects.toMatchObject({ statusCode: 422 });
  });

  test('rejects a missing item id', async () => {
    const db = mockDb(() => ({ rows: [], rowCount: 0 }));

    await expect(
      createBookmark(db, 'workshop-user', { itemType: 'PR' })
    ).rejects.toMatchObject({ statusCode: 422 });
  });

  test('rejects a bookmark for an item that does not exist', async () => {
    const db = mockDb(() => ({ rows: [], rowCount: 0 }));

    await expect(
      createBookmark(db, 'workshop-user', { itemType: 'PO', itemId: 'po-404' })
    ).rejects.toMatchObject({ statusCode: 422, message: 'Bookmarked item not found' });
  });

  test('creates a bookmark when the item exists', async () => {
    const db = mockDb((sql) => {
      if (sql.startsWith('SELECT id FROM')) {
        return { rows: [{ id: 'pr-1' }], rowCount: 1 };
      }

      return {
        rows: [
          {
            id: 'bookmark-1',
            item_type: 'PR',
            item_id: 'pr-1',
            created_at: '2026-01-01T00:00:00.000Z',
          },
        ],
        rowCount: 1,
      };
    });

    const result = await createBookmark(db, 'workshop-user', { itemType: 'PR', itemId: 'pr-1' });

    expect(result.created).toBe(true);
    expect(result.bookmark.itemType).toBe('PR');
    expect(result.bookmark.itemId).toBe('pr-1');
  });

  test('does not duplicate an existing bookmark', async () => {
    const db = mockDb((sql) => {
      if (sql.startsWith('SELECT id FROM')) {
        return { rows: [{ id: 'pr-1' }], rowCount: 1 };
      }

      if (sql.startsWith('INSERT')) {
        return { rows: [], rowCount: 0 };
      }

      return {
        rows: [
          {
            id: 'bookmark-1',
            item_type: 'PR',
            item_id: 'pr-1',
            created_at: '2026-01-01T00:00:00.000Z',
          },
        ],
        rowCount: 1,
      };
    });

    const result = await createBookmark(db, 'workshop-user', { itemType: 'PR', itemId: 'pr-1' });

    expect(result.created).toBe(false);
    expect(result.bookmark.id).toBe('bookmark-1');
  });
});

describe('deleteBookmark', () => {
  test('returns true when a bookmark is removed', async () => {
    const db = mockDb(() => ({ rows: [], rowCount: 1 }));

    await expect(deleteBookmark(db, 'workshop-user', 'GR', 'gr-1')).resolves.toBe(true);
  });

  test('returns false when nothing is removed', async () => {
    const db = mockDb(() => ({ rows: [], rowCount: 0 }));

    await expect(deleteBookmark(db, 'workshop-user', 'GR', 'gr-1')).resolves.toBe(false);
  });

  test('rejects an unsupported item type', async () => {
    const db = mockDb(() => ({ rows: [], rowCount: 0 }));

    await expect(deleteBookmark(db, 'workshop-user', 'XX', 'gr-1')).rejects.toMatchObject({
      statusCode: 422,
    });
  });
});

describe('attachBookmarkFlags', () => {
  test('marks only the bookmarked items', async () => {
    const db = mockDb(() => ({ rows: [{ item_id: 'pr-2' }], rowCount: 1 }));

    const items = await attachBookmarkFlags(db, 'workshop-user', 'PR', [
      { id: 'pr-1' },
      { id: 'pr-2' },
    ]);

    expect(items).toEqual([
      { id: 'pr-1', bookmarked: false },
      { id: 'pr-2', bookmarked: true },
    ]);
  });

  test('returns unmarked items without a user', async () => {
    const db = mockDb(() => ({ rows: [], rowCount: 0 }));

    const items = await attachBookmarkFlags(db, null, 'PR', [{ id: 'pr-1' }]);

    expect(db.query).not.toHaveBeenCalled();
    expect(items).toEqual([{ id: 'pr-1', bookmarked: false }]);
  });
});
