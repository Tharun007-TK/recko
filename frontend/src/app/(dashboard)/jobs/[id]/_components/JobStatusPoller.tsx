"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface JobStatusPollerProps {
  jobId: string;
  status: string;
}

export function JobStatusPoller({ jobId, status }: JobStatusPollerProps) {
  const router = useRouter();

  useEffect(() => {
    // Poll if status is 'uploaded' or 'processing'
    if (status === "uploaded" || status === "processing") {
      const interval = setInterval(() => {
        // Refreshing the router will re-fetch Server Components data
        router.refresh();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [status, router]);

  return null; // This is a logic-only component
}
