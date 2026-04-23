import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

interface StoredCaptcha {
  code: string;
  expiresAt: number;
}

@Injectable()
export class CaptchaService {
  private store = new Map<string, StoredCaptcha>();
  private readonly EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
  private readonly CLEANUP_INTERVAL = 60 * 1000; // 1 minute

  constructor() {
    setInterval(() => this.cleanup(), this.CLEANUP_INTERVAL);
  }

  generate(): { captchaId: string; captchaCode: string } {
    this.cleanup();

    const captchaId = crypto.randomUUID();
    const captchaCode = String(Math.floor(100000 + Math.random() * 900000));

    this.store.set(captchaId, {
      code: captchaCode,
      expiresAt: Date.now() + this.EXPIRY_MS,
    });

    return { captchaId, captchaCode };
  }

  verify(captchaId: string, captchaCode: string): boolean {
    if (!captchaId || !captchaCode) return false;

    const stored = this.store.get(captchaId);
    if (!stored) return false;

    // Always delete after attempt (one-time use)
    this.store.delete(captchaId);

    if (Date.now() > stored.expiresAt) return false;

    return stored.code === String(captchaCode).trim();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [id, entry] of this.store) {
      if (now > entry.expiresAt) {
        this.store.delete(id);
      }
    }
  }
}
