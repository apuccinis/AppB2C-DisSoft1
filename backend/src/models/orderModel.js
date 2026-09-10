import db from '../database/db.js';

export const toPublicOrder = (order) =>
  order
    ? {
        id: order.id,
        type: order.type,
        baseAsset: order.base_asset,
        quoteAsset: order.quote_asset,
        pair: `${order.base_asset}/${order.quote_asset}`,
        amount: order.amount,
        price: order.price,
        fee: order.fee,
        total: order.total,
        status: order.status,
        createdAt: order.created_at,
      }
    : null;

export const createOrder = (order) => {
  const info = db
    .prepare(
      `INSERT INTO orders (user_id, type, base_asset, quote_asset, amount, price, fee, total, status)
       VALUES (@userId, @type, @baseAsset, @quoteAsset, @amount, @price, @fee, @total, @status)`,
    )
    .run({ status: 'COMPLETED', ...order });
  return findOrderById(info.lastInsertRowid);
};

export const findOrderById = (id) => db.prepare('SELECT * FROM orders WHERE id = ?').get(id);

// Solo devuelve la orden si pertenece al usuario (ownership).
export const findUserOrder = (userId, id) =>
  db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(id, userId);

export const listOrdersByUser = (userId, { type, asset, limit = 100 } = {}) => {
  const clauses = ['user_id = ?'];
  const params = [userId];

  if (type) {
    clauses.push('type = ?');
    params.push(String(type).toUpperCase());
  }
  if (asset) {
    clauses.push('(base_asset = ? OR quote_asset = ?)');
    const symbol = String(asset).toUpperCase();
    params.push(symbol, symbol);
  }
  params.push(limit);

  return db
    .prepare(
      `SELECT * FROM orders WHERE ${clauses.join(' AND ')} ORDER BY datetime(created_at) DESC, id DESC LIMIT ?`,
    )
    .all(...params);
};
