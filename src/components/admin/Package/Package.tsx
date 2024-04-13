import {
  Create,
  Datagrid,
  DatagridConfigurable,
  DateField,
  Edit,
  List,
  ReferenceArrayField,
  Show,
  SimpleForm,
  SimpleShowLayout,
  TabbedShowLayout,
  TextField,
  TextInput,
  required,
} from "react-admin";

export const PackageList = () => {
  return (
    <List>
      <DatagridConfigurable
        rowClick="show"
        omit={["id"]}
        bulkActionButtons={false}
      >
        <TextField source="id" />
        <TextField source="name" />
      </DatagridConfigurable>
    </List>
  );
};

export const PackageShow = () => {
  return (
    <Show>
      <TabbedShowLayout>
        <TabbedShowLayout.Tab label="details">
          <SimpleShowLayout>
            <TextField source="name" />
          </SimpleShowLayout>
        </TabbedShowLayout.Tab>
        <TabbedShowLayout.Tab label="Events">
          <ReferenceArrayField source="events" reference="Event">
            <Datagrid rowClick="show" bulkActionButtons={false}>
              <TextField source="name" />
              <DateField source="date" />
            </Datagrid>
          </ReferenceArrayField>
        </TabbedShowLayout.Tab>
      </TabbedShowLayout>
    </Show>
  );
};

export const PackageEdit = () => {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="name" validate={required()} />
      </SimpleForm>
    </Edit>
  );
};

export const PackageCreate = () => {
  return (
    <Create redirect="show">
      <SimpleForm>
        <TextInput source="name" validate={required()} />
      </SimpleForm>
    </Create>
  );
};
