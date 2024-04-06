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
  return jobs.map((job) => (
    <div key={job.id}>
      <p>Event Name: {job.event.name}</p>
      <p>Location: {job.event.location}</p>
      <p>Last Updated: {job.updatedAt.toLocaleDateString("en-gb")}</p>
      <p>Created At: {job.createdAt.toLocaleDateString("en-gb")}</p>
      <p>Status: {job.status}</p>
      <p>Hotel booked? {job.hotelBooked}</p>
      <p>Hotel Info: {job.hotelInfo}</p>
      <p>Notes: {job.notes}</p>
    </div>
  ));
};

export default JobCard;
