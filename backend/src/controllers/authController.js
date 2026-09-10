import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import { requireEmail, requirePassword, requireString } from '../utils/validation.js';
import { getCurrentUser, login, register } from '../services/authService.js';

export const registerController = asyncHandler(async (req, res) => {
  const name = requireString(req.body?.name, 'name', { min: 2, max: 60 });
  const email = requireEmail(req.body?.email);
  const password = requirePassword(req.body?.password);

  const result = await register({ name, email, password });
  sendSuccess(res, result, 201);
});

export const loginController = asyncHandler(async (req, res) => {
  const email = requireEmail(req.body?.email);
  const password = requireString(req.body?.password, 'password', { max: 128 });

  const result = await login({ email, password });
  sendSuccess(res, result);
});

export const meController = asyncHandler(async (req, res) => {
  sendSuccess(res, { user: getCurrentUser(req.user.id) });
});
