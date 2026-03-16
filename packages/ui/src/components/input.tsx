import { Input as InputPrimitive } from "@base-ui/react/input";
import { cn } from "@sungano-group/ui/lib/utils";
import * as React from "react";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-12 w-full min-w-0 rounded-[8px] border border-input bg-white px-4 py-3 text-sm leading-[22px] transition-colors outline-none file:inline-flex file:h-7 file:rounded-[6px] file:border-0 file:bg-transparent file:px-2 file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/60 disabled:text-muted-foreground aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/30",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
