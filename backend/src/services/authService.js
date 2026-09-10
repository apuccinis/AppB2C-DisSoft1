import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import ApiError from '../utils/ApiError.js';
import { createUser, findUserByEmail, findUserById, toPublicUser } from '../models/userModel.js';
import { createDefaultWallets } from './walletService.js';

const SALT_ROUNDS = 10;

export const hashPassword = (password) => bcrypt.hash(password, SALT_ROUNDS);

export const signToken = (user) =>
  jwt.sign({ sub: user.id, email: user.email }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch {
    throw ApiError.unauthorized('Invalid or expired token');
  }
};

export const register = async ({ name, email, password }) => {
  if (findUserByEmail(email)) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const passwordHash = await hashPassword(password);
  const user = createUser({ name, email, passwordHash });
  // Toda cuenta nueva arranca con sus wallets en cero.
  createDefaultWallets(user.id);

  return { user: toPublicUser(user), token: signToken(user) };
};

export const login = async ({ email, password }) => {
  const user = findUserByEmail(email);
  // Mensaje generico: no revela si el email existe.
  const invalid = ApiError.unauthorized('Invalid email or password');
  if (!user) {
    await bcrypt.compare(password, '$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinv');
    throw invalid;
  }

  const matches = await bcrypt.compare(password, user.password_hash);
  if (!matches) throw invalid;

  return { user: toPublicUser(user), token: signToken(user) };
};

export const getCurrentUser = (userId) => {
  const user = findUserById(userId);
  if (!user) throw ApiError.unauthorized('Account no longer exists');
  return toPublicUser(user);
};
