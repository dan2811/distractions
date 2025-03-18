import {
  Create,
  Datagrid,
  DatagridConfigurable,
  Edit,
  List,
  ReferenceArrayField,
  ReferenceArrayInput,
  Show,
  SimpleForm,
  SimpleShowLayout,
  TabbedShowLayout,
  TextField,
  TextInput,
  required,
} from "react-admin";

export const SongList = () => {
  return (
    <List>
      <DatagridConfigurable
        rowClick="show"
        omit={["id"]}
        bulkActionButtons={false}
      >
        <TextField source="id" />
        <TextField source="name" />
        <TextField source="artist" />
      </DatagridConfigurable>
    </List>
  );
};

export const SongShow = () => {
  return (
    <Show>
      <TabbedShowLayout>
        <TabbedShowLayout.Tab label="details">
          <SimpleShowLayout>
            <TextField source="name" />
            <TextField source="artist" />
          </SimpleShowLayout>
        </TabbedShowLayout.Tab>
        <TabbedShowLayout.Tab label="Packages">
          <ReferenceArrayField source="packages" reference="Package">
            <Datagrid rowClick="show" bulkActionButtons={false}>
              <TextField source="name" />
            </Datagrid>
          </ReferenceArrayField>
        </TabbedShowLayout.Tab>
      </TabbedShowLayout>
    </Show>
  );
};

export const SongEdit = () => {
  return (
    <Edit redirect="show">
      <SimpleForm>
        <TextInput source="name" validate={required()} />
        <TextInput source="artist" validate={required()} />
        <ReferenceArrayInput source="packages" reference="package" />
      </SimpleForm>
    </Edit>
  );
};

export const SongCreate = () => {
  return (
    <Create redirect="list">
      <SimpleForm>
        <TextInput source="name" validate={required()} />
        <TextInput source="artist" validate={required()} />
        <ReferenceArrayInput source="packages" reference="package" />
      </SimpleForm>
    </Create>
  );
};
