/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Admin, Resource, type LayoutProps, Layout } from "react-admin";
import { ReactQueryDevtools } from "react-query/devtools";
import { AppBar, TitlePortal, InspectorButton } from "react-admin";
import { dataProvider } from "ra-data-simple-prisma";
import { UserEdit, UserList, UserShow } from "./Users/Users";
import EmojiPeopleIcon from "@mui/icons-material/EmojiPeople";
import { useSession } from "next-auth/react";

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
        icon={EmojiPeopleIcon}
      />
    </Admin>
  );
};

export default AdminApp;
