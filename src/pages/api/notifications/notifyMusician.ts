import { sendEmail } from "~/utils/email";
import type { RaJob } from "../RaHandlers/jobHandler";
import { prisma } from "~/server/db";
import { getNewGigForMusicianEmail } from "~/emails/musicians/musicians";

export default async function NotifyMusician(job: RaJob): Promise<void> {
  const { musicianId } = job;
  const musician = await prisma.user.findUnique({
    where: {
      id: musicianId,
    },
  });

  if (!musician) {
    console.error("MUSICIAN_NOT_FOUND", { musicianId });
    return;
  }

  const emailDetails = getNewGigForMusicianEmail(musician);

  await sendEmail(emailDetails);
}
