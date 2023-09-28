/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { Instrument, Prisma, User } from "@prisma/client";
import type { NextApiResponse } from "next";
import { type RaPayload, defaultHandler, createHandler, deleteHandler, deleteManyHandler, getListHandler, getManyHandler, getManyReferenceHandler, getOneHandler, updateHandler, updateManyHandler } from "ra-data-simple-prisma";
import { prisma } from "~/server/db";

export interface RaUser extends User {
    instruments: string[];
}

export default async function handler(req: { body: RaPayload; }, res: NextApiResponse) {
    let result;
    switch (req.body.resource) {
        case "user":
            result = await userHandler(req, res);
            break;
        default:
            result = await defaultHandler(req.body, prisma);
            break;
    };
    res.json(result);
}

const userHandler = async (req: { body: RaPayload; }, res: NextApiResponse) => {
    switch (req.body.method) {
        case "create":
            return await createHandler<Prisma.UserCreateArgs>(req.body, prisma.user, {
                connect: {
                    instruments: "id",
                },
            });
        case "delete":
            return await deleteHandler<Prisma.UserDeleteArgs>(req.body, prisma.user, {
                softDeleteField: "deletedAt",
            });
        case "deleteMany":
            return await deleteManyHandler(req.body, prisma.user, {
                softDeleteField: "deletedAt",
            });
        case "getList":
            interface UserWithInstruments extends User {
                instruments: Instrument[];
            }
            return await getListHandler<Prisma.UserFindManyArgs>(req.body, prisma.user, {
                debug: true,
                include: { instruments: true },
                map: (users: User[]): User[] => {
                    return users?.map((user) => ({
                        ...user, instruments: (user as UserWithInstruments).instruments.map((instr: Instrument) => instr.id)
                    } as User));
                },
            });
        case "getMany":
            const getManyResult = await getManyHandler<Prisma.UserFindManyArgs>(req.body, prisma.user, {
                include: {
                    instruments: true
                }
            });
            res.json(getManyResult);
            break;
        case "getManyReference":
            await getManyReferenceHandler<Prisma.UserFindManyArgs>(
                req.body,
                prisma.user,
            );
            break;
        case "getOne":
            const getOneRes: { data: AugmentedUser; } = await getOneHandler<Prisma.UserFindUniqueArgs>(
                req.body,
                prisma.user,
                {
                    debug: true,
                    include: {
                        instruments: true,
                    }
                },
            );
            interface AugmentedUser extends User {
                instruments: Instrument[];
            };

            const user: RaUser = {
                ...getOneRes.data,
                instruments: getOneRes.data.instruments.map((instr) => instr.id)
            };
            return { data: user };
        case "update":
            return await updateHandler<Prisma.UserUpdateArgs>(
                req.body,
                prisma.user,
                {
                    skipFields: {
                        computedField: true
                    },
                    set: {
                        tags: "id",
                    },
                    allowNestedUpdate: {
                        user_settings: true,
                        fixed_settings: false,
                    },
                    allowNestedUpsert: {
                        other_settings: true
                    },
                    allowJsonUpdate: {
                        raw_data_field: true
                    }
                }
            );
        case "updateMany":
            await updateManyHandler(
                req.body,
                prisma.user,
                {
                    skipFields: {
                        computedField: true
                    },
                    set: {
                        tags: "id",
                    },
                }
            );
            break;
        default:
            await defaultHandler(req.body, prisma);
            break;
    };
};