import { logger } from "~/utils/Logging";
import sgMail from "@sendgrid/mail";

export interface EmailDetails {
    to: string,
    from: string,
    subject: string,
    text: string,
    html: string,
}

export const sendEmail = async (emailDetails: EmailDetails) => {
    if (!process.env.SENDGRID_API_KEY) {
        // We should never see this, because env variables are checked on startup. 
        // But this allows typescript to infer the type as not null.
        throw new Error("SENDGRID_API_KEY not set");
    }
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    try {
        const result = await sgMail.send(emailDetails);
        logger.info("EMAIL_SENT", { emailDetails, sendGridResponse: result });
        return result;
    } catch (e) {
        logger.error("EMAIL_ERROR", { details: e });
    }
};