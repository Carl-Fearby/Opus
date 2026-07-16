import type { CSSProperties, ReactNode } from "react";
import { CustomScrollbar } from "@/components/CustomScrollbar";

export type ScrollAreaProps = {
  children: ReactNode;
  className?: string;
  maxHeight?: number | string;
  orientation?: "vertical" | "horizontal" | "both";
  style?: CSSProperties;
  autoHide?: boolean;
  thickness?: number;
};

export function ScrollArea({
  autoHide = false,
  children,
  className,
  maxHeight = 240,
  orientation = "vertical",
  style,
  thickness,
}: ScrollAreaProps) {
  return (
    <CustomScrollbar
      autoHide={autoHide}
      className={className}
      maxHeight={maxHeight}
      orientation={orientation}
      style={style}
      thickness={thickness}
    >
      {children}
    </CustomScrollbar>
  );
}
