import type { Prisma, Set, Event, Song } from "@prisma/client";
import type { NextApiResponse } from "next";
import {
  type RaPayload,
  defaultHandler,
  createHandler,
  getListHandler,
  getManyHandler,
  getOneHandler,
} from "ra-data-simple-prisma";
import { prisma } from "~/server/db";

interface AugmentedSet extends Set {
  badSongs: Song[];
  goodSongs: Song[];
}

export interface RaSet extends Set {
  badSongs: string[];
  goodSongs: string[];
}

export const setHandler = async (
  req: { body: RaPayload },
  _: NextApiResponse,
) => {
  switch (req.body.method) {
    case "create":
      console.log("INPUT YO: ", req.body);
      const { eventId, ...dataWithoutEventId } = req.body.params.data;
      const renamedData = { ...dataWithoutEventId, event: eventId as string };
      req.body.params.data =
        renamedData as unknown as Prisma.SetCreateArgs["data"];
      return await createHandler<Prisma.SetCreateArgs>(req.body, prisma.set, {
        connect: {
          event: "id",
          package: "id",
        },
      });
    case "getList":
      return await getListHandler<Prisma.SetFindManyArgs>(
        req.body,
        prisma.set,
        {
          include: {
            badSongs: true,
            goodSongs: true,
          },
          map: (sets: Set[]): Set[] => {
            return sets?.map(
              (set) =>
                ({
                  ...set,
                  badSongs: (set as AugmentedSet).badSongs.map(
                    (song: Song) => song.id,
                  ),
                  goodSongs: (set as AugmentedSet).goodSongs.map(
                    (song: Song) => song.id,
                  ),
                }) as Set,
            );
          },
        },
      );
    case "getMany":
      const getManyResult = await getManyHandler<Prisma.SetFindManyArgs>(
        req.body,
        prisma.set,
      );
      return getManyResult;
    case "getOne":
      const response: { data: AugmentedSet } =
        await getOneHandler<Prisma.SetFindUniqueArgs>(req.body, prisma.set, {
          include: {
            goodSongs: true,
            badSongs: true,
          },
        });
      const set: RaSet = {
        ...response.data,
        badSongs: response.data.badSongs.map((song: Song) => song.id),
        goodSongs: response.data.goodSongs.map((song: Song) => song.id),
      };
      return { data: set };
    default:
      return await defaultHandler(req.body, prisma);
  }
};
