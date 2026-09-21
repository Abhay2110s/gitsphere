import { z } from 'zod';

export const createMessageSchema = z.object({
  content: z
    .string({ required_error: 'Message content is required' })
    .trim()
    .min(1, 'Message content cannot be empty')
    .max(2000, 'Message cannot exceed 2000 characters'),
  project: z
    .string({ required_error: 'Project ID is required' })
    .min(1, 'Project ID is required'),
  task: z
    .string()
    .optional()
});
