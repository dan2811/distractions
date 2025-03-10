/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { NextApiRequest, NextApiResponse } from "next";
import { type RaPayload, defaultHandler } from "ra-data-simple-prisma";
import { prisma } from "~/server/db";
import { userHandler } from "../../server/RaHandlers/userHandler";
import { instrumentHandler } from "../../server/RaHandlers/instrumentHandler";
import { eventHandler } from "../../server/RaHandlers/eventHandler";
import { jobHandler } from "../../server/RaHandlers/jobHandler";
import { packageHandler } from "../../server/RaHandlers/packageHandler";
import { log } from "next-axiom";
import { invoiceHandler } from "../../server/RaHandlers/invoiceHandler";
import { getServerAuthSession } from "~/server/auth";
import { setHandler } from "~/server/RaHandlers/setHandler";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerAuthSession({ req, res });

  if (!session?.user) {
    console.error("THIS IS BAD, SOMEONE TRIED TO CALL THE API WITHOUT AUTH");
    return;
  }

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
    case "set":
      result = await setHandler(req, res);
      break;
    case "package":
      result = await packageHandler(req, res);
      break;
    case "invoice":
      result = await invoiceHandler(req, res);
      break;
    default:
      result = await defaultHandler(req.body as RaPayload, prisma);
      break;
  }
  log.info("REACT_ADMIN_ROUTE_HANDLER", {
    method: req.body.method,
    resource: req.body.resource,
    result,
    session,
  });
  return res.json(result);
};

export default handler;
