import { Typography } from "@mui/material";
import {
  ChipField,
  Datagrid,
  DateField,
  Labeled,
  ReferenceArrayField,
  ReferenceField,
  ReferenceManyField,
  Show,
  SimpleShowLayout,
  SingleFieldList,
  TextField,
  useRecordContext,
} from "react-admin";
import type { RaUser } from "~/pages/api/RaHandlers/userHandler";

export const UserShow = () => {
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="name" />
        <TextField source="email" />
        <TextField source="phone" emptyText="No phone number" />
        <TextField source="role" />
        <Instruments />
        <Labeled label="Events">
          <Events />
        </Labeled>
      </SimpleShowLayout>
    </Show>
  );
};

const Instruments = () => {
  const user = useRecordContext<RaUser>();
  if (user.role === "client") return null;
  if (!user?.instruments?.length)
    return (
      <Labeled label="Instruments">
        <Typography variant="body2">No instruments</Typography>
      </Labeled>
    );
  return (
    <Labeled label="Instruments">
      <ReferenceArrayField source="instruments" reference="Instrument">
        <SingleFieldList linkType="show">
          <ChipField source="name" />
        </SingleFieldList>
      </ReferenceArrayField>
    </Labeled>
  );
};

const Events = () => {
  const user = useRecordContext<RaUser>();

  if (user.role === "client") {
    return (
      <ReferenceManyField reference="event" target="ownerId">
        <Datagrid rowClick="show">
          <TextField source="name" />
          <DateField source="date" />
          <TextField source="location" />
        </Datagrid>
      </ReferenceManyField>
    );
  }

  return (
    <ReferenceArrayField source="jobs" reference="Job">
      <Datagrid rowClick="show" resource="event" bulkActionButtons={false}>
        <ReferenceField
          source="eventId"
          reference="Event"
          label="Client"
          link="show"
        >
          <ReferenceField source="ownerId" reference="user" link="show" />
        </ReferenceField>
        <ReferenceField source="eventId" reference="Event">
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField source="eventId" reference="Event">
          <DateField source="date" />
        </ReferenceField>
        <ReferenceField source="eventId" reference="Event">
          <TextField source="location" />
        </ReferenceField>
      </Datagrid>
    </ReferenceArrayField>
  );
};
