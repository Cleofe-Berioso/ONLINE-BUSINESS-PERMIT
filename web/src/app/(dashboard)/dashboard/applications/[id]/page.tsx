"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function ApplicationDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState(null);

  useEffect(() => {
    if (!id) return;
    // TODO: Fetch application details by ID
    setLoading(false);
  }, [id]);

  if (!id) {
    return <div>Invalid application ID</div>;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Application Details</h1>
      <p className="mt-4 text-gray-600">Application ID: {id}</p>
    </div>
  );
}

