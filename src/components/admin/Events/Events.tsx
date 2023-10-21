import { useEffect, useState } from "react";
import {
  ArrayField,
  ArrayInput,
  Create,
  Datagrid,
  DatagridConfigurable,
  DateInput,
  Edit,
  FunctionField,
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
  useRecordContext,
  NumberField,
  ChipField,
  FilterLiveSearch,
  FilterList,
  FilterListItem,
  SavedQueriesList,
  useGetList,
  Loading,
  useCreatePath,
  CreateButton,
  DateField,
  BooleanField,
  Button,
  TabbedShowLayout,
  ShowBase,
  useNotify,
  useRefresh,
  EditButton,
  ReferenceOneField,
  Link,
} from "react-admin";
import { InvoiceButton } from "./Invoices";
import type { RaEvent } from "~/pages/api/RaHandlers/eventHandler";
import type { EventType } from "@prisma/client";
import type { RaJob } from "~/pages/api/RaHandlers/jobHandler";
import {
  Card,
  CardContent,
  Chip,
  Grid,
  Tooltip,
  Typography,
} from "@mui/material";
import type { RequiredInstrumentsJSON } from "~/types";
import TodayIcon from "@mui/icons-material/Today";
import ColouredDateField from "../Fields/ColouredDateField";
import type { RaUser } from "~/pages/api/RaHandlers/userHandler";
import { globalColors } from "tailwind.config";
import { api } from "~/utils/api";
import { UploadDropzone } from "~/utils/uploadthing";

export const EventFilterSideBar = () => {
  const { data, isLoading } = useGetList<EventType>("eventType");
  const tomorrow = new Date(
    new Date(new Date().setDate(new Date().getDate() + 1)).setHours(1, 0, 0, 0),
  ).toISOString();

  const yesterday = new Date(
    new Date(new Date().setDate(new Date().getDate() - 1)).setHours(
      24,
      59,
      59,
      999,
    ),
  ).toISOString();
  return (
    <Card sx={{ order: -1, mr: 2, mt: 6, width: 250 }}>
      <CardContent>
        <SavedQueriesList />
        <FilterLiveSearch source="name" label="Search by event name" />
        <FilterList label="Date" icon={<TodayIcon />}>
          {/* TODO: Needs fixing! */}
          {/* <FilterListItem
            label="Today's events"
            value={{
              date_lte: tomorrow,
              date_gte: yesterday,
            }}
          /> */}
          <FilterListItem
            label="Previous events"
            value={{
              date_lt: yesterday,
            }}
          />
          <FilterListItem
            label="Future events"
            value={{
              date_gt: tomorrow,
            }}
          />
        </FilterList>
        <FilterList label="Event type" icon={<TodayIcon />}>
          {isLoading || !data ? (
            <Loading />
          ) : (
            data.map((eventType) => (
              <FilterListItem
                key={eventType.id}
                label={eventType.name}
                value={{ eventTypeId: eventType.id }}
              />
            ))
          )}
        </FilterList>
      </CardContent>
    </Card>
  );
};

export const EventList = () => {
  return (
    <List aside={<EventFilterSideBar />} sort={{ field: "date", order: "ASC" }}>
      <DatagridConfigurable omit={["id"]} rowClick="show">
        <TextField source="id" />
        <TextField source="name" />
        <ReferenceField
          source="ownerId"
          reference="user"
          link="show"
          label="Client"
        />
        <ColouredDateField source="date" />
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
      <TabbedShowLayout>
        <TabbedShowLayout.Tab label="details">
          <DetailsTab />
        </TabbedShowLayout.Tab>
        <TabbedShowLayout.Tab label="finance">
          <FinanceTab />
        </TabbedShowLayout.Tab>
      </TabbedShowLayout>
    </Show>
  );
};

const DetailsTab = () => {
  const notify = useNotify();
  const record = useRecordContext();
  const refresh = useRefresh();
  return (
    <ShowBase resource="event">
      <Grid container spacing={4}>
        <Grid item xs={6}>
          <SimpleShowLayout>
            <TextField source="name" />
            <DateField source="date" />
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
          </SimpleShowLayout>
        </Grid>
        <Grid item xs={6} className="flex flex-col justify-start align-middle">
          <SimpleShowLayout>
            <ReferenceOneField
              reference="Contract"
              target="eventId"
              label="Contract"
            >
              <SimpleShowLayout>
                <FunctionField
                  render={(record: { url: string; name: string }) => {
                    return (
                      <Link to={record.url} target="_blank">
                        {record.name}
                      </Link>
                    );
                  }}
                />
                <DateField source="updatedAt" label="Last updated" showTime />
              </SimpleShowLayout>
            </ReferenceOneField>
            <Typography variant="body1" className="text-red-700">
              Uploading a contract will automatically email the client to ask
              them to sign.
            </Typography>
            <UploadDropzone
              endpoint="contractUploader"
              input={{ eventId: record.id.toString() }}
              onClientUploadComplete={() => {
                notify("Upload Completed", { type: "success" });
                refresh();
              }}
              onUploadError={(error: Error) =>
                notify(`ERROR! ${error.message}`, { type: "error" })
              }
              content={{ label: "Upload contract" }}
            />
          </SimpleShowLayout>
        </Grid>
        <Grid item xs={12}>
          <InstrumentsRequired />
        </Grid>
      </Grid>
    </ShowBase>
  );
};
const FinanceTab = () => {
  const record = useRecordContext<RaEvent>();
  if (!record) return null;
  return (
    <ShowBase resource="event">
      <Grid container spacing={4}>
        <Grid item xs={6}>
          <Typography variant="h6">Deposit</Typography>
          <SimpleShowLayout>
            <BooleanField source="depositInvoiceSent" />
            {!record.depositInvoiceSent && (
              <SendInvoiceButton
                invoiceId={record.depositInvoiceId}
                type="deposit"
              />
            )}
            <InvoiceButton type="deposit" />
          </SimpleShowLayout>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="h6">Final Invoice</Typography>
          <SimpleShowLayout>
            <BooleanField source="finalInvoiceSent" />
            {!record.finalInvoiceSent && (
              <SendInvoiceButton
                invoiceId={record.finalInvoiceId}
                type="final"
              />
            )}
            <InvoiceButton type="final" />
          </SimpleShowLayout>
        </Grid>
      </Grid>
    </ShowBase>
  );
};

const SendInvoiceButton = ({
  invoiceId,
  type,
}: {
  invoiceId: string | null;
  type: "deposit" | "final";
}) => {
  const notify = useNotify();
  const refresh = useRefresh();
  const { mutate } = api.paypal.sendInvoice.useMutation({
    onSuccess: () => {
      refresh();
      notify("Invoice sent", { type: "success" });
    },
    onError: () => notify("Error sending invoice", { type: "error" }),
  });
  if (!invoiceId) return null;
  return (
    <Button label="Send invoice" onClick={() => mutate({ invoiceId, type })} />
  );
};

const InstrumentsRequired = () => {
  const record: RaEvent = useRecordContext();
  const dataprovider = useDataProvider();
  const [eventJobs, setEventJobs] = useState<RaJob[]>([]);
  const [musicians, setMusicians] = useState<RaUser[]>([]);

  useEffect(() => {
    const main = async () => {
      const jobs = await dataprovider.getMany<RaJob>("job", {
        ids: record.jobs,
      });
      setEventJobs(jobs.data);
    };
    void main();
  }, [dataprovider, record.jobs]);

  useEffect(() => {
    const main = async () => {
      const musicians = await dataprovider.getMany("user", {
        ids: eventJobs.map((job) => job.musicianId),
      });
      setMusicians(musicians.data);
    };
    void main();
  }, [dataprovider, eventJobs]);

  const parseJobStatus = (
    status: string,
  ): keyof typeof globalColors.jobStatus => {
    switch (status) {
      case "accepted":
        return "accepted";
      case "pending":
        return "pending";
      case "rejected":
        return "rejected";
      default:
        return "other";
    }
  };

  return (
    <ArrayField source="InstrumentsRequired">
      <Datagrid
        bulkActionButtons={false}
        resource="event"
        empty={<EditButton label="Add Musicians" />}
      >
        <ReferenceField source="id" reference="Instrument">
          <TextField source="name" />
        </ReferenceField>
        <NumberField source="quantity" />
        <FunctionField
          sortable={false}
          source="musicians"
          render={(instrument: RequiredInstrumentsJSON) => {
            const jobs = getJobsForInstrument(instrument, eventJobs, musicians);
            const chips = jobs.map(({ musician, job }) => {
              return (
                <Chip
                  key={instrument.id + musician?.name + job.id}
                  label={`${job.isMd ? "MD - " : ""}${
                    musician?.name ?? "unknown musician"
                  }: ${job.status}`}
                  sx={{
                    backgroundColor:
                      globalColors.jobStatus[parseJobStatus(job.status)],
                  }}
                />
              );
            });

            return chips;
          }}
        />
        <CreateJobButton eventId={record.id} />
      </Datagrid>
    </ArrayField>
  );
};

const CreateJobButton = ({ eventId }: { eventId: string }) => {
  const record = useRecordContext();
  const createPath = useCreatePath();
  return (
    <CreateButton
      label="Add musician"
      resource="job"
      to={{
        pathname: createPath({
          resource: "job",
          id: record.id,
          type: "create",
        }),
        search: `?source=${JSON.stringify({
          eventId,
          Instruments: [record.id],
        })}`,
      }}
    />
  );
};

const getJobsForInstrument = (
  instrument: RequiredInstrumentsJSON,
  eventJobs: RaJob[],
  musicians: RaUser[],
): { musician: RaUser | undefined; job: RaJob }[] => {
  const jobsForThisInstrument = eventJobs.filter((job) => {
    return job.Instruments.map((instr) => instr).includes(instrument.id);
  });
  if (!jobsForThisInstrument.length) {
    return [];
  }
  // map musician names to jobs
  const jobsWithMusicianNames = jobsForThisInstrument.map((job) => {
    const musician = musicians.find((musician) => {
      return musician.id === job.musicianId;
    });
    return { musician: musician, job };
  });

  return jobsWithMusicianNames.sort((a, b) =>
    a.job.status.localeCompare(b.job.status),
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
        <NumberInput source="deposit" />
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
