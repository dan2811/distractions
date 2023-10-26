import { createUploadthing, type FileRouter } from "uploadthing/next-legacy";
import { getServerAuthSession } from "./auth";
import { prisma } from "./db";
import { z } from "zod";
import { type EmailDetails, sendEmail } from "~/utils/email";

const f = createUploadthing();
// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
    // Define as many FileRoutes as you like, each with a unique routeSlug
    contractUploader: f({ pdf: { maxFileSize: "16MB" } })
        .input(z.object({
            eventId: z.string(),
            clientId: z.string()
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
        .onUploadComplete(async ({ metadata: { eventId, clientId }, file: { key, name, url } }) => {
            try {
                await prisma.contract.upsert({
                    create: {
                        id: key,
                        name,
                        url,
                        eventId
                    },
                    update: {
                        name,
                        url,
                        signatureUrl: null
                    },
                    where: {
                        eventId
                    }
                });
            } catch (e) {
                console.error("Error saving contract to DB: ", e);
                throw new Error(`Error saving contract to DB`);
            };
            try {
                const client = await prisma.user.findFirstOrThrow({
                    where: {
                        id: clientId
                    }
                });
                const emailDetails: EmailDetails = {
                    to: client.email,
                    from: process.env.EMAIL_FROM ?? "info@thedistractionsband.co.uk",
                    subject: "Your contract is ready to sign",
                    text: `Please visit ${process.env.MAIN_URL} to sign your contract`,
                    html: `<span>Hey ${client.given_name ?? client.name}</span><br><span>Please <a href="${process.env.MAIN_URL}/event/${eventId}?tab=2">login</a> to sign your contract.</span><br><span>Thanks, The Distractions Band Ltd.</span>`
                };
                const result = await sendEmail(emailDetails);
                if (!result) throw new Error("Error sending email");
            } catch (e) {
                console.error("Error notifying client of new contract: ", e);
            }
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;