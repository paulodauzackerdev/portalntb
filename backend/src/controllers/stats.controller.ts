import { FastifyRequest, FastifyReply } from "fastify";
import { sendSuccess, requireAuth } from "../utils";
import type { StatsService } from "../services/stats.service";
import { statsService as defaultStatsService } from "../services/stats.service";

export class StatsController {
  constructor(
    private statsService: StatsService = defaultStatsService,
  ) {}

  async dashboard(request: FastifyRequest, reply: FastifyReply) {
    const user = requireAuth(request);
    const stats = await this.statsService.getDashboard(user.portal_id);
    return sendSuccess(reply, stats);
  }
}

export const statsController = new StatsController();
