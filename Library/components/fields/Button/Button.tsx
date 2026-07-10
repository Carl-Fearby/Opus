import type { ButtonHTMLAttributes, ReactNode } from "react";
import { inputControlSizeClassName } from "../shared/inputControlSizes";
import type { InputControlSize } from "@/components/fields/types";
import styles from "./Button.module.css";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "warning"
  | "info"
  | "light"
  | "dark"
  | "link";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  size?: InputControlSize;
  variant?: ButtonVariant;
};

export function Button({
  children,
  className,
  size = "md",
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        styles.button,
        styles[variant],
        inputControlSizeClassName[size],
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
