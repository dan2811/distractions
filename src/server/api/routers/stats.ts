import { adminProcedure, createTRPCRouter } from "../trpc";
import { Client } from "@sendgrid/client";
import type { ClientResponse } from "@sendgrid/mail";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { env } from "~/env.mjs";

const sendGridStatsSchema = z.object({
  date: z.string(),
  stats: z.array(
    z.object({
      metrics: z.object({
        blocks: z.number(),
        bounce_drops: z.number(),
        bounces: z.number(),
        clicks: z.number(),
        deferred: z.number(),
        delivered: z.number(),
        invalid_emails: z.number(),
        opens: z.number(),
        processed: z.number(),
        requests: z.number(),
        spam_report_drops: z.number(),
        spam_reports: z.number(),
        unique_clicks: z.number(),
        unique_opens: z.number(),
        unsubscribe_drops: z.number(),
        unsubscribes: z.number(),
      }),
    }),
  ),
});

export const statsRouter = createTRPCRouter({
  getSendGridStats: adminProcedure.query(async () => {
    try {
      const sgClient = new Client();
      sgClient.setApiKey(env.SENDGRID_API_KEY);
      const sgStats = (await sgClient.request({
        url: `/v3/stats`,
        method: "GET",
        qs: {
          start_date: new Date().toISOString().split("T")[0],
          end_date: new Date().toISOString().split("T")[0],
          aggregated_by: "day",
        },
      })) as [ClientResponse, z.infer<typeof sendGridStatsSchema>[]];

      const zodResult = sendGridStatsSchema.safeParse(sgStats[1][0]);

      if (!zodResult.success) {
        console.warn(
          "Send grid stats response is not valid. Check their docs to see what they have updated!!",
        );
      }

      return sgStats;
    } catch (e) {
      console.error(
        `Error calling sendgrid API for stats ${
          typeof e === "string" ? e : JSON.stringify(e)
        }`,
      );
      throw new TRPCError({
        message: "Error getting stats from SendGrid",
        code: "INTERNAL_SERVER_ERROR",
        cause: e,
      });
    }
  }),
  getAppStats: adminProcedure.query(async ({ ctx }) => {
    const totalUsers = await ctx.prisma.user.count();
    const totalEvents = await ctx.prisma.event.count();
    const totalSessions = await ctx.prisma.session.count();
    return {
      totalUsers,
      totalEvents,
      totalSessions,
    };
  }),
});
