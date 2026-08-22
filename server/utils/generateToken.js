import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

/**
 * Generate a JWT token.
 * Payload: { id, role }
 * Expires in 7 days.
 *
 * @param {string} id - User's MongoDB _id
 * @param {string} role - User's role ('user' | 'admin')
 * @returns {string} Signed JWT
 */
export const generateToken = (id, role) => {
  return jwt.sign({ id, role }, config.jwtSecret, {
    expiresIn: '7d',
  });
};
