import { DocumentReviewDashboard } from "@/components/dashboard/document-review-dashboard";

export const metadata = { title: "Document Review" };

export default function DocumentReviewPage() {
  return (
    <div className="h-screen w-full">
      <DocumentReviewDashboard />
    </div>
  );
}
