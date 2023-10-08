import React, { useEffect, useState } from "react";
import {
  ArrayField,
  ArrayInput,
  Create,
  Datagrid,
  DatagridConfigurable,
  DateField,
  DateInput,
  Edit,
  FunctionField,
  type Identifier,
  List,
  NumberInput,
  ReferenceArrayField,
  ReferenceArrayInput,
  ReferenceField,
  ReferenceInput,
  SelectInput,
  Show,
  SimpleForm,
  SimpleFormIterator,
  SimpleShowLayout,
  SingleFieldList,
  TextField,
  TextInput,
  required,
  useDataProvider,
  useGetMany,
  useRecordContext,
  NumberField,
  ChipField,
} from "react-admin";
import { InvoiceButton } from "./Invoices";
import type { RaEvent } from "~/pages/api/RaHandlers/eventHandler";
import type { Instrument, User } from "@prisma/client";
import type { AugmentedJob, RaJob } from "~/pages/api/RaHandlers/jobHandler";
import { Chip, Tooltip } from "@mui/material";
import type { JobStatus, RequiredInstrumentsJSON } from "~/types";
import { RaInstrument } from "~/pages/api/RaHandlers/instrumentHandler";

export const EventList = () => {
  return (
    <List>
      <DatagridConfigurable omit={["id"]} rowClick="show">
        <TextField source="id" />
        <TextField source="name" />
        <ReferenceField
          source="ownerId"
          reference="user"
          link="show"
          label="Client"
        />
        <DateField source="date" />
        <ReferenceField
          source="eventTypeId"
          reference="eventType"
          link="show"
        />
      </DatagridConfigurable>
    </List>
  );
};

export const EventShow = () => {
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="name" />
        <TextField source="date" />
        <ReferenceField source="ownerId" reference="user" link="show" />
        <ReferenceField
          source="eventTypeId"
          reference="eventType"
          link="show"
        />
        <ReferenceArrayField source="packages" reference="package">
          <SingleFieldList>
            <ChipField source="name" />
          </SingleFieldList>
        </ReferenceArrayField>
        <InvoiceButton type="deposit" />
        <InvoiceButton type="final" />
        <InstrumentsRequired />
      </SimpleShowLayout>
    </Show>
  );
};

const InstrumentsRequired = () => {
  const record: RaEvent = useRecordContext();
  const dataprovider = useDataProvider();
  const [jobs, setJobs] = useState<RaJob[]>([]);

  useEffect(() => {
    const main = async () => {
      const result = (await dataprovider.getMany("job", {
        ids: record.jobs,
      })) as { data: RaJob[] };
      setJobs(result.data);
    };
    void main();
  }, [dataprovider, record.jobs]);

  return (
    <ArrayField source="InstrumentsRequired">
      <Datagrid
        bulkActionButtons={false}
        rowClick="expand"
        resource="event"
        expand={
          <FunctionField
            source="musicians"
            render={(instrument: RequiredInstrumentsJSON) => (
              <PendingAndRejectedJobs jobs={jobs} instrument={instrument} />
            )}
          />
        }
      >
        <ReferenceField source="id" reference="Instrument">
          <TextField source="name" />
        </ReferenceField>
        <NumberField source="quantity" />
        <FunctionField
          sortable={false}
          source="musicians"
          render={(instrument: RequiredInstrumentsJSON) =>
            getJobsForInstrument(instrument).map((job) => {
              return (
                <Chip
                  key="chipText"
                  label={`${job.musicianName}: ${job.status}`}
                  sx={{
                    backgroundColor:
                      job.status === "pending"
                        ? "#FFD580"
                        : job.status === "accepted"
                        ? "#90EE90"
                        : "#f94449",
                  }}
                />
              );
            })
          }
        />
      </Datagrid>
    </ArrayField>
  );
};

const getJobsForInstrument = (
  instrument: RequiredInstrumentsJSON,
): { musicianName: string; status: JobStatus }[] => {
  return [
    { musicianName: "John", status: "pending" },
    { musicianName: "Jane", status: "accepted" },
    { musicianName: "Joe", status: "rejected" },
  ];
};
// const MusiciansThatHaveAcceptedTheJob = ({
//   jobs,
//   instrument,
// }: {
//   jobs: RaJob[];
//   instrument: RequiredInstrumentsJSON;
// }) => {
//   const jobsForThisInstrument = jobs.filter((job) => {
//     return job.Instruments.includes(instrument.id);
//   });
//   if (!jobsForThisInstrument.length) {
//     return (
//       <Button>
//         <div>Add Musician</div>
//       </Button>
//     );
//   }

//   const acceptedJobsForThisInstrument = jobsForThisInstrument.filter(
//     (job) => job.status === "accepted",
//   );
//   const pendingJobsForThisInstrument = jobsForThisInstrument.filter(
//     (job) => job.status === "pending",
//   );

//   if (
//     !acceptedJobsForThisInstrument.length &&
//     !pendingJobsForThisInstrument.length
//   ) {
//     return (
//       <Button>
//         <div>Add Musician</div>
//       </Button>
//     );
//   }

//   const acceptedMusicianIds = acceptedJobsForThisInstrument.map(
//     (job) => job.musicianId,
//   );
//   const pendingMusicianIds = pendingJobsForThisInstrument.map(
//     (job) => job.musicianId,
//   );

//   console.log({ acceptedMusicianIds, pendingMusicianIds });
//   return (
//     <GetMusicianNames
//       acceptedMusicianIds={acceptedMusicianIds}
//       pendingMusicianIds={pendingMusicianIds}
//     />
//   );
// };

const GetMusicianNames = ({
  acceptedMusicianIds,
  pendingMusicianIds,
}: {
  acceptedMusicianIds: Identifier[];
  pendingMusicianIds: Identifier[];
}) => {
  const dataprovider = useDataProvider();
  const [musicians, setMusicians] = useState<User[]>([]);
  const [pendingMusicians, setPendingMusicians] = useState<User[]>([]);

  useEffect(() => {
    const main = async () => {
      const accepted = (await dataprovider.getMany("user", {
        ids: acceptedMusicianIds,
      })) as { data: User[] };
      const pending = (await dataprovider.getMany("user", {
        ids: pendingMusicianIds,
      })) as { data: User[] };
      setMusicians(accepted.data);
      setPendingMusicians(pending.data);
    };
    void main();
  }, [dataprovider, acceptedMusicianIds, pendingMusicianIds]);

  return (
    <div>
      <p>ACCEPTED: {musicians.map((musician) => musician.name).join(", ")}</p>
      <p>
        PENDING: {pendingMusicians.map((musician) => musician.name).join(", ")}
      </p>
    </div>
  );
};

const PendingAndRejectedJobs = ({
  jobs,
  instrument,
}: {
  jobs: RaJob[];
  instrument: RequiredInstrumentsJSON;
}) => {
  const jobsFilteredByInstrument = jobs?.filter((job) => {
    return job.Instruments.map((instr) => instr).includes(instrument.id);
  });

  return (
    <Datagrid
      data={jobsFilteredByInstrument}
      bulkActionButtons={false}
      empty={<p>No musicians have been offered this yet.</p>}
    >
      <ReferenceField source="musicianId" reference="user" link="show" />
      <TextField source="status" />
    </Datagrid>
  );
};

export const EventCreate = () => {
  return (
    <Create>
      <SimpleForm>
        <Tooltip title="The client will see the name of this event.">
          <TextInput
            source="name"
            validate={required(
              "You must give this event a name. The client will see this.",
            )}
          />
        </Tooltip>
        <DateInput
          source="date"
          parse={(val: string) => new Date(val).toISOString()}
        />
        <ReferenceInput source="owner" reference="user" />
        <ReferenceInput
          source="EventType"
          reference="eventType"
          validate={required()}
        />
        <ReferenceArrayInput source="packages" reference="package" />
        <TextInput source="location" />
        <NumberInput source="price" />
        <ArrayInput source="InstrumentsRequired">
          <SimpleFormIterator inline>
            <ReferenceInput
              source="id"
              reference="Instrument"
              resource="Instrument"
              label="Required instruments"
            >
              <SelectInput optionText="name" label="Instrument" value="id" />
            </ReferenceInput>
            <NumberInput source="quantity" defaultValue={1} min={1} />
          </SimpleFormIterator>
        </ArrayInput>
      </SimpleForm>
    </Create>
  );
};

export const EventEdit = () => {
  return (
    <Edit redirect="show">
      <SimpleForm>
        <Tooltip title="The client will see the name of this event.">
          <TextInput
            source="name"
            validate={required(
              "You must give this event a name. The client will see this.",
            )}
          />
        </Tooltip>
        <DateInput source="date" />
        <ReferenceInput source="ownerId" reference="user" />
        <ReferenceInput
          source="eventTypeId"
          reference="eventType"
          validate={required()}
        />
        <ReferenceArrayInput source="packages" reference="package" />
        <TextInput source="location" />
        <TextInput source="price" />
        <ArrayInput source="InstrumentsRequired">
          <SimpleFormIterator inline>
            <ReferenceInput
              source="id"
              reference="Instrument"
              resource="Instrument"
              label="Required instruments"
            >
              <SelectInput optionText="name" label="Instrument" value="id" />
            </ReferenceInput>
            <NumberInput source="quantity" defaultValue={1} min={1} />
          </SimpleFormIterator>
        </ArrayInput>
      </SimpleForm>
    </Edit>
  );
};
