import React from "react";
import {
  ArrayInput,
  Create,
  DatagridConfigurable,
  DateField,
  DateInput,
  Edit,
  List,
  NumberInput,
  ReferenceField,
  ReferenceInput,
  SelectInput,
  Show,
  SimpleForm,
  SimpleFormIterator,
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
        <ReferenceField
          source="ownerId"
          reference="user"
          link="show"
          label="Client"
        />
        <DateField source="date" />
        <ReferenceField
          source="eventTypeId"
          reference="eventType"
          link="show"
        />
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
        <ReferenceField
          source="eventTypeId"
          reference="eventType"
          link="show"
        />
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
        <DateInput
          source="date"
          parse={(val: string) => new Date(val).toISOString()}
        />
        <ReferenceInput source="owner" reference="user" />
        <ReferenceInput source="EventType" reference="eventType" />
        <TextInput source="location" />
        <NumberInput source="price" />
        <ArrayInput source="InstrumentsRequired">
          <SimpleFormIterator inline>
            <ReferenceInput
              source="id"
              reference="Instrument"
              resource="Instrument"
              label="Required instruments"
            >
              <SelectInput optionText="name" label="Instrument" />
            </ReferenceInput>
            <NumberInput source="quantity" defaultValue={1} min={1} />
          </SimpleFormIterator>
        </ArrayInput>
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
