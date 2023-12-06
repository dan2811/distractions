import { api } from "~/utils/api";
import { Heading } from "../Layout/Heading";
import { LoadingSpinner } from "../LoadingSpinner";
import { GigListItem } from "./GigListItem";

export const Gigs = () => {
  const { data, isLoading } = api.jobs.getMyJobs.useQuery({
    filter: {
      status: "accepted",
      // date_gte: new Date().toISOString(),
    },
  });

  return (
    <div>
      <Heading>
        <h2>Gigs</h2>
      </Heading>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          {!data?.length && (
            <p className="p-2 font-body">
              You currently have no gigs. When you accept a gig offer, it will
              appear here.
            </p>
          )}
          <p className="flex flex-col gap-4 p-4 font-body">
            {data?.map((job) => <GigListItem job={job} key={job.id} />)}
          </p>
        </>
      )}
    </div>
  );
};
