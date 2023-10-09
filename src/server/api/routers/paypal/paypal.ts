import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
    adminProcedure,
    createTRPCRouter, protectedProcedure,
} from "~/server/api/trpc";
import { getPaypalAccessToken } from "./helper";
import { prisma } from "~/server/db";
import { log } from "next-axiom";

const invoicer = {
    "name": {
        "business_name": "The Distractions Band Ltd.",
    },
    "address": {
        "address_line_1": "81 Burton Road",
        "address_line_2": "",
        "admin_area_2": "Derby",
        "postal_code": "DE1 1TJ",
        "country_code": "GB"
    },
    // THIS MUST BE THE EMAIL ADDRESS OF A PAYPAL BUSINESS ACCOUNT
    "email_address": "sb-nwmqu5280595@business.example.com",
    "phones": [{
        "country_code": "44",
        "national_number": "01156668276",
        "phone_type": "HOME"
    }],
    "website": "www.thedistractionsband.co.uk",
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

export const paypalRouter = createTRPCRouter({
    createDraftDepositInvoice: protectedProcedure.input(
        z.object({
            client: z.object({
                id: z.string(),
                name: z.string(),
                surname: z.string(),
                email: z.string()
            }),
            amount: z.string(),
            event: z.object({
                id: z.string(),
                date: z.string()
            })
        })
    ).mutation(async ({ input: { amount, client, event } }) => {
        const accessToken = await getPaypalAccessToken();
        console.debug("PAYPAL DRAFT INVOICE REQUESTED: ");
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
                        "memo": `Event ID: ${event.id}`,
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
                                "surname": client.surname
                            },
                            "email_address": client.email,
                        }
                    }],
                    "items": [{
                        "name": "Deposit",
                        "description": `Deposit payment required for your event scheduled for ${event.date}`,
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
                        "breakdown": {
                            "custom": {
                                "label": "Deposit",
                                "amount": {
                                    "currency_code": "GBP",
                                    "value": amount
                                },
                                "tax": {
                                    "name": "VAT",
                                    "percent": "20"
                                }
                            },
                        }
                    }
                })
            });
            const json = await res.json() as PaypalDraftInvoiceResponse;
            log.info("DRAFT_INVOICE_CREATED", json);

            try {
                await prisma.event.update({
                    where: {
                        id: event.id
                    },
                    data: {
                        adminDepositInvoiceUrl: json.detail.metadata.invoicer_view_url,
                        clientDepositInvoiceUrl: json.detail.metadata.recipient_view_url
                    }
                });
            } catch (e) {
                log.error("UPDATE_EVENT_WITH_INVOICE_DETAILS_ERROR", { details: e });
            }

            return json;
        } catch (e) {
            log.error("PAYPAL_DRAFT_INVOICE_ERROR", { details: e });
        }
    }),
    sendInvoice: adminProcedure.input(
        z.object({
            invoiceId: z.string()
        })).mutation(async ({ input }) => {
            const accessToken = await getPaypalAccessToken();
            try {
                log.info("SENDING_INVOICE", input);
                const res = await fetch(`${process.env.PAYPAL_URL}/v2/invoicing/invoices/${input.invoiceId}/send`, {
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

                const paypalResponse = await res.json() as string;
                log.debug("PAYPAL_SEND_INVOICE_RESPONSE", { paypalResponse });

                return paypalResponse;
            } catch (e) {
                log.error("PAYPAL_SEND_INVOICE_ERROR", { details: e });
                throw new TRPCError({ message: "Error contacting paypal server", code: "INTERNAL_SERVER_ERROR" });
            }
        }),
});