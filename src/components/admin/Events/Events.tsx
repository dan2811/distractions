import React, { useEffect, useState } from "react";
import {
  ArrayField,
  ArrayInput,
  Button,
  Create,
  Datagrid,
  DatagridConfigurable,
  DateField,
  DateInput,
  Edit,
  FunctionField,
  Identifier,
  Labeled,
  List,
  NumberInput,
  ReferenceField,
  ReferenceInput,
  SelectInput,
  Show,
  SimpleForm,
  SimpleFormIterator,
  SimpleShowLayout,
  TextField,
  TextInput,
  useDataProvider,
  useGetList,
  useGetMany,
  useGetOne,
  useRecordContext,
} from "react-admin";
import { InvoiceButton } from "./Invoices";
import type { RaEvent } from "~/pages/api/RaHandlers/eventHandler";
import { Instrument, Job, User } from "@prisma/client";
import { AugmentedJob, RaJob } from "~/pages/api/RaHandlers/jobHandler";
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
  const [jobs, setJobs] = useState<AugmentedJob[]>([]);

  useEffect(() => {
    const main = async () => {
      const result = (await dataprovider.getMany("job", {
        ids: record.jobs,
      })) as { data: AugmentedJob[] };
      setJobs(result.data);
    };
    void main();
  }, [dataprovider, record.jobs]);

  console.log(jobs);
  return (
    <ArrayField source="InstrumentsRequired">
      <Datagrid
        resource="event"
        expand={<PendingAndRejectedJobs event={record} />}
      >
        <TextField source="name" />
        <FunctionField
          source="quantity"
          render={(val: { name: string; quantity: number }) => val.quantity}
        />
        <FunctionField
          source="musicians"
          render={(instrument: { name: string; quantity: number }) => (
            <MusiciansThatHaveAcceptedTheJob
              jobs={jobs}
              instrument={instrument}
            />
          )}
        />
      </Datagrid>
    </ArrayField>
  );
};

const MusiciansThatHaveAcceptedTheJob = ({
  jobs,
  instrument,
}: {
  jobs: AugmentedJob[];
  instrument: { name: string; quantity: number };
}) => {
  const jobsForThisInstrument = jobs.filter((job) => {
    return job.Instruments.map((instr: Instrument) => instr.name).includes(
      instrument.name,
    );
  });

  if (!jobsForThisInstrument.length) {
    return (
      <Button>
        <div>Add Musician</div>
      </Button>
    );
  }

  const acceptedJobsForThisInstrument = jobsForThisInstrument.filter(
    (job) => job.status === "accepted",
  );
  const pendingJobsForThisInstrument = jobsForThisInstrument.filter(
    (job) => job.status === "pending",
  );

  if (
    !acceptedJobsForThisInstrument.length &&
    !pendingJobsForThisInstrument.length
  ) {
    return (
      <Button>
        <div>Add Musician</div>
      </Button>
    );
  }

  const musicianIds = acceptedJobsForThisInstrument.map(
    (job) => job.musicianId,
  );
  return <GetMusicianNames musicianIds={musicianIds} />;
};

const GetMusicianNames = ({ musicianIds }: { musicianIds: Identifier[] }) => {
  const dataprovider = useDataProvider();
  const [musicians, setMusicians] = useState<User[]>([]);

  useEffect(() => {
    const main = async () => {
      const result = (await dataprovider.getMany("user", {
        ids: musicianIds,
      })) as { data: User[] };
      setMusicians(result.data);
    };
    void main();
  }, [dataprovider, musicianIds]);

  return (
    <div>
      {musicians.map((musician) => (
        <div key={musician.id}>{musician.name}</div>
      ))}
    </div>
  );
};

const PendingAndRejectedJobs = ({ event }: { event: RaEvent }) => {
  const jobIds = event.jobs;
  const record: { name: string; quantity: number } = useRecordContext();

  const { data: jobs } = useGetMany<AugmentedJob>("job", {
    ids: jobIds,
  });

  const jobsFilteredByInstrument = jobs?.filter((job) => {
    return job.Instruments.map((instr: Instrument) => instr.name).includes(
      record.name,
    );
  });

  return (
    <Datagrid data={jobsFilteredByInstrument} bulkActionButtons={false}>
      <ReferenceField source="musicianId" reference="user" link="show" />
      <TextField source="status" />
    </Datagrid>
  );
};

export const EventCreate = () => {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="name" />
        <DateInput
          source="date"
          parse={(val: string) => new Date(val).toISOString()}
        />
        <ReferenceInput source="owner" reference="user" />
        <ReferenceInput source="EventType" reference="eventType" />
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
              <SelectInput optionText="name" label="Instrument" />
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
    <Edit>
      <SimpleForm>
        <TextInput source="name" />
        <DateInput source="date" />
        <ReferenceInput source="owner" reference="user" />
        <TextInput source="EventType" />
        <TextInput source="location" />
        <TextInput source="price" />
      </SimpleForm>
    </Edit>
  );
};
