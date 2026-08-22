/**
 * Admin role check middleware.
 * Must be used AFTER authMiddleware (protect) so req.user exists.
 */
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    const err = new Error('Not authorized — admin access required');
    err.statusCode = 403;
    next(err);
  }
};
