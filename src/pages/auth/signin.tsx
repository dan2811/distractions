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
import { useState } from "react";

export default function SignIn({
  providers,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [email, setEmail] = useState("");
  return (
    <div className="flex h-screen w-screen flex-col items-center">
      <Image
        src={RosieVocals}
        alt="female singer"
        className="fixed top-32 -z-50 object-scale-down md:top-48 md:w-2/3 md:object-contain lg:top-48 lg:w-1/2 xl:w-1/3"
      />
      <Image src={Logo} alt="The Distractions Band Ltd." className="p-16" />
      <div className="fixed bottom-0 flex h-1/3 w-full flex-col place-items-center justify-center">
        {Object.values(providers).map((provider) => {
          if (provider.name === "Email")
            return (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  try {
                    void signIn(provider.id, {
                      email,
                    });
                  } catch (e) {
                    console.error(e);
                  }
                }}
                key={provider.name}
                className="flex w-full max-w-md flex-col gap-2 px-20"
              >
                <p className="self-center">Or</p>
                <input
                  id="email"
                  type="email"
                  placeholder="Email"
                  className="themed-input p-2"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button className="themed-button w-full" type="submit">
                  Sign in with {provider.name}
                </button>
              </form>
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
