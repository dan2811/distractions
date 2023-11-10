import type { Event, User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { prisma } from "~/server/db";
import type { PaypalAccountType } from "~/types";
import { logger } from "~/utils/Logging";

const getEncodedPaypalData = (type: PaypalAccountType) => {
    if (type === "deposit") {
        return Buffer.from(process.env.PAYPAL_CLIENT_ID + ':' + process.env.PAYPAL_CLIENT_SECRET).toString('base64');
    } else {
        return Buffer.from(process.env.PAYPAL_FINAL_BALANCE_CLIENT_ID + ':' + process.env.PAYPAL_FINAL_BALANCE_SECRET).toString('base64');
    }
};

interface PaypalAccessTokenResponse {
    // comma separated list of scopes
    scope: string,
    access_token: string,
    token_type: 'Bearer',
    app_id: string,
    // seconds until expiry
    expires_in: number,
    nonce: string;
}

export const getPaypalAccessToken = async (type: PaypalAccountType) => {
    logger.info("PAYPAL_ACCESS_TOKEN_REQUESTED");

    const existingTokens = await prisma.paypalAccessToken.findMany({
        select: {
            createdAt: true,
            expires_in: true,
            access_token: true
        },
        where: {
            AND: {
                createdAt: {
                    gte: new Date(Date.now() - 3600 * 1000)
                },
                account: {
                    equals: type
                }
            }
        }
    });

    const validTokens = existingTokens.filter(token => new Date(token.createdAt).getTime() + token.expires_in * 1000 > Date.now());

    if (validTokens[0]) {
        logger.info("FOUND_EXISTING_VALID_PAYPAL_ACCESS_TOKEN");
        return validTokens[0].access_token;
    }

    const endpoint = "/v1/oauth2/token?grant_type=client_credentials";
    const encodedData = getEncodedPaypalData(type);
    const hostname = new URL(process.env.PAYPAL_URL!).hostname;
    const options = {
        "method": "POST",
        "hostname": hostname,
        "port": null,
        "path": endpoint,
        "headers": {
            "accept": "application/json",
            "accept-language": "en_US",
            "content-type": "application/x-www-form-urlencoded",
            "authorization": `basic ${encodedData}`
        }
    };

    try {
        const res = await fetch(process.env.PAYPAL_URL + endpoint, options);
        const json = await res.json() as PaypalAccessTokenResponse;
        logger.info("PAYPAL_ACCESS_TOKEN_REQUEST: ", json);
        const dbResponse = await prisma.paypalAccessToken.create({
            data: { ...json, account: type },
            select: {
                access_token: true,
            }
        });

        logger.info("PAYPAL_ACCESS_TOKEN_REQUEST_SUCCESS");

        return dbResponse.access_token;
    } catch (e) {
        logger.error("PAYPAL_ACCESS_TOKEN_REQUEST_ERROR: ", { details: e });
        throw new TRPCError({
            message: "Error requesting PayPal access token",
            code: "INTERNAL_SERVER_ERROR",
        });
    }
};


const invoicer = {
    "name": {
        "business_name": "The Distractions Band Ltd.",
    },
    "address": {
        "address_line_1": "The Distractions Band Ltd.",
        "address_line_2": "81 Burton Road",
        "admin_area_2": "Derby",
        "postal_code": "DE1 1TJ",
        "country_code": "GB"
    },
    // THIS MUST BE THE EMAIL ADDRESS OF A PAYPAL BUSINESS ACCOUNT
    "email_address": process.env.PAYPAL_DEPOSIT_ACCOUNT_EMAIL,
    "phones": [{
        "country_code": "44",
        "national_number": "07977991235",
        "phone_type": "HOME"
    }],
    "website": process.env.MAIN_URL,
};

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
            recipient_view_url: string,
            invoicer_view_url: string,
        },
    };
}

export const createDraftDepositInvoice = async (amount: string, client: Pick<User, "id" | "name" | "email" | "surname">, event: Pick<Event, "id" | "date" | "name">) => {
    const accessToken = await getPaypalAccessToken("deposit");
    try {
        const res = await fetch(`${process.env.PAYPAL_URL}/v2/invoicing/invoices`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                "detail": {
                    "reference": client.id,
                    "invoice_date": new Date().toISOString().split("T")[0],
                    "currency_code": "GBP",
                    "note": "We can't wait for your event.",
                    //client will see "term"
                    "term": "test term",
                    //client will not see "memo"
                    "memo": `Event ID: ${event.id}, Event name: ${event.name}`,
                    "payment_term": {
                        "term_type": "DUE_ON_RECEIPT",
                        "due_date": new Date().toISOString().split("T")[0],
                    }
                },
                "invoicer": invoicer,
                "primary_recipients": [{
                    "billing_info": {
                        "name": {
                            "given_name": client.name,
                            "surname": client.surname,
                        },
                        "email_address": client.email,
                    }
                }],
                "items": [{
                    "name": "Deposit",
                    "description": `Deposit payment required for your event scheduled for ${event.date.toLocaleDateString("en-gb")}`,
                    "quantity": "1",
                    "unit_amount": {
                        "currency_code": "GBP",
                        "value": amount
                    },
                    "unit_of_measure": "QUANTITY"
                }],
                "configuration": {
                    "partial_payment": {
                        "allow_partial_payment": false,
                    },
                    "allow_tip": true,
                    "tax_calculated_after_discount": true,
                    "tax_inclusive": true,
                },
                "amount": {
                    "currency_code": "GBP",
                    "value": amount,
                    "breakdown": {
                        "item_total": {
                            "currency_code": "GBP",
                            "value": amount
                        }
                    }
                }
            })
        });
        const json = await res.json() as PaypalDraftInvoiceResponse;
        logger.info("DRAFT_DEPOSIT_INVOICE_CREATED", json);

        try {
            await prisma.event.update({
                where: {
                    id: event.id
                },
                data: {
                    depositInvoiceId: json.id,
                    adminDepositInvoiceUrl: json.detail.metadata.invoicer_view_url,
                    clientDepositInvoiceUrl: json.detail.metadata.recipient_view_url
                }
            });
        } catch (e) {
            logger.error("UPDATE_EVENT_WITH_DEPOSIT_INVOICE_DETAILS_ERROR", { details: e });
        }
        return json;
    } catch (e) {
        logger.error("PAYPAL_DRAFT_DEPOSIT_INVOICE_ERROR", { details: e });
    }
};

export const createDraftFinalInvoice = async (amount: string, client: Pick<User, "id" | "name" | "email" | "surname">, event: Pick<Event, "id" | "date" | "name">) => {
    const accessToken = await getPaypalAccessToken("final");
    try {

        const defaultDueDate = new Date(event.date.setDate(event.date.getDate() - parseInt(process.env.DAYS_BEFORE_EVENT_FINAL_BALANCE_DUE!)));
        const dueDate = defaultDueDate.getTime() < Date.now() ? new Date() : defaultDueDate;
        const res = await fetch(`${process.env.PAYPAL_URL}/v2/invoicing/invoices`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                "detail": {
                    "reference": client.id,
                    "invoice_date": new Date().toISOString().split("T")[0],
                    "currency_code": "GBP",
                    "note": "We can't wait for your event.",
                    //client will see "term"
                    "term": "test term",
                    //client will not see "memo"
                    "memo": `Event ID: ${event.id}, Event name: ${event.name}`,
                    "payment_term": {
                        "term_type": "DUE_ON_DATE_SPECIFIED",
                        "due_date": dueDate.toISOString().split("T")[0],
                    }
                },
                "invoicer": invoicer,
                "primary_recipients": [{
                    "billing_info": {
                        "name": {
                            "given_name": client.name,
                            "surname": client.surname,
                        },
                        "email_address": client.email,
                    }
                }],
                "items": [{
                    "name": "Final balance",
                    "description": `Final payment required for your event scheduled for ${event.date.toLocaleDateString("en-gb")}`,
                    "quantity": "1",
                    "unit_amount": {
                        "currency_code": "GBP",
                        "value": amount
                    },
                    "unit_of_measure": "QUANTITY"
                }],
                "configuration": {
                    "partial_payment": {
                        "allow_partial_payment": true,
                    },
                    "allow_tip": true,
                    "tax_calculated_after_discount": true,
                    "tax_inclusive": true,
                },
                "amount": {
                    "currency_code": "GBP",
                    "value": amount,
                    "breakdown": {
                        "item_total": {
                            "currency_code": "GBP",
                            "value": amount
                        }
                    }
                }
            })
        });
        const json = await res.json() as PaypalDraftInvoiceResponse;
        logger.info("DRAFT_FINAL_INVOICE_CREATED", json);

        try {
            await prisma.event.update({
                where: {
                    id: event.id
                },
                data: {
                    finalInvoiceId: json.id,
                    adminFinalInvoiceUrl: json.detail.metadata.invoicer_view_url,
                    clientFinalInvoiceUrl: json.detail.metadata.recipient_view_url
                }
            });
        } catch (e) {
            logger.error("UPDATE_EVENT_WITH_FINAL_INVOICE_DETAILS_ERROR", { details: e });
        }

        return json;
    } catch (e) {
        logger.error("PAYPAL_DRAFT_FINAL_INVOICE_ERROR", { details: e });
    }
};

export const sendInvoice = async (invoiceId: string, type: PaypalAccountType) => {
    const accessToken = await getPaypalAccessToken(type);
    try {
        logger.info(JSON.stringify({ message: "SENDING_INVOICE", invoiceId }));
        const res = await fetch(`${process.env.PAYPAL_URL}/v2/invoicing/invoices/${invoiceId}/send`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                subject: "Invoice from The Distractions Band",
                note: "Thank you for your business.",
                send_to_invoicer: true,
                send_to_recipient: true,
            })
        });

        const paypalResponse = await res.json() as {
            name?: string; message?: string;
        };

        if (Object.hasOwn(paypalResponse, "name")) {
            throw new Error(`${paypalResponse.name} -${paypalResponse.message}`);
        }
        logger.debug("PAYPAL_SEND_INVOICE_RESPONSE", { paypalResponse });

        if (type === "deposit") {
            await prisma.event.update({
                where: {
                    depositInvoiceId: invoiceId
                },
                data: {
                    depositInvoiceSent: true
                }
            });
        } else {
            await prisma.event.update({
                where: {
                    finalInvoiceId: invoiceId
                },
                data: {
                    finalInvoiceSent: true
                }
            });
        }
        return paypalResponse;
    } catch (e) {
        logger.error("PAYPAL_SEND_INVOICE_ERROR", { details: e });
        throw new TRPCError({ message: "Error contacting paypal server", code: "INTERNAL_SERVER_ERROR" });
    }
};