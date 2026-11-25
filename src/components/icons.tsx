import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function PlusIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth={3.5} aria-hidden="true" {...props}>
      <path d="M9 1.5v15M1.5 9h15" />
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 12 7" fill="none" stroke="currentColor" strokeWidth={1.4} aria-hidden="true" {...props}>
      <path d="m.5.5 5.5 5.5L11.5.5" />
    </svg>
  );
}

export function DotsIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 21 6" fill="currentColor" aria-hidden="true" {...props}>
      <circle cx="3" cy="3" r="3" />
      <circle cx="10.5" cy="3" r="3" />
      <circle cx="18" cy="3" r="3" />
    </svg>
  );
}

export function HourglassIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 24" fill="currentColor" aria-hidden="true" {...props}>
      {/* Caps */}
      <path d="M1 0h14v2.4H1zM1 21.6h14V24H1z" />
      {/* Glass */}
      <path
        d="M3 2.4c0 4.6 2.4 7.2 4.6 9.6-2.2 2.4-4.6 5-4.6 9.6M13 2.4c0 4.6-2.4 7.2-4.6 9.6 2.2 2.4 4.6 5 4.6 9.6"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.4}
      />
      {/* Sand */}
      <path d="M4.2 4.6h7.6c-.3 1.6-1 2.8-1.9 3.9H6.1c-.9-1.1-1.6-2.3-1.9-3.9ZM4.3 21.6c.5-2.8 2-4.3 3.7-4.9 1.7.6 3.2 2.1 3.7 4.9Z" />
    </svg>
  );
}

export function PencilIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="m10.5 2.5 3 3L6 13H3v-3l7.5-7.5Z" />
    </svg>
  );
}
