import {
  BottomNavigation,
  BottomNavigationAction,
  Chip,
  Stack,
} from "@mui/material";
import type { Event, Instrument } from "@prisma/client";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import toast, { CheckmarkIcon, ErrorIcon } from "react-hot-toast";
import Layout from "~/components/Layout/Layout";
import { LoadingSpinner } from "~/components/LoadingSpinner";
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

  if (isLoading) return <LoadingSpinner />;

  if (!data) return <p>Gig not found</p>;

  const tabs = [<DetailsTab event={data} key={1} />];

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

const DetailsTab = ({ event }: { event: Event }) => {
  const router = useRouter();
  let eventData = event;
  const eventId = router.query.id as string;

  const {
    data,
    isLoading: isEventLoading,
    isError: isEventError,
  } = api.events.getOne.useQuery({
    id: eventId,
  });

  if (!event) {
    if (!data) throw new Error("Event not found");
    eventData = data;
  }

  const {
    data: jobData,
    isLoading: isJobLoading,
    isError: isJobError,
  } = api.jobs.getOne.useQuery({
    eventId: eventData.id,
  });

  const { mutateAsync } = api.jobs.updateOne.useMutation();

  if (!eventData.id) return 404;

  if (isJobError || isEventError) return "Error loading data";

  if (isEventLoading && !eventData) return <LoadingSpinner />;

  if (!eventData) router.back();

  const instruments = jobData?.Instruments;

  const handleDeclineJob = () => {
    if (!jobData) return void toast.error("Error declining job");
    void toast
      .promise(mutateAsync({ jobId: jobData.id, status: "rejected" }), {
        loading: "Declining job...",
        success: "Job declined",
        error: "Error declining job",
      })
      .then(() => {
        void router.push("/");
      });
  };

  const handleAcceptJob = () => {
    if (!jobData) return void toast.error("Error accepting job");

    void toast
      .promise(mutateAsync({ jobId: jobData.id, status: "accepted" }), {
        loading: "Accepting job...",
        success: "Job accepted",
        error: "Error accepting job",
      })
      .then(() => {
        void router.push("/");
      });
  };

  return (
    <div className="flex flex-col gap-2 py-2 pl-2">
      {!!jobData && jobData.status === "pending" && (
        <JobOffer acceptJob={handleAcceptJob} declineJob={handleDeclineJob} />
      )}
      <ClientInfo clientId={eventData.ownerId} />

      <h2 className="text-xl text-main-accent">Location</h2>
      <p className="text-lg">{eventData.location}</p>
      <h2 className="text-xl text-main-accent">Date</h2>
      <p className="text-lg">{new Date(eventData.date).toLocaleDateString()}</p>
      {!!instruments && (
        <>
          <h2 className="text-xl text-main-accent">Instrument</h2>
          <p className="text-lg">
            {instruments
              .map((instrument: Instrument) => instrument.name)
              .join(", ")}
          </p>
        </>
      )}
      {isJobLoading ? (
        <LoadingSpinner />
      ) : !jobData?.notes ? null : (
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

const JobOffer = ({
  acceptJob,
  declineJob,
}: {
  acceptJob: () => void;
  declineJob: () => void;
}) => {
  return (
    <div className="flex flex-col gap-3 self-center rounded-lg bg-main-input p-6">
      <p>Would you like to accept this gig?</p>
      <Stack direction="row" spacing={1} className="self-center">
        <Chip
          label="Accept"
          variant="outlined"
          icon={<CheckmarkIcon />}
          onClick={acceptJob}
        />
        <Chip
          label="Decline"
          variant="outlined"
          icon={<ErrorIcon />}
          onClick={declineJob}
        />
      </Stack>
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
        <LoadingSpinner />
      ) : (
        <p className="text-lg">{clientData?.name}</p>
      )}
    </>
  );
};

export default GigDetails;
