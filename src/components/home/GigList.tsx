import { api } from "~/utils/api";
import { Heading } from "../Layout/Heading";
import { LoadingSpinner } from "../LoadingSpinner";
import { GigListItem } from "./GigListItem";
import { GigCalendar } from "../musician/GigCalendar";
import { useState } from "react";
import JobCard from "../musician/JobCard";
import { List, Calendar } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";

export function ViewToggle() {
  return (
    <ToggleGroup type="single" defaultValue="calendar">
      <ToggleGroupItem value="calendar" aria-label="Toggle calendar view">
        <Calendar className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="list" aria-label="Toggle list view">
        <List className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

export const Gigs = () => {
  const [selectedDate, setSelectedDate] = useState<undefined | Date>();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // use current month to get the first and last day of the month
  const firstDay = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1,
  );
  const lastDay = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0,
  );

  const { data: jobs, isLoading } = api.jobs.getMyJobs.useQuery({
    filter: {
      status: "accepted",
      date_gte: firstDay,
      date_lte: lastDay,
    },
    includeEvents: true,
  });

  const selectedJobs = jobs?.filter(
    (job) => job.event.date.getDate() === selectedDate?.getDate(),
  );

  return (
    <div>
      <Heading>
        <h2 className="themed-h2">Gigs</h2>
      </Heading>
      <div>
        <ViewToggle />
      </div>
      <div className="flex w-full items-center justify-center p-4">
        <GigCalendar
          showOutsideDays={false}
          highlightedDates={jobs}
          setSelectedDate={setSelectedDate}
          selectedDate={selectedDate}
          setCurrentMonth={setCurrentMonth}
        />
      </div>
      <JobCard jobs={selectedJobs} />
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          {!jobs?.length && (
            <p className="p-2 font-body">
              You currently have no gigs. When you accept a gig offer, it will
              appear here.
            </p>
          )}
          <p className="flex flex-col gap-4 p-4 font-body">
            {jobs?.map((job) => <GigListItem job={job} key={job.id} />)}
          </p>
        </>
      )}
    </div>
  );
};
