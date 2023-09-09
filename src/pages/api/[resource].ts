import { type RaPayload, defaultHandler } from "ra-data-simple-prisma";
import { prisma } from "~/server/db";

export default async function handler(req: { body: RaPayload; }, res: {
    json: (input: unknown) => void;
}) {
    const result = await defaultHandler(req.body, prisma);
    res.json(result);
}