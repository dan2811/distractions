import {
  Create,
  DatagridConfigurable,
  Edit,
  List,
  ReferenceArrayField,
  ReferenceArrayInput,
  SelectInput,
  SimpleForm,
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
        <ReferenceArrayInput source="instrument" reference="instrument" />
      </SimpleForm>
    </Edit>
  );
};

export const UserCreate = () => {
  return (
    <Create redirect="show">
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
        <ReferenceArrayField source="instruments" reference="Instrument" />
      </SimpleForm>
    </Create>
  );
};
