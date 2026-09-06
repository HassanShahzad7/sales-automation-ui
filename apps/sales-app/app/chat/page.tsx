"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Thread } from "@/components/assistant-ui/thread";
import { getAuth } from "@/lib/auth";

export default function ChatRoute() {
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

  return <Thread />;
}
