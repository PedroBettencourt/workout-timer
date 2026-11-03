export let TIME_SET = 1 * 20;
export let MAX_REPS = TIME_SET;

export function changeTimeSet(newTime: number) {
    TIME_SET = newTime;
    MAX_REPS = newTime;
};

// Format date (e.g. "30/10/2026, 14:03")
const dateFormatter = new Intl.DateTimeFormat("en-gb", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
export const formatDate = (date: Date) => dateFormatter.format(date);

export function dateToISO(local: string): string {
  return new Date(local).toISOString();
};

// Date format for the input in history page
const pad = (n: number) => String(n).padStart(2, "0");
export function dateFromISO(iso: string): string {
  const date = new Date(iso);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};