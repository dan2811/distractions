import Image from "next/image";
import logo from "../../public/assets/images/logo_dark.png";
import logoFull from "../../public/assets/images/logo_full_dark.png";

export const Logo = (props: { className?: string }) => (
  <Image
    src={logo}
    alt="The Distractions Band Logo"
    width={175}
    height={175}
    className={`p-2 ${props.className ?? ""}`}
  />
);

export const LogoFull = (props: { className?: string }) => (
  <Image
    src={logoFull}
    alt="The Distractions Band Logo"
    width={175}
    height={175}
    className={`p-2 ${props.className ?? ""}`}
  />
);
