import {
  BooleanInput,
  Edit,
  Labeled,
  NumberInput,
  ReferenceArrayInput,
  ReferenceField,
  SimpleForm,
  TextInput,
  required,
} from "react-admin";

export const JobEdit = () => {
  return (
    <Edit>
      <SimpleForm>
        <Labeled label="Event" sx={{ paddingBottom: "1rem" }}>
          <ReferenceField source="eventId" reference="event" link="show" />
        </Labeled>
        <ReferenceArrayInput
          source="Instruments"
          reference="instrument"
          resource="instrument"
        />
        <BooleanInput source="isMd" defaultValue={false} label="MD" />
        <NumberInput source="pay" validate={required()} defaultValue={0} />
        <TextInput source="notes" multiline />
      </SimpleForm>
    </Edit>
  );
};
