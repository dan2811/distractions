import { z } from "zod";

import {
  createTRPCRouter, protectedProcedure,
} from "~/server/api/trpc";
import { prisma } from "~/server/db";

export const userRouter = createTRPCRouter({
  update: protectedProcedure.input(z.object({
    email: z.string().optional(),
    phone: z.string().optional(),
  })).mutation(({ ctx, input }) => {
    return prisma.user.update({
      where: {
        id: ctx.session.user.id,
      },
      data: input
    });
  }),
});
