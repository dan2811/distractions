import { z } from "zod";

import {
    createTRPCRouter, protectedProcedure,
    // protectedProcedure,
    // publicProcedure,
} from "~/server/api/trpc";
import { prisma } from "~/server/db";

export const paymentRouter = createTRPCRouter({
    findMany: protectedProcedure.input(z.object({
        eventId: z.string(),
    })).query(({ input }) => {
        return prisma.payment.findMany({
            where: {
                eventId: input.eventId,
            }
        });
    })
});