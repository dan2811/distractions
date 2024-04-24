export function differenceInDays(date1: Date, date2: Date): number {
  // Calculate the difference in milliseconds
  const diffInMs = date2.getTime() - date1.getTime();
  // Convert milliseconds to days
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
  // Return the difference in days
  return Math.floor(diffInDays);
}
