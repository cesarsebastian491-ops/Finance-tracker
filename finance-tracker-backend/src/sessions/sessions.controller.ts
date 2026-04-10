import { Controller, Get, Param, Post, Body } from "@nestjs/common";
import { SessionsService } from "./sessions.service";

@Controller("sessions")
export class SessionsController {
  constructor(private sessionsService: SessionsService) { }

  @Get(":userId")
  getSessions(@Param("userId") userId: number) {
    return this.sessionsService.getSessionsForUser(userId);
  }

  @Post("revoke")
  revoke(@Body() body: { sessionId: number }) {
    return this.sessionsService.revokeSession(body.sessionId);
  }

  @Post("revoke-all")
  revokeAll(@Body() body: { userId: number; currentSessionId: number }) {
    return this.sessionsService.revokeAllExcept(
      body.userId,
      body.currentSessionId,
    );
  }

}