import { z } from "zod";

import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import { prisma } from "~/server/db";
import { Role } from "~/types";

export const userRouter = createTRPCRouter({
  update: protectedProcedure
    .input(
      z.object({
        email: z.string().optional(),
        phone: z.string().optional(),
        instruments: z.array(z.string()).optional(),
        address: z.string().optional(),
        emergencyContactName: z.string().optional(),
        emergencyContactPhone: z.string().optional(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return prisma.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          ...input,
          instruments: {
            set: input.instruments?.map((instrument) => ({
              id: instrument,
            })),
          },
        },
      });
    }),
  getUser: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(({ input }) => {
      return prisma.user.findFirst({
        where: {
          id: input.id,
        },
      });
    }),
  listUsers: adminProcedure
    .input(
      z
        .object({
          roles: z.array(Role).optional(),
          instruments: z.array(z.string()).optional(),
        })
        .optional(),
    )
    .query(({ input }) => {
      const filter = {} as Record<string, unknown>;
      if (input?.roles) {
        filter.role = {
          in: input?.roles,
        };
      }
      if (input?.instruments) {
        filter.instruments = {
          some: {
            id: {
              in: input.instruments,
            },
          },
        };
      }

      return prisma.user.findMany({
        where: filter,
      });
    }),
});
