"use client";

export type WorkflowFilter = "all" | "active" | "inactive";

type Props = {
  filter: WorkflowFilter;
  counts: { all: number; active: number; inactive: number };
  onChange: (filter: WorkflowFilter) => void;
};

const TABS: { key: WorkflowFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "inactive", label: "Inactive" },
];

export function WorkflowFilters({ filter, counts, onChange }: Props) {
  return (
    <div className="flex w-fit gap-1 rounded-lg bg-muted p-1">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`rounded-md px-3 py-1.5 font-medium text-sm transition-colors ${
            filter === tab.key
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {tab.label} ({counts[tab.key]})
        </button>
      ))}
    </div>
  );
}
