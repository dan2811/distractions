import {
  BottomNavigation,
  BottomNavigationAction,
  Chip,
  Stack,
} from "@mui/material";
import { type Instrument } from "@prisma/client";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { CheckmarkIcon, ErrorIcon } from "react-hot-toast";
import { Heading } from "~/components/Layout/Heading";
import Layout from "~/components/Layout/Layout";
import { Loading } from "~/components/Loading";
import { api } from "~/utils/api";

const GigDetails = () => {
  const router = useRouter();
  const { id, tab: currentTab } = router.query;
  const { data, isLoading } = api.events.getOne.useQuery({
    id: id as string,
  });

  const [state, setState] = useState(0);

  useEffect(() => {
    setState(parseInt(currentTab as string));
  }, [currentTab]);

  if (isLoading) return <Loading />;

  if (!data) return <p>Gig not found</p>;

  const tabs = [<DetailsTab key={1} />];

  return (
    <Layout>
      {tabs[parseInt(currentTab as string)]}
      <BottomNavigation
        showLabels
        value={state}
        onChange={(event, newValue: number) => {
          void router.push(`/gig/${id as string}?tab=${newValue}`);
        }}
        className="fixed bottom-0 w-full"
      >
        <BottomNavigationAction label="Details" />
      </BottomNavigation>
    </Layout>
  );
};

const DetailsTab = () => {
  const router = useRouter();
  const eventId = router.query.id as string;
  const { data: eventData, isLoading: isEventLoading } =
    api.events.getOne.useQuery({
      id: eventId,
    });

  const { data: jobData, isLoading: isJobLoading } = api.jobs.getOne.useQuery({
    eventId,
  });

  if (!eventId) return 404;

  if (!eventData || !jobData) return "Error loading data";

  if (isEventLoading || isJobLoading) return <Loading />;

  const instruments: Instrument[] = jobData.Instruments;
  return (
    <div className="flex flex-col gap-2 py-2 pl-2">
      <div className="flex flex-col gap-3 self-center rounded-lg bg-main-input p-6">
        <p>Would you like to accept this gig?</p>
        <Stack direction="row" spacing={1} className="self-center">
          <Chip
            label="Accept"
            variant="outlined"
            icon={<CheckmarkIcon />}
            onClick={() => console.log("clicked")}
          />
          <Chip
            label="Decline"
            variant="outlined"
            icon={<ErrorIcon />}
            onClick={() => console.log("clicked")}
          />
        </Stack>
      </div>
      <ClientInfo clientId={eventData.ownerId} />

      <h2 className="text-xl text-main-accent">Location</h2>
      <p className="text-lg">{eventData.location}</p>
      <h2 className="text-xl text-main-accent">Date</h2>
      <p className="text-lg">{eventData.date}</p>
      {instruments.length > 0 && (
        <>
          <h2 className="text-xl text-main-accent">Instrument</h2>
          <p className="text-lg">
            {instruments
              .map((instrument: Instrument) => instrument.name)
              .join(", ")}
          </p>
        </>
      )}
      {!jobData.notes ? null : (
        <>
          <h2 className="text-xl text-main-accent">Notes</h2>
          <p className="text-lg">{jobData.notes}</p>
        </>
      )}
      <h2 className="text-xl text-main-accent">Pay</h2>
      <div>No payment Information yet</div>
    </div>
  );
};

const ClientInfo = ({ clientId }: { clientId: string }) => {
  const { data: clientData, isLoading: isClientLoading } =
    api.users.getClient.useQuery({
      id: clientId,
    });

  return (
    <>
      <h2 className="text-xl text-main-accent">Client</h2>
      {isClientLoading ? (
        <Loading />
      ) : (
        <p className="text-lg">{clientData?.name}</p>
      )}
    </>
  );
};

export default GigDetails;
