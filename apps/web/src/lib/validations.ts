import { z } from 'zod';

export const loginSchema = z.object({
  loginId: z.string().min(1, 'Email or Phone is required'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  mobile: z.string().min(10, 'Mobile number must be at least 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  companyName: z.string().min(1, 'Company Name is required'),
  companyType: z.string().min(1, 'Company Type is required'),
  role: z.enum(['BUYER', 'SELLER']),
});

export const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  subCategory: z.string().min(1, 'Sub Category is required'),
  priceType: z.enum(['FIXED', 'CONTACT_FOR_QUOTE']),
  price: z.number().optional().nullable(),
  pricingUnit: z.string().optional(),
  piecesPerUnit: z.number().optional().nullable(),
  minQtyPurchase: z.number().min(1, 'Minimum Quantity must be at least 1'),
  minAmountPurchase: z.number().min(0, 'Minimum Amount must be non-negative'),
  stockQuantity: z.number().min(0, 'Stock cannot be negative').optional(),
});
