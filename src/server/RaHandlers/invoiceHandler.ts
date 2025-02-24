import type { Prisma, Invoice } from "@prisma/client";
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

export interface RaInvoice extends Invoice {
  Job: Prisma.SelectAndInclude;
}

export const invoiceHandler = async (
  req: { body: RaPayload },
  _: NextApiResponse,
) => {
  switch (req.body.method) {
    case "create":
      return await createHandler<Prisma.InvoiceCreateArgs>(
        req.body,
        prisma.invoice,
      );
    case "getList":
      return await getListHandler<Prisma.InvoiceFindManyArgs>(
        req.body,
        prisma.invoice,
        {
          include: {
            Job: {
              include: {
                musician: true,
                event: true,
                Instruments: true,
              },
            },
          },
        },
      );
    case "getMany":
      const getManyResult = await getManyHandler<Prisma.InvoiceFindManyArgs>(
        req.body,
        prisma.invoice,
        {
          include: {
            Job: {
              include: {
                musician: true,
                event: true,
                Instruments: true,
              },
            },
          },
        },
      );
      return getManyResult;
    case "getOne":
      return await getOneHandler<Prisma.InvoiceFindUniqueArgs>(
        req.body,
        prisma.invoice,
        {
          include: {
            Job: {
              include: {
                musician: true,
                event: true,
                Instruments: true,
              },
            },
          },
        },
      );
    default:
      return await defaultHandler(req.body, prisma);
  }
};
