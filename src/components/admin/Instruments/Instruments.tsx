import {
  Create,
  Datagrid,
  DatagridConfigurable,
  DateField,
  Edit,
  List,
  ReferenceArrayField,
  ReferenceField,
  Show,
  SimpleForm,
  SimpleShowLayout,
  TabbedShowLayout,
  TextField,
  TextInput,
  required,
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
      <TabbedShowLayout>
        <TabbedShowLayout.Tab label="details">
          <SimpleShowLayout>
            <TextField source="name" />
          </SimpleShowLayout>
        </TabbedShowLayout.Tab>
        <TabbedShowLayout.Tab label="Musicians">
          <ReferenceArrayField source="musicians" reference="User">
            <Datagrid rowClick="show">
              <TextField source="name" />
              <TextField source="email" />
            </Datagrid>
          </ReferenceArrayField>
        </TabbedShowLayout.Tab>
        <TabbedShowLayout.Tab label="Events">
          <ReferenceArrayField source="jobs" reference="Job">
            <Datagrid rowClick="show">
              <ReferenceField source="eventId" reference="Event">
                <TextField source="name" />
              </ReferenceField>
              <ReferenceField source="eventId" reference="Event">
                <DateField source="date" />
              </ReferenceField>
            </Datagrid>
          </ReferenceArrayField>
        </TabbedShowLayout.Tab>
      </TabbedShowLayout>
    </Show>
  );
};

export const InstrumentEdit = () => {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="name" validate={required()} />
      </SimpleForm>
    </Edit>
  );
};

export const InstrumentCreate = () => {
  return (
    <Create redirect="show">
      <SimpleForm>
        <TextInput source="name" validate={required()} />
      </SimpleForm>
    </Create>
  );
};
