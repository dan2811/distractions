import {
  BooleanInput,
  Create,
  NumberInput,
  ReferenceArrayInput,
  ReferenceInput,
  SelectInput,
  SimpleForm,
  required,
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
          <SelectInput optionText="name" />
        </ReferenceInput>

        <ReferenceArrayInput
          source="Instruments"
          reference="instrument"
          validate={required()}
        />

        <ReferenceInput
          optionText="name"
          source="musicianId"
          reference="user"
          validate={required()}
          filter={{ role: ["musician", "admin", "superAdmin"] }}
        >
          <SelectInput />
        </ReferenceInput>

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
