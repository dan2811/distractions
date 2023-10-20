import { type Event } from "@prisma/client";
import React from "react";
import { Heading } from "~/components/Layout/Heading";

interface PaymentTabProps {
  event: Event;
}

const PaymentTab = ({ event }: PaymentTabProps) => {
  const { clientDepositInvoiceUrl, clientFinalInvoiceUrl } = event;
  return (
    <div className="flex flex-col gap-8">
      <article>
        <Heading>
          <h2>Payments</h2>
        </Heading>
        {!clientDepositInvoiceUrl && !clientFinalInvoiceUrl && (
          <section className="p-2">
            Nothing to pay yet, we&apos;ll send you an invoice soon, your
            invoices will also appear here once they have been sent.
            <br />
            <br />
            Please make sure your email address is correct by clicking on the
            profile icon at the top right.
          </section>
        )}
        <div>
          {clientDepositInvoiceUrl && (
            <a href={clientDepositInvoiceUrl} target="_blank">
              <button>Pay deposit</button>
            </a>
          )}
          {clientFinalInvoiceUrl && (
            <a href={clientFinalInvoiceUrl} target="_blank">
              <button>Pay remaining balance</button>
            </a>
          )}
        </div>
      </article>
    </div>
  );
};

export default PaymentTab;
