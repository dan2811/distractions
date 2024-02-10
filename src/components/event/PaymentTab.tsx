import { type Event } from "@prisma/client";
import React from "react";

interface PaymentTabProps {
  event: Event;
}

const PaymentTab = ({ event }: PaymentTabProps) => {
  const { clientDepositInvoiceUrl, clientFinalInvoiceUrl } = event;
  return (
    <div className="flex flex-col gap-6 place-self-center p-4 md:max-w-lg">
      <section className="grid w-full grid-cols-3 items-center justify-between gap-2 rounded-lg bg-gradient-to-tl from-gray-900/40 to-gray-300/50 p-4 text-center bg-blend-darken shadow-inner shadow-gray-500 backdrop-blur-md">
        <h2>Deposit</h2>
        <p>£{event.deposit}</p>
        {clientDepositInvoiceUrl && (
          <a href={clientDepositInvoiceUrl} target="_blank">
            <button>Pay</button>
          </a>
        )}
      </section>
      <section className="grid w-full grid-cols-3 items-center justify-between gap-2 rounded-lg bg-gradient-to-tl from-gray-900/40 to-gray-300/50 p-4 text-center bg-blend-darken shadow-inner shadow-gray-500 backdrop-blur-md">
        <h2>Final balance</h2>
        <p>£{event.price}</p>
        {clientFinalInvoiceUrl && (
          <a href={clientFinalInvoiceUrl} target="_blank">
            <button>Pay</button>
          </a>
        )}
      </section>
    </div>
  );
};

export default PaymentTab;
