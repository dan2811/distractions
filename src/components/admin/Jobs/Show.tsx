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

export const JobShow = () => {
  return (
    <Show>
      <SimpleShowLayout>
        <ReferenceField
          source="musicianId"
          reference="user"
          link="show"
          label="Musician"
        />
        <ReferenceField
          source="eventId"
          reference="event"
          link="show"
          label="Event"
        />
        <TextField source="status" />
        <BooleanField source="isMd" />
        <TextField source="notes" emptyText="No notes" />
        <FunctionField
          source="pay"
          render={(record: { pay: string }) => "£" + (record.pay ?? 0)}
        />
        <DateField source="createdAt" showTime />
        <DateField source="updatedAt" showTime />
        <ReferenceArrayField source="Instruments" reference="Instrument">
          <Datagrid rowClick="show" bulkActionButtons={false} header={<></>}>
            <TextField source="name" />
          </Datagrid>
        </ReferenceArrayField>
      </SimpleShowLayout>
    </Show>
  );
};
