import type { Prisma } from "@prisma/client";
import React from "react";

interface JobCardProps {
  jobs:
    | Prisma.JobGetPayload<{
        include: {
          event: {
            select: {
              date: true;
              id: true;
              name: true;
              location: true;
            };
          };
        };
      }>[]
    | undefined;
}

const JobCard = ({ jobs }: JobCardProps) => {
  console.log(jobs);
  if (!jobs) return null;
  return (
    <div className="flex flex-col gap-4 p-4">
      {jobs.map((job) => (
        <div
          key={job.id}
          className="flex flex-col rounded-lg bg-gradient-to-tl from-gray-900/40 to-gray-600/50 p-4 px-2 bg-blend-darken shadow-inner shadow-gray-500 backdrop-blur-md"
        >
          <div>
            <p className="text-left text-lg font-light">Event Name:</p>
            <p>{job.event.name}</p>
          </div>
          <div>
            <p className="text-left text-lg font-light">Location:</p>
            <p>{job.event.location}</p>
          </div>
          <div>
            <p className="text-left text-lg font-light">Status:</p>
            <p>{job.status}</p>
          </div>
          <div>
            {job.notes ? (
              <>
                <p className="text-left text-lg font-light">Notes:</p>
                <p>{job.notes}</p>
              </>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
};

export default JobCard;
