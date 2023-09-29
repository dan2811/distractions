"use client";
import { Admin, Resource, type LayoutProps, Layout } from "react-admin";
import { ReactQueryDevtools } from "react-query/devtools";
import { AppBar, TitlePortal, InspectorButton } from "react-admin";
import { dataProvider } from "ra-data-simple-prisma";
import { UserCreate, UserEdit, UserList } from "./Users/Users";

import EmojiPeopleIcon from "@mui/icons-material/EmojiPeople";
import FestivalIcon from "@mui/icons-material/Festival";
import PianoIcon from "@mui/icons-material/Piano";

import { useSession } from "next-auth/react";
import { EventCreate, EventList, EventShow } from "./Events/Events";
import {
  InstrumentCreate,
  InstrumentEdit,
  InstrumentList,
  InstrumentShow,
} from "./Instruments/Instruments";
import { UserShow } from "./Users/UserShow";
import type { Event } from "@prisma/client";
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

export const MyLayout = (props: LayoutProps) => (
  <>
    <Layout {...props} appBar={MyAppBar} />
    <ReactQueryDevtools initialIsOpen={false} />
  </>
);

const MyAppBar = () => {
  const session = useSession();
  if (session.status !== "authenticated") {
    return null;
  }
  const isSuperAdmin = session.data.user.role === "superAdmin";
  return (
    <AppBar>
      <TitlePortal />
      {isSuperAdmin ?? <InspectorButton />}
    </AppBar>
  );
};

const AdminApp = () => {
  const session = useSession();
  if (session.status !== "authenticated") {
    return null;
  }

  const isSuperAdmin = session.data.user.role === "superAdmin";

  return (
    <Admin dataProvider={dataProvider("/api")} layout={MyLayout}>
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
          `${new Date(rec.date).toLocaleDateString()} - ${rec.name}`
        }
        list={EventList}
        show={EventShow}
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
        recordRepresentation="name"
        list={EventTypeList}
        show={EventTypeShow}
        create={EventTypeCreate}
        edit={EventTypeEdit}
      />
      <Resource
        name="package"
        recordRepresentation="name"
        list={PackageList}
        show={PackageShow}
        create={PackageCreate}
        edit={PackageEdit}
      />
    </Admin>
  );
};

export default AdminApp;
