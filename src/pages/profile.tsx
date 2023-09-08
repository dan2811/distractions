import { useSession } from "next-auth/react";
import Layout from "~/components/Layout";

const Profile = () => {
  const { data: sessionData } = useSession();

  return (
    <Layout>
      <p className="flex flex-col text-center text-2xl text-white">
        {sessionData && <span>Logged in as {sessionData.user.name}</span>}
      </p>
    </Layout>
  );
};

export default Profile;
