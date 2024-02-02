import { Exo, Noto_Sans_Display } from "next/font/google";
import { NavBar } from "./NavBar";
import Head from "next/head";
import React from "react";
const exo = Exo({ subsets: ["latin"], variable: "--font-exo" });
const noto = Noto_Sans_Display({ subsets: ["latin"], variable: "--font-noto" });

interface LayoutProps extends React.PropsWithChildren {
  pageName: string;
  pageDescription: string;
}

const Layout = (props: LayoutProps) => {
  return (
    <>
      <Head>
        <title>{props.pageName}</title>
        <meta name="description" content={props.pageDescription} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main
        className={`${exo.variable} ${noto.variable} min-w-screen flex min-h-screen flex-col bg-main-dark text-white`}
      >
        <NavBar />
        {props.children}
      </main>
    </>
  );
};

export default Layout;
