import React from "react";
import {
  Create,
  DatagridConfigurable,
  DateInput,
  Edit,
  List,
  ReferenceField,
  ReferenceInput,
  Show,
  SimpleForm,
  SimpleShowLayout,
  TextField,
  TextInput,
} from "react-admin";
import { InvoiceButton } from "./Invoices";

export const EventList = () => {
  return (
    <List>
      <DatagridConfigurable omit={["id"]} rowClick="show">
        <TextField source="id" />
        <TextField source="name" />
        <TextField source="date" />
        <ReferenceField source="ownerId" reference="user" />
      </DatagridConfigurable>
    </List>
  );
};

export const EventShow = () => {
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="name" />
        <TextField source="date" />
        <ReferenceField source="ownerId" reference="user" link="show" />
        <InvoiceButton type="deposit" />
        <InvoiceButton type="final" />
      </SimpleShowLayout>
    </Show>
  );
};

export const EventCreate = () => {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="name" />
        <DateInput source="date" />
        <ReferenceInput source="owner" reference="user" />
        <TextInput source="EventType" />
        <TextInput source="location" />
        <TextInput source="price" />
      </SimpleForm>
    </Create>
  );
};

export const EventEdit = () => {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="name" />
        <DateInput source="date" />
        <ReferenceInput source="owner" reference="user" />
        <TextInput source="EventType" />
        <TextInput source="location" />
        <TextInput source="price" />
      </SimpleForm>
    </Edit>
  );
};
