import React from "react";
import { DateField, type FieldProps, useRecordContext } from "react-admin";

const ColouredDateField = (props: FieldProps) => {
  const record = useRecordContext();
  if (!props.source) return null;
  const now = new Date().getTime();
  const nowDateUkLocale = new Date().toLocaleDateString("en-UK");
  const recordDateUkLocale = new Date(
    record[props.source] as string,
  ).toLocaleDateString("en-UK");
  const dateIsToday = nowDateUkLocale === recordDateUkLocale;

  return dateIsToday ? (
    "TODAY"
  ) : (
    <DateField
      sx={{
        color: dateIsToday
          ? "blue"
          : new Date(record[props.source] as string).getTime() < now
          ? "gray"
          : null,
      }}
      {...props}
    />
  );
};

export default ColouredDateField;
