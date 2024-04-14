import { api } from "~/utils/api";
import { Heading } from "../Layout/Heading";
import { LoadingSpinner } from "../LoadingSpinner";
import { GigListItem } from "./GigListItem";
import { GigCalendar } from "../musician/GigCalendar";
import { useState } from "react";
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
  view,
}: {
  setView: (view: "calendar" | "list") => void;
  view: "calendar" | "list";
}) {
  return (
    <ToggleGroup type="single" defaultValue={view}>
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
  if (!localStorage.getItem("gigs-view-preference")) {
    localStorage.setItem("gigs-view-preference", "calendar");
  }
  const viewPreference = localStorage.getItem("gigs-view-preference");
  const cachedCurrentMonth = sessionStorage.getItem("gig-list-current-month");
  const cachedCurrentYear = sessionStorage.getItem("gig-list-current-year");
  const [selectedDate, setSelectedDate] = useState<undefined | Date>(
    new Date(cachedCurrentYear ?? new Date()),
  );
  const [currentMonth, setCurrentMonth] = useState(
    new Date(cachedCurrentMonth ?? new Date()),
  );
  const [currentYear, setCurrentYear] = useState(new Date());
  const [view, setView] = useState<"calendar" | "list">(
    (viewPreference as "calendar" | "list") ?? "calendar",
  );

  const setViewPreference = (input: "calendar" | "list") => {
    localStorage.setItem("gigs-view-preference", input);
    setView(input);
  };

  const setCurrentMonthWrapper = (input: Date) => {
    setCurrentMonth(input);
    sessionStorage.setItem("gig-list-current-month", input.toISOString());
  };

  const setCurrentYearWrapper = (input: Date) => {
    setCurrentYear(input);
    sessionStorage.setItem("gig-list-current-year", currentYear.toISOString());
  };

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
          <ViewToggle setView={setViewPreference} view={view} />
        </div>
      </div>
      {viewPreference === "calendar" ? (
        <>
          <div className="flex w-full items-center justify-center p-4">
            <GigCalendar
              showOutsideDays={false}
              highlightedDates={jobs}
              setSelectedDate={setSelectedDate}
              selectedDate={selectedDate}
              setCurrentMonth={setCurrentMonthWrapper}
              setCurrentYear={setCurrentYearWrapper}
              currentMonth={currentMonth}
              currentYear={currentYear}
            />
          </div>

          <div className="flex flex-col gap-4 px-4 pb-4 font-body">
            {selectedJobs?.map((job) => <GigListItem job={job} key={job.id} />)}
          </div>
        </>
      ) : (
        <>
          <div className="flex w-2/3 gap-2 pl-4 pt-4 font-headers font-normal">
            <MonthSelect
              setCurrentMonth={setCurrentMonth}
              currentMonth={currentMonth}
            />
            <YearSelect
              setCurrentYear={setCurrentYear}
              currentYear={currentYear}
            />
          </div>
          {isLoading ? (
            <LoadingSpinner />
          ) : !jobs?.length ? (
            <div className="flex flex-col gap-4 p-4 font-body">
              <p className="flex h-1/2 w-full items-center justify-between gap-2 rounded-lg bg-gradient-to-tl from-gray-900/40 to-gray-300/50 p-4 text-center bg-blend-darken shadow-inner shadow-gray-500 backdrop-blur-md md:max-w-md">
                No gigs
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 p-4 font-body">
              {jobs?.map((job) => <GigListItem job={job} key={job.id} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const MonthSelect = ({
  setCurrentMonth,
  currentMonth,
}: {
  setCurrentMonth: (input: Date) => void;
  currentMonth: Date;
}) => {
  return (
    <Select
      defaultValue={
        !currentMonth
          ? new Date().getMonth().toString(10)
          : currentMonth.getMonth().toString(10)
      }
      value={currentMonth.getMonth().toString(10)}
      onValueChange={(e) =>
        setCurrentMonth(new Date(new Date().setMonth(parseInt(e))))
      }
    >
      <SelectTrigger className="w-1/2">
        <SelectValue placeholder="Month" />
      </SelectTrigger>
      <SelectContent style={{ zIndex: 1000000 }}>
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
  currentYear,
}: {
  setCurrentYear: (input: Date) => void;
  currentYear: Date;
}) => {
  const years = Array.from({ length: 9 }, (_, i) =>
    (currentYear.getFullYear() - 4 + i).toString(),
  );

  return (
    <Select
      defaultValue={currentYear.getFullYear().toString()}
      value={currentYear.getFullYear().toString()}
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
