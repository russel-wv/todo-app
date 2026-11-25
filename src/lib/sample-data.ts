import { DAY, HOUR } from "./time";
import type { Priority, Status, TodoData } from "./types";

type SampleTask = [
  title: string,
  description: string,
  status: Status,
  priority: Priority,
  dueIn: number,
];

const SAMPLE_TASKS: SampleTask[] = [
  ["Midterm Study", "Study for the midterms, which is coming next week.", "todo", "high", 20 * DAY],
  ["Summative Study", "Make fast changes to the review for english and science discussions.", "todo", "high", 5 * HOUR],
  ["Algebra", "Start solving algebra problems for next week quiz with Mrs. Samson.", "in-progress", "medium", 6 * DAY],
  ["Buy Colored Pencil", "Make a run to the supply shop for extra colored pencil.", "in-progress", "low", 5 * HOUR],
  ["Memorize Formulas", "Make cheat sheet and memorize all formulas.", "in-progress", "low", 20 * DAY],
  ["PE Group Project", "Make conversation with the team members for the dance orchestration.", "in-progress", "high", 5 * HOUR],
  ["Finish Q2 Homework", "Do homework so I can play games already.", "completed", "low", 2 * HOUR],
];

/** The board from the design mockup, loaded on a browser's first visit. */
export function createSampleData(now: number): TodoData {
  const academic = { id: "sample-academic", name: "Academic" };
  return {
    categories: [academic],
    tasks: SAMPLE_TASKS.map(
      ([title, description, status, priority, dueIn], index) => ({
        id: `sample-task-${index + 1}`,
        title,
        description,
        status,
        priority,
        dueAt: now + dueIn,
        categoryId: academic.id,
        createdAt: now,
      }),
    ),
  };
}
