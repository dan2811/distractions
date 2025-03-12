import {
  Badge,
  BottomNavigation,
  BottomNavigationAction,
  Card,
} from "@mui/material";
import { Song } from "@prisma/client";
import { ArrowLeftIcon, CheckIcon, XIcon } from "lucide-react";
import { useRouter } from "next/router";
import React from "react";
import toast from "react-hot-toast";
import Layout from "~/components/Layout/Layout";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { Button } from "~/components/ui/button";
import { api } from "~/utils/api";

const SongChoice = () => {
  const router = useRouter();
  const { id: eventId, setId } = router.query;
  const {
    data: set,
    isLoading,
    error,
    refetch,
  } = api.sets.getSet.useQuery({ id: setId as string }, { enabled: !!setId });

  const {
    data: songs,
    isLoading: songsIsLoading,
    error: songsError,
  } = api.songs.listSongs.useQuery(
    { setId: setId as string },
    { enabled: !!setId },
  );

  const { mutateAsync: mutateSongToGoodSongs } =
    api.sets.addSongToGoodSongs.useMutation();

  const { mutateAsync: mutateSongToBadSongs } =
    api.sets.addSongToBadSongs.useMutation();

  if (isLoading || songsIsLoading) return <LoadingSpinner />;

  if (error ?? songsError)
    return (
      <p>
        Something went wrong! Error: {error?.message} {songsError?.message}
      </p>
    );

  if (!eventId || Array.isArray(eventId))
    return <p className="text-red-600">Event not found</p>;

  if (!setId || Array.isArray(setId))
    return <p className="text-red-600">Set not found</p>;

  const addSongToGoodSongs = async (song: Song, isAlreadyAdded: boolean) => {
    await mutateSongToGoodSongs(
      { songId: song.id, setId: setId },
      {
        onSuccess: () => {
          void refetch();
        },
        onError: (e) => {
          toast.error(`Error: ${e.message}`);
        },
      },
    );
  };

  const addSongToBadSongs = async (song: Song, isAlreadyAdded: boolean) => {
    await mutateSongToBadSongs(
      { songId: song.id, setId: setId },
      {
        onSuccess: () => {
          void refetch();
        },
        onError: (e) => {
          toast.error(`Error: ${e.message}`);
        },
      },
    );
  };

  return (
    <Layout
      pageName="Choose your songs"
      pageDescription="Help us understand your music taste."
    >
      <div className="sticky top-14 z-50 px-4">
        <span className="flex justify-between bg-black pt-2">
          <h1 className=" text-left text-xl font-light">Choose your songs</h1>
          <Button
            className="themed-button"
            onClick={() => void router.push(`/event/${eventId}/sets`)}
          >
            <ArrowLeftIcon />
            <p>Back</p>
          </Button>
        </span>
        <p className="bg-black pt-2">
          Click the green tick to tell us that you like a song and use the red
          button if you&apos;re not a fan. Click the same button again to undo.
        </p>
        <div className="h-8 bg-gradient-to-b from-black to-transparent"></div>
      </div>
      <div className="flex w-full flex-col gap-6 place-self-center p-4 pt-0 md:max-w-lg">
        {songs?.map((song) => {
          const isGoodSong = !!set?.goodSongs.find((sng) => sng.id === song.id);
          let isBadSong = false;
          if (!isGoodSong) {
            isBadSong = !!set?.badSongs.find((sng) => sng.id === song.id);
          }
          console.log(`${song.name}`, { isGoodSong, isBadSong });
          return (
            <span
              key={song.id}
              className="grid w-full grid-cols-2 self-center rounded-lg bg-gradient-to-tl from-gray-900/40 to-gray-300/50 p-4 bg-blend-darken shadow-inner shadow-gray-500 backdrop-blur-md"
            >
              <span>
                <p>{song.name}</p>
                <p>{song.artist}</p>
              </span>
              <span className="flex items-center justify-center gap-8">
                <button
                  onClick={() => void addSongToGoodSongs(song, isGoodSong)}
                  className={`h-fit w-fit rounded-full bg-green-500 ${
                    isGoodSong ? "bg-opacity-70" : "bg-opacity-30"
                  }  p-2`}
                >
                  <CheckIcon />
                </button>
                <button
                  onClick={() => void addSongToBadSongs(song, isBadSong)}
                  className={`h-fit w-fit rounded-full bg-red-500 ${
                    isBadSong ? "bg-opacity-70" : "bg-opacity-30"
                  } p-2`}
                >
                  <XIcon />
                </button>
              </span>
            </span>
          );
        })}
      </div>
      <Card className="h-16 w-full" />
      <BottomNavigation
        showLabels
        // value={tab}
        onChange={(_event, newValue: number) => {
          void router.push(`/event/${eventId}?tab=${newValue}`);
        }}
        sx={{
          borderTop: "0.5px solid rgba(168, 160, 124, 0.5)",
          boxShadow: "0px -5px 10px 0px rgba(0,0,0,0.75)",
        }}
        className="fixed bottom-0 h-14 w-full"
      >
        <BottomNavigationAction
          label="Likes"
          icon={
            <Badge
              badgeContent={set?.goodSongs.length}
              anchorOrigin={{ vertical: "top", horizontal: "left" }}
              overlap="circular"
            >
              <CheckIcon color="green" />
            </Badge>
          }
        />
        <BottomNavigationAction
          label="Dislikes"
          icon={
            <Badge
              badgeContent={set?.badSongs.length}
              anchorOrigin={{ vertical: "top", horizontal: "left" }}
              overlap="circular"
            >
              <XIcon color="red" />
            </Badge>
          }
        />
      </BottomNavigation>
    </Layout>
  );
};

export default SongChoice;
