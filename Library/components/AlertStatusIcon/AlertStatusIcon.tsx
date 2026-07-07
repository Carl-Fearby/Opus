import type { AlertStatus } from "@/components/fields/types";

type AlertStatusIconProps = {
  markClassName: string;
  status: AlertStatus;
  svgClassName: string;
};

export function AlertStatusIcon({ markClassName, status, svgClassName }: AlertStatusIconProps) {
  if (status === "error" || status === "warning") {
    return <span className={markClassName}>!</span>;
  }

  if (status === "info") {
    return <span className={markClassName}>i</span>;
  }

  if (status === "success") {
    return (
      <svg aria-hidden="true" className={svgClassName} viewBox="0 0 16 16">
        <path
          d="M4 8.5 6.8 11.2 12 5.8"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    );
  }

  return null;
}
