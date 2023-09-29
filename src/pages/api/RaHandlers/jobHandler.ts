import type { Prisma, Job, Package, Equipment, Instrument } from "@prisma/client";
import type { NextApiResponse } from "next";
import { type RaPayload, defaultHandler, createHandler, getListHandler, getManyHandler, getOneHandler } from "ra-data-simple-prisma";
import { prisma } from "~/server/db";

export interface AugmentedJob extends Job {
    Instruments: Instrument[];
}

export interface RaJob extends Job {
    Instruments: string[];
}

export const jobHandler = async (req: { body: RaPayload; }, res: NextApiResponse) => {
    switch (req.body.method) {
        case "create":
            return await createHandler<Prisma.JobCreateArgs>(req.body, prisma.job, {
                connect: {
                    event: "id",
                    instruments: "id",
                    musician: "id"
                }
            });
        case "getList":
            return await getListHandler<Prisma.JobFindManyArgs>(req.body, prisma.job, {
                include: {
                    Instruments: true,
                    musician: true,
                },
                map: (jobs: Job[]): Job[] => {
                    return jobs?.map((job) => ({
                        ...job,
                        Instruments: (job as AugmentedJob).Instruments?.map((instr: Instrument) => instr.id)
                    } as Job));
                },
            });
        case "getMany":
            const getManyResult: { data: AugmentedJob[]; } = await getManyHandler<Prisma.JobFindManyArgs>(req.body, prisma.job, {
                include: {
                    Instruments: true,
                    musician: true
                },
            });
            const mappedResult = getManyResult.data.map((job: Job) => ({
                ...job,
                Instruments: (job as AugmentedJob).Instruments?.map((instr: Instrument) => instr.id)
            }));
            res.json({ data: mappedResult });
            break;
        case "getOne":
            const response: { data: AugmentedJob; } = await getOneHandler<Prisma.JobFindUniqueArgs>(
                req.body,
                prisma.job,
                {
                    include: {
                        Instruments: true,
                        musician: true
                    },
                },
            );
            const job: RaJob = {
                ...response.data,
                Instruments: response.data.Instruments?.map((instr: Instrument) => instr.id),
            };
            return { data: job };
        default:
            return await defaultHandler(req.body, prisma);
    };
};