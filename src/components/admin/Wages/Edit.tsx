import { Edit, SimpleForm, TextInput, required } from "react-admin";

export const WageEdit = () => {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="name" validate={required()} />
        <TextInput source="amount" validate={required()} />
      </SimpleForm>
    </Edit>
  );
};
