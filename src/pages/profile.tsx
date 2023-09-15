import { UserArgs } from "@prisma/client/runtime/library";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import Layout from "~/components/Layout/Layout";
import { Loading } from "~/components/Loading";
import { api } from "~/utils/api";

const Profile = () => {
  const { data: sessionData } = useSession();
  const { push } = useRouter();
  if (!sessionData) return <Loading />;

  if (!sessionData.user.email) return void push("/");
  return (
    <Layout>
      <div className="flex flex-col gap-y-2">
        <p className="flex flex-col text-2xl text-white">
          {sessionData && <span>Hello {sessionData.user.name},</span>}
        </p>
        <ProfileAttributeEdit
          label="Email"
          fieldName="email"
          inputType="email"
          initialValue={sessionData.user.email}
        />
        <ProfileAttributeEdit
          label="Phone"
          fieldName="phone"
          inputType="tel"
          initialValue={sessionData?.user.phone ?? ""}
          pattern="[0-9]{3}-[0-9]{2}-[0-9]{3}"
        />
      </div>
    </Layout>
  );
};

interface ProfileInputProps {
  fieldName: string;
  label: string;
  inputType: string;
  initialValue: string;
  pattern?: string;
}

const ProfileAttributeEdit = ({
  fieldName,
  label,
  inputType,
  initialValue,
  pattern,
}: ProfileInputProps) => {
  const [value, setValue] = useState(initialValue.toString());
  const { isLoading, mutateAsync } = api.users.update.useMutation();
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void toast.promise(
      mutateAsync({
        [fieldName]: value,
      }),
      {
        loading: "Saving...",
        success: "Saved",
        error: "Error",
      },
    );
  };
  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-6">
      <label htmlFor={fieldName} className="self-center px-2">
        {label}:
      </label>
      <input
        type={inputType}
        id={fieldName}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        pattern={pattern}
        className="col-span-4 w-full p-2"
      />
      <div className="flex justify-center">
        {!isLoading && (
          <button type="submit" className="w-3/4 bg-main-accent text-sm">
            Save
          </button>
        )}
      </div>
    </form>
  );
};

export default Profile;
