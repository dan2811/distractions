import type { Prisma, Package, Event } from "@prisma/client";
import type { NextApiResponse } from "next";
import { type RaPayload, defaultHandler, createHandler, getListHandler, getManyHandler, getOneHandler } from "ra-data-simple-prisma";
import { prisma } from "~/server/db";

interface AugmentedPackage extends Package {
    events: Event[];
}

export interface RaPackage extends Package {
    events: string[];
}

export const packageHandler = async (req: { body: RaPayload; }, res: NextApiResponse) => {
    switch (req.body.method) {
        case "create":
            return await createHandler<Prisma.PackageCreateArgs>(req.body, prisma.package);
        case "getList":
            return await getListHandler<Prisma.PackageFindManyArgs>(req.body, prisma.package, {
                include: {
                    events: true,
                },
                map: (packages: Package[]): Package[] => {
                    return packages?.map((pack) => ({
                        ...pack,
                        events: (pack as AugmentedPackage).events.map((event: Event) => event.id),
                    } as Package));
                },
            });
        case "getMany":
            const getManyResult = await getManyHandler<Prisma.PackageFindManyArgs>(req.body, prisma.package, {
                include: {
                    events: true
                }
            });
            return getManyResult;
        case "getOne":
            const response: { data: AugmentedPackage; } = await getOneHandler<Prisma.PackageFindUniqueArgs>(
                req.body,
                prisma.package,
                {
                    include: {
                        events: true,
                    },
                },
            );
            const pack: RaPackage = {
                ...response.data,
                events: response.data?.events?.map((event: Event) => event.id),
            };
            return { data: pack };
        default:
            return await defaultHandler(req.body, prisma);
    };
};