const Joi = require('joi');
const { validate } = require('./auth.validator');

/**
 * Task Validation Schemas
 */

// ── Create Task ──────────────────────────────
const createTaskSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).required()
    .messages({
      'string.min': 'Title must be at least 3 characters',
      'any.required': 'Title is required',
    }),
  description: Joi.string().trim().min(10).max(2000).required()
    .messages({
      'string.min': 'Description must be at least 10 characters',
      'any.required': 'Description is required',
    }),
  category: Joi.string().valid(
    'disaster-relief', 'education', 'healthcare',
    'environment', 'community', 'logistics', 'technical', 'other'
  ).default('other'),
  location: Joi.object({
    coordinates: Joi.array().items(Joi.number()).length(2).required()
      .messages({
        'array.length': 'Location must have [longitude, latitude]',
      }),
    address: Joi.string().trim().max(500).optional(),
  }).required()
    .messages({
      'any.required': 'Task location is required',
    }),
  urgency: Joi.string().valid('low', 'medium', 'high', 'critical').default('medium'),
  requiredSkills: Joi.array().items(Joi.string().trim()).default([]),
  maxVolunteers: Joi.number().integer().min(1).max(100).default(1),
  deadline: Joi.date().iso().greater('now').required()
    .messages({
      'date.greater': 'Deadline must be in the future',
      'any.required': 'Deadline is required',
    }),
});

// ── Update Task ──────────────────────────────
const updateTaskSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200),
  description: Joi.string().trim().min(10).max(2000),
  category: Joi.string().valid(
    'disaster-relief', 'education', 'healthcare',
    'environment', 'community', 'logistics', 'technical', 'other'
  ),
  location: Joi.object({
    coordinates: Joi.array().items(Joi.number()).length(2),
    address: Joi.string().trim().max(500),
  }),
  urgency: Joi.string().valid('low', 'medium', 'high', 'critical'),
  requiredSkills: Joi.array().items(Joi.string().trim()),
  maxVolunteers: Joi.number().integer().min(1).max(100),
  deadline: Joi.date().iso().greater('now'),
  status: Joi.string().valid('open', 'assigned', 'in-progress', 'completed', 'verified', 'cancelled'),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

// ── Assign Task ──────────────────────────────
const assignTaskSchema = Joi.object({
  taskId: Joi.string().required()
    .messages({ 'any.required': 'Task ID is required' }),
  volunteerIds: Joi.array().items(Joi.string()).min(1).required()
    .messages({
      'array.min': 'At least one volunteer must be assigned',
      'any.required': 'Volunteer IDs are required',
    }),
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  assignTaskSchema,
  validate,
};
