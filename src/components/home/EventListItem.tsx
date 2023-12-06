import { useRouter } from "next/router";
import InfoIcon from "@mui/icons-material/Info";

export const EventListItem = ({
  event,
}: {
  event: { id: string; name: string; date: Date };
}) => {
  const { push } = useRouter();

  return (
    <>
      <div
        className="flex h-1/2 w-full items-center justify-between gap-2 rounded-lg bg-gradient-to-tl from-gray-900/40 to-gray-300/50 p-4 text-center bg-blend-darken shadow-inner shadow-gray-500 backdrop-blur-md"
        onClick={() => void push(`event/${event.id}?tab=0`)}
      >
        <div>
          <p className="text-left text-lg font-light">
            {event.date
              ? new Date(event.date).toLocaleDateString("en-GB")
              : null}
          </p>
          <p className="text-left">{event.name || "Your event"}</p>
        </div>
        <InfoIcon />
      </div>
    </>
  );
};
