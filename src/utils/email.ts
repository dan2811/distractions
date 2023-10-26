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

    if (process.env.NODE_ENV === "development") {
        console.log("Not sending email in development mode, would've sent this: ", emailDetails);
        return;
    }

    try {
        const result = await sgMail.send(emailDetails);
        logger.info("EMAIL_SENT", { emailDetails, sendGridResponse: result });
        return result;
    } catch (e) {
        logger.error("EMAIL_ERROR", { details: e });
    }
};