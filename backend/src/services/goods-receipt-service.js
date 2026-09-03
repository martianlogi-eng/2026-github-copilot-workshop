// Minimal Goods Receipt read model. Full GR create/post workflow is out of
// scope for this workshop baseline; only a list view is provided so GR
// items can be shown and bookmarked.

function mapHeader(row) {
  return {
    id: row.id,
    grNumber: row.gr_number,
    status: row.status,
    poId: row.po_id,
    poNumber: row.po_number,
    receiptDate: row.receipt_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listGoodsReceipts(db) {
  const { rows } = await db.query(
    `SELECT gr.id, gr.gr_number, gr.status, gr.po_id, gr.receipt_date, gr.created_at, gr.updated_at,
            po.po_number
     FROM goods_receipts gr
     JOIN purchase_orders po ON po.id = gr.po_id
     ORDER BY gr.created_at DESC`
  );

  return rows.map(mapHeader);
}
