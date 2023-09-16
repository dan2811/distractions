import { BottomNavigation, BottomNavigationAction } from "@mui/material";
import { useRouter } from "next/router";
import React, {
  type Dispatch,
  type HTMLInputTypeAttribute,
  type SetStateAction,
  useState,
  useEffect,
} from "react";
import { toast } from "react-hot-toast";
import { globalColors } from "tailwind.config";
import Layout from "~/components/Layout/Layout";
import { Loading } from "~/components/Loading";
import { type RouterInputs, api } from "~/utils/api";

const EventDetails = () => {
  const router = useRouter();
  const id = router.query.id;
  const { data, isLoading } = api.events.getOne.useQuery({
    id: id as string,
  });
  const [currentTab, setCurrentTab] = useState(0);

  const tabs = [<DetailsTab key={1} />, <div key={2}>Payments</div>];

  return (
    <Layout>
      {tabs[currentTab]}
      <BottomNavigation
        showLabels
        value={currentTab}
        onChange={(event, newValue: number) => {
          setCurrentTab(newValue);
        }}
        sx={{
          "& .Mui-selected": {
            color: "white",
          },
          "& .MuiBottomNavigationAction-root": {
            color: globalColors.main.accent,
          },
        }}
        className="bg-main-menu fixed bottom-0 w-full"
      >
        <BottomNavigationAction label="Details" />
        <BottomNavigationAction label="Payments" />
      </BottomNavigation>
    </Layout>
  );
};

const DetailsTab = () => {
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
    date: data?.date ?? "",
    location: data?.location ?? "",
  });
  const [editMode, setEditMode] = useState(false);
  const { isLoading: isMutationLoading, mutateAsync } =
    api.events.updateEvent.useMutation();
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void toast.promise(mutateAsync(formValues), {
      loading: "Saving...",
      success: "Saved",
      error: () => {
        setEditMode(true);
        return "Error when saving";
      },
    });
  };

  useEffect(() => {
    setFormValues({
      eventId: id as string,
      name: data?.name ?? "",
      date: data?.date ?? "",
      location: data?.location ?? "",
    });
    console.log("use effect check");
  }, [data?.date, data?.location, data?.name, id]);
  if (!id) return 404;

  if (isLoading) return <Loading />;
  return (
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
        editMode={editMode}
      />
      <Attribute
        fieldName="location"
        label="Location"
        inputType="text"
        formValues={formValues}
        setFormValues={setFormValues}
        editMode={editMode}
      />
      <ul className="flex w-full flex-col pl-2">
        <p>Packages:</p>
        {data?.packages.map((pkg) => (
          <li key={pkg.id} className="w-2/5 text-right">
            - {pkg.name}
          </li>
        ))}
      </ul>
      <button
        type={editMode ? "button" : "submit"}
        disabled={isMutationLoading}
        className="w-1/2 self-center bg-main-accent disabled:opacity-40"
        onClick={() => setEditMode(!editMode)}
      >
        {editMode ? "Save" : "Edit Details"}
      </button>
    </form>
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
      {editMode ? (
        <input
          type={inputType}
          id={fieldName}
          value={formValues[fieldName]}
          onChange={(e) =>
            setFormValues({ ...formValues, [fieldName]: e.target.value })
          }
          pattern={validationPattern}
          className="col-span-4 w-full p-1"
        />
      ) : (
        <p className="col-span-4 w-full">{formValues[fieldName]}</p>
      )}
    </div>
  );
};

export default EventDetails;
