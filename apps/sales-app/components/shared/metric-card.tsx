import type { LucideIcon } from "lucide-react";
import { MinusIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type MetricTrend = "up" | "down" | "flat";

const TREND_ICON: Record<MetricTrend, LucideIcon> = {
  up: TrendingUpIcon,
  down: TrendingDownIcon,
  flat: MinusIcon,
};

const TREND_CLASS: Record<MetricTrend, string> = {
  up: "text-emerald-600 dark:text-emerald-400",
  down: "text-red-600 dark:text-red-400",
  flat: "text-muted-foreground",
};

export function MetricCard({
  label,
  value,
  delta,
  icon: Icon,
  className,
}: {
  label: string;
  value: string;
  delta?: { value: string; direction: MetricTrend };
  icon?: LucideIcon;
  className?: string;
}) {
  const DeltaIcon = delta ? TREND_ICON[delta.direction] : null;

  return (
    <Card className={cn("gap-2", className)}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-0">
        <span className="flex items-center gap-2 font-medium text-muted-foreground text-sm">
          {label}
        </span>
        {Icon && <Icon className="size-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        <span className="font-semibold text-2xl text-foreground tracking-tight">
          {value}
        </span>
        {delta && DeltaIcon && (
          <span
            className={cn(
              "flex items-center gap-1 text-xs",
              TREND_CLASS[delta.direction],
            )}
          >
            <DeltaIcon className="size-3" />
            {delta.value}
          </span>
        )}
      </CardContent>
    </Card>
  );
}
