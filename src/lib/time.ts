import { use, useSyncExternalStore } from "react";
import { browser } from "react-dom";

export const MINUTE = 60 * 1000;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

const CLOCK_TICK = 30 * 1000;

function subscribeToClock(onTick: () => void) {
  const id = window.setInterval(onTick, CLOCK_TICK);
  return () => window.clearInterval(id);
}

// Rounded down to the tick, so React sees the same value until the next tick.
function readClock() {
  return Math.floor(Date.now() / CLOCK_TICK) * CLOCK_TICK;
}

/**
 * The current time, refreshed every 30 seconds. The server can't know the
 * viewer's clock, so components that call this render only in the browser
 * and need a `<Suspense>` boundary above them.
 */
export function useNow() {
  use(browser("Deadlines are shown relative to the viewer's current time."));
  return useSyncExternalStore(subscribeToClock, readClock, readClock);
}

/** Default deadline for a new task: this time tomorrow, rounded up to the hour. */
export function defaultDueAt() {
  return Math.ceil((Date.now() + DAY) / HOUR) * HOUR;
}

function pluralize(count: number, unit: string) {
  return `${count} ${unit}${count === 1 ? "" : "s"}`;
}

/** "20 days", "5 hours", "1 minute"; `null` for less than half a minute. */
function formatDuration(ms: number) {
  const minutes = Math.round(ms / MINUTE);
  if (minutes < 1) return null;
  if (minutes < 60) return pluralize(minutes, "minute");
  const hours = Math.round(ms / HOUR);
  if (hours < 24) return pluralize(hours, "hour");
  return pluralize(Math.round(ms / DAY), "day");
}

export interface DeadlineLabel {
  text: string;
  overdue: boolean;
}

export function describeDeadline(
  dueAt: number,
  now: number,
  completed: boolean,
): DeadlineLabel {
  const remaining = dueAt - now;
  const duration = formatDuration(Math.abs(remaining));
  if (duration === null) return { text: "Due now", overdue: false };
  if (remaining > 0) return { text: `${duration} left`, overdue: false };
  // A finished task isn't late, so its passed deadline is shown neutrally.
  return completed
    ? { text: `Due ${duration} ago`, overdue: false }
    : { text: `${duration} overdue`, overdue: true };
}

const pad = (value: number) => String(value).padStart(2, "0");

/** Formats a timestamp for `<input type="datetime-local">`, in local time. */
export function toDateTimeInputValue(ms: number) {
  const date = new Date(ms);
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

/** Reads a `datetime-local` value (local time); `null` when empty or invalid. */
export function parseDateTimeInputValue(value: string) {
  if (!value) return null;
  const ms = new Date(value).getTime();
  return Number.isNaN(ms) ? null : ms;
}
