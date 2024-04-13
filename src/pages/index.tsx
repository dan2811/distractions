import { signIn, useSession } from "next-auth/react";
import Layout from "~/components/Layout/Layout";
import Dwayne from "../../public/assets/images/Dwayne.png";
import Image from "next/image";
import { Bookings } from "~/components/home/bookings";
import { GigOffers } from "~/components/home/GigOffers";
import { Gigs } from "~/components/home/GigList";
import type { Role } from "~/types";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import NextGig from "~/components/home/NextGig";

const Home = () => {
  const session = useSession();

  if (session.status === "loading") return <LoadingSpinner />;

  if (session.status !== "authenticated") return void signIn();

  return (
    <Layout
      pageName="The Distractions Band"
      pageDescription="Manage your booking"
    >
      <AuthenticatedHomePage session={session} />
    </Layout>
  );
};

const AuthenticatedHomePage = ({
  session,
}: {
  session: {
    status: "authenticated";
    data: {
      user: {
        role: Role;
      };
    };
  };
}) => {
  const { push } = useRouter();
  const bookings = api.events.getMyBookings.useQuery();
  const isClient = session.data.user.role === "client";
  const userRole = session.data?.user.role;

  // redirect to the event page if the user is a client and has only one booking
  if (userRole === "client" && bookings.data && bookings.data.length === 1) {
    void push(`/event/${bookings.data[0]?.id}`);
    return;
  }

  return (
    <>
      <div className="fixed -z-40 h-screen w-screen bg-black bg-opacity-30 " />
      <Image
        src={Dwayne}
        alt="showband"
        className="fixed -z-50 bg-black bg-blend-darken"
      />
      {!isClient && !bookings.data?.length ? null : (
        <Bookings bookings={bookings} />
      )}
      {!isClient && <GigOffers />}
      {!isClient && <NextGig />}
      {!isClient && <Gigs />}
    </>
  );
};

export default Home;
