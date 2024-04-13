import { Create, SimpleForm, TextInput, required } from "react-admin";

export const WageCreate = () => {
  return (
    <Create redirect="show">
      <SimpleForm>
        <TextInput source="name" validate={required()} />
        <TextInput source="amount" validate={required()} />
      </SimpleForm>
    </Create>
  );
};
