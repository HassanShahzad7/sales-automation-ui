"use client";

import { useState } from "react";
import { Building2Icon, PlusIcon, TargetIcon, UsersIcon } from "lucide-react";
import { CreateIcpDialog } from "@/components/create-icp-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useIcps } from "@/lib/use-workspace-data";

export function IcpsPage() {
  const { icps, refetch } = useIcps();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="ICPs"
        description="Ideal customer profiles used to find matching companies and decision-makers."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <PlusIcon className="size-4" />
            Create ICP
          </Button>
        }
      />

      {icps === null ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-xl border bg-muted"
            />
          ))}
        </div>
      ) : icps.length === 0 ? (
        <EmptyState
          icon={TargetIcon}
          title="No ICPs yet"
          description="Create your first ICP to start discovering matching companies and decision-makers."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <PlusIcon className="size-4" />
              Create ICP
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {icps.map((icp) => (
            <Card key={icp.id}>
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <TargetIcon className="size-5 text-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-sm">{icp.name}</p>
                    {icp.description && (
                      <p className="mt-0.5 line-clamp-2 text-muted-foreground text-xs">
                        {icp.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href="/companies">
                      <Building2Icon className="size-3.5" />
                      View Companies
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href="/prospects">
                      <UsersIcon className="size-3.5" />
                      View Prospects
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateIcpDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={refetch}
      />
    </div>
  );
}
