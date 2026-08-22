/**
 * Joi schema validation middleware factory.
 *
 * Usage:
 *   import { validate } from '../middleware/validate.js';
 *   router.post('/trips', validate(createTripSchema), createTrip);
 *
 * @param {import('joi').ObjectSchema} schema - Joi validation schema
 * @param {string} property - Request property to validate ('body' | 'query' | 'params')
 */
export const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,       // report all errors, not just the first
      stripUnknown: true,      // remove unknown fields
      allowUnknown: false,
    });

    if (error) {
      const err = new Error(
        error.details.map((d) => d.message).join(', ')
      );
      err.statusCode = 400;
      err.code = 'VALIDATION_ERROR';
      return next(err);
    }

    // Replace the request property with the validated (and stripped) value
    req[property] = value;
    next();
  };
};
