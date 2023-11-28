import { useSession } from "next-auth/react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { AuthButton } from "~/components/Auth";
import Layout from "~/components/Layout/Layout";
import { api } from "~/utils/api";
import FemaleSinger from "/public/assets/images/female-singer.png";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { Heading } from "~/components/Layout/Heading";
import { Chip } from "@mui/material";
import type { UseQueryResult } from "@tanstack/react-query";

const Profile = () => {
  const { data: sessionData, status, update } = useSession();
  const {
    data: user,
    isLoading,
    refetch,
  } = api.users.getUser.useQuery({
    id: sessionData?.user.id ?? "",
  });
  if (isLoading) return <LoadingSpinner />;
  if (!user) return 401;
  if (status === "unauthenticated") return 401;
  return (
    <Layout pageName="Profile" pageDescription="Your details">
      <div className="fixed -z-40 h-screen w-screen bg-black bg-opacity-40" />
      <Image src={FemaleSinger} alt="female singer" className="fixed -z-50" />
      {status === "loading" ? (
        <LoadingSpinner />
      ) : (
        <>
          <Heading>
            <h2>Profile</h2>
          </Heading>
          <div className="flex flex-col gap-6 p-4">
            <ProfileAttribute
              label="Email"
              fieldName="email"
              inputType="email"
              initialValue={user.email ?? ""}
              // @TODO nasty typing, please fix me!
              refetch={refetch as UseQueryResult<"users">["refetch"]}
            />
            <ProfileAttribute
              label="Phone"
              fieldName="phone"
              inputType="tel"
              initialValue={user.phone ?? ""}
              refetch={refetch as UseQueryResult<"users">["refetch"]}
            />
            {!sessionData
              ? null
              : sessionData?.user.role !== "client" && (
                  <InstrumentsSelect userId={sessionData.user.id} />
                )}
          </div>
          <AuthButton />
        </>
      )}
    </Layout>
  );
};

interface ProfileInputProps {
  fieldName: string;
  label: string;
  inputType: string;
  initialValue: string;
  pattern?: string;
  refetch: UseQueryResult<"users">["refetch"];
}

const ProfileAttribute = ({
  fieldName,
  label,
  inputType,
  initialValue,
  pattern,
  refetch,
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
    void refetch();
  };
  return (
    <div className="w-full rounded-lg bg-gradient-to-tl from-gray-900/40 to-gray-300/50 p-4 bg-blend-darken shadow-inner shadow-gray-500 backdrop-blur-md">
      <form onSubmit={handleSubmit} className="grid grid-cols-6">
        <label
          htmlFor={fieldName}
          className="col-span-6 self-center pb-2 font-light"
        >
          {label}:
        </label>
        <input
          type={inputType}
          id={fieldName}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          pattern={pattern}
          className="col-span-4 w-full rounded-lg bg-main-input bg-opacity-60 p-2"
        />
        <div className="col-span-2 flex justify-center">
          <button
            type="submit"
            className="w-3/4 bg-main-accent text-sm disabled:opacity-30"
            disabled={isLoading}
          >
            SAVE
          </button>
        </div>
      </form>
    </div>
  );
};

const InstrumentsSelect = ({ userId }: { userId: string }) => {
  const { data: instruments, isLoading: isLoadingInstruments } =
    api.instruments.getAll.useQuery();
  const { data: usersInstruments, isLoading: isLoadingUsersInstruments } =
    api.instruments.getUsersInstruments.useQuery({ userId });
  const { isLoading, mutateAsync } = api.users.update.useMutation();
  const [value, setValue] = useState<string[]>([]);
  useEffect(() => {
    const usersInstrumentsIDs =
      usersInstruments?.map((instrument) => instrument.id) ?? [];
    setValue(usersInstrumentsIDs);
  }, [usersInstruments]);

  if (isLoadingUsersInstruments || isLoadingInstruments)
    return <LoadingSpinner />;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void toast.promise(
      mutateAsync({
        instruments: value,
      }),
      {
        loading: "Saving...",
        success: "Saved",
        error: "Error",
      },
    );
  };
  return (
    <div className="w-full rounded-lg bg-gradient-to-tl from-gray-900/40 to-gray-300/50 p-4 bg-blend-darken shadow-inner shadow-gray-500 backdrop-blur-md">
      <form className="grid grid-cols-6 gap-2" onSubmit={handleSubmit}>
        <label
          htmlFor="instruments"
          className="col-span-6 self-center font-light"
        >
          Instruments:
        </label>
        <div className="col-span-6 flex flex-wrap gap-2">
          {instruments?.map((instrument) => (
            <Chip
              key={instrument.id}
              label={instrument.name}
              variant="filled"
              className="p-1 text-white"
              color={value.includes(instrument.id) ? "primary" : "default"}
              onClick={() => {
                if (value.includes(instrument.id)) {
                  setValue(value.filter((id) => id !== instrument.id));
                } else {
                  setValue([...value, instrument.id]);
                }
              }}
            />
          ))}
        </div>
        <div className="col-span-2 flex justify-center">
          <button
            type="submit"
            className="w-3/4 bg-main-accent text-sm disabled:opacity-30"
            disabled={isLoading}
          >
            SAVE
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
