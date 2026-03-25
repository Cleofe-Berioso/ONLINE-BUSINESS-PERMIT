"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ApplicationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState(null);

  useEffect(() => {
    // TODO: Fetch application details by ID
    setLoading(false);
  }, [params.id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Application Details</h1>
      <p className="mt-4 text-gray-600">Application ID: {params.id}</p>
    </div>
  );
}
