import {
  Create,
  DatagridConfigurable,
  Edit,
  List,
  SelectInput,
  Show,
  SimpleForm,
  SimpleShowLayout,
  TextField,
  TextInput,
} from "react-admin";

export const UserList = () => {
  return (
    <List>
      <DatagridConfigurable rowClick="show" omit={["id"]}>
        <TextField source="id" />
        <TextField source="name" />
        <TextField source="role" />
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
        <TextInput source="email" type="email" />
        <TextInput source="phone" />
        <SelectInput
          source="role"
          choices={[
            { id: "superAdmin", name: "Super Admin" },
            { id: "admin", name: "Admin" },
            { id: "musician", name: "Musician" },
            { id: "client", name: "Client" },
          ]}
        />
      </SimpleForm>
    </Edit>
  );
};

export const UserCreate = () => {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="name" />
        <TextInput source="email" type="email" />
        <TextInput source="phone" />
        <SelectInput
          source="role"
          choices={[
            { id: "superAdmin", name: "Super Admin" },
            { id: "admin", name: "Admin" },
            { id: "musician", name: "Musician" },
            { id: "client", name: "Client" },
          ]}
        />
      </SimpleForm>
    </Create>
  );
};
