import { useRouter } from "next/router";
import React, {
  type Dispatch,
  type HTMLInputTypeAttribute,
  type SetStateAction,
  useState,
  useEffect,
} from "react";
import { toast } from "react-hot-toast";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { type RouterInputs, api } from "~/utils/api";
import Image from "next/image";
import Showband from "/public/assets/images/showband.webp";
import { Chip } from "@mui/material";

export const DetailsTab = () => {
  const router = useRouter();
  const id = router.query.id;
  const { data, isLoading } = api.events.getOne.useQuery({
    id: id as string,
  });
  const [formValues, setFormValues] = useState<
    RouterInputs["events"]["updateEvent"]
  >({
    eventId: id as string,
    name: data?.name ?? "",
    date: data?.date ? new Date(data.date).toLocaleDateString() : "",
    location: data?.location ?? "",
  });
  const [editMode, setEditMode] = useState(false);

  const { isLoading: isMutationLoading, mutateAsync } =
    api.events.updateEvent.useMutation();

  useEffect(() => {
    setFormValues({
      eventId: id as string,
      name: data?.name ?? "",
      date: new Date(data?.date ?? "").toISOString().split("T")[0] ?? "",
      location: data?.location ?? "",
    });
  }, [data?.date, data?.location, data?.name, id]);

  if (!id) return 404;

  if (!data || isLoading) return <LoadingSpinner />;

  const tooLateToEdit: boolean =
    Date.parse(data.date.toISOString()) <
    new Date().setDate(
      new Date().getDate() +
        parseInt(process.env.NUM_DAYS_BEFORE_EVENT_LOCK ?? "14"),
    );

  console.log(
    Date.parse(data.date.toISOString()),
    new Date().setDate(
      new Date().getDate() -
        parseInt(process.env.NUM_DAYS_BEFORE_EVENT_LOCK ?? "14"),
    ),
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (tooLateToEdit) {
      toast.error("Too late to edit event details", { duration: 5000 });
      return;
    }
    void toast.promise(
      mutateAsync({
        ...formValues,
        date: new Date(formValues.date).toISOString(),
      }),
      {
        loading: "Saving...",
        success: () => {
          setEditMode(false);
          return "Saved";
        },
        error: () => {
          setEditMode(true);
          return "Error when saving";
        },
      },
    );
  };

  return (
    <>
      <Image
        src={Showband}
        alt="showband"
        className="max-h-60 w-full object-cover object-bottom"
      />
      <h1 className="text-center text-xl font-light">
        {data.name ?? "Your event"}
      </h1>
      <div className="flex flex-col gap-6 p-4">
        <span className="grid w-full grid-cols-2 self-center rounded-lg bg-gradient-to-tl from-gray-900/40 to-gray-300/50 p-4 bg-blend-darken shadow-inner shadow-gray-500 backdrop-blur-md">
          <div>
            <h2>Date</h2>
            <p>{new Date(data.date).toLocaleDateString()}</p>
          </div>
        </span>
        <span className="grid w-full grid-cols-2 self-center rounded-lg bg-gradient-to-tl from-gray-900/40 to-gray-300/50 p-4 bg-blend-darken shadow-inner shadow-gray-500 backdrop-blur-md">
          <div>
            <h2>Location</h2>
            <p>{data.location}</p>
          </div>
          <button className="flex w-1/2 justify-center place-self-end self-center">
            EDIT
          </button>
        </span>
        <span className="grid w-full grid-cols-2 self-center rounded-lg bg-gradient-to-tl from-gray-900/40 to-gray-300/50 p-4 bg-blend-darken shadow-inner shadow-gray-500 backdrop-blur-md">
          <div className="col-span-2 flex flex-col gap-2">
            <h2>Packages</h2>
            <div className="col-span-2 flex w-full flex-wrap gap-2">
              {data.packages.map((pkg) => {
                return (
                  <Chip
                    key={pkg.id}
                    label={pkg.name}
                    className="bg-main-accent bg-opacity-50 text-white"
                  />
                );
              })}
            </div>
          </div>
        </span>
      </div>
    </>
  );
};

interface AttributeProps<FormValues> {
  fieldName: keyof FormValues;
  label: string;
  inputType: HTMLInputTypeAttribute;
  formValues: FormValues;
  setFormValues: Dispatch<SetStateAction<FormValues>>;
  validationPattern?: string;
  editMode: boolean;
}

const Attribute = ({
  fieldName,
  label,
  inputType,
  formValues,
  setFormValues,
  validationPattern,
  editMode,
}: AttributeProps<RouterInputs["events"]["updateEvent"]>) => {
  return (
    <div className="grid grid-cols-6 p-2">
      {editMode && (
        <label htmlFor={fieldName} className="col-span-2 self-start">
          {label}:
        </label>
      )}
      <input
        type={inputType}
        id={fieldName}
        value={formValues[fieldName]}
        onChange={(e) =>
          setFormValues({ ...formValues, [fieldName]: e.target.value })
        }
        pattern={validationPattern}
        className="col-span-4 w-full bg-main-input p-2 disabled:bg-opacity-0"
        disabled={!editMode}
      />
    </div>
  );
};
