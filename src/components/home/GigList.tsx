import { api } from "~/utils/api";
import { Heading } from "../Layout/Heading";
import { LoadingSpinner } from "../LoadingSpinner";
import { GigListItem } from "./GigListItem";
import { GigCalendar } from "../musician/GigCalendar";
import { useState } from "react";
import JobCard from "../musician/JobCard";
import { List, Calendar } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export function ViewToggle({
  setView,
}: {
  setView: (view: "calendar" | "list") => void;
}) {
  return (
    <ToggleGroup type="single" defaultValue="calendar">
      <ToggleGroupItem
        value="calendar"
        aria-label="Toggle calendar view"
        onClick={() => setView("calendar")}
      >
        <Calendar className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="list"
        aria-label="Toggle list view"
        onClick={() => setView("list")}
      >
        <List className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

export const Gigs = () => {
  const [selectedDate, setSelectedDate] = useState<undefined | Date>();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentYear, setCurrentYear] = useState(new Date());
  const [view, setView] = useState<"calendar" | "list">("calendar");

  // use current month to get the first and last day of the month
  const firstDay = new Date(
    currentYear.getFullYear(),
    currentMonth.getMonth(),
    1,
  );
  const lastDay = new Date(
    currentYear.getFullYear(),
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
      <div className="flex w-full justify-between">
        <Heading>
          <h2 className="themed-h2">Gigs</h2>
        </Heading>
        <div className="flex items-center rounded-lg bg-gradient-to-tl from-gray-900/40 to-gray-300/50 px-2 bg-blend-darken shadow-inner shadow-gray-500 backdrop-blur-md">
          <ViewToggle setView={setView} />
        </div>
      </div>
      {isLoading ? (
        <LoadingSpinner />
      ) : view === "calendar" ? (
        <>
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
        </>
      ) : (
        <>
          <div className="flex w-2/3 gap-2 pl-4 pt-4">
            <MonthSelect setCurrentMonth={setCurrentMonth} />
            <YearSelect setCurrentYear={setCurrentYear} />
          </div>
          {!jobs?.length && <p className="p-2 font-body">No gigs</p>}
          <p className="flex flex-col gap-4 p-4 font-body">
            {jobs?.map((job) => <GigListItem job={job} key={job.id} />)}
          </p>
        </>
      )}
    </div>
  );
};

const MonthSelect = ({
  setCurrentMonth,
}: {
  setCurrentMonth: (input: Date) => void;
}) => {
  return (
    <Select
      defaultValue={new Date().getMonth().toString(10)}
      onValueChange={(e) =>
        setCurrentMonth(new Date(new Date().setMonth(parseInt(e))))
      }
    >
      <SelectTrigger className="w-1/2">
        <SelectValue placeholder="Month" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Months</SelectLabel>
          <SelectItem value="0">January</SelectItem>
          <SelectItem value="1">February</SelectItem>
          <SelectItem value="2">March</SelectItem>
          <SelectItem value="3">April</SelectItem>
          <SelectItem value="4">May</SelectItem>
          <SelectItem value="5">June</SelectItem>
          <SelectItem value="6">July</SelectItem>
          <SelectItem value="7">August</SelectItem>
          <SelectItem value="8">September</SelectItem>
          <SelectItem value="9">October</SelectItem>
          <SelectItem value="10">November</SelectItem>
          <SelectItem value="11">December</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

const YearSelect = ({
  setCurrentYear,
}: {
  setCurrentYear: (input: Date) => void;
}) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 9 }, (_, i) =>
    (currentYear - 4 + i).toString(),
  );

  return (
    <Select
      defaultValue={currentYear.toString()}
      onValueChange={(e) =>
        setCurrentYear(new Date(new Date().setFullYear(parseInt(e))))
      }
    >
      <SelectTrigger className="w-1/2">
        <SelectValue placeholder="Year" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Years</SelectLabel>
          {years.map((year) => (
            <SelectItem key={year} value={year}>
              {year}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
