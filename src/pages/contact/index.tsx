import React from "react";
import { Heading } from "~/components/Layout/Heading";
import Layout from "~/components/Layout/Layout";

const contact = () => {
  return (
    <Layout>
      <Heading>
        <h2>Contact</h2>
      </Heading>
      <span>Joseph Malik</span>
      <span>Band Manager</span>
      <a href="tel:07977991235">07977991235</a>
    </Layout>
  );
};

export default contact;
