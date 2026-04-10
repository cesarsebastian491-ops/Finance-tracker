import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly authService: AuthService) {
    super();
  }

  handleRequest(err, user, info, context: ExecutionContext) {
    if (user) {
      this.authService.updateLastActive(user.id);
    }
    return user;
  }
}