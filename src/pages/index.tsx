import Head from "next/head";
import { Auth } from "~/components/Auth";
import Layout from "~/components/Layout";

export default function Home() {
  return (
    <>
      <Head>
        <title>Booking manager</title>
        <meta name="description" content="Manage your booking" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <Auth />
      </Layout>
    </>
  );
}
