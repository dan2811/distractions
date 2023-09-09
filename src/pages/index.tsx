import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Auth } from "~/components/Auth";
import Layout from "~/components/Layout";
import { Loading } from "~/components/Loading";
import { api } from "~/utils/api";

export default function Home() {
  const session = useSession();
  const isUserAuthed = session.status === "authenticated";
  const userRole = session.data?.user.role;
  return (
    <>
      <Head>
        <title>The Distractions Band</title>
        <meta name="description" content="Manage your booking" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <Auth />
        {isUserAuthed && (
          <>
            <Bookings />
            {userRole === "musician" ?? <Gigs />}
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
        onClick={() => void push(`event/detail/${event.id}`)}
      >
        <p>{event.date ?? new Date(event.date).toLocaleDateString()}</p>
        <p>{event.name}</p>
      </div>
      <hr />
    </>
  );
};

const Gigs = () => {
  return (
    <div>
      <Heading>
        <h2>Your Gigs</h2>
      </Heading>
    </div>
  );
};

const Heading = (props: React.PropsWithChildren) => (
  <div className="flex w-2/3 flex-row items-center justify-end gap-2 bg-main-accent py-2 pr-2 font-headers">
    <hr className="flex-grow" />
    {props.children}
  </div>
);
