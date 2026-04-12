# 🚀 Quick Reference Guide

## Setup (First Time)

```bash
# Backend
cd finance-tracker-backend
cp .env.example .env
# Edit .env with your database credentials
npm install
npm run start:dev

# Frontend (in new terminal)
cd finance-tracker
npm install
npm run dev
```

## Common Commands

### Backend
```bash
npm run start:dev      # Dev server with auto-reload
npm run build          # Build for production
npm run start:prod     # Run production build
npm run lint           # Fix linting errors
npm run test           # Run tests
npm run test:cov       # Test coverage
```

### Frontend
```bash
npm run dev           # Dev server
npm run build         # Production build
npm run preview       # Preview build locally
npm run lint          # Lint check
```

## Database Migrations

```bash
npm run migration:generate -- --name NameOfMigration
npm run migration:run
npm run migration:revert
```

## Security Checklist

### Development
- ✅ Never commit `.env` file
- ✅ Use `.env.example` for templates
- ✅ Always validate user input
- ✅ Sanitize before display
- ✅ Use secure API calls

### Before Commiting
```bash
npm run lint           # Fix code style
npm run test           # Run tests
```

## File Locations

### Backend Security
- Constants: `src/common/constants/security.constants.ts`
- Service: `src/common/security/security.service.ts`
- Middleware: `src/common/middleware/rate-limit.middleware.ts`
- Validation: `src/common/dto/validation.dto.ts`
- Config: `.env` (create from `.env.example`)

### Frontend Security
- Utilities: `src/utils/security.util.js`
- Config: `src/config.js`

## Using Security Features

### Backend - Sanitize Input
```typescript
import { SecurityService } from './common/security/security.service';

export class MyService {
  constructor(private securityService: SecurityService) {}

  handleUserInput(input: string) {
    const clean = this.securityService.sanitizeInput(input);
    // Use clean value
  }
}
```

### Backend - Validate Passwords
```typescript
const isStrong = this.securityService.isStrongPassword(password);
const message = this.securityService.getPasswordStrengthMessage(password);
```

### Frontend - Sanitize Output
```javascript
import { sanitizeInput, isStrongPassword } from './utils/security.util';

// Prevent XSS
const safe = sanitizeInput(userInput);
document.getElementById('output').textContent = safe;

// Check password strength
const strength = getPasswordStrength(password);
console.log(`Password strength: ${strength}%`);
```

### Frontend - Secure API Calls
```javascript
import { secureAPICall } from './utils/security.util';

const response = await secureAPICall('/api/transactions', {
  method: 'POST',
  body: JSON.stringify({ amount: 100 })
});
```

## Environment Variables Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `3306` |
| `DB_USERNAME` | DB user | `root` |
| `DB_PASSWORD` | DB password | `MySecurePassword123!` |
| `DB_NAME` | Database name | `finance-system` |
| `JWT_SECRET` | JWT signing key | Generated random string |
| `CORS_ORIGIN` | Allowed origins | `http://localhost:5173` |
| `NODE_ENV` | Environment | `development` or `production` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` (15 min) |

## Troubleshooting

### "Cannot find module" error
```bash
npm install
npm run build
```

### Port already in use
```bash
# Change port in .env
APP_PORT=3001
```

### Database connection error
```bash
# Verify .env credentials
# Check MySQL is running
mysql -u root -p  # Test connection
```

### CORS error
```bash
# Add frontend URL to CORS_ORIGIN
CORS_ORIGIN=http://localhost:5173,http://192.168.1.100:5173
```

## Testing Security

### Test XSS Prevention
```javascript
const malicious = '<script>alert("xss")</script>';
const safe = sanitizeInput(malicious);
console.log(safe);  // No script tags
```

### Test Password Validation
```typescript
const weak = 'password';
const strong = 'MyPassword123!';

console.log(isStrongPassword(weak));    // false
console.log(isStrongPassword(strong));  // true
```

### Test Rate Limiting
```bash
# Make multiple requests quickly
for i in {1..101}; do curl http://localhost:3000/api/end-point; done
# After 100+ requests, should get 429 Too Many Requests
```

## Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | General project info |
| `SECURITY_GUIDE.md` | Comprehensive security guide |
| `IMPROVEMENTS.md` | Summary of improvements |
| `SECURITY.md` | Backend security details |
| `backend/.env.example` | Environment template |
| `backend/SECURITY.md` | Backend security checklist |

## Important Security Rules

1. **Never hardcode secrets**
   ```typescript
   // ❌ WRONG
   password: '1234'
   
   // ✅ RIGHT
   password: process.env.DB_PASSWORD
   ```

2. **Always validate input**
   ```typescript
   // ❌ WRONG
   const user = req.body;
   
   // ✅ RIGHT
   @Body() createUserDto: CreateUserDto  // Auto-validated
   ```

3. **Always sanitize output**
   ```javascript
   // ❌ WRONG
   dangerouslySetInnerHTML={{ __html: userInput }}
   
   // ✅ RIGHT
   textContent = sanitizeInput(userInput)
   ```

4. **Use secure API calls**
   ```javascript
   // ❌ WRONG
   fetch('/api/data')
   
   // ✅ RIGHT
   secureAPICall('/api/data')  // Includes auth & CSRF
   ```

## Git Workflow

```bash
# Before commiting
npm run lint          # Fix style issues
npm run test          # Run tests

# Never commit these
.env                  # Has secrets
node_modules/         # Install locally
dist/                 # Build locally

# Always commit
.env.example          # Template for secrets
src/                  # Source code
package.json          # Dependencies
```

## Performance Tips

- Keep `.env` loading fast (not in loops)
- Cache sanitized inputs when possible
- Don't rate-limit static assets
- Use database indexes for lookups

## Deployment Commands

```bash
# Build frontend
cd finance-tracker
npm run build

# Build backend
cd ../finance-tracker-backend
npm run build

# All deployments require proper .env setup!
```

---

**Last Updated:** April 10, 2026  
**Version:** 1.0  
**Status:** ✅ Ready for use
