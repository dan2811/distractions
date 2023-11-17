import { Prisma } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { AuthButton } from "~/components/Auth";
import { Heading } from "~/components/Layout/Heading";
import Layout from "~/components/Layout/Layout";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { api } from "~/utils/api";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";
import Dwayne from "../../public/assets/images/Dwayne.png";
import HornPlayer from "../../public/assets/images/horn-player.png";
import Image from "next/image";

export default function Home() {
  const session = useSession();
  const isUserAuthed = session.status === "authenticated";

  return (
    <Layout
      pageName="The Distractions Band"
      pageDescription="Manage your booking"
    >
      {!isUserAuthed && (
        <div>
          <Image
            src={HornPlayer}
            alt="Horn player"
            className="fixed -z-50 bg-black bg-blend-darken"
          />
          <div className="fixed grid h-screen w-full grid-cols-1 place-content-end pb-28">
            <AuthButton />
          </div>
        </div>
      )}
      {isUserAuthed && (
        <>
          <div className="fixed -z-40 h-screen w-screen bg-black bg-opacity-30 " />
          <Image
            src={Dwayne}
            alt="showband"
            className="fixed -z-50 bg-black bg-blend-darken"
          />
          <Bookings />
          {session.data.user.role !== "client" && <GigOffers />}
          {session.data.user.role !== "client" && <Gigs />}
        </>
      )}
    </Layout>
  );
}

const Bookings = () => {
  const session = useSession();
  const { data, isLoading } = api.events.getMyBookings.useQuery();
  if (session.data?.user.role !== "client" && !data?.length) return null;
  return (
    <div>
      <Heading>
        <h2>Bookings</h2>
      </Heading>
      {isLoading && session.data?.user.role === "client" ? (
        <LoadingSpinner />
      ) : (
        <div className="flex flex-col gap-4 p-4 font-body">
          {!data?.length && (
            <div>
              <p>You haven&apos;t made a booking with us yet. 😢</p>
            </div>
          )}
          {data?.map((event) => <EventListItem event={event} key={event.id} />)}
        </div>
      )}
    </div>
  );
};

const EventListItem = ({
  event,
}: {
  event: { id: string; name: string; date: Date };
}) => {
  const { push } = useRouter();

  return (
    <>
      <div
        className="flex h-1/2 w-full items-center justify-between gap-2 rounded-lg bg-gradient-to-tl from-gray-900/40 to-gray-300/50 p-4 text-center bg-blend-darken shadow-inner shadow-gray-500 backdrop-blur-md"
        onClick={() => void push(`event/${event.id}?tab=0`)}
      >
        <div>
          <p className="text-left text-lg font-light">
            {event.date
              ? new Date(event.date).toLocaleDateString("en-GB")
              : null}
          </p>
          <p className="text-left">{event.name || "Your event"}</p>
        </div>
        <InfoIcon />
      </div>
    </>
  );
};

const Gigs = () => {
  const { data, isLoading } = api.jobs.getMyJobs.useQuery({
    filter: {
      status: "accepted",
      // date_gte: new Date().toISOString(),
    },
  });

  return (
    <div>
      <Heading>
        <h2>Gigs</h2>
      </Heading>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          {!data?.length && (
            <p className="p-2 font-body">
              You currently have no gigs. When you accept a gig offer, it will
              appear here.
            </p>
          )}
          <p className="flex flex-col gap-4 p-4 font-body">
            {data?.map((job) => <GigListItem job={job} key={job.id} />)}
          </p>
        </>
      )}
    </div>
  );
};

const GigOffers = () => {
  const { data, isLoading } = api.jobs.getMyJobs.useQuery({
    filter: {
      status: "pending",
    },
  });

  return (
    <div>
      <Heading>
        <h2>Gig Offers</h2>
      </Heading>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <p className="flex flex-col gap-4 p-4 font-body">
          {!data?.length && (
            <p className="p-2 font-body">
              You currently have no gig offers. When you get an offer, it will
              appear here.
            </p>
          )}
          {data?.map((job) => <GigListItem job={job} key={job.id} />)}
        </p>
      )}
    </div>
  );
};

const jobWithInstruments = Prisma.validator<Prisma.JobDefaultArgs>()({
  include: { Instruments: true },
});

type JobWithInstruments = Prisma.JobGetPayload<typeof jobWithInstruments>;

const GigListItem = ({ job }: { job: JobWithInstruments }) => {
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
        className="flex h-1/2 w-full items-center justify-between gap-2 rounded-lg bg-gradient-to-tl from-gray-900/40 to-gray-300/50 p-4 text-center bg-blend-darken shadow-inner shadow-gray-500 backdrop-blur-md"
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
