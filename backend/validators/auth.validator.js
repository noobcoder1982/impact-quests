const Joi = require('joi');

/**
 * Auth Validation Schemas
 * Uses Joi for robust input validation and sanitization
 */

// ── Register Volunteer ──────────────────────────
const registerVolunteerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required()
    .messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 100 characters',
      'any.required': 'Name is required',
    }),
  email: Joi.string().email().lowercase().trim().required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
  password: Joi.string().min(6).max(128).required()
    .messages({
      'string.min': 'Password must be at least 6 characters',
      'any.required': 'Password is required',
    }),
  skills: Joi.array().items(Joi.string().trim()).default([]),
  location: Joi.object({
    coordinates: Joi.array().items(Joi.number()).length(2).required()
      .messages({
        'array.length': 'Location must have [longitude, latitude]',
      }),
  }).optional(),
  availability: Joi.array().items(
    Joi.object({
      day: Joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday').required(),
      startTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required()
        .messages({ 'string.pattern.base': 'Start time must be in HH:MM format' }),
      endTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required()
        .messages({ 'string.pattern.base': 'End time must be in HH:MM format' }),
    })
  ).default([]),
});

// ── Register NGO ────────────────────────────────
const registerNGOSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  organizationName: Joi.string().trim().min(2).max(200).required()
    .messages({
      'any.required': 'Organization name is required',
    }),
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().min(6).max(128).required(),
});

// ── Login ───────────────────────────────────────
const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required()
    .messages({
      'string.email': 'Please provide a valid email',
      'any.required': 'Email is required',
    }),
  password: Joi.string().required()
    .messages({
      'any.required': 'Password is required',
    }),
});

// ── Register Customer ───────────────────────────
const registerCustomerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().min(6).max(128).required(),
});

// ── Validate middleware factory ─────────────────
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Return all errors at once
      stripUnknown: true, // Remove unknown fields (sanitization)
    });

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    // Replace body with validated & sanitized values
    req.body = value;
    next();
  };
};

module.exports = {
  registerVolunteerSchema,
  registerNGOSchema,
  registerCustomerSchema,
  loginSchema,
  validate,
};
