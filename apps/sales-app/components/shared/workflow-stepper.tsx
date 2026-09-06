import {
  CheckIcon,
  CircleDashedIcon,
  ClockIcon,
  LoaderIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type StepState =
  | "not-started"
  | "in-progress"
  | "ready"
  | "needs-review"
  | "completed";

export type WorkflowStep = {
  key: string;
  label: string;
  state: StepState;
};

const STATE_CONFIG: Record<
  StepState,
  { icon: typeof CheckIcon; dot: string; text: string }
> = {
  "not-started": {
    icon: CircleDashedIcon,
    dot: "border-border bg-muted text-muted-foreground",
    text: "text-muted-foreground",
  },
  "in-progress": {
    icon: LoaderIcon,
    dot: "border-primary bg-primary/10 text-primary",
    text: "text-foreground",
  },
  ready: {
    icon: ClockIcon,
    dot: "border-primary bg-primary/10 text-primary",
    text: "text-foreground",
  },
  "needs-review": {
    icon: TriangleAlertIcon,
    dot: "border-amber-500 bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
    text: "text-foreground",
  },
  completed: {
    icon: CheckIcon,
    dot: "border-emerald-500 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
    text: "text-foreground",
  },
};

export function WorkflowStepper({ steps }: { steps: WorkflowStep[] }) {
  return (
    <ol className="flex flex-wrap items-start gap-x-2 gap-y-4">
      {steps.map((step, i) => {
        const config = STATE_CONFIG[step.state];
        const Icon = config.icon;
        return (
          <li key={step.key} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex size-8 items-center justify-center rounded-full border",
                  config.dot,
                )}
              >
                <Icon
                  className={cn(
                    "size-4",
                    step.state === "in-progress" && "animate-spin",
                  )}
                />
              </div>
              <span
                className={cn(
                  "max-w-24 text-center text-xs leading-tight",
                  config.text,
                )}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="mb-5 h-px w-6 shrink-0 bg-border sm:w-10" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
