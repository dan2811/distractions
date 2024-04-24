/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { NextApiResponse } from "next";
import { type RaPayload, defaultHandler } from "ra-data-simple-prisma";
import { prisma } from "~/server/db";
import { userHandler } from "./RaHandlers/userHandler";
import { instrumentHandler } from "./RaHandlers/instrumentHandler";
import { eventHandler } from "./RaHandlers/eventHandler";
import { jobHandler } from "./RaHandlers/jobHandler";
import { packageHandler } from "./RaHandlers/packageHandler";
import { log } from "next-axiom";
import { invoiceHandler } from "./RaHandlers/invoiceHandler";

const handler = async (req: { body: RaPayload }, res: NextApiResponse) => {
  let result;
  switch (req.body.resource) {
    case "user":
      result = await userHandler(req, res);
      break;
    case "instrument":
      result = await instrumentHandler(req, res);
      break;
    case "event":
      result = await eventHandler(req, res);
      break;
    case "job":
      result = await jobHandler(req, res);
      break;
    case "package":
      result = await packageHandler(req, res);
      break;
    case "invoice":
      result = await invoiceHandler(req, res);
      break;
    default:
      result = await defaultHandler(req.body, prisma);
      break;
  }
  log.info("REACT_ADMIN_ROUTE_HANDLER", {
    method: req.body.method,
    resource: req.body.resource,
    result,
  });
  return res.json(result);
};

export default handler;
