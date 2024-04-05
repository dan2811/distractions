import { signIn, signOut, useSession } from "next-auth/react";

export const AuthButton = () => {
  const { data: sessionData } = useSession();

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <button
        className="themed-button"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "SIGN OUT" : "SIGN IN"}
      </button>
    </div>
  );
};
