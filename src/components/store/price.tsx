import { formatNaira } from "@/lib/money";
import { cn } from "@/lib/utils";

type PriceProps = { amount: number; compareAt?: number | null; className?: string };

export function Price({ amount, compareAt, className }: PriceProps) {
  const onSale = compareAt != null && compareAt > amount;
  return (
    <p className={cn("text-sm tabular-nums", className)}>
      {onSale && (
        <>
          <span className="sr-only">Was </span>
          <s className="mr-2 text-muted">{formatNaira(compareAt)}</s>
          <span className="sr-only">now </span>
        </>
      )}
      <span className={cn(onSale && "text-signal")}>{formatNaira(amount)}</span>
    </p>
  );
}
