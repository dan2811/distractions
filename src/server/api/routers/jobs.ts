import { z } from "zod";

import {
    createTRPCRouter, protectedProcedure,
} from "~/server/api/trpc";
import { prisma } from "~/server/db";

export const jobRouter = createTRPCRouter({
    getOne: protectedProcedure.input(z.object({
        eventId: z.string(),
    })).query(({ input }) => {
        return prisma.job.findFirstOrThrow({
            where: {
                eventId: input.eventId,
            },
            include: {
                Instruments: true,
            }
        });
    })
});
