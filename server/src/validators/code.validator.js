import { z } from 'zod';

export const createFileSchema = z.object({
  fileName: z
    .string({ required_error: 'File name is required' })
    .trim()
    .min(1, 'File name cannot be empty')
    .max(100, 'File name cannot exceed 100 characters')
    .regex(/^[^\\/:\*\?"<>\|]+$/, 'File name contains invalid characters'),
  filePath: z.string().trim().default('/'),
  language: z.string().trim().toLowerCase().optional().default('javascript'),
  content: z.string().optional().default('// Start coding here...\n')
});

export const updateFileSchema = z.object({
  content: z.string().optional(),
  fileName: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .regex(/^[^\\/:\*\?"<>\|]+$/, 'File name contains invalid characters')
    .optional(),
  language: z.string().trim().toLowerCase().optional()
});

export const createVersionSchema = z.object({
  commitMessage: z
    .string({ required_error: 'Commit message is required' })
    .trim()
    .min(1, 'Commit message cannot be empty')
    .max(200, 'Commit message cannot exceed 200 characters')
});
