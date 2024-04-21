import {
  DatagridConfigurable,
  DateField,
  List,
  ReferenceField,
  TextField,
} from "react-admin";

export const InvoiceList = () => {
  return (
    <List>
      <DatagridConfigurable
        rowClick="show"
        omit={["id"]}
        bulkActionButtons={false}
      >
        <DateField source="Job.event.date" label="Event Date" />
        <ReferenceField
          source="Job.musicianId"
          reference="user"
          label="Musician"
        />
        <ReferenceField
          source="Job.eventId"
          reference="event"
          label="Event"
          link="show"
        />
        <TextField source="status" label="Status" />
      </DatagridConfigurable>
    </List>
  );
};
