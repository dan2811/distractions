import sgMail from "@sendgrid/mail";
import { env } from "~/env.mjs";

export interface EmailDetails {
  to: string | null;
  from: string;
  subject: string;
  text: string;
  html: string;
}

export const sendEmail = async (emailDetails: EmailDetails) => {
  sgMail.setApiKey(env.SENDGRID_API_KEY);

  if (process.env.NODE_ENV === "development") {
    console.info(
      "Not sending email in development mode, would've sent this: ",
      emailDetails,
    );
    return;
  }

  try {
    if (!emailDetails.to) {
      console.error("Email not sent. No email for user.", { emailDetails });
      return;
    }
    const result = await sgMail.send(
      emailDetails as Omit<EmailDetails, "to"> & {
        to: string;
      },
    );
    console.info("EMAIL_SENT", { emailDetails, sendGridResponse: result });
    return result;
  } catch (e) {
    console.error("Error sending email", e);
    console.error("EMAIL_ERROR", { details: e });
  }
};
