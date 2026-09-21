import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createTaskSchema = z.object({
  title: z
    .string({ required_error: 'Task title is required' })
    .trim()
    .min(2, 'Task title must be at least 2 characters')
    .max(120, 'Task title cannot exceed 120 characters'),
  description: z.string().max(2000, 'Description cannot exceed 2000 characters').optional(),
  assignedTo: z
    .string()
    .regex(objectIdRegex, 'Invalid assignedTo User ID format')
    .optional()
    .nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  deadline: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}/))
    .optional()
    .nullable(),
  labels: z.array(z.string().trim()).optional()
});

export const updateTaskSchema = z.object({
  title: z.string().trim().min(2).max(120).optional(),
  description: z.string().max(2000).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  deadline: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}/))
    .optional()
    .nullable(),
  labels: z.array(z.string().trim()).optional()
});

export const assignTaskSchema = z.object({
  assignedTo: z
    .string({ required_error: 'assignedTo is required' })
    .regex(objectIdRegex, 'Invalid assignedTo User ID format')
    .nullable()
});

export const updateTaskStatusSchema = z.object({
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'CHANGES_REQUESTED', 'COMPLETED'], {
    required_error: 'Status is required'
  })
});
