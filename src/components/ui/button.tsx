import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "group/button type-label inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap transition-colors duration-200 disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-ink text-paper hover:bg-ink/85",
        secondary: "border border-ink text-ink hover:bg-ink hover:text-paper",
        inverse: "bg-paper text-ink hover:bg-paper/85",
        outlineInverse: "border border-paper text-paper hover:bg-paper hover:text-ink",
        ghost: "text-ink hover:bg-mist",
        link: "text-ink underline decoration-1 underline-offset-4 hover:decoration-2",
      },
      size: {
        sm: "h-9 px-4",
        md: "h-12 px-6",
        lg: "h-14 px-8",
        icon: "size-11",
      },
    },
    compoundVariants: [{ variant: "link", className: "h-auto px-0" }],
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    /** Render the child element (e.g. a Link) with button styles. */
    asChild?: boolean;
  };

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Component = asChild ? Slot.Root : "button";
  return <Component className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
