/**
 * Security Constants and Configuration
 */

export const SECURITY_CONFIG = {
  // Password requirements
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,

  // JWT
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || 3600, // 1 hour

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),

  // CAPTCHA
  CAPTCHA_ENABLED: (process.env.CAPTCHA_ENABLED || 'true').toLowerCase() === 'true',
  CAPTCHA_VERIFY_URL:
    process.env.CAPTCHA_VERIFY_URL || 'https://www.google.com/recaptcha/api/siteverify',
  CAPTCHA_TIMEOUT_MS: parseInt(process.env.CAPTCHA_TIMEOUT_MS || '5000', 10),

  // Session timeout
  SESSION_TIMEOUT_MS: 1800000, // 30 minutes

  // 2FA
  TOTP_WINDOW: 1, // Allow 1 time step drift

  // CORS
  ALLOWED_ORIGINS: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(','),

  // API versioning
  API_VERSION: 'v1',

  // Request size limits
  MAX_REQUEST_SIZE: '1mb',
  MAX_JSON_SIZE: '1mb',
  MAX_URL_ENCODED_SIZE: '1mb',
};

export const SECURITY_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Forbidden',
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_NOT_FOUND: 'User not found',
  EMAIL_ALREADY_EXISTS: 'Email already registered',
  WEAK_PASSWORD: 'Password does not meet security requirements',
  INVALID_2FA_CODE: 'Invalid 2FA code',
  TOO_MANY_REQUESTS: 'Too many requests. Please try again later',
  SESSION_EXPIRED: 'Your session has expired. Please login again',
  CAPTCHA_REQUIRED: 'Please complete CAPTCHA verification',
  CAPTCHA_INVALID: 'CAPTCHA verification failed',
  CAPTCHA_UNAVAILABLE: 'CAPTCHA verification service is unavailable',
};

export const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
  SECURITY: 'SECURITY',
};
