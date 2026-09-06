import type { LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export function ComingSoonPage({
  icon: Icon,
  title,
}: {
  icon: LucideIcon;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title={title} />
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Icon />
          </EmptyMedia>
          <EmptyTitle>Coming soon</EmptyTitle>
          <EmptyDescription>
            This section is coming soon. We&apos;re still building out{" "}
            {title.toLowerCase()}.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
