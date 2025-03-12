import { TRPCError } from "@trpc/server";
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
        include: {
          goodSongs: true,
          badSongs: true,
        },
      });
    }),
  addSongToGoodSongs: protectedProcedure
    .input(
      z.object({
        songId: z.string(),
        setId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input: { songId, setId } }) => {
      const set = await ctx.prisma.set.findUnique({
        where: { id: setId },
        include: { goodSongs: true, badSongs: true },
      });

      if (!set) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Set not found",
        });
      }

      if (set.badSongs.some((s) => s.id === songId)) {
        await ctx.prisma.set.update({
          where: {
            id: setId,
          },
          data: {
            badSongs: {
              disconnect: {
                id: songId,
              },
            },
          },
        });
      }

      if (set.goodSongs.some((s) => s.id === songId)) {
        return ctx.prisma.set.update({
          where: {
            id: setId,
          },
          data: {
            goodSongs: {
              disconnect: {
                id: songId,
              },
            },
          },
        });
      }
      return ctx.prisma.set.update({
        where: {
          id: setId,
        },
        data: {
          goodSongs: {
            connect: {
              id: songId,
            },
          },
        },
      });
    }),
  addSongToBadSongs: protectedProcedure
    .input(
      z.object({
        songId: z.string(),
        setId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input: { songId, setId } }) => {
      const set = await ctx.prisma.set.findUnique({
        where: { id: setId },
        include: { badSongs: true, goodSongs: true },
      });

      if (!set) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Set not found",
        });
      }

      if (set.goodSongs.some((s) => s.id === songId)) {
        await ctx.prisma.set.update({
          where: {
            id: setId,
          },
          data: {
            goodSongs: {
              disconnect: {
                id: songId,
              },
            },
          },
        });
      }

      if (set.badSongs.some((s) => s.id === songId)) {
        return ctx.prisma.set.update({
          where: {
            id: setId,
          },
          data: {
            badSongs: {
              disconnect: {
                id: songId,
              },
            },
          },
        });
      }
      return ctx.prisma.set.update({
        where: {
          id: setId,
        },
        data: {
          badSongs: {
            connect: {
              id: songId,
            },
          },
        },
      });
    }),
});
