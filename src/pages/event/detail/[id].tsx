import { Router, useRouter } from "next/router";
import React from "react";
import Layout from "~/components/Layout/Layout";
import { Loading } from "~/components/Loading";
import { api } from "~/utils/api";

const EventDetails = () => {
  const router = useRouter();
  const id = router.query.id;
  const { push } = useRouter();
  if (!id) return 404;

  const { data, isLoading } = api.events.getOne.useQuery({
    id: id as string,
  });

  if (isLoading)
    return (
      <Layout>
        <Loading />
      </Layout>
    );

  return (
    <Layout>
      <div className="flex flex-col gap-2 py-2 pl-2">
        <h2>{data?.name}</h2>
        <p>Date: {data?.date}</p>
        <p>Location: {data?.location}</p>
        <p>Packages booked:</p>
        <ul>
          {data?.packages.map((pkg) => <li key={pkg.id}>- {pkg.name}</li>)}
        </ul>
      </div>
      <button className="w-1/2 self-center" onClick={() => void push("/")}>
        Edit Details
      </button>
    </Layout>
  );
};

export default EventDetails;
