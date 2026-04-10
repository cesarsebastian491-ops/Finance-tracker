import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../transactions/entities/user.entity';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Session } from 'src/sessions/session.entity';

@Injectable()
export class LastActiveInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepo: Repository<Session>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const sessionId = req.user?.sessionId;   // ⭐ FIXED

    return next.handle().pipe(
      tap(async () => {
        if (sessionId) {
          await this.sessionRepo.update(sessionId, { lastActive: new Date() });
        }
      }),
    );
  }
}