import React from 'react';
import { z } from 'zod';

/**
 * OWASP-compliant input validation and sanitization utilities
 */

// XSS Protection patterns
const XSS_PATTERNS = [
  /<script[^>]*>.*?<\/script>/gi,
  /<iframe[^>]*>.*?<\/iframe>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<object[^>]*>.*?<\/object>/gi,
  /<embed[^>]*>.*?<\/embed>/gi,
  /<applet[^>]*>.*?<\/applet>/gi,
  /<meta[^>]*>/gi,
  /<link[^>]*>/gi,
  /<style[^>]*>.*?<\/style>/gi,
];

// SQL Injection protection patterns
const SQL_INJECTION_PATTERNS = [
  /(\b(ALTER|CREATE|DELETE|DROP|EXEC(UTE)?|INSERT|MERGE|SELECT|UPDATE|UNION|USE)\b)/gi,
  /([\s\S]*[';][\s\S]*--[\s\S]*)/gi,
  /([\s\S]*[';][\s\S]*\/\*[\s\S]*\*\/[\s\S]*)/gi,
  /(\b(AND|OR)\b[\s\S]*[=<>][\s\S]*[\s\S]*)/gi,
];

// Common validation schemas
export const validationSchemas = {
  // User input validation
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .refine(val => !containsXSS(val), 'Invalid characters detected')
    .refine(val => !containsSQLInjection(val), 'Invalid input format'),

  email: z.string()
    .email('Please enter a valid email address')
    .max(254, 'Email address too long')
    .refine(val => !containsXSS(val), 'Invalid characters detected'),

  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

  phone: z.string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number')
    .optional(),

  // RSVP specific validation
  dietary_requirements: z.string()
    .max(500, 'Dietary requirements must be less than 500 characters')
    .refine(val => !containsXSS(val), 'Invalid characters detected')
    .optional(),

  // Content validation
  message: z.string()
    .min(1, 'Message is required')
    .max(1000, 'Message must be less than 1000 characters')
    .refine(val => !containsXSS(val), 'Invalid characters detected')
    .refine(val => !containsSQLInjection(val), 'Invalid input format'),

  // URL validation
  url: z.string()
    .url('Please enter a valid URL')
    .refine(val => val.startsWith('https://'), 'Only HTTPS URLs are allowed')
    .optional(),

  // File upload validation
  filename: z.string()
    .max(255, 'Filename too long')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Filename contains invalid characters')
    .refine(val => !val.includes('..'), 'Invalid filename format'),
};

/**
 * Check if string contains potential XSS patterns
 */
export function containsXSS(input: string): boolean {
  if (!input) return false;
  
  return XSS_PATTERNS.some(pattern => pattern.test(input));
}

/**
 * Check if string contains potential SQL injection patterns
 */
export function containsSQLInjection(input: string): boolean {
  if (!input) return false;
  
  return SQL_INJECTION_PATTERNS.some(pattern => pattern.test(input));
}

/**
 * Sanitize HTML content (simplified without DOMPurify dependency)
 */
export function sanitizeHTML(dirty: string): string {
  if (!dirty) return '';
  
  // Basic HTML sanitization without external dependency
  return dirty
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/<object[^>]*>.*?<\/object>/gi, '')
    .replace(/<embed[^>]*>.*?<\/embed>/gi, '')
    .replace(/<applet[^>]*>.*?<\/applet>/gi, '')
    .replace(/<meta[^>]*>/gi, '')
    .replace(/<link[^>]*>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

/**
 * Sanitize text input by removing/escaping dangerous characters
 */
export function sanitizeText(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/['"]/g, '') // Remove quotes
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Validate and sanitize form data
 */
export function validateAndSanitize<T>(
  data: unknown,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => err.message);
      return { success: false, errors };
    }
    return { success: false, errors: ['Validation failed'] };
  }
}

/**
 * Rate limiting helper (client-side tracking)
 */
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();

  isRateLimited(key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const recentAttempts = attempts.filter(time => now - time < windowMs);
    
    if (recentAttempts.length >= maxAttempts) {
      return true;
    }

    // Add current attempt
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    
    return false;
  }

  clearAttempts(key: string): void {
    this.attempts.delete(key);
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Secure random string generator
 */
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }
  
  return result;
}

/**
 * Input sanitization React hook
 */
export function useSanitizedInput(initialValue: string = '') {
  const [value, setValue] = React.useState(initialValue);
  const [sanitizedValue, setSanitizedValue] = React.useState(sanitizeText(initialValue));

  const updateValue = (newValue: string) => {
    setValue(newValue);
    setSanitizedValue(sanitizeText(newValue));
  };

  return {
    value,
    sanitizedValue,
    updateValue,
    isValid: !containsXSS(value) && !containsSQLInjection(value),
  };
}

export default {
  validationSchemas,
  containsXSS,
  containsSQLInjection,
  sanitizeHTML,
  sanitizeText,
  validateAndSanitize,
  rateLimiter,
  generateSecureToken,
  useSanitizedInput,
};