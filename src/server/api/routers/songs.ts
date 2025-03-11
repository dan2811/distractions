import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const songRouter = createTRPCRouter({
  listSongs: protectedProcedure
    .input(
      z.object({
        setId: z.string().optional(),
      }),
    )
    .query(({ ctx, input: { setId } }) => {
      return ctx.prisma.song.findMany({
        where: {
          packages: {
            some: {
              sets: {
                some: {
                  id: setId,
                },
              },
            },
          },
        },
      });
    }),
});
