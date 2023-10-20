import { createUploadthing, type FileRouter } from "uploadthing/next-legacy";
import { getServerAuthSession } from "./auth";
import { prisma } from "./db";
import { z } from "zod";

const f = createUploadthing();
// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
    // Define as many FileRoutes as you like, each with a unique routeSlug
    contractUploader: f({ pdf: { maxFileSize: "16MB" } })
        .input(z.object({
            eventId: z.string()
        }))
        // Set permissions and file types for this FileRoute
        .middleware(async ({ req, res, input }) => {
            //only allow admins to upload contracts
            const session = await getServerAuthSession({ req, res });
            const isAdmin = session?.user.role === "admin" || session?.user.role === "superAdmin";
            if (!isAdmin) throw new Error("Unauthorized");
            // Whatever is returned here is accessible in onUploadComplete as `metadata`
            return input;
        })
        .onUploadComplete(async ({ metadata: { eventId }, file: { key, name, url } }) => {
            await prisma.contract.upsert({
                create: {
                    id: key,
                    name,
                    url,
                    eventId
                },
                update: {
                    name,
                    url
                },
                where: {
                    eventId
                }
            });
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;