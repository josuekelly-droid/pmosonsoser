import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "h-12 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 font-sans text-sm text-white outline-none transition-all duration-300",
          "placeholder:text-neutral-600",
          "hover:border-white/20 hover:bg-white/[0.05]",
          "focus:border-brand-red focus:bg-white/[0.06] focus:ring-1 focus:ring-brand-red/50",
          "disabled:cursor-not-allowed disabled:opacity-40",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";