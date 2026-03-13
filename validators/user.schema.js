import { z } from "zod";
import validator from 'validator';
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),

  email: z.string().email("Please provide a valid email address"),

  phone: z
    .string().refine((value)=>validator.isMobilePhone(value,"ar-EG"), "Please provide a valid Egyptian mobile number (01xxxxxxxxx)"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
