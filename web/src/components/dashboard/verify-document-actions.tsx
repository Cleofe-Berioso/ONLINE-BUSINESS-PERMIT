"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";

export function VerifyDocumentActions({ documentId }: { documentId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: "VERIFIED" | "REJECTED") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/documents/${documentId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      });

      if (res.ok) {
        router.refresh();
      }
    } catch {
      // Handle error silently
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="success"
        onClick={() => handleAction("VERIFIED")}
        loading={loading}
      >
        <CheckCircle className="h-3 w-3" /> Verify
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={() => handleAction("REJECTED")}
        loading={loading}
      >
        <XCircle className="h-3 w-3" /> Reject
      </Button>
    </div>
  );
}
