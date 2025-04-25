import { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

type GridColumns = 1 | 2 | 3 | 4 | 5 | 6;
type GridGap = "sm" | "md" | "lg";

interface GridProps extends ComponentProps<"div"> {
  columns?: GridColumns;
  gap?: GridGap;
  className?: string;
}

const columnStyles: Record<GridColumns, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  5: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
  6: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
};

const gapStyles: Record<GridGap, string> = {
  sm: "gap-4",
  md: "gap-6",
  lg: "gap-8",
};

export function Grid({
  columns = 3,
  gap = "md",
  className = "",
  children,
  ...props
}: GridProps) {
  return (
    <div
      className={twMerge(
        "grid w-full",
        columnStyles[columns],
        gapStyles[gap],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
