import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const setRouter = createTRPCRouter({
  getSet: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(({ ctx, input: { id } }) => {
      return ctx.prisma.set.findUnique({
        where: {
          id,
        },
      });
    }),
});
