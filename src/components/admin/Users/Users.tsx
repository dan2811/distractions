import {
  DatagridConfigurable,
  Edit,
  List,
  ReferenceArrayInput,
  ReferenceInput,
  Show,
  SimpleForm,
  SimpleShowLayout,
  TextField,
  TextInput,
  useGetMany,
  useGetManyReference,
  useRecordContext,
} from "react-admin";

export const UserList = () => {
  return (
    <List>
      <DatagridConfigurable rowClick="show" omit={["id"]}>
        <TextField source="id" />
        <TextField source="name" />
      </DatagridConfigurable>
    </List>
  );
};

export const UserShow = () => {
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="name" />
        <TextField source="email" />
        <TextField source="phone" />
      </SimpleShowLayout>
    </Show>
  );
};

export const UserEdit = () => {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="name" />
        <TextInput source="email" />
        <TextInput source="phone" />
      </SimpleForm>
    </Edit>
  );
};
