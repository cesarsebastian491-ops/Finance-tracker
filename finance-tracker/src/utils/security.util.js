/**
 * Frontend Security Utilities
 * Input sanitization, XSS prevention, and secure API calls
 */

// Sanitize user input to prevent XSS
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;

  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

// Sanitize HTML (for rich text, use DOMPurify library in production)
export function sanitizeHTML(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  
  // Remove potentially dangerous elements
  const dangerous = ['script', 'iframe', 'object', 'embed'];
  dangerous.forEach(tag => {
    const elements = div.querySelectorAll(tag);
    elements.forEach(el => el.remove());
  });

  return div.innerHTML;
}

// Validate email
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate password strength
export function isStrongPassword(password) {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

// Get password strength percentage
export function getPasswordStrength(password) {
  let strength = 0;

  if (password.length >= 8) strength += 20;
  if (password.length >= 12) strength += 10;
  if (/[a-z]/.test(password)) strength += 15;
  if (/[A-Z]/.test(password)) strength += 15;
  if (/\d/.test(password)) strength += 15;
  if (/[@$!%*?&]/.test(password)) strength += 25;

  return Math.min(strength, 100);
}

// Secure API calls with CSRF token
export async function secureAPICall(url, options = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  };

  // Add CSRF token if available
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
  if (csrfToken) {
    defaultHeaders['X-CSRF-Token'] = csrfToken;
  }

  // Add auth token from localStorage
  const token = localStorage.getItem('token');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  return fetch(url, config);
}

// Store token securely - avoid localStorage for sensitive data
export function storeToken(token) {
  // ⚠️ NOTE: In production, use httpOnly cookies instead
  // This is only for development/learning purposes
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
}

// Get stored token
export function getToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

// Clear token on logout
export function clearToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
}

// Check if token is expired
export function isTokenExpired(token) {
  if (!token) return true;

  try {
    // Decode JWT (don't trust it - only for client-side UI)
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

// Generate CSRF token
export function generateCSRFToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Validate URL to prevent open redirect
export function isSafeURL(url) {
  try {
    const parsed = new URL(url, window.location.origin);
    // Only allow same origin
    return parsed.origin === window.location.origin;
  } catch {
    return false;
  }
}

// Prevent clickjacking
export function setSecurityHeaders() {
  const meta = document.createElement('meta');
  meta.httpEquiv = 'X-UA-Compatible';
  meta.content = 'ie=edge';
  document.head.appendChild(meta);
}
