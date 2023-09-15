"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { AuthButton } from "~/components/Auth";
import Layout from "~/components/Layout/Layout";
import { api } from "~/utils/api";

const Profile = () => {
  const { data: sessionData } = useSession();
  if (!sessionData ?? !sessionData?.user.email) return 401;
  return (
    <Layout>
      <div className="flex flex-col gap-y-2 py-2">
        <p className="flex flex-col text-2xl text-white">
          {sessionData && <span>Hello {sessionData.user.name},</span>}
        </p>
        <ProfileAttribute
          label="Email"
          fieldName="email"
          inputType="email"
          initialValue={sessionData.user.email}
        />
        <ProfileAttribute
          label="Phone"
          fieldName="phone"
          inputType="tel"
          initialValue={sessionData.user.phone ?? ""}
        />
      </div>
      <AuthButton />
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

const ProfileAttribute = ({
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
        <button
          type="submit"
          className="w-3/4 bg-main-accent text-sm disabled:opacity-30"
          disabled={isLoading}
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default Profile;
