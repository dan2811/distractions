import type { Prisma, Job, Instrument } from "@prisma/client";
import { type RaPayload, defaultHandler, createHandler, getListHandler, getManyHandler, getOneHandler } from "ra-data-simple-prisma";
import { prisma } from "~/server/db";
import NotifyMusician from "../notifications/notifyMusician";
import { logger } from "~/utils/Logging";
import type { NextApiResponse } from "next";

export interface AugmentedJob extends Job {
    Instruments: Instrument[];
}

export interface RaJob extends Job {
    Instruments: string[];
}

export const jobHandler = async (req: { body: RaPayload; }, _: NextApiResponse) => {
    switch (req.body.method) {
        case "create":
            const newJob = await createHandler<Prisma.JobCreateArgs>(req.body, prisma.job, {
                connect: {
                    event: "id",
                    Instruments: "id",
                    musician: "id"
                },
                include: {
                    Instruments: true,
                    musician: true,
                }
            });
            try {
                await NotifyMusician(newJob.data as RaJob);
            } catch (e) {
                console.error("NOTIFY_MUSICIAN_ERROR", { details: e });
            }
            return newJob;
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
            return { data: mappedResult };
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