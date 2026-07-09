import sizeStyles from "./choiceControlSizes.module.css";
import type { ChoiceControlSize } from "@/components/fields/types";

export const choiceControlSizeClassName: Record<ChoiceControlSize, string> = {
  lg: sizeStyles.sizeLg,
  md: sizeStyles.sizeMd,
  sm: sizeStyles.sizeSm,
};
