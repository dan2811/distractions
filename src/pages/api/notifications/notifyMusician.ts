import { type EmailDetails, sendEmail } from '~/utils/email';
import type { RaJob } from '../RaHandlers/jobHandler';
import { prisma } from '~/server/db';
import { logger } from '~/utils/Logging';

export default async function NotifyMusician(job: RaJob): Promise<void> {
    const { musicianId } = job;
    const musician = await prisma.user.findUnique({
        where: {
            id: musicianId,
        },
    });

    if (!musician) {
        logger.error("MUSICIAN_NOT_FOUND", { musicianId });
        return;
    }

    const emailDetails: EmailDetails = {
        to: musician.email,
        from: process.env.EMAIL_FROM ?? "info@thedistractionsband.co.uk",
        subject: 'New gig offer from The Distractions',
        text: `Hey ${musician.name}, we've got a gig for you. Log in to check the details and respond.`,
        html: `<p>Hey ${musician.name},</p><p>We've got a gig for you.</p><p><a href="${process.env.MAIN_URL}">Log in</a> to check the details and respond!</p>`,
    };

    await sendEmail(emailDetails);
}
