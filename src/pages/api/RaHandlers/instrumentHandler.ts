import type { Job, Prisma, Instrument, User } from "@prisma/client";
import { NextResponse } from "next/server";
import { type RaPayload, defaultHandler, getListHandler, getManyHandler, getOneHandler } from "ra-data-simple-prisma";
import { prisma } from "~/server/db";

interface AugmentedInstrument extends Instrument {
    musicians: User[];
    jobs: Job[];
}

export interface RaInstrument extends Instrument {
    musicians: string[];
    jobs: string[];
}

export const instrumentHandler = async (req: { body: RaPayload; }, _: NextResponse) => {
    switch (req.body.method) {
        case "getList":
            return await getListHandler<Prisma.InstrumentFindManyArgs>(req.body, prisma.instrument, {
                include: {
                    musicians: true,
                    jobs: true,
                },
                map: (instruments: Instrument[]): Instrument[] => {
                    return instruments?.map((instrument) => ({
                        ...instrument,
                        musicians: (instrument as AugmentedInstrument).musicians.map((musician: User) => musician.id),
                        jobs: (instrument as AugmentedInstrument).jobs.map((job: Job) => job.id)
                    } as Instrument));
                },
            });
        case "getMany":
            const getManyResult = await getManyHandler<Prisma.InstrumentFindManyArgs>(req.body, prisma.instrument, {
                include: {
                    musicians: true,
                    jobs: true,
                }
            });
            return getManyResult;
        case "getOne":
            const response: { data: AugmentedInstrument; } = await getOneHandler<Prisma.InstrumentFindUniqueArgs>(
                req.body,
                prisma.instrument,
                {
                    include: {
                        musicians: true,
                        jobs: true,
                    },
                },
            );
            const instrument: RaInstrument = {
                ...response.data,
                musicians: response.data.musicians.map((musician: User) => musician.id),
                jobs: response.data.jobs.map((job: Job) => job.id),
            };
            return { data: instrument };
        default:
            return await defaultHandler(req.body, prisma);
    };
};