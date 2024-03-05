import type { Event, User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { prisma } from "~/server/db";
import {
  paypalInvoiceSchema,
  type PaypalAccountType,
  type PaypalInvoice,
} from "~/types";
import { logger } from "~/utils/Logging";

const getEncodedPaypalData = (type: PaypalAccountType) => {
  if (type === "deposit") {
    return Buffer.from(
      process.env.PAYPAL_CLIENT_ID + ":" + process.env.PAYPAL_CLIENT_SECRET,
    ).toString("base64");
  } else {
    return Buffer.from(
      process.env.PAYPAL_FINAL_BALANCE_CLIENT_ID +
        ":" +
        process.env.PAYPAL_FINAL_BALANCE_SECRET,
    ).toString("base64");
  }
};

interface PaypalAccessTokenResponse {
  // comma separated list of scopes
  scope: string;
  access_token: string;
  token_type: "Bearer";
  app_id: string;
  // seconds until expiry
  expires_in: number;
  nonce: string;
}

export const getPaypalAccessToken = async (type: PaypalAccountType) => {
  console.info("PAYPAL_ACCESS_TOKEN_REQUESTED");

  const existingTokens = await prisma.paypalAccessToken.findMany({
    select: {
      createdAt: true,
      expires_in: true,
      access_token: true,
    },
    where: {
      AND: {
        createdAt: {
          gte: new Date(Date.now() - 3600 * 1000),
        },
        account: {
          equals: type,
        },
      },
    },
  });

  const validTokens = existingTokens.filter(
    (token) =>
      new Date(token.createdAt).getTime() + token.expires_in * 1000 >
      Date.now(),
  );

  if (validTokens[0]) {
    console.info("FOUND_EXISTING_VALID_PAYPAL_ACCESS_TOKEN");
    return validTokens[0].access_token;
  }

  const endpoint = "/v1/oauth2/token?grant_type=client_credentials";
  const encodedData = getEncodedPaypalData(type);
  const hostname = new URL(process.env.PAYPAL_URL!).hostname;
  const options = {
    method: "POST",
    hostname: hostname,
    port: null,
    path: endpoint,
    headers: {
      accept: "application/json",
      "accept-language": "en_US",
      "content-type": "application/x-www-form-urlencoded",
      authorization: `basic ${encodedData}`,
    },
  };

  try {
    const res = await fetch(process.env.PAYPAL_URL + endpoint, options);
    const json = (await res.json()) as PaypalAccessTokenResponse;
    console.info("PAYPAL_ACCESS_TOKEN_REQUEST: ", json);
    const dbResponse = await prisma.paypalAccessToken.create({
      data: { ...json, account: type },
      select: {
        access_token: true,
      },
    });

    console.info("PAYPAL_ACCESS_TOKEN_REQUEST_SUCCESS");

    return dbResponse.access_token;
  } catch (e) {
    console.error("PAYPAL_ACCESS_TOKEN_REQUEST_ERROR: ", { details: e });
    throw new TRPCError({
      message: "Error requesting PayPal access token",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
};

const getInvoicer = (type: PaypalAccountType) => ({
  name: {
    business_name: "The Distractions Band Ltd.",
  },
  address: {
    address_line_1: "The Distractions Band Ltd.",
    address_line_2: "81 Burton Road",
    admin_area_2: "Derby",
    postal_code: "DE1 1TJ",
    country_code: "GB",
  },
  // THIS MUST BE THE EMAIL ADDRESS OF A PAYPAL BUSINESS ACCOUNT
  email_address:
    type === "deposit"
      ? process.env.PAYPAL_DEPOSIT_ACCOUNT_EMAIL
      : process.env.PAYPAL_FINAL_BALANCE_ACCOUNT_EMAIL,
  phones: [
    {
      country_code: "44",
      national_number: "07977991235",
      phone_type: "HOME",
    },
  ],
  website: process.env.MAIN_URL,
});

interface PaypalDraftInvoiceResponse {
  id: string;
  status: string;
  detail: {
    reference: string;
    invoice_date: string;
    currency_code: string;
    note: string;
    term: string;
    memo: string;
    payment_term: {
      term_type: string;
      due_date: string;
    };
    metadata: {
      //ISO string
      create_time: string;
      //ISO string
      last_update_time: string;
      created_by_flow: string;
      recipient_view_url: string;
      invoicer_view_url: string;
    };
  };
}

export const createDraftDepositInvoice = async (
  amount: string,
  client: Pick<User, "id" | "name" | "email" | "surname">,
  event: Pick<Event, "id" | "date" | "name">,
) => {
  const accessToken = await getPaypalAccessToken("deposit");
  try {
    const res = await fetch(`${process.env.PAYPAL_URL}/v2/invoicing/invoices`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        detail: {
          reference: client.id,
          invoice_date: new Date().toISOString().split("T")[0],
          currency_code: "GBP",
          note: "We can't wait for your event.",
          //client will see "term"
          term: "test term",
          //client will not see "memo"
          memo: `Event ID: ${event.id}, Event name: ${event.name}`,
          payment_term: {
            term_type: "DUE_ON_RECEIPT",
            due_date: new Date().toISOString().split("T")[0],
          },
        },
        invoicer: getInvoicer("deposit"),
        primary_recipients: [
          {
            billing_info: {
              name: {
                given_name: client.name,
                surname: client.surname,
              },
              email_address: client.email,
            },
          },
        ],
        items: [
          {
            name: "Deposit",
            description: `Deposit payment required for your event scheduled for ${event.date.toLocaleDateString(
              "en-gb",
            )}`,
            quantity: "1",
            unit_amount: {
              currency_code: "GBP",
              value: amount,
            },
            unit_of_measure: "QUANTITY",
          },
        ],
        configuration: {
          partial_payment: {
            allow_partial_payment: false,
          },
          allow_tip: true,
          tax_calculated_after_discount: true,
          tax_inclusive: true,
        },
        amount: {
          currency_code: "GBP",
          value: amount,
          breakdown: {
            item_total: {
              currency_code: "GBP",
              value: amount,
            },
          },
        },
      }),
    });
    const json = (await res.json()) as PaypalDraftInvoiceResponse;
    console.info("DRAFT_DEPOSIT_INVOICE_CREATED", json);

    try {
      await prisma.event.update({
        where: {
          id: event.id,
        },
        data: {
          depositInvoiceId: json.id,
          adminDepositInvoiceUrl: json.detail.metadata.invoicer_view_url,
          clientDepositInvoiceUrl: json.detail.metadata.recipient_view_url,
        },
      });
    } catch (e) {
      console.error("UPDATE_EVENT_WITH_DEPOSIT_INVOICE_DETAILS_ERROR", {
        details: e,
      });
    }
    return json;
  } catch (e) {
    console.error("PAYPAL_DRAFT_DEPOSIT_INVOICE_ERROR", { details: e });
  }
};

export const createDraftFinalInvoice = async (
  amount: string,
  client: Pick<User, "id" | "name" | "email" | "surname">,
  event: Pick<Event, "id" | "date" | "name">,
) => {
  const accessToken = await getPaypalAccessToken("final");
  try {
    const defaultDueDate = new Date(
      event.date.setDate(
        event.date.getDate() -
          parseInt(process.env.DAYS_BEFORE_EVENT_FINAL_BALANCE_DUE!),
      ),
    );
    const dueDate =
      defaultDueDate.getTime() < Date.now() ? new Date() : defaultDueDate;
    const res = await fetch(`${process.env.PAYPAL_URL}/v2/invoicing/invoices`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        detail: {
          reference: client.id,
          invoice_date: new Date().toISOString().split("T")[0],
          currency_code: "GBP",
          note: "We can't wait for your event.",
          //client will see "term"
          term: "test term",
          //client will not see "memo"
          memo: `Event ID: ${event.id}, Event name: ${event.name}`,
          payment_term: {
            term_type: "DUE_ON_DATE_SPECIFIED",
            due_date: dueDate.toISOString().split("T")[0],
          },
        },
        invoicer: getInvoicer("final"),
        primary_recipients: [
          {
            billing_info: {
              name: {
                given_name: client.name,
                surname: client.surname,
              },
              email_address: client.email,
            },
          },
        ],
        items: [
          {
            name: "Final balance",
            description: `Final payment required for your event scheduled for ${event.date.toLocaleDateString(
              "en-gb",
            )}`,
            quantity: "1",
            unit_amount: {
              currency_code: "GBP",
              value: amount,
            },
            unit_of_measure: "QUANTITY",
          },
        ],
        configuration: {
          partial_payment: {
            allow_partial_payment: true,
          },
          allow_tip: true,
          tax_calculated_after_discount: true,
          tax_inclusive: true,
        },
        amount: {
          currency_code: "GBP",
          value: amount,
          breakdown: {
            item_total: {
              currency_code: "GBP",
              value: amount,
            },
          },
        },
      }),
    });
    const json = (await res.json()) as PaypalDraftInvoiceResponse;
    console.info("DRAFT_FINAL_INVOICE_CREATED", json);

    try {
      await prisma.event.update({
        where: {
          id: event.id,
        },
        data: {
          finalInvoiceId: json.id,
          adminFinalInvoiceUrl: json.detail.metadata.invoicer_view_url,
          clientFinalInvoiceUrl: json.detail.metadata.recipient_view_url,
        },
      });
    } catch (e) {
      console.error("UPDATE_EVENT_WITH_FINAL_INVOICE_DETAILS_ERROR", {
        details: e,
      });
    }

    return json;
  } catch (e) {
    console.error("PAYPAL_DRAFT_FINAL_INVOICE_ERROR", { details: e });
  }
};

export const sendInvoice = async (
  invoiceId: string,
  type: PaypalAccountType,
) => {
  const accessToken = await getPaypalAccessToken(type);
  const { status } = await getInvoice(invoiceId, type);
  if (status !== "DRAFT") {
    throw new TRPCError({
      message: `Invoice cannot be sent, invoice status is ${status}`,
      code: "BAD_REQUEST",
    });
  }

  try {
    console.info(JSON.stringify({ message: "SENDING_INVOICE", invoiceId }));
    const res = await fetch(
      `${process.env.PAYPAL_URL}/v2/invoicing/invoices/${invoiceId}/send`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: "Invoice from The Distractions Band",
          note: "Thank you for your business.",
          send_to_invoicer: true,
          send_to_recipient: true,
        }),
      },
    );

    const paypalResponse = (await res.json()) as {
      name?: string;
      message?: string;
    };

    if (Object.hasOwn(paypalResponse, "name")) {
      throw new Error(`${paypalResponse.name} -${paypalResponse.message}`);
    }
    console.debug("PAYPAL_SEND_INVOICE_RESPONSE", { paypalResponse });

    if (type === "deposit") {
      await prisma.event.update({
        where: {
          depositInvoiceId: invoiceId,
        },
        data: {
          depositInvoiceSent: true,
        },
      });
    } else {
      await prisma.event.update({
        where: {
          finalInvoiceId: invoiceId,
        },
        data: {
          finalInvoiceSent: true,
        },
      });
    }
    return paypalResponse;
  } catch (e) {
    console.error("PAYPAL_SEND_INVOICE_ERROR", { details: e });
    throw new TRPCError({
      message: "Error contacting paypal server",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
};

export const getInvoice = async (
  invoiceId: string,
  type: PaypalAccountType,
): Promise<PaypalInvoice> => {
  const accessToken = await getPaypalAccessToken(type);
  try {
    const res = await fetch(
      `${process.env.PAYPAL_URL}/v2/invoicing/invoices/${invoiceId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    const paypalResponse = (await res.json()) as unknown;
    console.debug("PAYPAL_GET_INVOICE_RESPONSE", { paypalResponse });

    const { success } = paypalInvoiceSchema.safeParse(paypalResponse);

    if (!success) {
      console.warn(
        JSON.stringify({
          path: "server/api/routers/paypal/helper.ts",
          message:
            '"paypal GET invoice response did not have the expected type! This could cause errors!"',
        }),
      );
    }
    return paypalResponse as PaypalInvoice;
  } catch (e) {
    console.error("PAYPAL_GET_INVOICE_ERROR", { details: e });
    throw new TRPCError({
      message: "Error contacting paypal server",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
};

export const deleteInvoice = async (
  invoiceId: string,
  type: PaypalAccountType,
) => {
  const accessToken = await getPaypalAccessToken(type);

  try {
    console.info(
      JSON.stringify({ message: "DELETING_INVOICE", type, invoiceId }),
    );
    const { status } = await fetch(
      `${process.env.PAYPAL_URL}/v2/invoicing/invoices/${invoiceId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    console[status === 204 ? "debug" : "error"](
      "PAYPAL_DELETE_INVOICE_RESPONSE",
      {
        type,
        invoiceId,
        status,
      },
    );

    const where =
      type === "final"
        ? {
            finalInvoiceId: invoiceId,
          }
        : {
            depositInvoiceId: invoiceId,
          };

    const data =
      type === "final"
        ? {
            finalInvoiceId: null,
            adminFinalInvoiceUrl: null,
            clientFinalInvoiceUrl: null,
            finalInvoiceSent: false,
          }
        : {
            depositInvoiceId: null,
            adminDepositInvoiceUrl: null,
            depositInvoiceSent: false,
            clientDepositInvoiceUrl: null,
          };

    if (status === 204) {
      try {
        await prisma.event.update({
          where,
          data,
        });
        return true;
      } catch (e) {
        console.error("Could not update event after deleting paypal invoices", {
          invoiceId,
          type,
        });
        return false;
      }
    }
    return false;
  } catch (e) {
    console.error("PAYPAL_DELETE_INVOICE_ERROR", { details: e });
    throw new TRPCError({
      message: "Error contacting paypal server",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
};

const cancelInvoice = async (invoiceId: string, type: PaypalAccountType) => {
  const accessToken = await getPaypalAccessToken(type);
  try {
    const res = await fetch(
      `${process.env.PAYPAL_URL}/v2/invoicing/invoices/${invoiceId}/cancel`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    console.debug("PAYPAL_CANCEL_INVOICE_RESPONSE", {
      type,
      invoiceId,
      status: res.status,
    });
    if (res.status === 204) {
      return true;
    }
    throw res;
  } catch (e) {
    console.error("PAYPAL_CANCEL_INVOICE_ERROR", { details: e });
    return false;
  }
};

export const cancelPaypalInvoices = async (eventId: string) => {
  const result = {
    depositInvoice: {
      deleted: false,
      cancelled: false,
    },
    finalInvoice: {
      deleted: false,
      cancelled: false,
    },
  };

  const event = await prisma.event.findFirst({
    select: {
      depositInvoiceId: true,
      finalInvoiceId: true,
    },
    where: {
      id: eventId,
    },
  });

  console.log({ event });

  if (event?.depositInvoiceId) {
    const depositInvoice = await getInvoice(event.depositInvoiceId, "deposit");
    if (depositInvoice.status === "DRAFT") {
      result.depositInvoice.deleted = await deleteInvoice(
        event.depositInvoiceId,
        "deposit",
      );
    } else if (depositInvoice.status === "SENT") {
      result.depositInvoice.cancelled = await cancelInvoice(
        event.depositInvoiceId,
        "deposit",
      );
    } else {
      console.warn(
        `Deposit invoice status is ${depositInvoice.status}. Please delete/cancel invoice manually.`,
      );
    }
  } else {
    console.warn(
      `No deposit invoice found for event: ${eventId}. Could not delete/cancel invoice.`,
    );
  }

  if (event?.finalInvoiceId) {
    const finalInvoice = await getInvoice(event.finalInvoiceId, "final");
    if (finalInvoice.status === "DRAFT") {
      result.finalInvoice.deleted = await deleteInvoice(
        event.finalInvoiceId,
        "final",
      );
    } else if (finalInvoice.status === "SENT") {
      result.finalInvoice.cancelled = await cancelInvoice(
        event.finalInvoiceId,
        "final",
      );
    } else {
      console.warn(
        `Final invoice status is ${finalInvoice.status}. Please delete/cancel invoice manually.`,
      );
    }
  } else {
    console.warn(
      `No final invoice found for event: ${eventId}. Could not delete/cancel invoice.`,
    );
  }

  return result;
};
