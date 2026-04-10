import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Session } from "./session.entity";

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private sessionRepo: Repository<Session>,
  ) { }

  async createSession(userId: number, ip: string, userAgent: string) {
    const session = this.sessionRepo.create({
      userId,
      ip,
      userAgent,
      createdAt: new Date(),
      lastActive: new Date(),
      isRevoked: false,
    });

    return this.sessionRepo.save(session);
  }

  async getSessionsForUser(userId: number) {
    return this.sessionRepo.find({
      where: { userId, isRevoked: false },
      order: { createdAt: "DESC" },
    });
  }

  async revokeSession(sessionId: number) {
    return this.sessionRepo.update(sessionId, { isRevoked: true });
  }

  async revokeAllExcept(userId: number, currentSessionId: number) {
    return this.sessionRepo
      .createQueryBuilder()
      .update(Session)
      .set({ isRevoked: true })
      .where("userId = :userId", { userId })
      .andWhere("id != :currentSessionId", { currentSessionId })
      .execute();
  }

  async updateLastActive(sessionId: number) {
    return this.sessionRepo.update(sessionId, { lastActive: new Date() });
  }


}