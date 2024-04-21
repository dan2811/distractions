import { createUploadthing, type FileRouter } from "uploadthing/next-legacy";
import { getServerAuthSession } from "./auth";
import { prisma } from "./db";
import { z } from "zod";
import { sendEmail } from "~/utils/email";
import { getContractReadyEmail } from "~/emails/clients/contractReady";

const f = createUploadthing();
// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  contractUploader: f({ pdf: { maxFileSize: "16MB" } })
    .input(
      z.object({
        eventId: z.string(),
        clientId: z.string(),
      }),
    )
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req, res, input }) => {
      //only allow admins to upload contracts
      const session = await getServerAuthSession({ req, res });
      const isAdmin =
        session?.user.role === "admin" || session?.user.role === "superAdmin";
      if (!isAdmin) throw new Error("Unauthorized");
      return input;
    })
    .onUploadComplete(
      async ({ metadata: { eventId, clientId }, file: { key, name, url } }) => {
        try {
          await prisma.contract.upsert({
            create: {
              id: key,
              name,
              url,
              eventId,
            },
            update: {
              name,
              url,
              signatureUrl: null,
            },
            where: {
              eventId,
            },
          });
        } catch (e) {
          console.error("Error saving contract to DB: ", e);
          throw new Error(`Error saving contract to DB`);
        }
        try {
          const client = await prisma.user.findFirstOrThrow({
            where: {
              id: clientId,
            },
          });
          const emailDetails = getContractReadyEmail(client, eventId);
          const result = await sendEmail(emailDetails);
          if (!result) throw new Error("Error sending email");
        } catch (e) {
          console.error("Error notifying client of new contract: ", e);
        }
      },
    ),
  generalDocumentUploader: f({ pdf: { maxFileSize: "16MB" } })
    .middleware(async ({ req, res }) => {
      //only allow admins to upload contracts
      const session = await getServerAuthSession({ req, res });
      const isAdmin =
        session?.user.role === "admin" || session?.user.role === "superAdmin";
      if (!isAdmin) throw new Error("Unauthorized");
      return { user: session?.user };
    })
    .onUploadComplete(({ file, metadata }) => {
      console.info("General document uploaded", { file, metadata });
    }),
  musicianInvoiceUploader: f({ pdf: { maxFileSize: "1MB" } })
    .input(
      z.object({
        jobId: z.string(),
      }),
    )
    .middleware(async ({ req, res, input }) => {
      const session = await getServerAuthSession({ req, res });
      if (!session) throw new Error("Unauthorized");
      const isMusicianOrAbove =
        session.user.role === "musician" ||
        session.user.role === "admin" ||
        session.user.role === "superAdmin";
      if (!isMusicianOrAbove) throw new Error("Unauthorized");
      return input;
    })
    .onUploadComplete(
      async ({ file: { key, url, size, name }, metadata: { jobId } }) => {
        console.info("Musician invoice uploaded", {
          key,
          url,
          jobId,
          size,
          name,
        });
        try {
          await prisma.invoice.upsert({
            create: {
              id: key,
              url,
              jobId,
            },
            update: {
              url,
            },
            where: {
              jobId,
            },
          });
        } catch (e) {
          console.error("Error saving contract to DB: ", e);
          throw new Error(`Error saving contract to DB`);
        }
      },
    ),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
