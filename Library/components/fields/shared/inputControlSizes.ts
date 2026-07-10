import sizeStyles from "./inputControlSizes.module.css";
import type { InputControlSize } from "@/components/fields/types";

export const inputControlSizeClassName: Record<InputControlSize, string> = {
  lg: sizeStyles.sizeLg,
  md: sizeStyles.sizeMd,
  sm: sizeStyles.sizeSm,
};
