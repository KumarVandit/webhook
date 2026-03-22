import { forwardRef, type LabelHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;

const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
      // biome-ignore lint/a11y/noLabelWithoutControl: Label is a generic component that will be associated with controls by the consumer
      <label
        className={cn(
          "font-medium text-sm text-zinc-950 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-zinc-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Label.displayName = "Label";

export { Label };
export type { LabelProps };
