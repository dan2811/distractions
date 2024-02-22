import { type Event } from "@prisma/client";
import React from "react";
import { CheckmarkIcon, ErrorIcon } from "react-hot-toast";
import { api } from "~/utils/api";

interface PaymentTabProps {
  event: Event;
}

const PaymentTab = ({ event }: PaymentTabProps) => {
  const {
    clientDepositInvoiceUrl,
    clientFinalInvoiceUrl,
    depositInvoiceId,
    finalInvoiceId,
  } = event;

  const {
    data: depositInvoice,
    error: depositInvoiceError,
    isLoading: depositInvoiceIsLoading,
  } = api.paypal.getInvoice.useQuery({
    invoiceId: depositInvoiceId ?? "--",
    type: "deposit",
  });
  const {
    data: finalInvoice,
    error: finalInvoiceError,
    isLoading: finalInvoiceIsLoading,
  } = api.paypal.getInvoice.useQuery({
    invoiceId: depositInvoiceId ?? "--",
    type: "deposit",
  });

  if (!!depositInvoiceError || !!finalInvoiceError) {
    return <div>There was an error getting the invoices</div>;
  }

  const isDepositPaid = Number(depositInvoice?.due_amount?.value) === 0;
  const isFinalPaid = Number(finalInvoice?.due_amount?.value) === 0;

  return (
    <div className="flex flex-col gap-6 place-self-center p-4 md:max-w-lg">
      <section className="grid w-full grid-cols-3 items-center justify-between gap-2 rounded-lg bg-gradient-to-tl from-gray-900/40 to-gray-300/50 p-4 text-center bg-blend-darken shadow-inner shadow-gray-500 backdrop-blur-md">
        <h2>Deposit</h2>
        {!depositInvoiceId ||
        !depositInvoice?.due_amount?.value ||
        !clientDepositInvoiceUrl ? (
          <div className="col-span-2">Information not currently available</div>
        ) : (
          <>
            <div className="flex flex-col items-center">
              <p>£{event.deposit}</p>
              {isDepositPaid ? <CheckmarkIcon /> : <ErrorIcon />}
            </div>
            clientDepositInvoiceUrl &&
            <a href={clientDepositInvoiceUrl} target="_blank">
              <button>{isDepositPaid ? "View Invoice" : "Pay"}</button>
            </a>
          </>
        )}
      </section>
      <section className="grid w-full grid-cols-3 items-center justify-between gap-2 rounded-lg bg-gradient-to-tl from-gray-900/40 to-gray-300/50 p-4 text-center bg-blend-darken shadow-inner shadow-gray-500 backdrop-blur-md">
        <h2>Final balance</h2>
        {!finalInvoiceId ||
        !finalInvoice?.due_amount?.value ||
        !clientFinalInvoiceUrl ? (
          <div className="col-span-2">Information not currently available</div>
        ) : (
          <>
            <div className="flex flex-col items-center">
              <p>£{event.price}</p>
              {isFinalPaid ? <CheckmarkIcon /> : <ErrorIcon />}
            </div>
            clientFinalInvoiceUrl &&
            <a href={clientFinalInvoiceUrl} target="_blank">
              <button>{isFinalPaid ? "View Invoice" : "Pay"}</button>
            </a>
          </>
        )}
      </section>
    </div>
  );
};

export default PaymentTab;
