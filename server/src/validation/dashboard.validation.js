import { z } from "zod";

export const dashboardStatsSchema = z.object({
  query: z.object({
    months: z.coerce.number().int().min(1).max(24).default(6),
    top: z.coerce.number().int().min(1).max(20).default(5),
  }),
});