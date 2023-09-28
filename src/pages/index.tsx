import { type Instrument, Prisma } from "@prisma/client";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { AuthButton } from "~/components/Auth";
import { Heading } from "~/components/Layout/Heading";
import Layout from "~/components/Layout/Layout";
import { Loading } from "~/components/Loading";
import { api } from "~/utils/api";

export default function Home() {
  const session = useSession();
  const isUserAuthed = session.status === "authenticated";

  return (
    <>
      <Head>
        <title>The Distractions Band</title>
        <meta name="description" content="Manage your booking" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        {!isUserAuthed && <AuthButton />}
        {isUserAuthed && (
          <>
            <Bookings />
            {session.data.user.role === "musician" && <GigOffers />}
            {session.data.user.role === "musician" && <Gigs />}
          </>
        )}
      </Layout>
    </>
  );
}

const Bookings = () => {
  const { data, isLoading } = api.events.getMyBookings.useQuery();
  if (!data?.length) return null;
  return (
    <div>
      <Heading>
        <h2>Your Bookings</h2>
      </Heading>
      {isLoading ? (
        <Loading />
      ) : (
        <p className="font-body">
          {data?.map((event) => <EventListItem event={event} key={event.id} />)}
        </p>
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
        className="flex flex-col gap-2 py-2 pl-2"
        onClick={() => void push(`event/${event.id}?tab=0`)}
      >
        <p>{!!event.date ?? new Date(event.date).toLocaleDateString()}</p>
        <p>{event.name || "Your event"}</p>
      </div>
      <hr />
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
        <h2>Your Gigs</h2>
      </Heading>
      {isLoading ? (
        <Loading />
      ) : (
        <>
          {!data?.length && (
            <p className="p-2 font-body">
              You currently have no gigs. When you accept a gig offer, it will
              appear here.
            </p>
          )}
          <p className="font-body">
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
        <h2>Your Gig Offers</h2>
      </Heading>
      {isLoading ? (
        <Loading />
      ) : (
        <p className="font-body">
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
  const { data: event, isLoading } = api.events.getOne.useQuery({
    id: job.eventId,
  });
  if (!event) return <Loading />;

  const instruments = job.Instruments;
  return (
    <>
      <div
        className="flex flex-col gap-2 py-2 pl-2"
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
      <hr />
    </>
  );
};
