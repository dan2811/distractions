import { InfoIcon } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";
import Layout from "~/components/Layout/Layout";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { api } from "~/utils/api";

const Sets = () => {
  const router = useRouter();
  const eventId = router.query.id as string;
  const [more, setMore] = useState(false);

  const {
    data: sets,
    isLoading,
    error,
  } = api.events.getSets.useQuery({ eventId }, { enabled: !!eventId });

  if (isLoading) return <LoadingSpinner />;

  if (error) return <p>Something went wrong! Error: {error.message}</p>;

  return (
    <Layout
      pageName="Your sets"
      pageDescription="Help us understand your music taste."
    >
      <div className="flex w-full flex-col gap-6 place-self-center p-4 md:max-w-lg">
        <h1 className="text-center text-xl font-light">Your Sets</h1>
        <p>
          Help us to make your event unforgettable by letting us know your music
          preferences.{" "}
          <a
            onClick={() => setMore((m) => !m)}
            className="font-medium text-main-accent underline"
          >
            {more ? "Read less..." : "Read more..."}
          </a>
        </p>
        {more && (
          <span className="flex gap-4">
            <InfoIcon className="h-full min-w-fit self-center" />
            <p>
              Our performance at your event is split up into sets. Our musicians
              will constantly assess the audience throughout event and
              dynamically adjust the songs we play based on audience reactions
              and the general mood of the room. The selection you are about to
              make is not a guarantee. It is a guide to help us understand your
              preferences before the event.
            </p>
          </span>
        )}
        {sets.length ? (
          sets.map((set) => {
            return (
              <span
                key={set.id}
                className="grid w-full grid-cols-2 self-center rounded-lg bg-gradient-to-tl from-gray-900/40 to-gray-300/50 p-4 bg-blend-darken shadow-inner shadow-gray-500 backdrop-blur-md"
              >
                <div>
                  <h2 className="themed-h2">{set.name}</h2>
                  <p>{set.location}</p>
                  <p>
                    {new Date(set.startTime).toLocaleTimeString("en-GB", {
                      timeStyle: "short",
                    })}{" "}
                    -{" "}
                    {new Date(set.endTime).toLocaleTimeString("en-GB", {
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                <span className="flex w-1/2 flex-col justify-between gap-4 place-self-end self-center">
                  <button
                    type="button"
                    className="themed-button"
                    onClick={() =>
                      void router.push(`/event/${eventId}/sets/${set.id}`)
                    }
                  >
                    Songs
                  </button>
                </span>
              </span>
            );
          })
        ) : (
          <span className="flex gap-4">
            <InfoIcon className="h-full min-w-fit self-center" />
            <p>
              The sets for this event haven&apos;t yet been created. Please
              check again later.
            </p>
          </span>
        )}
      </div>
    </Layout>
  );
};

export default Sets;
