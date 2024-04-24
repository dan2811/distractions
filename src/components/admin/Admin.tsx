"use client";
import { Admin, Resource, type LayoutProps, Layout } from "react-admin";
import { ReactQueryDevtools } from "react-query/devtools";
import { dataProvider } from "ra-data-simple-prisma";
import { UserCreate, UserEdit, UserList } from "./Users/Users";

import EmojiPeopleIcon from "@mui/icons-material/EmojiPeople";
import FestivalIcon from "@mui/icons-material/Festival";
import PianoIcon from "@mui/icons-material/Piano";
import StadiumIcon from "@mui/icons-material/Stadium";
import AudioFileIcon from "@mui/icons-material/AudioFile";
import ArticleIcon from "@mui/icons-material/Article";
import CurrencyPoundIcon from "@mui/icons-material/CurrencyPound";
import ReceiptIcon from "@mui/icons-material/Receipt";

import { useSession } from "next-auth/react";
import { EventCreate, EventEdit, EventList, EventShow } from "./Events/Events";
import {
  InstrumentCreate,
  InstrumentEdit,
  InstrumentList,
  InstrumentShow,
} from "./Instruments/Instruments";
import { UserShow } from "./Users/UserShow";
import type { Event, Prisma } from "@prisma/client";
import {
  EventTypeCreate,
  EventTypeEdit,
  EventTypeList,
  EventTypeShow,
} from "./EventType/EventType";
import {
  PackageCreate,
  PackageEdit,
  PackageList,
  PackageShow,
} from "./Package/Package";
import Dashboard from "./Dashboard";
import MyAppBar from "./AppBar";
import {
  GeneralDocumentCreate,
  GeneralDocumentList,
  GeneralDocumentShow,
} from "./GeneralDocuments/GeneralDocumentList";
import { JobCreate, JobEdit, JobShow } from "./Jobs";
import { WageCreate } from "./Wages/Create";
import { WageShow } from "./Wages/Show";
import { WageEdit } from "./Wages/Edit";
import { WageList } from "./Wages/List";
import { InvoiceList } from "./Invoices/List";
import { InvoiceShow } from "./Invoices/Show";

export const MyLayout = (props: LayoutProps) => (
  <>
    <Layout {...props} appBar={MyAppBar} />
    <ReactQueryDevtools initialIsOpen={false} />
  </>
);

const AdminApp = () => {
  const session = useSession();
  if (session.status !== "authenticated") {
    return null;
  }

  const isSuperAdmin = session.data.user.role === "superAdmin";

  return (
    <Admin
      dataProvider={dataProvider("/api")}
      layout={MyLayout}
      dashboard={Dashboard}
    >
      <Resource
        recordRepresentation="name"
        name="user"
        show={UserShow}
        list={UserList}
        edit={UserEdit}
        create={UserCreate}
        icon={EmojiPeopleIcon}
      />
      <Resource
        name="event"
        recordRepresentation={(rec: Event) =>
          `${new Date(rec.date).toLocaleDateString("en-gb")} - ${rec.name}`
        }
        list={EventList}
        show={EventShow}
        edit={EventEdit}
        create={EventCreate}
        icon={FestivalIcon}
      />
      <Resource
        name="instrument"
        recordRepresentation="name"
        list={InstrumentList}
        show={InstrumentShow}
        edit={InstrumentEdit}
        create={InstrumentCreate}
        icon={PianoIcon}
      />
      <Resource
        name="eventType"
        options={{ label: "Event Types" }}
        recordRepresentation="name"
        list={EventTypeList}
        show={EventTypeShow}
        create={EventTypeCreate}
        edit={EventTypeEdit}
        icon={StadiumIcon}
      />
      <Resource
        name="package"
        recordRepresentation="name"
        list={PackageList}
        show={PackageShow}
        create={PackageCreate}
        edit={PackageEdit}
        icon={AudioFileIcon}
      />
      <Resource
        name="generalDocument"
        options={{ label: "General Documents" }}
        recordRepresentation="name"
        list={GeneralDocumentList}
        show={GeneralDocumentShow}
        create={GeneralDocumentCreate}
        icon={ArticleIcon}
      />
      <Resource
        name="job"
        recordRepresentation="musician.name"
        create={JobCreate}
        show={JobShow}
        edit={JobEdit}
      />
      {isSuperAdmin && (
        <Resource
          name="wages"
          recordRepresentation={({
            name,
            amount,
          }: {
            name: string;
            amount: string;
          }) => `${name} - £${amount}`}
          create={WageCreate}
          show={WageShow}
          edit={WageEdit}
          list={WageList}
          icon={CurrencyPoundIcon}
        />
      )}
      {isSuperAdmin && (
        <Resource
          name="invoice"
          recordRepresentation={(
            record: Prisma.InvoiceGetPayload<{
              include: {
                Job: {
                  include: {
                    musician: true;
                    event: true;
                  };
                };
              };
            }>,
          ) => {
            return `${record.Job.musician.name} - ${record.Job.event.name}`;
          }}
          show={InvoiceShow}
          list={InvoiceList}
          icon={ReceiptIcon}
        />
      )}
    </Admin>
  );
};

export default AdminApp;
