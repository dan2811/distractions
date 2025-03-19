import type {
  Job,
  Prisma,
  Event,
  Package,
  Equipment,
  Contract,
  Set,
} from "@prisma/client";
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
import {
  createDraftDepositInvoice,
  createDraftFinalInvoice,
} from "~/server/api/routers/paypal/helper";
import { prisma } from "~/server/db";

interface AugmentedEvent extends Event {
  packages: Package[];
  Equipment: Equipment[];
  jobs: Job[];
  contract: Contract;
  sets: Set[];
}

export interface RaEvent extends Event {
  packages: string[];
  Equipment: string[];
  jobs: string[];
  contract: string;
  sets: string[];
}

export const eventHandler = async (
  req: { body: RaPayload },
  _: NextApiResponse,
) => {
  switch (req.body.method) {
    case "create":
      const newEvent: {
        data: Prisma.EventGetPayload<{
          include: {
            owner: true;
          };
        }>;
      } = await createHandler<Prisma.EventCreateArgs>(req.body, prisma.event, {
        connect: {
          EventType: "id",
          packages: "id",
          Equipment: "id",
          owner: "id",
        },
        include: {
          owner: true,
        },
      });
      const { deposit, price, owner } = newEvent.data;
      await createDraftDepositInvoice(deposit.toString(), owner, newEvent.data);
      await createDraftFinalInvoice(price.toString(), owner, newEvent.data);
      return newEvent;
    case "getList":
      return await getListHandler<Prisma.EventFindManyArgs>(
        req.body,
        prisma.event,
        {
          include: {
            packages: true,
            jobs: true,
            contract: true,
          },
          map: (events: Event[]): Event[] => {
            return events?.map(
              (event) =>
                ({
                  ...event,
                  packages: (event as AugmentedEvent).packages?.map(
                    (pack: Package) => pack.id,
                  ),
                  job: (event as AugmentedEvent).jobs?.map(
                    (job: Job) => job.id,
                  ),
                  contract: (event as AugmentedEvent).contract?.id,
                }) as Event,
            );
          },
        },
      );
    case "getMany":
      return getManyHandler<Prisma.EventFindManyArgs>(req.body, prisma.event, {
        include: {
          packages: true,
        },
        transform(data: AugmentedEvent[]) {
          return data.map(
            (event) =>
              ({
                ...event,
                packages: event.packages?.map((pack: Package) => pack.id),
                job: event.jobs?.map((job: Job) => job.id),
                contract: event.contract?.id,
              }) as Event,
          );
        },
      });
    case "getOne":
      const response: { data: AugmentedEvent } =
        await getOneHandler<Prisma.EventFindUniqueArgs>(
          req.body,
          prisma.event,
          {
            include: {
              packages: true,
              jobs: true,
              contract: true,
              sets: true,
            },
          },
        );
      const event: RaEvent = {
        ...response.data,
        packages: response.data?.packages?.map((pack: Package) => pack.id),
        jobs: response.data?.jobs?.map((job: Job) => job.id),
        Equipment: response.data?.Equipment?.map(
          (equip: Equipment) => equip.id,
        ),
        contract: response.data?.contract?.id,
        sets: response.data?.sets?.map((set) => set.id),
      };

      return { data: event };
    case "update":
      try {
        const res = await updateHandler<Prisma.EventUpdateArgs>(
          req.body,
          prisma.event,
          {
            set: {
              EventType: "id",
              packages: "id",
              Equipment: "id",
              owner: "id",
              sets: "id",
            },
            skipFields: {
              jobs: true,
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
      console.log("USING DEFAULT RA HANDLER");
      return await defaultHandler(req.body, prisma);
  }
};
