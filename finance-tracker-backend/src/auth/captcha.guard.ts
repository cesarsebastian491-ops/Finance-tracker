import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { SECURITY_MESSAGES } from '../common/constants/security.constants';
import { CaptchaService } from './captcha.service';

@Injectable()
export class CaptchaGuard implements CanActivate {
  constructor(private readonly captchaService: CaptchaService) {}

  private isCaptchaEnabled(): boolean {
    return (process.env.CAPTCHA_ENABLED || 'true').toLowerCase() === 'true';
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.isCaptchaEnabled()) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const { captchaId, captchaCode } = request.body || {};

    if (!captchaId || !captchaCode) {
      throw new BadRequestException(SECURITY_MESSAGES.CAPTCHA_REQUIRED);
    }

    const valid = this.captchaService.verify(captchaId, captchaCode);

    if (!valid) {
      throw new BadRequestException(SECURITY_MESSAGES.CAPTCHA_INVALID);
    }

    return true;
  }
}
