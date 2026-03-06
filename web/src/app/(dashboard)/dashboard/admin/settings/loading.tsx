import { CardSkeleton } from "@/components/ui/skeleton";
export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="mb-6 space-y-2">
        <div className="h-7 w-40 animate-pulse rounded-md bg-gray-200" />
        <div className="h-4 w-64 animate-pulse rounded-md bg-gray-200" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
