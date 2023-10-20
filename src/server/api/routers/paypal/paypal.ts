import { z } from "zod";
import {
    adminProcedure,
    createTRPCRouter, protectedProcedure,
} from "~/server/api/trpc";
import { createDraftDepositInvoice, sendInvoice } from "./helper";

export const paypalRouter = createTRPCRouter({
    createDraftDepositInvoice: protectedProcedure.input(
        z.object({
            client: z.object({
                id: z.string(),
                name: z.string(),
                surname: z.string(),
                email: z.string()
            }),
            amount: z.string(),
            event: z.object({
                id: z.string(),
                name: z.string(),
                date: z.date()
            })
        })
    ).mutation(({ input: { amount, client, event } }) => {
        return createDraftDepositInvoice(amount, client, event);
    }),
    sendInvoice: adminProcedure.input(
        z.object({
            invoiceId: z.string(),
            type: z.union([z.literal("deposit"), z.literal("final")])
        })).mutation(async ({ input: { invoiceId, type } }) => {
            return sendInvoice(invoiceId, type);
        })
});