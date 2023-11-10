import type { Instrument, Job, Prisma, User } from "@prisma/client";
import type { NextApiResponse } from "next";
import { type RaPayload, defaultHandler, createHandler, getListHandler, getManyHandler, getOneHandler, updateHandler } from "ra-data-simple-prisma";
import { prisma } from "~/server/db";

interface AugmentedUser extends User {
    instruments: Instrument[];
    jobs: Job[];
}

export interface RaUser extends User {
    instruments: string[];
    jobs: string[];
}

export const userHandler = async (req: { body: RaPayload; }, _: NextApiResponse) => {
    switch (req.body.method) {
        case "create":
            return await createHandler<Prisma.UserCreateArgs>(req.body, prisma.user, {
                connect: {
                    instruments: "id",
                },
            });
        case "getList":
            return await getListHandler<Prisma.UserFindManyArgs>(req.body, prisma.user, {
                include: {
                    instruments: true,
                    jobs: true,
                },
                map: (users: User[]): User[] => {
                    return users?.map((user) => ({
                        ...user,
                        instruments: (user as AugmentedUser).instruments.map((instr: Instrument) => instr.id),
                        job: (user as AugmentedUser).jobs.map((job: Job) => job.id)
                    } as User));
                },
            });
        case "getMany":
            const getManyResult = await getManyHandler<Prisma.UserFindManyArgs>(req.body, prisma.user, {
                include: {
                    instruments: true
                }
            });
            return getManyResult;
        case "getOne":
            const response: { data: AugmentedUser; } = await getOneHandler<Prisma.UserFindUniqueArgs>(
                req.body,
                prisma.user,
                {
                    include: {
                        instruments: true,
                        jobs: true,
                    },
                },
            );
            const user: RaUser = {
                ...response.data,
                instruments: response.data?.instruments?.map((instrument: Instrument) => instrument.id),
                jobs: response.data?.jobs?.map((job: Job) => job.id),
            };
            return { data: user };
        case "update":
            const updateResult: { data: AugmentedUser; } = await updateHandler<Prisma.UserUpdateArgs>(
                req.body,
                prisma.user,
                {
                    set: {
                        instruments: "id",
                        jobs: "id",
                    },
                    include: {
                        instruments: true,
                        jobs: true,
                    },
                },
            );
            const updatedUser: RaUser = {
                ...updateResult.data,
                instruments: updateResult.data?.instruments?.map((instrument: Instrument) => instrument.id),
                jobs: updateResult.data?.jobs?.map((job: Job) => job.id),
            };
            return { data: updatedUser };
        default:
            return await defaultHandler(req.body, prisma);
    };
};