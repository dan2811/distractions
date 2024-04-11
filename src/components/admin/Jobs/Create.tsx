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
  TextInput,
} from "react-admin";
import type { RaJob } from "~/pages/api/RaHandlers/jobHandler";
import type { Role } from "~/types";
import { api } from "~/utils/api";

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
        <TextInput source="notes" multiline />
        <BooleanInput source="isMd" defaultValue={false} label="MD" />
      </SimpleForm>
    </Create>
  );
};

export default JobCreate;

const FilteredMusicianInput = () => {
  const { record } = useCreateContext<{
    id: Identifier;
    Instruments: string[] | null;
  }>();
  const notify = useNotify();

  const query: { roles: Role[]; instruments?: string[] } = {
    roles: ["admin", "musician", "superAdmin"],
  };

  if (record?.Instruments) {
    query.instruments = record?.Instruments;
  }

  const { data: musicians, isLoading } = api.users.listUsers.useQuery(query);

  if (!record || isLoading) return null;

  if (!musicians ?? !musicians?.length) {
    notify(
      "There are no musicians that play this instrument! Please ensure the musician you want to add has this instrument on their profile.",
      {
        type: "warning",
        autoHideDuration: 10000,
      },
    );
  }

  return (
    <SelectInput choices={musicians} source="musicianId" optionText="name" />
  );
};
