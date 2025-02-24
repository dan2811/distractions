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

export const sendWelcomeEmailToMusician = async ({
  name,
  email,
}: {
  name: string;
  email: string;
}) => {
  const emailDetails = {
    from: process.env.EMAIL_FROM ?? "info@thedistractionsband.co.uk",
    to: email,
    subject: "Welcome to the band!",
    html: `
      <p>Hey ${name},</p>
      <p>You've been added to The Distractions online service!</p>
      <p>Login to the app to check everything is working ok, then you'll start receiving emails with gig offers.</p>
      <p><a href="${process.env.MAIN_URL}">Click here to login.</a> Make sure you use this email address to sign in: ${email}</p>
      <p>Let us know if you have any questions or problems.</p>
      <p>Thanks!</p>

      <p> Login link not displaying properly? Copy this link into a browser: ${process.env.MAIN_URL}</p>
    `,
    text: `You've been added to The Distractions online service. Please visit ${process.env.MAIN_URL} to Login.`,
  };

  await sendEmail(emailDetails);
};
