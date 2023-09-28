import React from "react";
import {
  Create,
  Datagrid,
  Edit,
  Link,
  List,
  ReferenceField,
  ReferenceManyField,
  Show,
  SimpleForm,
  SimpleShowLayout,
  TextField,
  TextInput,
} from "react-admin";

export const EventTypeList = () => {
  return (
    <List>
      <Datagrid rowClick="show">
        <TextField source="name" />
      </Datagrid>
    </List>
  );
};

export const EventTypeShow = () => {
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="name" />
        <ReferenceManyField reference="Event" target="eventTypeId">
          <Datagrid rowClick="show">
            <TextField source="name" />
            <ReferenceField source="ownerId" reference="User">
              <TextField source="name" />
            </ReferenceField>
          </Datagrid>
        </ReferenceManyField>
      </SimpleShowLayout>
    </Show>
  );
};

export const EventTypeCreate = () => {
  return (
    <Create redirect="list">
      <SimpleForm>
        <TextInput source="name" />
      </SimpleForm>
    </Create>
  );
};

export const EventTypeEdit = () => {
  return (
    <Edit redirect="list">
      <SimpleForm>
        <TextInput source="name" />
      </SimpleForm>
    </Edit>
  );
};
