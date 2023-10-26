import { z } from "zod";

import {
    createTRPCRouter, protectedProcedure,
} from "~/server/api/trpc";
import { prisma } from "~/server/db";

export const contractRouter = createTRPCRouter({
    getContract: protectedProcedure.input(z.object({
        id: z.string(),
    })).query(({ input }) => {
        return prisma.contract.findFirst({
            where: {
                id: input.id,
            }
        });
    }),
    signContract: protectedProcedure.input(z.object({
        id: z.string(),
        signatureUrl: z.string(),
    })).mutation(({ input: { id, signatureUrl } }) => {
        return prisma.contract.update({
            where: {
                id,
            },
            data: {
                signatureUrl,
            }
        });
    })
});
