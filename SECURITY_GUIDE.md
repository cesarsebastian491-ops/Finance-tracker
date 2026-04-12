# 🔒 Finance Tracker - Security & Code Organization Guide

## Overview

This document outlines the security improvements and code organization enhancements implemented in the Finance Tracker application.

---

## 📁 Project Structure

### Backend (`finance-tracker-backend/`)

```
src/
├── common/                              # Shared utilities & security
│   ├── constants/
│   │   └── security.constants.ts        # Security configs & messages
│   ├── dto/
│   │   └── validation.dto.ts            # Input validation schemas
│   ├── middleware/
│   │   └── rate-limit.middleware.ts     # Rate limiting
│   ├── security/
│   │   └── security.service.ts          # Sanitization & validation utils
│   └── ...
├── auth/                                # Authentication & authorization
├── users/                               # User management
├── transactions/                        # Financial transactions
├── logs/                                # Audit logging
└── app.module.ts                        # Main app module
```

### Frontend (`finance-tracker/`)

```
src/
├── utils/
│   ├── security.util.js                 # XSS prevention, input sanitization
│   └── api.util.js                      # Secure API calls
├── components/                          # React components
├── pages/                               # Page components
├── context/                             # State management
└── config.js                            # Configuration
```

---

## 🔐 Security Features Implemented

### 1. **Environment Variables** ✅
- Secrets stored in `.env` file (not in git)
- Use `.env.example` as template
- All sensitive data externalized

**Before:**
```typescript
// DANGEROUS - hardcoded credentials
TypeOrmModule.forRoot({
  username: 'root',
  password: '1234',
})
```

**After:**
```typescript
// SAFE - uses environment variables
TypeOrmModule.forRoot({
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
})
```

### 2. **Helmet.js Security Headers** ✅
Adds HTTP security headers to prevent common attacks:
- XSS Protection
- Clickjacking Protection
- Content Security Policy
- MIME-type Sniffing Prevention

```typescript
app.use(helmet());
```

### 3. **Strict CORS** ✅
Before: Allowed all origins (`origin: '*'`)
After: Whitelist specific origins only

```typescript
const allowedOrigins = ['http://localhost:5173'];
app.enableCors({
  origin: allowedOrigins,
  credentials: true,
});
```

### 4. **Input Validation** ✅
Global validation pipe validates all incoming requests:
- Type checking
- Length validation
- Format validation
- Whitelist untrusted data

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  })
);
```

### 5. **Rate Limiting** ✅
Prevents brute force attacks and DoS:
- Limit requests per IP
- Configurable window and thresholds
- Returns 429 Too Many Requests

```typescript
// 100 requests per 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
```

### 6. **Input Sanitization** ✅
Backend sanitization prevents:
- XSS (Cross-Site Scripting)
- SQL Injection (via ORM)
- NoSQL Injection

Frontend sanitization in `security.util.js`:
```javascript
sanitizeInput("user <script>alert('xss')</script>")
// Result: user alert('xss')
```

### 7. **Password Strength Validation** ✅
Enforces strong passwords:
- Minimum 8 characters
- 1 Uppercase, 1 Lowercase
- 1 Number, 1 Special Character

```typescript
REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
```

### 8. **.gitignore** ✅
Prevents committing secrets:
```
.env
node_modules/
dist/
logs/
```

---

## 🚀 Getting Started

### Backend Setup

1. **Create `.env` file** from template:
```bash
cp .env.example .env
```

2. **Configure values:**
```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret_key
CORS_ORIGIN=http://localhost:5173
```

3. **Install dependencies:**
```bash
npm install
```

4. **Start development server:**
```bash
npm run start:dev
```

### Frontend Setup

1. **Create `.env` file:**
```bash
VITE_API_URL=http://localhost:3000
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start dev server:**
```bash
npm run dev
```

---

## 📋 Best Practices

### Backend

1. **Always validate input:**
```typescript
// ✅ GOOD
async addExpense(@Body() dto: CreateExpenseDto) {
  // dto already validated by ValidationPipe
}

// ❌ BAD
async addExpense(@Body() data: any) {
  // No validation
}
```

2. **Use DTOs with class-validator:**
```typescript
export class CreateExpenseDto {
  @IsString()
  @MinLength(2)
  expense: string;

  @IsNumber()
  @Min(0)
  amount: number;
}
```

3. **Never trust user input:**
```typescript
// ✅ GOOD - Sanitized
const description = this.securityService.sanitizeInput(dto.description);

// ❌ BAD - Direct use
const description = req.body.description;
```

4. **Use parameterized queries:**
```typescript
// ✅ GOOD - ORM handles this
const user = await this.repo.findOne({ where: { id: userId } });

// ❌ BAD - SQL Injection risk
const user = await this.repo.query(`SELECT * FROM users WHERE id = ${userId}`);
```

### Frontend

1. **Never store tokens in localStorage:**
```javascript
// ❌ BAD - vulnerable to XSS
localStorage.setItem('token', token);

// ✅ BETTER - use httpOnly cookies (server-set)
// Let backend set httpOnly cookie
```

2. **Sanitize user input before display:**
```javascript
// ✅ GOOD
function renderExpense(expense) {
  const sanitized = sanitizeInput(expense.description);
  return <p>{sanitized}</p>;
}

// ❌ BAD - XSS vulnerability
return <p dangerouslySetInnerHTML={{ __html: expense.description }} />;
```

3. **Use secure API calls:**
```javascript
// ✅ GOOD - Includes auth token
const response = await secureAPICall('/api/transactions', {
  method: 'POST',
  body: JSON.stringify(data)
});

// ❌ BAD - No auth header
const response = await fetch('/api/transactions', {
  method: 'POST',
  body: JSON.stringify(data)
});
```

---

## 🔍 Security Checklist

### Development
- [ ] Never commit `.env` file
- [ ] Use `.env.example` for configuration template
- [ ] Run `npm install` after pulling changes
- [ ] Validate all user inputs
- [ ] Sanitize all user outputs
- [ ] Test XSS vulnerabilities
- [ ] Test SQL injection vectors

### Before Production Deployment
- [ ] Update all environment variables in production
- [ ] Set `NODE_ENV=production`
- [ ] Generate strong JWT secret
- [ ] Configure HTTPS/SSL
- [ ] Enable database backups
- [ ] Set up monitoring & logging
- [ ] Run security audit
- [ ] Configure WAF (Web Application Firewall)
- [ ] Test authentication & authorization
- [ ] Implement rate limiting
- [ ] Set up alerting for suspicious activity

### Post-Deployment
- [ ] Monitor error logs
- [ ] Review security headers
- [ ] Test API endpoints for vulnerabilities
- [ ] Monitor failed login attempts
- [ ] Review audit logs regularly
- [ ] Keep dependencies updated

---

## 🛡️ Common Attacks & Mitigations

### XSS (Cross-Site Scripting)
**Mitigation:**
- Input sanitization
- Output encoding
- Content Security Policy (Helmet)
- DOMPurify for HTML content

### SQL Injection
**Mitigation:**
- Parameterized queries (ORM)
- Input validation
- Least privilege database users

### CSRF (Cross-Site Request Forgery)
**Mitigation:**
- CSRF tokens
- SameSite cookies
- Double-submit cookies

### Brute Force Attacks
**Mitigation:**
- Rate limiting
- Account lockout after failed attempts
- 2FA authentication

### Man-in-the-Middle
**Mitigation:**
- HTTPS/SSL
- HSTS headers
- Certificate pinning

---

## 📚 Resources

- [OWASP Top 10 2023](https://owasp.org/www-project-top-ten/)
- [OWASP API Security](https://owasp.org/www-project-api-security/)
- [NestJS Security](https://docs.nestjs.com/security/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express.js Security](https://expressjs.com/en/advanced/best-practice-security.html)

---

## 🆘 Need Help?

For security vulnerabilities, please:
1. **DON'T** create a public issue
2. Email: `security@yourapp.com`
3. Include detailed description of vulnerability
4. DO NOT share exploit code publicly

---

**Last Updated:** April 10, 2026  
**Status:** ✅ Security foundations implemented
