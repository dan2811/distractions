import { Card, Grid, Typography } from "@mui/material";
import {
  Button,
  Loading,
  ShowBase,
  SimpleShowLayout,
  useNotify,
  useRecordContext,
  useRefresh,
} from "react-admin";
import type { RaEvent } from "~/server/RaHandlers/eventHandler";
import { api } from "~/utils/api";
import type { Event } from "@prisma/client";
import type { PaypalRefunds } from "~/types";

export const FinanceTab = () => {
  const record = useRecordContext<RaEvent>();
  if (!record) return null;
  const { depositInvoiceId, finalInvoiceId } = record;

  return (
    <ShowBase resource="event">
      <SimpleShowLayout>
        <Grid container spacing={2} width={"100%"}>
          {depositInvoiceId && (
            <Grid item width={"50%"}>
              <InvoiceCard invoiceId={depositInvoiceId} type="deposit" />
            </Grid>
          )}
          {finalInvoiceId && (
            <Grid item width={"50%"}>
              <InvoiceCard invoiceId={finalInvoiceId} type="final" />
            </Grid>
          )}
        </Grid>
      </SimpleShowLayout>
    </ShowBase>
  );
};

interface InvoiceCardProps {
  invoiceId: string;
  type: "deposit" | "final";
}

const InvoiceCard = ({ invoiceId, type }: InvoiceCardProps) => {
  const {
    data: invoice,
    isLoading,
    refetch,
  } = api.paypal.getInvoice.useQuery({
    invoiceId,
    type,
  });

  const record = useRecordContext<Event>();
  if (!record) return null;

  const paypalInvoiceUrl =
    type === "deposit"
      ? record.adminDepositInvoiceUrl
      : record.adminFinalInvoiceUrl;

  if (isLoading) return <Loading />;
  if (!invoice) return null;

  let refunds: PaypalRefunds["transactions"];

  if (invoice.refunds) {
    if (invoice.refunds.transactions) {
      refunds = invoice.refunds.transactions;
    }
  }
  return (
    <Card className="p-4" raised={true}>
      <div className="flex items-center">
        <Typography variant="h5" className="h-fit w-fit">
          {`${type.charAt(0).toUpperCase() + type.slice(1)} Invoice - ${
            invoice.status
          }`}
        </Typography>
        <div className="flex gap-2 pl-4">
          <a href={paypalInvoiceUrl ?? ""} target="_blank">
            <Button label="View on PayPal" variant="outlined" />
          </a>
          {invoice.status === "DRAFT" && (
            <SendInvoiceButton
              invoiceId={invoiceId}
              type={type}
              refetch={refetch}
            />
          )}
        </div>
      </div>

      <Grid container spacing={2}>
        <Grid
          item
          width="50%"
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        ></Grid>
        <Grid item width="100%">
          <div className="flex flex-col gap-y-2 py-6">
            <div>Total: £{invoice.amount.value}</div>
            <div>Due: £{invoice.due_amount.value}</div>
            <div>Paid: £{invoice.payments?.paid_amount.value ?? "00.00"}</div>
          </div>
          {invoice.payments?.transactions.length ? (
            <>
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b-2 border-b-slate-200 text-left">
                    <th>
                      <Typography variant="h6">Payment Date</Typography>
                    </th>
                    <th>
                      <Typography variant="h6">Method</Typography>
                    </th>
                    <th>
                      <Typography variant="h6">Amount</Typography>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.payments?.transactions.map((transaction, idx) => (
                    <tr
                      key={transaction.payment_id}
                      className={
                        invoice.payments?.transactions &&
                        idx === invoice.payments?.transactions.length - 1
                          ? ""
                          : "border-b-2 border-slate-200"
                      }
                    >
                      <td>
                        <Typography>{transaction.payment_date}</Typography>
                      </td>
                      <td>
                        <Typography>{transaction.method}</Typography>
                      </td>
                      <td>
                        <Typography>£{transaction.amount?.value}</Typography>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : null}
        </Grid>
        {refunds && (
          <Grid item width="100%">
            <>
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b-2 border-b-slate-200 text-left">
                    <th>
                      <Typography variant="h6">Refund Date</Typography>
                    </th>
                    <th>
                      <Typography variant="h6">Method</Typography>
                    </th>
                    <th>
                      <Typography variant="h6">Amount</Typography>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {refunds.map((transaction, idx) => (
                    <tr
                      key={transaction.refund_id}
                      className={
                        invoice.refunds?.transactions &&
                        idx === invoice.refunds?.transactions.length - 1
                          ? ""
                          : "border-b-2 border-slate-200"
                      }
                    >
                      <td>
                        <Typography>{transaction.refund_date}</Typography>
                      </td>
                      <td>
                        <Typography>{transaction.method}</Typography>
                      </td>
                      <td>
                        <Typography>£{transaction.amount?.value}</Typography>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          </Grid>
        )}
      </Grid>
    </Card>
  );
};

const SendInvoiceButton = ({
  invoiceId,
  type,
  refetch,
}: {
  invoiceId: string | null;
  type: "deposit" | "final";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  refetch: () => Promise<any>;
}) => {
  const notify = useNotify();
  const refresh = useRefresh();
  const { mutate, isLoading } = api.paypal.sendInvoice.useMutation({
    onSuccess: () => {
      notify("Invoice sent", { type: "success" });
      refresh();
      void refetch();
    },
    onError: (error) => notify(error.message, { type: "error" }),
  });
  if (!invoiceId) return null;
  if (isLoading)
    return (
      <div>
        <Loading loadingPrimary="Sending invoice" />
      </div>
    );
  return (
    <Button
      variant="outlined"
      label="Send invoice"
      onClick={() => mutate({ invoiceId, type })}
    />
  );
};
