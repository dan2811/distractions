import { z } from "zod";
import {
    createTRPCRouter, protectedProcedure,
} from "~/server/api/trpc";
import { prisma } from "~/server/db";

export const instrumentRouter = createTRPCRouter({
    getAll: protectedProcedure.query(() => {
        return prisma.instrument.findMany();
    }),
    getUsersInstruments: protectedProcedure.input(z.object({
        userId: z.string()
    })).query(({ input }) => {
        return prisma.instrument.findMany({
            where: {
                musicians: {
                    some: {
                        id: input.userId
                    }
                }
            }
        });
    })
});
