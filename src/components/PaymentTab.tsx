import { useRouter } from "next/router";
import React from "react";
import { Heading } from "~/components/Layout/Heading";
import { api } from "~/utils/api";

interface PaymentTabProps {
  eventCost: number;
}
const PaymentTab = ({ eventCost }: PaymentTabProps) => {
  const {
    query: { id: eventId },
  } = useRouter();
  if (!eventId) return null;
  const { data } = api.payments.findMany.useQuery({
    eventId: eventId as string,
  });

  const totalPaid = data?.reduce((acc, { amount }) => acc + amount, 0) ?? 0;

  return (
    <div className="flex flex-col gap-8">
      <section>
        <Heading>
          <h2>New Payment</h2>
        </Heading>
        <div>Paypal buttons here?</div>
      </section>
      <section>
        <Heading>
          <h2>Totals</h2>
        </Heading>
        {!totalPaid ? null : <p>Total paid: £{totalPaid}</p>}
        {!eventCost || eventCost < totalPaid ? null : (
          <p>Total left to pay: £{(eventCost - totalPaid).toFixed(2)}</p>
        )}
      </section>
      <section>
        <Heading>
          <h2>Previous Payments</h2>
        </Heading>
        {data?.map(({ id, date, amount, type }) => (
          <div key={id} className="grid grid-cols-3">
            <p>{date}</p>
            <p>£{amount.toFixed(2)}</p>
            <p>{type}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default PaymentTab;
