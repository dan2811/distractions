import { type Event } from "@prisma/client";
import { Button, useRecordContext } from "react-admin";

interface InvoiceButtonProps {
  type: "deposit" | "final";
}
export const InvoiceButton = ({ type }: InvoiceButtonProps) => {
  const record = useRecordContext<Event>();
  if (!record) return null;

  const paypalInvoiceUrl =
    type === "deposit"
      ? record.adminDepositInvoiceUrl
      : record.adminFinalInvoiceUrl;
  if (!paypalInvoiceUrl) return null;
  return (
    <a href={paypalInvoiceUrl} target="_blank">
      <Button>
        <>View on paypal</>
      </Button>
    </a>
  );
};
