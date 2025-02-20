import { useRouter } from "next/router";
import Logo from "../../../public/assets/images/logo_full_dark.png";
import Image from "next/image";

const AuthError = () => {
  const router = useRouter();
  return (
    <div className="h-dvh flex w-screen flex-col items-center">
      <Image src={Logo} alt="The Distractions Band Ltd." className="p-16" />
      <div className="flex h-fit w-full flex-col place-items-center justify-around gap-4 p-8">
        <h1 className="text-3xl">Something has gone wrong</h1>
        <p>
          We had trouble signing you in. Make sure you are using the correct
          email address and an account has been made for you by an admin. If
          this problem persists, please contact us for help.
        </p>
        <a href="mailto: support@thedistractionsband.co.uk">
          support@thedistractionsband.co.uk
        </a>
        <button
          className="themed-button"
          onClick={() => {
            router.back();
          }}
        >
          Try again
        </button>
      </div>
    </div>
  );
};

export default AuthError;
