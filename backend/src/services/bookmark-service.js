import { v4 as uuidv4 } from 'uuid';

// ── Config ───────────────────────────────────────────────

const ENTITY_CONFIG = {
  PR: {
    table: 'purchase_requisitions',
    numberColumn: 'pr_number',
    labelColumn: 'title',
    detailRoute: (id) => `/requisitions/${id}`,
  },
  PO: {
    table: 'purchase_orders',
    numberColumn: 'po_number',
    labelColumn: 'vendor_name',
    detailRoute: (id) => `/purchase-orders/${id}`,
  },
  GR: {
    table: 'goods_receipts',
    numberColumn: 'gr_number',
    labelColumn: null,
    detailRoute: () => null,
  },
};

export const SUPPORTED_ENTITY_TYPES = Object.keys(ENTITY_CONFIG);

// ── Mappers ──────────────────────────────────────────────

function mapBookmark(row) {
  const config = ENTITY_CONFIG[row.entity_type];
  return {
    id: row.id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    createdAt: row.created_at,
    entityNumber: row.entity_number,
    entityLabel: row.entity_label,
    entityStatus: row.entity_status,
    detailRoute: row.entity_number ? config.detailRoute(row.entity_id) : null,
  };
}

// ── Validation ───────────────────────────────────────────

function validateEntityType(entityType) {
  if (!SUPPORTED_ENTITY_TYPES.includes(entityType)) {
    const err = new Error(`entityType must be one of ${SUPPORTED_ENTITY_TYPES.join(', ')}`);
    err.statusCode = 422;
    throw err;
  }
}

async function assertEntityExists(db, entityType, entityId) {
  const config = ENTITY_CONFIG[entityType];
  const { rowCount } = await db.query(
    `SELECT id FROM ${config.table} WHERE id = $1`,
    [entityId]
  );

  if (rowCount === 0) {
    const err = new Error(`${entityType} item not found`);
    err.statusCode = 404;
    throw err;
  }
}

// ── Queries ──────────────────────────────────────────────

export async function listBookmarksForUser(db, userId) {
  const results = [];

  for (const entityType of SUPPORTED_ENTITY_TYPES) {
    const config = ENTITY_CONFIG[entityType];
    const labelExpr = config.labelColumn ? `entity.${config.labelColumn}` : 'NULL';
    const { rows } = await db.query(
      `SELECT b.id, b.entity_type, b.entity_id, b.created_at,
              entity.${config.numberColumn} AS entity_number,
              ${labelExpr} AS entity_label,
              entity.status AS entity_status
       FROM bookmarks b
       JOIN ${config.table} entity ON entity.id = b.entity_id
       WHERE b.user_id = $1 AND b.entity_type = $2
       ORDER BY b.created_at DESC`,
      [userId, entityType]
    );

    results.push(...rows.map(mapBookmark));
  }

  return results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function createBookmark(db, userId, payload) {
  const entityType = payload?.entityType;
  const entityId = payload?.entityId;

  validateEntityType(entityType);

  if (!entityId) {
    const err = new Error('entityId is required');
    err.statusCode = 422;
    throw err;
  }

  await assertEntityExists(db, entityType, entityId);

  try {
    const id = uuidv4();
    await db.query(
      `INSERT INTO bookmarks (id, user_id, entity_type, entity_id) VALUES ($1, $2, $3, $4)`,
      [id, userId, entityType, entityId]
    );

    return { id, entityType, entityId };
  } catch (error) {
    if (error.code === '23505') {
      const err = new Error('Item is already bookmarked');
      err.statusCode = 409;
      throw err;
    }

    throw error;
  }
}

export async function deleteBookmark(db, userId, bookmarkId) {
  const { rowCount } = await db.query(
    `DELETE FROM bookmarks WHERE id = $1 AND user_id = $2`,
    [bookmarkId, userId]
  );

  return rowCount > 0;
}
