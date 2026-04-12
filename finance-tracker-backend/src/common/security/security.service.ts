import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class SecurityService {
  /**
   * Sanitize user input to prevent XSS attacks
   */
  sanitizeInput(input: string): string {
    if (typeof input !== 'string') return input;

    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
  }

  /**
   * Validate email format
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   * Requires: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
   */
  isStrongPassword(password: string): boolean {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  /**
   * Get password strength message
   */
  getPasswordStrengthMessage(password: string): string {
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(password)) return 'Password must contain uppercase letters';
    if (!/[a-z]/.test(password)) return 'Password must contain lowercase letters';
    if (!/\d/.test(password)) return 'Password must contain numbers';
    if (!/[@$!%*?&]/.test(password)) return 'Password must contain special characters (@$!%*?&)';
    return 'Password strength: Strong';
  }

  /**
   * Prevent NoSQL injection by validating object structure
   */
  validateObjectStructure(obj: any, allowedKeys: string[]): boolean {
    if (typeof obj !== 'object' || obj === null) return false;

    const keys = Object.keys(obj);
    return keys.every((key) => allowedKeys.includes(key));
  }

  /**
   * Rate limit check (store in Redis in production)
   */
  private requestLimits = new Map<string, { count: number; resetTime: number }>();

  checkRateLimit(identifier: string, maxRequests: number = 100, windowMs: number = 900000): boolean {
    const now = Date.now();
    const record = this.requestLimits.get(identifier);

    if (!record || now > record.resetTime) {
      this.requestLimits.set(identifier, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (record.count >= maxRequests) {
      return false;
    }

    record.count++;
    return true;
  }
}
