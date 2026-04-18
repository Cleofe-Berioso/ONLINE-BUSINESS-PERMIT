"use client";

import { BusinessLocation } from "@prisma/client";
import dynamic from "next/dynamic";

interface BusinessMapProps {
  locations: (BusinessLocation & {
    application?: { businessName?: string };
  })[];
}

// Dynamically import map content with SSR disabled to prevent "Map container is already initialized" error
const BusinessMapContent = dynamic(
  () =>
    import("./business-map-content").then((mod) => mod.BusinessMapContent),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading map...</p>
      </div>
    ),
  }
);

export function BusinessMap({ locations }: BusinessMapProps) {
  return (
    <div className="w-full h-full rounded-lg overflow-hidden border border-gray-200">
      <BusinessMapContent locations={locations} />
    </div>
  );
}
