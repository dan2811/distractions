import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "~/lib/utils";
import { buttonVariants } from "~/components/ui/button";
import type { Prisma } from "@prisma/client";

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  highlightedDates?: Prisma.JobGetPayload<{
    include: {
      event: {
        select: {
          date: true;
          id: true;
          name: true;
          location: true;
        };
      };
    };
  }>[];
  selectedDate?: Date;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  setCurrentMonth: React.Dispatch<React.SetStateAction<Date>>;
};

export const GigCalendar = ({
  className,
  classNames,
  highlightedDates = [],
  selectedDate,
  setSelectedDate,
  setCurrentMonth,
  ...props
}: CalendarProps) => {
  const isHighlighted = (date: Date) => {
    return highlightedDates.some(
      ({ event }) =>
        event.date.getDate() === date.getDate() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getFullYear() === date.getFullYear(),
    );
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      today.getDate() === date.getDate() &&
      today.getMonth() === date.getMonth() &&
      today.getFullYear() === date.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    return (
      selectedDate &&
      selectedDate.getDate() === date.getDate() &&
      selectedDate.getMonth() === date.getMonth() &&
      selectedDate.getFullYear() === date.getFullYear()
    );
  };

  const isOutsideCurrentMonth = (date: Date, displayMonth: Date) => {
    return date.getMonth() !== displayMonth.getMonth();
  };

  return (
    <DayPicker
      showOutsideDays={false}
      className={cn(
        "rounded-lg bg-gradient-to-tl from-gray-950/80 to-gray-500/70 p-4 font-headers bg-blend-darken shadow-inner shadow-gray-500 backdrop-blur-md",
        className,
      )}
      weekStartsOn={1}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-lg font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "rounded-md w-9 font-normal text-[1rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
        ),
        day_range_end: "day-range-end",
        day_today: "text-accent-foreground border-2 border-main-accent",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      onMonthChange={(month) => setCurrentMonth(month)}
      components={{
        Day: ({ date, displayMonth }) => {
          return (
            <button
              onClick={() => {
                setSelectedDate(date);
              }}
              className={cn(
                "day relative",
                isHighlighted(date)
                  ? `w-full rounded-md p-1 font-headers text-xl font-normal text-main-accent`
                  : "w-full rounded-md p-1 font-headers text-xl font-normal text-slate-400",
                isSelected(date) && "text-primary-foreground bg-main-accent",
                isOutsideCurrentMonth(date, displayMonth) && "hidden",
                isToday(date) && "border-2 border-main-accent",
              )}
            >
              {isHighlighted(date) && (
                <div
                  className={cn(
                    "absolute left-1/2 top-0.5 h-2 w-2 -translate-x-1/2 transform rounded-full",
                    isSelected(date) ? "bg-black" : "bg-main-accent",
                  )}
                ></div>
              )}
              <p className="pt-1">{date.getDate()}</p>
            </button>
          );
        },
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
};
