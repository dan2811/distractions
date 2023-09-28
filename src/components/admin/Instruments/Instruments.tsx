import { ReactEventHandler } from "react";
import {
  ArrayField,
  Create,
  DatagridConfigurable,
  Edit,
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

export const InstrumentList = () => {
  return (
    <List>
      <DatagridConfigurable rowClick="show" omit={["id"]}>
        <TextField source="id" />
        <TextField source="name" />
      </DatagridConfigurable>
    </List>
  );
};

export const InstrumentShow = () => {
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="id" />
        <TextField source="name" />
      </SimpleShowLayout>
    </Show>
  );
};

export const InstrumentEdit = () => {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="name" />
      </SimpleForm>
    </Edit>
  );
};

export const InstrumentCreate = () => {
  return (
    <Create redirect="show">
      <SimpleForm>
        <TextInput source="name" />
      </SimpleForm>
    </Create>
  );
};
