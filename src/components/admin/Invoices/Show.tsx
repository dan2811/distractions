import { Typography } from "@mui/material";
import type { Prisma } from "@prisma/client";
import {
  TextField,
  Show,
  SimpleShowLayout,
  UrlField,
  DateField,
  FunctionField,
  useRecordContext,
  ReferenceField,
  useNotify,
  useRefresh,
  Button,
} from "react-admin";
import { api } from "~/utils/api";

export const InvoiceShow = () => {
  const { mutate } = api.jobs.markInvoicePaid.useMutation();
  const notify = useNotify();
  const refresh = useRefresh();
  return (
    <Show aside={<PdfPreview />}>
      <SimpleShowLayout>
        <FunctionField
          render={(
            record: Prisma.InvoiceGetPayload<{
              include: { Job: true };
            }>,
          ) => {
            if (record.status === "paid") return null;
            return (
              <Button
                variant="contained"
                onClick={() => {
                  mutate(
                    { invoiceId: record.id, musicianId: record.Job.musicianId },
                    {
                      onSuccess: () => {
                        refresh();
                        notify("Invoice marked as paid");
                      },
                    },
                  );
                }}
              >
                <Typography>Mark as paid</Typography>
              </Button>
            );
          }}
        />
        <TextField source="status" label="Status" />
        <TextField source="Job.musician.name" label="Musician" />
        <ReferenceField
          source="Job.eventId"
          reference="event"
          label="Event"
          link="show"
        />
        <DateField source="Job.event.date" label="Event Date" />
        <FunctionField
          label="Pay"
          render={(
            record: Prisma.InvoiceGetPayload<{
              include: { Job: true };
            }>,
          ) => `£${record.Job.pay}`}
        />
        <UrlField source="url" />
      </SimpleShowLayout>
    </Show>
  );
};

const PdfPreview = () => {
  const invoice = useRecordContext<
    Prisma.InvoiceGetPayload<{
      include: { Job: true };
    }>
  >();

  if (!invoice) return null;

  return (
    <div style={{ width: "30rem", minHeight: "50rem" }}>
      <iframe src={invoice.url} className="h-full w-full" />
    </div>
  );
};
