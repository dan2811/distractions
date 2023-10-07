import sgMail from "@sendgrid/mail";
import { globalColors } from "tailwind.config";

export const sendVerificationRequest = async (params: { identifier: string, url: string; }) => {
    const { identifier: recipientEmailAddress, url } = params;
    const appName = "The Distractions Band";

    if (!process.env.SENDGRID_API_KEY) {
        // We should never see this, because env variables are checked on startup. 
        // But this allows typescript to infer the type as not null.
        throw new Error("SENDGRID_API_KEY not set");
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const emailDetails = {
        to: recipientEmailAddress,
        from: process.env.EMAIL_FROM ?? "info@thedistractionsband.co.uk",
        subject: "Sign in to The Distractions Band",
        text: text(appName, url),
        html: html(appName, url),
    };

    try {
        const result = await sgMail.send(emailDetails);
        console.log(JSON.stringify(result));
    } catch (e) {
        console.log(e);
    }
};

function html(appName: string, url: string) {

    const color = {
        background: globalColors.main.dark,
        text: globalColors.main.accent,
        mainBackground: globalColors.main.input,
        buttonBackground: globalColors.main.menu,
        buttonBorder: globalColors.main.accent,
        buttonText: globalColors.main.accent,
    };

    return `
<body>
  <table width="100%" border="0" cellspacing="20" cellpadding="0"
    style="background: ${color.mainBackground}; max-width: 600px; margin: auto; border-radius: 10px;">
    <tr>
      <td align="center"
        style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
        ${appName}
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="border-radius: 5px;" bgcolor="${color.buttonBackground}"><a href="${url}"
                target="_blank"
                style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${color.buttonText}; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid ${color.buttonBorder}; display: inline-block; font-weight: bold;">Sign
                in</a></td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td align="center"
        style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
        If you did not request this email you can safely ignore it.
      </td>
    </tr>
  </table>
</body>
`;
}

/** Email Text body (fallback for email clients that don't render HTML) */
function text(appName: string, url: string) {
    return `To sign in to ${appName}, use this link: ${url}`;
}


