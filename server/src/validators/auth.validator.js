import { z } from 'zod';

export const registerSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(60, 'Name cannot exceed 60 characters'),
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Please provide a valid email address')
    .toLowerCase(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password is too long'),
  avatar: z.string().url('Avatar must be a valid URL').optional().or(z.literal('')),
  bio: z.string().max(300, 'Bio cannot exceed 300 characters').optional()
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Please provide a valid email address')
    .toLowerCase(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required')
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60).optional(),
  bio: z.string().max(300, 'Bio cannot exceed 300 characters').optional(),
  avatar: z.string().url('Avatar must be a valid URL').optional().or(z.literal(''))
});
