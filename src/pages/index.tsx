import { Event } from "@prisma/client";
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
            {session.data.user.role === "musician" && <Gigs />}
          </>
        )}
      </Layout>
    </>
  );
}

const Bookings = () => {
  const { data, isLoading } = api.events.getMyBookings.useQuery();
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
  event: { id: string; name: string; date: string };
}) => {
  const { push } = useRouter();

  return (
    <>
      <div
        className="flex flex-col gap-2 py-2 pl-2"
        onClick={() => void push(`event/${event.id}?tab=0`)}
      >
        <p>{event.date ?? new Date(event.date).toLocaleDateString()}</p>
        <p>{event.name || "Your event"}</p>
      </div>
      <hr />
    </>
  );
};

const Gigs = () => {
  const { data, isLoading } = api.events.getMyGigs.useQuery();

  return (
    <div>
      <Heading>
        <h2>Your Gigs</h2>
      </Heading>
      {isLoading ? (
        <Loading />
      ) : (
        <p className="font-body">
          {data?.map((event) => <GigListItem event={event} key={event.id} />)}
        </p>
      )}
    </div>
  );
};

const GigListItem = ({
  event,
}: {
  event: { id: string; date: string; location: string | null };
}) => {
  const { push } = useRouter();

  return (
    <>
      <div
        className="flex flex-col gap-2 py-2 pl-2"
        onClick={() => void push(`gig/${event.id}?tab=0`)}
      >
        <p>{event.date ?? new Date(event.date).toLocaleDateString()}</p>
        <p>{event.location}</p>
      </div>
      <hr />
    </>
  );
};
