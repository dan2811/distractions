import { type Event } from "@prisma/client";
import React from "react";
import Showband from "public/assets/images/showband.webp";
import Image from "next/image";

interface PaymentTabProps {
  event: Event;
}

const PaymentTab = ({ event }: PaymentTabProps) => {
  const { clientDepositInvoiceUrl, clientFinalInvoiceUrl } = event;
  return (
    <div className="flex flex-col gap-8">
      <article>
        <Image
          src={Showband}
          alt="showband"
          className="max-h-60 w-full object-cover object-bottom"
        />
        <h1 className="text-center text-xl font-light">
          {event.name ?? "Your event"}
        </h1>
        <div className="flex flex-col gap-6 p-4">
          <section className="grid h-1/2 w-full grid-cols-3 items-center justify-between gap-2 rounded-lg bg-gradient-to-tl from-gray-900/40 to-gray-300/50 p-4 text-center bg-blend-darken shadow-inner shadow-gray-500 backdrop-blur-md">
            <h2>Deposit</h2>
            <p>£{event.deposit}</p>
            {clientDepositInvoiceUrl && (
              <a href={clientDepositInvoiceUrl} target="_blank">
                <button>Pay</button>
              </a>
            )}
          </section>
          <section className="grid h-1/2 w-full grid-cols-3 items-center justify-between gap-2 rounded-lg bg-gradient-to-tl from-gray-900/40 to-gray-300/50 p-4 text-center bg-blend-darken shadow-inner shadow-gray-500 backdrop-blur-md">
            <h2>Final balance</h2>
            <p>£{event.price}</p>
            {clientFinalInvoiceUrl && (
              <a href={clientFinalInvoiceUrl} target="_blank">
                <button>Pay</button>
              </a>
            )}
          </section>
        </div>
      </article>
    </div>
  );
};

export default PaymentTab;
