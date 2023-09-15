import { useRouter } from "next/router";
import React from "react";
import { api } from "~/utils/api";

const Payment = () => {
  const {
    query: { id: eventId },
  } = useRouter();
  if (!eventId) return null;
  const { data } = api.payments.findMany.useQuery({
    eventId: eventId as string,
  });
  return <div>{JSON.stringify(data)}</div>;
};

export default Payment;
