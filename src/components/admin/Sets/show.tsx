import {
  BooleanField,
  Datagrid,
  DateField,
  FunctionField,
  ReferenceArrayField,
  ReferenceField,
  Show,
  SimpleShowLayout,
  TextField,
} from "react-admin";

export const SetShow = () => {
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="name" />
        <ReferenceArrayField source="Songs" reference="Song">
          <Datagrid rowClick="show" bulkActionButtons={false} header={<></>}>
            <TextField source="name" />
            <TextField source="artist" />
          </Datagrid>
        </ReferenceArrayField>
      </SimpleShowLayout>
    </Show>
  );
};
