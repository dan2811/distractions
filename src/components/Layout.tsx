import { Exo, Noto_Sans_Display } from "next/font/google";
import { Logo } from "./Logo";
const exo = Exo({ subsets: ["latin"], variable: "--font-exo" });
const noto = Noto_Sans_Display({ subsets: ["latin"], variable: "--font-noto" });

const Layout = (props: React.PropsWithChildren) => {
  return (
    <main
      className={`${exo.variable} ${noto.variable} min-w-screen flex min-h-screen flex-col bg-gradient-to-b from-[rgb(0,0,0)] to-[#1e1e1e] text-white`}
    >
      <Logo className="self-center" />
      {props.children}
    </main>
  );
};

export default Layout;
