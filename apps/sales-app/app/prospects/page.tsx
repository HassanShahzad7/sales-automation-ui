"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProspectsPage } from "@/components/prospects-page";
import { getAuth } from "@/lib/auth";

export default function ProspectsRoute() {
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

  return <ProspectsPage />;
}
