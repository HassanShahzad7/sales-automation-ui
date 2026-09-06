"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChartIcon } from "lucide-react";
import { ComingSoonPage } from "@/components/shared/coming-soon-page";
import { getAuth } from "@/lib/auth";

export default function AnalyticsRoute() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    if (!auth?.userToken) {
      router.replace("/login");
    } else {
      setIsReady(true);
    }
  }, [router]);

  if (!isReady) return null;

  return <ComingSoonPage icon={BarChartIcon} title="Analytics" />;
}
