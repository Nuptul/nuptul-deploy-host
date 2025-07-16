import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const signUpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: passwordSchema,
  confirmPassword: z.string().min(1, "Please confirm your password"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  mobile: z.string().min(10, "Please enter a valid mobile number"),
  address: z.string().min(5, "Please enter a valid address"),
  suburb: z.string().min(2, "Please enter your suburb"),
  state: z.string().min(2, "Please enter your state/province"),
  country: z.string().min(2, "Please enter your country"),
  postcode: z.string().min(3, "Please enter a valid postcode/zip code"),
  emergencyContact: z.string().optional(),
  relationshipToCouple: z.string().min(1, "Please specify your relationship to the couple"),
  dietaryRequirements: z.array(z.string()).default([]),
  allergies: z.array(z.string()).default([]),
  specialAccommodations: z.string().optional(),
  bio: z.string().optional(),
  hasPlusOne: z.boolean().default(false),
  plusOneName: z.string().optional(),
  plusOneEmail: z.string().email("Please enter a valid email").optional().or(z.literal("")),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.hasPlusOne && (!data.plusOneName || data.plusOneName.trim().length === 0)) {
    return false;
  }
  return true;
}, {
  message: "Plus one name is required when bringing a guest",
  path: ["plusOneName"],
}).refine((data) => {
  if (data.hasPlusOne && (!data.plusOneEmail || data.plusOneEmail.trim().length === 0)) {
    return false;
  }
  return true;
}, {
  message: "Plus one email is required when bringing a guest",
  path: ["plusOneEmail"],
});

export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const magicLinkSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export type SignUpFormData = z.infer<typeof signUpSchema>;
export type SignInFormData = z.infer<typeof signInSchema>;
export type MagicLinkFormData = z.infer<typeof magicLinkSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const getPasswordStrength = (password: string): {
  score: number;
  feedback: string;
  color: string;
} => {
  let score = 0;
  const checks = [
    { test: /.{8,}/, weight: 1, label: "8+ characters" },
    { test: /[A-Z]/, weight: 1, label: "uppercase letter" },
    { test: /[a-z]/, weight: 1, label: "lowercase letter" },
    { test: /[0-9]/, weight: 1, label: "number" },
    { test: /[^A-Za-z0-9]/, weight: 1, label: "special character" },
    { test: /.{12,}/, weight: 1, label: "12+ characters" },
  ];

  checks.forEach((check) => {
    if (check.test.test(password)) score += check.weight;
  });

  if (score <= 2) return { score, feedback: "Weak", color: "hsl(var(--destructive))" };
  if (score <= 4) return { score, feedback: "Good", color: "hsl(var(--warning))" };
  return { score, feedback: "Strong", color: "hsl(var(--success))" };
};