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
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="theme-color" content="#000000" />
      </Head>
      <main
        className={`${exo.variable} ${noto.variable} min-w-screen bg-main-dark flex min-h-screen flex-col text-white`}
      >
        <NavBar />
        {props.children}
      </main>
    </>
  );
};

export default Layout;
