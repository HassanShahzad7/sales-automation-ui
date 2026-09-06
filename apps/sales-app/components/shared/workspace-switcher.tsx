"use client";

import { FlaskConicalIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWorkspace, type Workspace } from "@/lib/workspace-context";

export function WorkspaceSwitcher() {
  const { workspace, setWorkspace } = useWorkspace();

  return (
    <div className="flex items-center gap-2 px-2 py-1 group-data-[collapsible=icon]:hidden">
      <FlaskConicalIcon className="size-4 shrink-0 text-muted-foreground" />
      <Select
        value={workspace}
        onValueChange={(v) => setWorkspace(v as Workspace)}
      >
        <SelectTrigger size="sm" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="actual">Actual Workspace</SelectItem>
          <SelectItem value="demo">Demo Workspace</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
