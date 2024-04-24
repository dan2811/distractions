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
import { UploadButton } from "~/utils/uploadthing";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

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
    <Layout
      pageName={`Gig - ${new Date(data.date).toLocaleDateString("en-GB", {
        dateStyle: "short",
      })}`}
      pageDescription="Everything you need to know about your gig."
    >
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

      <h2 className="themed-h2">Location</h2>
      <p>{eventData.location}</p>
      <h2 className="themed-h2">Date</h2>
      <p>{new Date(eventData.date).toLocaleDateString("en-gb")}</p>
      {!!instruments && (
        <>
          <h2 className="themed-h2">Instrument</h2>
          <p>
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
          <h2 className="themed-h2">Notes</h2>
          <p className="text-lg">{jobData.notes}</p>
        </>
      )}
      <h2 className="themed-h2">Pay</h2>
      {jobData?.pay ? (
        <div>£{jobData?.pay}</div>
      ) : (
        <div>No payment info yet</div>
      )}
      {!!jobData && jobData.status === "accepted" && (
        <Invoice eventId={eventId} />
      )}
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
    api.users.getUser.useQuery({
      id: clientId,
    });

  return (
    <>
      <h2 className="themed-h2">Client</h2>
      {isClientLoading ? <LoadingSpinner /> : <p>{clientData?.name}</p>}
    </>
  );
};

const Invoice = ({ eventId }: { eventId: string }) => {
  const { data: job, refetch: refetchJob } = api.jobs.getOne.useQuery({
    eventId,
  });

  const { mutateAsync } = api.jobs.deleteInvoice.useMutation({
    onSuccess: async () => {
      await refetchJob();
    },
  });

  const [uploaded, setUploaded] = useState(false);

  useEffect(() => {
    if (uploaded) {
      void refetchJob();
    }
  }, [uploaded, refetchJob]);

  if (!job) return null;

  if (uploaded && !job.invoice) {
    setTimeout(() => {
      void refetchJob();
      if (!job.invoice) {
        setTimeout(() => {
          void refetchJob();
        }, 2000);
      }
    }, 1000);
    return <LoadingSpinner />;
  }

  if (!job.invoice)
    return (
      <>
        <h2 className="themed-h2 pr-4">Invoice</h2>
        <UploadButton
          endpoint="musicianInvoiceUploader"
          input={{ jobId: job.id }}
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onClientUploadComplete={() => {
            setUploaded(true);
            toast.success("Invoice Uploaded!");
          }}
          className="font-headers font-normal ut-button:bg-main-accent/80 ut-button:after:bg-main-accent ut-button:focus-within:ring-0"
          onUploadError={(error: Error) =>
            toast.error(`ERROR! ${error.message}`)
          }
        />
      </>
    );

  const invoiceStatus = !job.invoice ? "" : job.invoice?.status.toLowerCase();

  return (
    <div className="flex flex-col">
      <div className="flex w-full items-center pb-2 pr-2">
        <h2 className="themed-h2 pr-4">Invoice</h2>
        {job.invoice !== null && (
          <div className="flex w-full items-center justify-between">
            <Chip
              label={invoiceStatus.toUpperCase()}
              variant="filled"
              className="w-fit p-1 text-white"
              color={
                invoiceStatus === "due"
                  ? "info"
                  : invoiceStatus === "paid"
                    ? "success"
                    : invoiceStatus === "overdue"
                      ? "error"
                      : "primary"
              }
            />

            {invoiceStatus !== "paid" && (
              <button
                className="rounded-lg border border-white p-2"
                onClick={(e) => {
                  e.preventDefault();
                  setUploaded(false);
                  void toast.promise(
                    mutateAsync({
                      invoiceId: job.invoice!.id,
                    }),
                    {
                      loading: "Deleting...",
                      success: "Invoice deleted",
                      error: "There was an error deleting the invoice",
                    },
                  );
                }}
              >
                <DeleteForeverIcon />
              </button>
            )}
          </div>
        )}
      </div>
      {job.invoice !== null && (
        <div className="h-screen">
          <iframe
            src={job.invoice.url}
            className="h-full w-full max-w-lg pr-2 pt-2"
          />
        </div>
      )}
    </div>
  );
};
export default GigDetails;
