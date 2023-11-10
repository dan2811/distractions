import {
    createTRPCRouter, protectedProcedure,
} from "~/server/api/trpc";
import { prisma } from "~/server/db";

export const generalDocumentRouter = createTRPCRouter({
    getGeneralDocuments: protectedProcedure.query(() => {
        return prisma.generalDocument.findMany();
    })
});
