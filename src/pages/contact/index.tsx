import React from "react";
import { Heading } from "~/components/Layout/Heading";
import Layout from "~/components/Layout/Layout";
import Joseph from "../../../public/assets/images/joseph_malik.jpeg";
import Image from "next/image";

const contact = () => {
  return (
    <Layout
      pageName="Contact"
      pageDescription="Get in touch with us about your booking."
    >
      <Heading>
        <h2>Contact</h2>
      </Heading>
      <div className="flex w-full self-center p-4">
        <div className="flex w-full content-between rounded-lg bg-gradient-to-tl from-gray-900/40 to-gray-300/50 p-6 bg-blend-darken shadow-inner shadow-gray-500 backdrop-blur-md">
          <Image
            src={Joseph}
            alt="Joseph Malik"
            width={130}
            height={130}
            className="w-1/2 rounded-full"
          />
          <div className="flex w-full flex-col justify-center text-center">
            <span>Joseph Malik</span>
            <span>Band Manager</span>
            <a href="tel:07977991235">07977991235</a>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default contact;
