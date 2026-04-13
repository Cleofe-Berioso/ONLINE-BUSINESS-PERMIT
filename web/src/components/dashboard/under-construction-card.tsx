import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface UnderConstructionCardProps {
  pageTitle?: string;
}

export function UnderConstructionCard({
  pageTitle = "Page",
}: UnderConstructionCardProps) {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-yellow-500" />
            <h2 className="mt-4 text-lg font-semibold text-gray-900">
              {pageTitle}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              This page is under construction. Content will be added soon.
            </p>
            {/* TODO: Replace this placeholder with actual page content */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
