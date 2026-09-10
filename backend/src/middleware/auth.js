import ApiError from '../utils/ApiError.js';
import { verifyToken } from '../services/authService.js';
import { findUserById, toPublicUser } from '../models/userModel.js';

// Protege rutas privadas: exige un JWT valido en Authorization: Bearer <token>.
export const requireAuth = (req, _res, next) => {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw ApiError.unauthorized('Missing authentication token');
    }

    const payload = verifyToken(token);
    const user = findUserById(payload.sub);
    if (!user) throw ApiError.unauthorized('Account no longer exists');

    req.user = toPublicUser(user);
    next();
  } catch (error) {
    next(error);
  }
};

export default requireAuth;
