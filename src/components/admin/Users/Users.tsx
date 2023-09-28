import { User } from "@prisma/client";
import { ReactEventHandler } from "react";
import {
  ArrayField,
  Create,
  DatagridConfigurable,
  Edit,
  FunctionField,
  List,
  ReferenceArrayField,
  ReferenceArrayInput,
  ReferenceInput,
  SelectArrayInput,
  SelectInput,
  Show,
  SimpleForm,
  SimpleShowLayout,
  TextField,
  TextInput,
} from "react-admin";
import { RaUser } from "~/pages/api/[resource]";

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
        <TextField source="phone" emptyText="No phone number" />
        <TextField source="role" />
        <FunctionField
          render={(record: RaUser) =>
            record.role === "client" ? null : (
              <ReferenceArrayField
                source="instruments"
                reference="instrument"
              />
            )
          }
        />
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
