import { Card, CardContent, Chip } from "@mui/material";
import type { Prisma } from "@prisma/client";
import { ReceiptIcon } from "lucide-react";
import { useEffect } from "react";
import {
  DatagridConfigurable,
  DateField,
  FilterList,
  FilterListItem,
  FilterLiveSearch,
  FunctionField,
  List,
  ReferenceField,
  SavedQueriesList,
} from "react-admin";
import { differenceInDays } from "~/utils/date";

export const InvoiceFilterSideBar = () => {
  const daysTillOverDue = 30;
  const overDueDate = new Date(
    new Date(new Date().setHours(0, 0, 0, 0)).getTime() -
      daysTillOverDue * 24 * 60 * 60 * 1000,
  );

  return (
    <Card sx={{ order: -1, mr: 2, mt: 6, width: 250 }}>
      <CardContent>
        <SavedQueriesList />
        <FilterLiveSearch source="Job.musician.name" label="Musician" />
        <FilterList label="Status" icon={<ReceiptIcon />}>
          <FilterListItem label="PAID" value={{ status: "paid" }} />
          <FilterListItem label="DUE (+OVERDUE)" value={{ status: "due" }} />
          <FilterListItem
            label="OVERDUE"
            value={{
              createdAt_lte: overDueDate.toISOString(),
              status_not: "paid",
            }}
          />
        </FilterList>
      </CardContent>
    </Card>
  );
};

export const InvoiceList = () => {
  return (
    <List aside={<InvoiceFilterSideBar />}>
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
        <FunctionField
          sortBy="createdAt"
          source="status"
          render={(
            record: Prisma.InvoiceGetPayload<{
              include: {
                Job: false;
              };
            }>,
          ) => {
            if (record.status === "paid") {
              return "PAID";
            }
            if (record.status === "overdue") {
              return "OVERDUE";
            }
            const daysTillDue = differenceInDays(
              new Date(),
              new Date(
                new Date(record.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000,
              ),
            );
            if (daysTillDue < 1) {
              return "OVERDUE";
            } else {
              return `Due in ${daysTillDue} day(s)`;
            }
          }}
        />
      </DatagridConfigurable>
    </List>
  );
};
