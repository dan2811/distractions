import { z } from "zod";

export type Role = "client" | "musician" | "admin" | "superAdmin";
export type JobStatus = "pending" | "accepted" | "rejected" | "completed";
export interface RequiredInstrumentsJSON {
  quantity: number;
  id: string;
}

export type PaypalAccountType = "deposit" | "final";

const refunds = z.object({
  transactions: z
    .array(
      z.object({
        refund_id: z.string(),
        refund_date: z.string().optional(),
        method: z.string(),
        amount: z
          .object({
            currency_code: z.string().optional(),
            value: z.string().optional(),
          })
          .optional(),
      }),
    )
    .optional(),
  //   refund_amount: z.object({
  //     currency_code: z.string().optional(),
  //     value: z.string().optional(),
  //   }),
});

export const paypalInvoiceSchema = z.object({
  id: z.string(),
  status: z.string(),
  amount: z.object({
    currency_code: z.string().optional(),
    value: z.string().optional(),
  }),
  due_amount: z.object({
    curreny_code: z.string().optional(),
    value: z.string().optional(),
  }),
  payments: z
    .object({
      transactions: z.array(
        z.object({
          payment_id: z.string(),
          payment_date: z.string().optional(),
          method: z.string(),
          amount: z
            .object({
              currency_code: z.string().optional(),
              value: z.string().optional(),
            })
            .optional(),
        }),
      ),
      paid_amount: z.object({
        currency_code: z.string().optional(),
        value: z.string().optional(),
      }),
    })
    .optional(),
  refunds: refunds.optional(),
});

export type PaypalInvoice = z.infer<typeof paypalInvoiceSchema>;
export type PaypalRefunds = z.infer<typeof refunds>;
