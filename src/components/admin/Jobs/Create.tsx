import {
  BooleanInput,
  Create,
  type Identifier,
  NumberInput,
  ReferenceArrayInput,
  ReferenceInput,
  SelectArrayInput,
  SelectInput,
  SimpleForm,
  required,
  useCreateContext,
  useNotify,
  useRedirect,
} from "react-admin";
import type { RaJob } from "~/pages/api/RaHandlers/jobHandler";

const JobCreate = () => {
  const notify = useNotify();
  const redirect = useRedirect();
  const onSuccess = (data: RaJob) => {
    notify(`Musician added!`);
    redirect(`/event/${data.eventId}/show`);
  };

  return (
    <Create redirect="event" mutationOptions={{ onSuccess }}>
      <SimpleForm>
        <ReferenceInput
          source="eventId"
          reference="event"
          validate={required()}
        >
          <SelectInput optionText="name" disabled />
        </ReferenceInput>

        <ReferenceArrayInput
          source="Instruments"
          reference="instrument"
          validate={required()}
          disabled={true}
        >
          <SelectArrayInput optionText="name" disabled />
        </ReferenceArrayInput>
        <FilteredMusicianInput />
        <NumberInput
          source="pay"
          validate={required()}
          defaultValue={0}
          disabled
        />

        <BooleanInput source="isMd" defaultValue={false} label="MD" />
      </SimpleForm>
    </Create>
  );
};

export default JobCreate;

interface MusicianFilter {
  role: string[];
  instruments?: string[];
}

const FilteredMusicianInput = () => {
  const { record } = useCreateContext<{
    id: Identifier;
    instruments: string[] | null;
  }>();
  const notify = useNotify();

  if (!record) return null;
  if (!record.instruments) {
    notify(
      "There are no musicians that play this instrument! Please ensure the musician you want to add has this instrument on their profile.",
      {
        type: "warning",
        autoHideDuration: 10000,
      },
    );
  }

  const filter: MusicianFilter = {
    role: ["musician", "admin", "superAdmin"],
  };
  if (record.instruments) filter.instruments = record.instruments;

  return (
    <ReferenceInput
      optionText="name"
      source="musicianId"
      reference="user"
      validate={required()}
      filter={filter}
    >
      <SelectInput />
    </ReferenceInput>
  );
};
