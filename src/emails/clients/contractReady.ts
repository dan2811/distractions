import type { User } from "@prisma/client";
import { globalColors } from "tailwind.config";
import type { EmailDetails } from "~/utils/email";

export const getContractReadyEmail = (
  client: User,
  eventId: string,
): EmailDetails => ({
  to: client.email ?? "",
  from: process.env.EMAIL_FROM ?? "info@thedistractionsband.co.uk",
  subject: "Your contract is ready to sign",
  text: `Please visit ${process.env.MAIN_URL} to sign your contract`,
  html: `<body >
  <table width="100%" border="0" cellspacing="20" cellpadding="0"
    style="background: ${globalColors.main.input}; max-width: 600px; margin: auto; border-radius: 10px;">
    <tr>
      <td align="center"
        style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${globalColors.main.accent};">
        The Distractions Band
      </td>
    </tr>
    <tr>
    <td align="center" style="border-radius: 5px; color: ${globalColors.main.accent}; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; text-decoration: none;">Your event contract is ready to be signed!</td>
    </tr>
    <tr>
      <td align="center" style="border-radius: 5px;"><a href="${process.env.MAIN_URL}/event/${eventId}?tab=2"
          target="_blank"
          style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${globalColors.main.accent}; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid ${globalColors.main.accent}; display: inline-block; font-weight: bold; background: ${globalColors.main.menu}">View Contract</a></td>
    </tr>
  </table>
</body>`,
});
