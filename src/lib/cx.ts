/** Joins the truthy class names, so conditional Tailwind classes read cleanly. */
export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
