import db from '../database/db.js';

// Proyeccion publica: nunca expone password_hash.
export const toPublicUser = (user) =>
  user ? { id: user.id, name: user.name, email: user.email, createdAt: user.created_at } : null;

export const createUser = ({ name, email, passwordHash }) => {
  const info = db
    .prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)')
    .run(name, email, passwordHash);
  return findUserById(info.lastInsertRowid);
};

export const findUserById = (id) => db.prepare('SELECT * FROM users WHERE id = ?').get(id);

export const findUserByEmail = (email) =>
  db.prepare('SELECT * FROM users WHERE email = ?').get(String(email).toLowerCase());

export const countUsers = () => db.prepare('SELECT COUNT(*) AS total FROM users').get().total;
