import type { Prisma, Job, Instrument } from "@prisma/client";
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
import NotifyMusician from "~/server/notifications/notifyMusician";
import type { NextApiResponse } from "next";

export interface AugmentedJob extends Job {
  Instruments: Instrument[];
}

export interface RaJob extends Job {
  Instruments: string[];
}

export const jobHandler = async (
  req: { body: RaPayload },
  _: NextApiResponse,
) => {
  switch (req.body.method) {
    case "create":
      console.log("req.body", req.body);

      if (!Object.hasOwn(req.body.params.data, "wages")) {
        throw new Error("Wage ID is required", { cause: "MISSING_WAGE_ID" });
      }
      const wageId: string = req.body.params.data.wages! as string;

      if (!wageId) {
        throw new Error("Wage ID is required", { cause: "MISSING_WAGE_ID" });
      }

      const wage = await prisma.wages.findUniqueOrThrow({
        where: { id: wageId },
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { wages, ...dataWithoutWages } = req.body.params.data;
      const data = { ...dataWithoutWages, pay: parseInt(wage.amount, 10) };

      req.body.params.data = data as unknown as Prisma.JobCreateArgs["data"];
      const newJob = await createHandler<Prisma.JobCreateArgs>(
        req.body,
        prisma.job,
        {
          connect: {
            event: "id",
            Instruments: "id",
            musician: "id",
          },
          include: {
            Instruments: true,
            musician: true,
          },
        },
      );
      try {
        await NotifyMusician(newJob.data as RaJob);
      } catch (e) {
        console.error("NOTIFY_MUSICIAN_ERROR", { details: e });
      }
      return newJob;
    case "getList":
      return await getListHandler<Prisma.JobFindManyArgs>(
        req.body,
        prisma.job,
        {
          include: {
            Instruments: true,
            musician: true,
          },
          map: (jobs: Job[]): Job[] => {
            return jobs?.map(
              (job) =>
                ({
                  ...job,
                  Instruments: (job as AugmentedJob).Instruments?.map(
                    (instr: Instrument) => instr.id,
                  ),
                }) as Job,
            );
          },
        },
      );
    case "getMany":
      const getManyResult: { data: AugmentedJob[] } =
        await getManyHandler<Prisma.JobFindManyArgs>(req.body, prisma.job, {
          include: {
            Instruments: true,
            musician: true,
          },
        });
      const mappedResult = getManyResult.data.map((job: Job) => ({
        ...job,
        Instruments: (job as AugmentedJob).Instruments?.map(
          (instr: Instrument) => instr.id,
        ),
      }));
      return { data: mappedResult };
    case "getOne":
      const response: { data: AugmentedJob } =
        await getOneHandler<Prisma.JobFindUniqueArgs>(req.body, prisma.job, {
          include: {
            Instruments: true,
            musician: true,
          },
        });
      const job: RaJob = {
        ...response.data,
        Instruments: response.data.Instruments?.map(
          (instr: Instrument) => instr.id,
        ),
      };
      return { data: job };
    case "update":
      try {
        const res = await updateHandler<Prisma.JobUpdateArgs>(
          req.body,
          prisma.job,
          {
            set: {
              Instruments: "id",
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
