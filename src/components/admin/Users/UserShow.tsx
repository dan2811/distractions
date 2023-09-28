import {
  ChipField,
  Datagrid,
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
        <ReferenceArrayField source="instruments" reference="Instrument">
          <SingleFieldList linkType="show">
            <ChipField
              source="name"
              emptyText="This user plays no instruments"
            />
          </SingleFieldList>
        </ReferenceArrayField>
        <Gigs />
      </SimpleShowLayout>
    </Show>
  );
};

const Gigs = () => {
  const user: RaUser = useRecordContext();

  if (user.role === "client") {
    return (
      <ReferenceManyField reference="event" target="ownerId">
        <Datagrid>
          <TextField source="name" />
          <TextField source="date" />
          <TextField source="location" />
        </Datagrid>
      </ReferenceManyField>
    );
  }

  return (
    <ReferenceArrayField source="jobs" reference="Job">
      <Datagrid>
        <ReferenceField source="eventId" reference="Event" label="Client">
          <ReferenceField source="ownerId" reference="user" />
        </ReferenceField>
        <ReferenceField source="eventId" reference="Event">
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField source="eventId" reference="Event">
          <TextField source="date" />
        </ReferenceField>
        <ReferenceField source="eventId" reference="Event">
          <TextField source="location" />
        </ReferenceField>
      </Datagrid>
    </ReferenceArrayField>
  );
};
