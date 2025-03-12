import {
  BooleanInput,
  Create,
  type Identifier,
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
  TimeInput,
} from "react-admin";
import type { RaJob } from "~/server/RaHandlers/jobHandler";
import type { Role } from "~/types";
import { api } from "~/utils/api";

export const SetCreate = () => {
  const notify = useNotify();
  const redirect = useRedirect();
  const onSuccess = (data: RaJob) => {
    notify(`Set added!`);
    redirect(`/event/${data.eventId}/show/2`);
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

        <TextInput source="name" label="Set name" validate={required()} />
        <ReferenceInput
          source="package"
          reference="package"
          validate={required()}
        />
        <TextInput source="location" multiline validate={required()} />
        <TimeInput source="startTime" validate={required()} />
        <TimeInput source="endTime" validate={required()} />
      </SimpleForm>
    </Create>
  );
};
