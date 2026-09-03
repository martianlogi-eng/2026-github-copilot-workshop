import { v4 as uuidv4 } from 'uuid';

export const BOOKMARK_ITEM_TYPES = ['PR', 'PO', 'GR'];

function mapBookmark(row) {
  return {
    id: row.id,
    itemType: row.item_type,
    itemId: row.item_id,
    itemNumber: row.item_number,
    itemTitle: row.item_title,
    itemStatus: row.item_status,
    createdAt: row.created_at,
  };
}

function validationError(message) {
  const err = new Error(message);
  err.statusCode = 422;
  return err;
}

function validateBookmarkTarget(itemType, itemId) {
  if (!itemType || !BOOKMARK_ITEM_TYPES.includes(itemType)) {
    return `itemType must be one of ${BOOKMARK_ITEM_TYPES.join(', ')}`;
  }

  if (!itemId || typeof itemId !== 'string') {
    return 'itemId is required';
  }

  return null;
}

const ITEM_LOOKUP = {
  PR: {
    table: 'purchase_requisitions',
    numberColumn: 'pr_number',
    titleColumn: 'title',
  },
  PO: {
    table: 'purchase_orders',
    numberColumn: 'po_number',
    titleColumn: 'vendor_name',
  },
  GR: {
    table: 'goods_receipts',
    numberColumn: 'gr_number',
    titleColumn: 'notes',
  },
};

export async function listBookmarks(db, userId) {
  const selects = BOOKMARK_ITEM_TYPES.map((itemType) => {
    const lookup = ITEM_LOOKUP[itemType];
    return `SELECT b.id, b.item_type, b.item_id, b.created_at,
                   item.${lookup.numberColumn} AS item_number,
                   item.${lookup.titleColumn} AS item_title,
                   item.status AS item_status
            FROM bookmarks b
            JOIN ${lookup.table} item ON item.id = b.item_id
            WHERE b.user_id = $1 AND b.item_type = '${itemType}'`;
  });

  const { rows } = await db.query(
    `${selects.join(' UNION ALL ')} ORDER BY created_at DESC`,
    [userId]
  );

  return rows.map(mapBookmark);
}

export async function createBookmark(db, userId, payload) {
  const itemType = payload?.itemType;
  const itemId = payload?.itemId;

  const message = validateBookmarkTarget(itemType, itemId);
  if (message) {
    throw validationError(message);
  }

  const lookup = ITEM_LOOKUP[itemType];
  const itemResult = await db.query(
    `SELECT id FROM ${lookup.table} WHERE id = $1`,
    [itemId]
  );

  if (itemResult.rowCount === 0) {
    throw validationError('Bookmarked item not found');
  }

  const { rows } = await db.query(
    `INSERT INTO bookmarks (id, user_id, item_type, item_id)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, item_type, item_id) DO NOTHING
     RETURNING id, user_id, item_type, item_id, created_at`,
    [uuidv4(), userId, itemType, itemId]
  );

  if (rows.length === 0) {
    const existing = await db.query(
      `SELECT id, user_id, item_type, item_id, created_at
       FROM bookmarks
       WHERE user_id = $1 AND item_type = $2 AND item_id = $3`,
      [userId, itemType, itemId]
    );

    return { created: false, bookmark: mapBookmark(existing.rows[0]) };
  }

  return { created: true, bookmark: mapBookmark(rows[0]) };
}

export async function deleteBookmark(db, userId, itemType, itemId) {
  const message = validateBookmarkTarget(itemType, itemId);
  if (message) {
    throw validationError(message);
  }

  const { rowCount } = await db.query(
    `DELETE FROM bookmarks
     WHERE user_id = $1 AND item_type = $2 AND item_id = $3`,
    [userId, itemType, itemId]
  );

  return rowCount > 0;
}

/**
 * Adds a `bookmarked` flag to list items for the given user.
 * Without a user the flag is always false so list endpoints stay usable.
 */
export async function attachBookmarkFlags(db, userId, itemType, items) {
  if (!userId || items.length === 0) {
    return items.map((item) => ({ ...item, bookmarked: false }));
  }

  const { rows } = await db.query(
    `SELECT item_id FROM bookmarks
     WHERE user_id = $1 AND item_type = $2 AND item_id = ANY($3::uuid[])`,
    [userId, itemType, items.map((item) => item.id)]
  );

  const bookmarkedIds = new Set(rows.map((row) => row.item_id));

  return items.map((item) => ({ ...item, bookmarked: bookmarkedIds.has(item.id) }));
}
