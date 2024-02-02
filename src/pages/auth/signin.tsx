import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { getProviders, signIn } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import authOptions from "../api/auth/[...nextauth]";
import type { NextAuthOptions } from "next-auth";
import RosieVocals from "../../../public/assets/images/vocals-rosie.webp";
import GoogleSignin from "../../../public/assets/images/google_signin.png";
import Logo from "../../../public/assets/images/logo_full_dark.png";
import Image from "next/image";

export default function SignIn({
  providers,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  console.log(providers);
  return (
    <div className="h-screen w-screen">
      <Image
        src={RosieVocals}
        alt="female singer"
        className="fixed top-32 -z-50"
      />
      <Image src={Logo} alt="The Distractions Band Ltd." className="p-16" />
      <div className="fixed bottom-0 flex h-1/3 w-full flex-col place-items-center justify-center">
        {Object.values(providers).map((provider) => {
          if (provider.name === "Email")
            return (
              <div
                key={provider.name}
                className="flex w-full max-w-md flex-col gap-2 px-20"
              >
                <p className="self-center">Or</p>
                <input type="email" placeholder="Email" className="p-2" />
                <button
                  className="w-full"
                  onClick={() => void signIn(provider.id)}
                >
                  Sign in with {provider.name}
                </button>
              </div>
            );
          return (
            <div key={provider.name} className="w-full max-w-md px-20">
              <button
                className="flex w-full place-items-center justify-center bg-transparent"
                onClick={() => void signIn(provider.id)}
              >
                <Image
                  src={GoogleSignin}
                  alt="Continue with Google"
                  height={100}
                  width={200}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(
    context.req,
    context.res,
    authOptions as NextAuthOptions,
  );

  if (session) {
    return { redirect: { destination: "/" } };
  }

  const providers = await getProviders();

  return {
    props: { providers: providers ?? [] },
  };
}
