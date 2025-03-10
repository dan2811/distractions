import { useRouter } from "next/router";
import React from "react";
import Layout from "~/components/Layout/Layout";
import { api } from "~/utils/api";

const SongChoice = () => {
  const router = useRouter();
  const { id: eventId, setId } = router.query;
  const {
    data: set,
    isLoading,
    error,
  } = api.sets.getSet.useQuery({ id: setId as string }, { enabled: !!setId });
  return (
    <Layout
      pageName="Choose your songs"
      pageDescription="Help us understand your music taste."
    >
      <div className="flex w-full flex-col gap-6 place-self-center p-4 md:max-w-lg">
        <h1 className="text-left text-xl font-light">Choose your songs</h1>
        <p>Set name: {set?.name}</p>

        
      </div>
    </Layout>
  );
};

export default SongChoice;
