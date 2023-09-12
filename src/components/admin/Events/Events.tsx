import React from "react";
import {
  DatagridConfigurable,
  List,
  ReferenceField,
  Show,
  SimpleShowLayout,
  TextField,
} from "react-admin";

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
      </SimpleShowLayout>
    </Show>
  );
};
