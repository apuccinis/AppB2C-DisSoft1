import ApiError from './ApiError.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const requireString = (value, field, { min = 1, max = 255 } = {}) => {
  if (typeof value !== 'string' || value.trim().length < min) {
    throw ApiError.badRequest(`Field "${field}" is required`);
  }
  const trimmed = value.trim();
  if (trimmed.length > max) {
    throw ApiError.badRequest(`Field "${field}" must be at most ${max} characters`);
  }
  return trimmed;
};

export const requireEmail = (value) => {
  const email = requireString(value, 'email').toLowerCase();
  if (!EMAIL_REGEX.test(email)) {
    throw ApiError.badRequest('A valid email is required');
  }
  return email;
};

export const requirePassword = (value) => {
  if (typeof value !== 'string' || value.length < 6) {
    throw ApiError.badRequest('Password must be at least 6 characters long');
  }
  if (value.length > 128) {
    throw ApiError.badRequest('Password must be at most 128 characters long');
  }
  return value;
};

export const requirePositiveNumber = (value, field) => {
  const parsed = typeof value === 'string' ? Number(value.trim()) : Number(value);
  if (!Number.isFinite(parsed)) {
    throw ApiError.badRequest(`Field "${field}" must be a number`);
  }
  if (parsed <= 0) {
    throw ApiError.badRequest(`Field "${field}" must be greater than zero`);
  }
  return parsed;
};
