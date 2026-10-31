import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-emerald-600 text-white shadow-sm hover:bg-emerald-500 hover:shadow-emerald-500/20 shadow-md",
        destructive:
          "bg-rose-600 text-white shadow-sm hover:bg-rose-500 hover:shadow-rose-500/20 shadow-md",
        outline:
          "border border-slate-700 bg-slate-900/60 text-slate-200 hover:bg-slate-800 hover:text-white backdrop-blur-sm",
        secondary:
          "bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white",
        ghost:
          "text-slate-300 hover:bg-slate-800/80 hover:text-white",
        link:
          "text-emerald-400 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-lg px-6 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
