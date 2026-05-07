"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RuntimeProvider } from "@/lib/runtime-provider";
import { ChatUI } from "@/components/chat-ui";
import { getAuth } from "@/lib/auth";

export default function HomePage() {
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

  return (
    <RuntimeProvider>
      <ChatUI />
    </RuntimeProvider>
  );
}
