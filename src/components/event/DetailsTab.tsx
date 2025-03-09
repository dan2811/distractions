import { useRouter } from "next/router";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { api } from "~/utils/api";
import { Chip } from "@mui/material";

export const DetailsTab = () => {
  const router = useRouter();
  const id = router.query.id as string;

  const { data, isLoading, refetch } = api.events.getOne.useQuery({ id });
  const [editMode, setEditMode] = useState(false);
  const [formValues, setFormValues] = useState({
    eventId: id,
    location: data?.location ?? "",
  });

  const { mutateAsync } = api.events.updateEvent.useMutation();

  if (!id) return 404;

  if (!data || isLoading) return <LoadingSpinner />;

  const tooLateToEdit: boolean =
    Date.parse(data.date.toISOString()) <
    new Date().setDate(new Date().getDate() + data.clientEditLockNumOfDays);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (tooLateToEdit) {
      toast.error("Too late to edit event details", { duration: 5000 });
      return;
    }
    console.log(e);
    void toast.promise(mutateAsync(formValues), {
      loading: "Saving...",
      success: () => {
        void refetch();
        setEditMode(false);
        return "Saved";
      },
      error: () => {
        setEditMode(true);
        return "Error when saving";
      },
    });
  };

  return (
    <div className="flex w-full flex-col gap-6 place-self-center p-4 md:max-w-lg">
      <span className="grid w-full grid-cols-2 self-center rounded-lg bg-gradient-to-tl from-gray-900/40 to-gray-300/50 p-4 bg-blend-darken shadow-inner shadow-gray-500 backdrop-blur-md">
        <div>
          <h2 className="themed-h2">Date</h2>
          <p>{new Date(data.date).toLocaleDateString("en-gb")}</p>
        </div>
      </span>
      <form onSubmit={handleSubmit}>
        <span className="grid w-full grid-cols-2 self-center rounded-lg bg-gradient-to-tl from-gray-900/40 to-gray-300/50 p-4 bg-blend-darken shadow-inner shadow-gray-500 backdrop-blur-md">
          <div>
            <h2 className="themed-h2">Location</h2>
            {editMode ? (
              <textarea
                defaultValue={data.location ?? ""}
                className="themed-input h-3/4 w-full px-1"
                value={formValues.location}
                onChange={(e) =>
                  setFormValues({ ...formValues, location: e.target.value })
                }
              />
            ) : (
              <p className="px-1">{data.location}</p>
            )}
          </div>
          {!tooLateToEdit && (
            <div className="flex w-1/2 flex-col justify-between gap-4 place-self-end self-center">
              <button
                type="button"
                onClick={() => setEditMode(!editMode)}
                className="themed-button"
              >
                {editMode ? "CANCEL" : "EDIT"}
              </button>
              {editMode && (
                <button type="submit" className="themed-button">
                  SAVE
                </button>
              )}
            </div>
          )}
        </span>
      </form>
      <span className="grid w-full grid-cols-2 self-center rounded-lg bg-gradient-to-tl from-gray-900/40 to-gray-300/50 p-4 bg-blend-darken shadow-inner shadow-gray-500 backdrop-blur-md">
        <div className="col-span-2 flex flex-col gap-2">
          <h2 className="themed-h2">Packages</h2>
          <div className="col-span-2 flex w-full flex-wrap gap-2">
            {data.packages.map((pkg) => {
              return (
                <Chip
                  key={pkg.id}
                  label={pkg.name}
                  sx={{
                    backgroundColor: "rgba(168, 160, 124, 0.5)",
                    color: "white",
                  }}
                />
              );
            })}
          </div>
        </div>
      </span>
    </div>
  );
};
