import { useRouter } from "next/router";
import React from "react";
import { Heading } from "~/components/Layout/Heading";
import Layout from "~/components/Layout/Layout";
import { api } from "~/utils/api";

const Payment = () => {
  const {
    query: { id: eventId },
  } = useRouter();
  if (!eventId) return null;
  const { data } = api.payments.findMany.useQuery({
    eventId: eventId as string,
  });

  const totalPaid = data?.reduce((acc, { amount }) => acc + amount, 0);
  
  return (
    <Layout>
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
          <p>Total paid: £{totalPaid}</p>
          <p>Total left to pay: </p>
        </section>
        <section>
          <Heading>
            <h2>Previous Payments</h2>
          </Heading>
          {data?.map(({ id, date, amount, type }) => (
            <div key={id} className="grid grid-cols-3">
              <p>{date}</p>
              <p>£{amount}</p>
              <p>{type}</p>
            </div>
          ))}
        </section>
      </div>
    </Layout>
  );
};

export default Payment;
