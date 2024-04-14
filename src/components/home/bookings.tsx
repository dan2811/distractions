import { Heading } from "../Layout/Heading";
import { LoadingSpinner } from "../LoadingSpinner";
import { EventListItem } from "./EventListItem";
import type { UseTRPCQueryResult } from "@trpc/react-query/shared";
import type { TRPCClientErrorLike } from "@trpc/client";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "~/server/api/root";

export const Bookings = ({
  bookings,
}: {
  bookings: UseTRPCQueryResult<
    inferRouterOutputs<AppRouter>["events"]["getMyBookings"],
    TRPCClientErrorLike<AppRouter>
  >;
}) => {
  const { data, isLoading } = bookings;
  return (
    <div>
      <Heading>
        <h2 className="themed-h2">Bookings</h2>
      </Heading>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="flex flex-col gap-4 p-4 font-body">
          {!data?.length && (
            <div>
              <p>You haven&apos;t made a booking with us yet. 😢</p>
            </div>
          )}
          {data?.map((event) => <EventListItem event={event} key={event.id} />)}
        </div>
      )}
    </div>
  );
};
