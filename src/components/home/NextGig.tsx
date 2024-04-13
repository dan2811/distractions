import React from "react";
import { api } from "~/utils/api";
import { Heading } from "../Layout/Heading";
import { LoadingSpinner } from "../LoadingSpinner";
import { GigListItem } from "./GigListItem";

const NextGig = () => {
  const { data, isLoading } = api.jobs.getMyNextJobs.useQuery();
  if (!data?.length) {
    return;
  }
  return (
    <div>
      {data && data.length > 0 && (
        <Heading>
          <h2 className="themed-h2">Next Gig</h2>
        </Heading>
      )}
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <p className="flex flex-col gap-4 p-4 font-body">
          {data?.map((job) => <GigListItem job={job} key={job.id} />)}
        </p>
      )}
    </div>
  );
};

export default NextGig;
