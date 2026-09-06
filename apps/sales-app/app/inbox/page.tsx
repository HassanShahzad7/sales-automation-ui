"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { InboxPage } from "@/components/inbox-page";
import { getAuth } from "@/lib/auth";

export default function InboxRoute() {
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

  return <InboxPage />;
}
