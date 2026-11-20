import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { getJwtSecret } from '../config/jwt.js';

/**
 * Protect routes - Verifies JWT from Authorization header
 */
export async function protect(req, res, next) {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authorization token provided.',
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      getJwtSecret()
    );
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authorization token.',
    });
  }
}

/**
 * Grant access to specific roles
 */
export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: User role "${req.user?.role || 'anonymous'}" is not authorized to access this resource.`,
      });
    }
    next();
  };
}

/**
 * Optional Auth - Attaches user if token is provided, proceeds as guest otherwise
 */
export async function optionalAuth(req, res, next) {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(
      token,
      getJwtSecret()
    );
    req.user = await User.findById(decoded.id).select('-password');
  } catch {
    req.user = null;
  }
  next();
}
