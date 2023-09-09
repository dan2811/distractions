import { useSession } from "next-auth/react";
import Head from "next/head";
import { Auth } from "~/components/Auth";
import Layout from "~/components/Layout";
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
        <Auth />
        {isUserAuthed && (
          <>
            <RequiredActions />
            <Bookings />
            <Gigs />
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
        <p>Loading...</p>
      ) : (
        <p className="font-body">
          {data?.map(({ id, date }) => `${id} ${date}`)}
        </p>
      )}
    </div>
  );
};

const Gigs = () => {
  return (
    <div>
      <h2>Your Gigs</h2>
    </div>
  );
};

const RequiredActions = () => {
  return (
    <div>
      <h2>Required Actions</h2>
    </div>
  );
};

const Heading = (props: React.PropsWithChildren) => (
  <div className="bg-main-accent font-headers flex w-2/3 flex-row items-center justify-end gap-2 py-2 pr-2">
    <hr className="flex-grow" />
    {props.children}
  </div>
);
