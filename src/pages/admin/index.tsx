import { type NextPage } from "next";
import dynamic from "next/dynamic";
const AdminApp = dynamic(() => import("../../components/admin/Admin"), {
  ssr: false,
});

const Admin: NextPage = () => {
  return <AdminApp />;
};

export default Admin;
