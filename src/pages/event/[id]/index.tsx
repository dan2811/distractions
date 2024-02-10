import { BottomNavigation, BottomNavigationAction, Card } from "@mui/material";
import Image from "next/image";
import Showband from "/public/assets/images/showband.png";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import Layout from "~/components/Layout/Layout";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { DetailsTab } from "~/components/event/DetailsTab";
import { DocumentsTab } from "~/components/event/DocumentsTab";
import PaymentTab from "~/components/event/PaymentTab";
import { api } from "~/utils/api";

const EventDetails = () => {
  const router = useRouter();
  const { id, tab: currentTab } = router.query;
  const { data, isLoading } = api.events.getOne.useQuery({
    id: id as string,
  });

  const [tab, setTab] = useState(0);

  useEffect(() => {
    setTab(parseInt(currentTab as string));
  }, [currentTab]);

  if (isLoading) return <LoadingSpinner />;

  if (!data) return <p>Event not found</p>;

  const tabs = [
    <DetailsTab key={1} />,
    <PaymentTab key={2} event={data} />,
    <DocumentsTab key={3} event={data} />,
  ];

  return (
    <Layout
      pageName="Your event"
      pageDescription="Everything you need to know about your booking with us."
    >
      <EventHeader eventName={data.name} />
      {tabs[parseInt(currentTab as string)]}
      <Card className="h-16 w-full" />
      <BottomNavigation
        showLabels
        value={tab}
        onChange={(event, newValue: number) => {
          void router.push(`/event/${id as string}?tab=${newValue}`);
        }}
        sx={{
          borderTop: "0.5px solid rgba(168, 160, 124, 0.5)",
          boxShadow: "0px -5px 10px 0px rgba(0,0,0,0.75)",
        }}
        className="fixed bottom-0 h-14 w-full"
      >
        <BottomNavigationAction label="Details" />
        <BottomNavigationAction label="Payments" />
        <BottomNavigationAction label="Documents" />
      </BottomNavigation>
    </Layout>
  );
};

const EventHeader = ({ eventName }: { eventName?: string }) => {
  return (
    <>
      <Image
        src={Showband}
        alt="showband"
        className="w-full place-self-center object-cover object-bottom md:max-w-3xl"
      />
      <h1 className="text-center text-xl font-light">
        {eventName ?? "Your event"}
      </h1>
    </>
  );
};

export default EventDetails;
