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
        src="/public/assets/images/showband.webp"
        alt="showband"
        className="max-h-60 w-full object-cover object-bottom"
      />
      <h1 className="text-center text-xl font-light">
        {data.name ?? "Your event"}
      </h1>
      <form className="flex flex-col gap-2 py-2 pl-2" onSubmit={handleSubmit}>
        <Attribute
          fieldName="name"
          label="Event Name"
          inputType="text"
          formValues={formValues}
          setFormValues={setFormValues}
          editMode={editMode}
        />
        <Attribute
          fieldName="date"
          label="Date"
          inputType="date"
          formValues={formValues}
          setFormValues={setFormValues}
          editMode={false}
        />
        <div className="grid grid-cols-6 p-2">
          <label htmlFor="location" className="col-span-2 self-start">
            Location:
          </label>
          <textarea
            id="location"
            value={formValues.location}
            onChange={(e) =>
              setFormValues({ ...formValues, location: e.target.value })
            }
            className="col-span-4 w-full resize-none p-1 disabled:bg-main-dark"
            disabled={!editMode}
          />
        </div>
        <ul className="flex w-full flex-col pl-2">
          <p>Packages:</p>

          {data.packages.map((pkg) => (
            <li key={pkg.id} className="w-2/5 text-right">
              - {pkg.name}
            </li>
          ))}
        </ul>
        <span className="flex justify-center gap-3">
          {!editMode ? (
            <button
              type={"button"}
              disabled={isMutationLoading}
              className="w-1/3 self-center bg-main-accent disabled:opacity-40"
              onClick={(e) => {
                e.preventDefault();
                if (tooLateToEdit) {
                  toast.error("Too late to edit event details", {
                    duration: 5000,
                  });
                } else {
                  setEditMode(true);
                }
              }}
            >
              {"Edit Details"}
            </button>
          ) : (
            <button
              type="submit"
              disabled={isMutationLoading}
              className="w-1/3 self-center bg-main-accent disabled:opacity-40"
            >
              {"Save"}
            </button>
          )}
          {editMode && (
            <button
              type="button"
              onClick={() => setEditMode(false)}
              className="w-1/3 self-center bg-main-accent disabled:opacity-40"
            >
              Cancel
            </button>
          )}
        </span>
      </form>
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
      <label htmlFor={fieldName} className="col-span-2 self-start">
        {label}:
      </label>
      <input
        type={inputType}
        id={fieldName}
        value={formValues[fieldName]}
        onChange={(e) =>
          setFormValues({ ...formValues, [fieldName]: e.target.value })
        }
        pattern={validationPattern}
        className="col-span-4 w-full bg-main-input p-2 disabled:bg-main-dark"
        disabled={!editMode}
      />
    </div>
  );
};
