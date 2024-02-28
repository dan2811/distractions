import type { User } from "@prisma/client";
import type { EmailDetails } from "~/utils/email";

export const getNewGigForMusicianEmail = (musician: User): EmailDetails => ({
  to: musician.email,
  from: process.env.EMAIL_FROM ?? "info@thedistractionsband.co.uk",
  subject: "New Distractions Gig",
  text: `Hey ${musician.name}, we've got a gig for you. Log in to check the details and respond.`,
  html: `<p>Hey ${musician.name},</p><p>We've got a gig for you.</p><p><a href="${process.env.MAIN_URL}">Log in</a> to check the details and respond!</p>`,
});
