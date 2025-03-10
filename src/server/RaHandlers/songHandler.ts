import type { Prisma, Song, Package } from "@prisma/client";
import type { NextApiResponse } from "next";
import {
  type RaPayload,
  defaultHandler,
  createHandler,
  getListHandler,
  getManyHandler,
  getOneHandler,
  updateHandler,
} from "ra-data-simple-prisma";
import { prisma } from "~/server/db";

interface AugmentedSong extends Song {
  packages: Package[];
}

export interface RaSong extends Song {
  packages: string[];
}

export const songHandler = async (
  req: { body: RaPayload },
  _: NextApiResponse,
) => {
  switch (req.body.method) {
    case "create":
      console.log("yoyoyo", req.body);
      return await createHandler<Prisma.SongCreateArgs>(req.body, prisma.song, {
        connect: {
          packages: "id",
        },
      });
    case "getList":
      return await getListHandler<Prisma.SongFindManyArgs>(
        req.body,
        prisma.song,
        {
          include: {
            packages: true,
          },
          map: (songs: Song[]): Song[] => {
            return songs?.map(
              (song) =>
                ({
                  ...song,
                  packages: (song as AugmentedSong).packages.map(
                    (pack: Package) => pack.id,
                  ),
                }) as Song,
            );
          },
        },
      );
    case "getMany":
      const getManyResult = await getManyHandler<Prisma.SongFindManyArgs>(
        req.body,
        prisma.song,
      );
      return getManyResult;
    case "getOne":
      const response: { data: AugmentedSong } =
        await getOneHandler<Prisma.SongFindUniqueArgs>(req.body, prisma.song, {
          include: {
            packages: true,
          },
        });
      const song: RaSong = {
        ...response.data,
        packages: response.data.packages.map((pack: Package) => pack.id),
      };
      return { data: song };
    case "update":
      try {
        const res = await updateHandler<Prisma.SongUpdateArgs>(
          req.body,
          prisma.song,
          {
            set: {
              packages: "id",
            },
          },
        );
        console.log("UPDATE RES: ", res);
        return res;
      } catch (e) {
        console.error(`Error updating event: `, e as Record<string, unknown>);
        throw new Error(`Error updating event`);
      }
    default:
      return await defaultHandler(req.body, prisma);
  }
};
