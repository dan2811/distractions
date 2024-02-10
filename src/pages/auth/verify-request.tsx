import Logo from "../../../public/assets/images/logo_full_dark.png";
import Image from "next/image";

const VerifyRequest = () => {
  return (
    <div className="h-dvh flex w-screen flex-col items-center">
      <Image src={Logo} alt="The Distractions Band Ltd." className="p-16" />
      <div className="flex h-fit w-full flex-col place-items-center justify-around gap-4 p-8">
        <h1 className="text-3xl">Check your inbox</h1>
        <p>
          We&apos;ve sent an email to the address you provided. Please follow
          the link in the email to login.
        </p>
      </div>
    </div>
  );
};

export default VerifyRequest;
