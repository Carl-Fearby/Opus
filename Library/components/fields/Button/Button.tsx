import type { ButtonHTMLAttributes, ReactNode } from "react";
import { inputControlSizeClassName } from "../shared/inputControlSizes";
import type { ControlRadius, InputControlSize } from "@/components/fields/types";
import styles from "./Button.module.css";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "success"
  | "danger"
  | "warning"
  | "info"
  | "light"
  | "dark"
  | "ghost"
  | "link";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  size?: InputControlSize;
  radius?: ControlRadius;
  variant?: ButtonVariant;
};

export function Button({
  children,
  className,
  size = "md",
  variant = "primary",
  radius,
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
      data-control-radius={radius}
      {...props}
    >
      {children}
    </button>
  );
}
