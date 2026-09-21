import { z } from 'zod';

export const createCommentSchema = z.object({
  lineNumber: z
    .number({ required_error: 'Line number is required' })
    .int('Line number must be an integer')
    .min(1, 'Line number must be at least 1'),
  content: z
    .string({ required_error: 'Comment content is required' })
    .trim()
    .min(1, 'Comment content cannot be empty')
    .max(1000, 'Comment cannot exceed 1000 characters')
});

export const updateCommentSchema = z.object({
  content: z
    .string({ required_error: 'Comment content is required' })
    .trim()
    .min(1, 'Comment content cannot be empty')
    .max(1000, 'Comment cannot exceed 1000 characters')
});

export const submitReviewSchema = z.object({
  summary: z.string().trim().max(2000, 'Summary cannot exceed 2000 characters').optional()
});

export const evaluateReviewSchema = z.object({
  status: z.enum(['APPROVED', 'CHANGES_REQUESTED'], {
    required_error: 'Status is required (APPROVED or CHANGES_REQUESTED)'
  }),
  summary: z.string().trim().max(2000, 'Summary cannot exceed 2000 characters').optional()
});
