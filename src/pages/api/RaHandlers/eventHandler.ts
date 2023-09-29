import type { Job, Prisma, Event, Package, Equipment } from "@prisma/client";
import type { NextApiResponse } from "next";
import { type RaPayload, defaultHandler, createHandler, getListHandler, getManyHandler, getOneHandler } from "ra-data-simple-prisma";
import { prisma } from "~/server/db";

interface AugmentedEvent extends Event {
    packages: Package[];
    Equipment: Equipment[];
    jobs: Job[];
}

export interface RaEvent extends Event {
    packages: string[];
    Equipment: string[];
    jobs: string[];
}

export const eventHandler = async (req: { body: RaPayload; }, res: NextApiResponse) => {
    switch (req.body.method) {
        case "create":
            return await createHandler<Prisma.EventCreateArgs>(req.body, prisma.event, {
                connect: {
                    EventType: "id",
                    packages: "id",
                    Equipment: "id",
                    owner: "id"
                }
            });
        case "getList":
            return await getListHandler<Prisma.EventFindManyArgs>(req.body, prisma.event, {
                include: {
                    packages: true,
                    jobs: true,
                },
                map: (events: Event[]): Event[] => {
                    return events?.map((event) => ({
                        ...event,
                        packages: (event as AugmentedEvent).packages?.map((pack: Package) => pack.id),
                        job: (event as AugmentedEvent).jobs?.map((job: Job) => job.id)
                    } as Event));
                },
            });
        case "getMany":
            const getManyResult = await getManyHandler<Prisma.EventFindManyArgs>(req.body, prisma.event, {
                include: {
                    packages: true
                }
            });
            res.json(getManyResult);
            break;
        case "getOne":
            const response: { data: AugmentedEvent; } = await getOneHandler<Prisma.EventFindUniqueArgs>(
                req.body,
                prisma.event,
                {
                    include: {
                        packages: true,
                        jobs: true,
                    },
                },
            );
            const event: RaEvent = {
                ...response.data,
                packages: response.data?.packages?.map((pack: Package) => pack.id),
                jobs: response.data?.jobs?.map((job: Job) => job.id),
                Equipment: response.data?.Equipment?.map((equip: Equipment) => equip.id)
            };
            return { data: event };
        default:
            return await defaultHandler(req.body, prisma);
    };
};