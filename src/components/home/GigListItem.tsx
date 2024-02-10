import { Prisma } from "@prisma/client";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { LoadingSpinner } from "../LoadingSpinner";
import { ErrorIcon } from "react-hot-toast";

const jobWithInstruments = Prisma.validator<Prisma.JobDefaultArgs>()({
  include: { Instruments: true },
});

type JobWithInstruments = Prisma.JobGetPayload<typeof jobWithInstruments>;

export const GigListItem = ({ job }: { job: JobWithInstruments }) => {
  const { push } = useRouter();
  const {
    data: event,
    isLoading,
    isError,
  } = api.events.getOne.useQuery({
    id: job.eventId,
  });
  if (isLoading) return <LoadingSpinner />;
  if (isError)
    return (
      <>
        <div>
          <ErrorIcon color="error" />
          <p> Something went wrong with this event</p>
        </div>
      </>
    );
  if (!event) return <p>Event not found</p>;
  const instruments = job.Instruments;
  return (
    <>
      <div
        className="flex h-1/2 w-full items-center justify-between gap-2 rounded-lg bg-gradient-to-tl from-gray-900/40 to-gray-300/50 p-4 text-center bg-blend-darken shadow-inner shadow-gray-500 backdrop-blur-md md:max-w-md"
        onClick={() => void push(`gig/${event.id}?tab=0`)}
      >
        <p>
          {event.date
            ? new Date(event.date).toLocaleDateString()
            : "Date unknown"}
        </p>
        <p>{event.location}</p>
        {instruments?.length > 0 && (
          <p>{instruments.map((instrument) => instrument.name).join(", ")}</p>
        )}
      </div>
    </>
  );
};
