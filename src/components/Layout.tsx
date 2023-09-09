import { Exo, Noto_Sans_Display } from "next/font/google";
const exo = Exo({ subsets: ["latin"], variable: "--font-exo" });
const noto = Noto_Sans_Display({ subsets: ["latin"], variable: "--font-noto" });

const Layout = (props: React.PropsWithChildren) => {
  return (
    <main
      className={`${exo.variable} ${noto.variable} min-w-screen flex min-h-screen flex-col bg-gradient-to-b from-[rgb(0,0,0)] to-[#1e1e1e] text-white`}
    >
      {props.children}
    </main>
  );
};

export default Layout;
