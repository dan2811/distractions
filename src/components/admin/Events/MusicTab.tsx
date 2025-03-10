import { Grid, SxProps } from "@mui/material";
import {
  Button,
  Datagrid,
  DateField,
  Link,
  ReferenceArrayField,
  ReferenceField,
  RowClickFunction,
  ShowBase,
  SimpleShowLayout,
  TextField,
  useCreatePath,
  useGetOne,
  useRecordContext,
} from "react-admin";
import type { RaEvent } from "~/server/RaHandlers/eventHandler";
import AddIcon from "@mui/icons-material/Add";
import { useState } from "react";
import { RaSet } from "~/server/RaHandlers/setHandler";

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
  const record = useRecordContext<RaEvent>();
  const [selectedSet, setSelectedSet] = useState<string | null>(null);

  const onRowClick: RowClickFunction = (id, _resource, _record) => {
    setSelectedSet(id as string);
    console.log(`selected: ${id}`);
    return false;
  };

  const setRowSx: (record: RaSet, index: number) => SxProps = (record) => {
    if (record.id === selectedSet) {
      return {
        backgroundColor: "Highlight",
      };
    } else {
      return {};
    }
  };

  return (
    <ShowBase resource="event">
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <SimpleShowLayout>
            <ReferenceArrayField source="sets" reference="set">
              <Datagrid rowClick={onRowClick} rowSx={setRowSx}>
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
        <Grid item xs={6}>
          {selectedSet ? (
            <SongList id={selectedSet} source="goodSongs" />
          ) : (
            <div>Select a set, to view it&apos;s songs</div>
          )}
        </Grid>
        <Grid item xs={6}>
          {selectedSet ? <SongList id={selectedSet} source="badSongs" /> : null}
        </Grid>
      </Grid>
    </ShowBase>
  );
};

const SongList = ({
  id,
  source,
}: {
  id: string;
  source: "badSongs" | "goodSongs";
}) => {
  const set = useGetOne<RaSet>("set", {
    id,
  });
  return (
    <SimpleShowLayout record={set.data}>
      <ReferenceArrayField source={source} reference="song">
        <Datagrid
          rowClick="show"
          bulkActionButtons={false}
          sx={{
            backgroundColor:
              source === "goodSongs" ? "lightgreen" : "lightsalmon",
          }}
        >
          <TextField source="name" />
          <TextField source="artist" />
        </Datagrid>
      </ReferenceArrayField>
    </SimpleShowLayout>
  );
};
