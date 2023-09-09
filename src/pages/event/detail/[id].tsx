import { useRouter } from "next/router";
import React from "react";
import Layout from "~/components/Layout";

const EventDetails = () => {
  const router = useRouter();
  const id = router.query.id;
  return <Layout>The ID for this event is {id}</Layout>;
};

export default EventDetails;
