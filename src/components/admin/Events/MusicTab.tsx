import { Grid } from "@mui/material";
import {
  Button,
  Datagrid,
  DateField,
  Link,
  ReferenceArrayField,
  ReferenceField,
  ShowBase,
  SimpleShowLayout,
  TextField,
  useCreatePath,
  useNotify,
  useRecordContext,
  useRefresh,
} from "react-admin";
import type { RaEvent } from "~/server/RaHandlers/eventHandler";
import AddIcon from "@mui/icons-material/Add";

const CreateSetButton = ({ eventId }: { eventId: string }) => {
  const record = useRecordContext();
  const createPath = useCreatePath();
  return (
    <Button
      component={Link}
      startIcon={<AddIcon />}
      label="Add Set"
      to={{
        pathname: createPath({
          resource: "set",
          id: record.id,
          type: "create",
        }),
        search: `?source=${JSON.stringify({
          eventId,
        })}`,
      }}
    >
      <>
        <AddIcon />
      </>
    </Button>
  );
};

export const MusicTab = () => {
  const notify = useNotify();
  const record = useRecordContext<RaEvent>();
  const refresh = useRefresh();
  return (
    <ShowBase resource="event">
      <Grid container spacing={4}>
        <Grid item xs={6}>
          <SimpleShowLayout>
            <ReferenceArrayField source="sets" reference="set">
              <Datagrid rowClick="show">
                <TextField source="name" />
                <DateField
                  source="startTime"
                  showTime
                  options={{ hour: "2-digit", minute: "2-digit" }}
                />
                <DateField
                  source="endTime"
                  showTime
                  options={{ hour: "2-digit", minute: "2-digit" }}
                />
                <ReferenceField source="packageId" reference="package" />
              </Datagrid>
            </ReferenceArrayField>
            <CreateSetButton eventId={record.id} />
          </SimpleShowLayout>
        </Grid>
        <Grid item xs={6} className="flex flex-col justify-start align-middle">
          <SimpleShowLayout>
            <div> hello</div>
          </SimpleShowLayout>
        </Grid>
        <Grid item xs={12}>
          <div>hello</div>
        </Grid>
      </Grid>
    </ShowBase>
  );
};
