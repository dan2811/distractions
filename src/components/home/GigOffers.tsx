import { api } from "~/utils/api";
import { Heading } from "../Layout/Heading";
import { LoadingSpinner } from "../LoadingSpinner";
import { GigListItem } from "./GigListItem";

export const GigOffers = () => {
  const { data, isLoading } = api.jobs.getMyJobs.useQuery({
    filter: {
      status: "pending",
    },
  });

  return (
    <div>
      {data && data.length > 0 && (
        <Heading>
          <h2 className="themed-h2">Gig Offers</h2>
        </Heading>
      )}
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <p className="flex flex-col gap-4 p-4 font-body">
          {/* {!data?.length && (
            <p className="flex h-1/2 w-full items-center justify-between gap-2 rounded-lg bg-gradient-to-tl from-gray-900/40 to-gray-300/50 p-4 text-center font-light bg-blend-darken shadow-inner shadow-gray-500 backdrop-blur-md md:max-w-md">
              You currently have no gig offers. When you get an offer, it will
              appear here.
            </p>
          )} */}
          {data?.map((job) => <GigListItem job={job} key={job.id} />)}
        </p>
      )}
    </div>
  );
};
