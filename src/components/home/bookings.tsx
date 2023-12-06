import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import { Heading } from "../Layout/Heading";
import { LoadingSpinner } from "../LoadingSpinner";
import { EventListItem } from "./EventListItem";

export const Bookings = () => {
  const session = useSession();
  const { data, isLoading } = api.events.getMyBookings.useQuery();
  if (session.data?.user.role !== "client" && !data?.length) return null;
  return (
    <div>
      <Heading>
        <h2>Bookings</h2>
      </Heading>
      {isLoading && session.data?.user.role === "client" ? (
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
