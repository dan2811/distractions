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
      <Heading>
        <h2 className="themed-h2">Gig Offers</h2>
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
