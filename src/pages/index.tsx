import { signIn, useSession } from "next-auth/react";
import Layout from "~/components/Layout/Layout";
import Dwayne from "../../public/assets/images/Dwayne.png";
import Image from "next/image";
import { Bookings } from "~/components/home/bookings";
import { GigOffers } from "~/components/home/GigOffers";
import { Gigs } from "~/components/home/GigList";
import type { Role } from "~/types";
import { LoadingSpinner } from "~/components/LoadingSpinner";

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
  return (
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
  );
};

export default Home;
