import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How to Apply",
  description: "Step-by-step guide on how to apply for a business permit online through the Online Business Permit System.",
};

const steps = [
  {
    number: 1,
    title: "Create an Account",
    description: "Register for a free account using your email address. You'll need to verify your email with an OTP before you can log in.",
    details: [
      "Go to the Registration page",
      "Fill in your personal details (name, email, phone number)",
      "Create a strong password",
      "Accept the Terms of Service and Data Privacy Agreement",
      "Verify your email using the OTP sent to your inbox",
    ],
  },
  {
    number: 2,
    title: "Fill Out the Application Form",
    description: "Complete the business permit application form with your business information. You can save as draft and return later.",
    details: [
      "Select application type: New or Renewal",
      "Enter business details (name, type, address)",
      "Provide registration numbers (DTI/SEC, TIN, SSS)",
      "Enter financial information (capital investment, gross sales)",
      "Review your information before proceeding",
    ],
  },
  {
    number: 3,
    title: "Upload Required Documents",
    description: "Upload scanned copies of all required documents. Ensure they are clear, legible, and within the file size limit.",
    details: [
      "Prepare digital copies (PDF, JPEG, or PNG)",
      "Each file must not exceed 10MB",
      "Upload all required documents for your application type",
      "You can upload additional documents later if needed",
      "Check the Requirements page for the complete list",
    ],
  },
  {
    number: 4,
    title: "Submit Your Application",
    description: "Review all information and documents, then submit your application for processing. You'll receive a confirmation with your application number.",
    details: [
      "Review all entered information",
      "Ensure all required documents are uploaded",
      "Click Submit Application",
      "Receive your unique Application Number (e.g., BP-2026-000001)",
      "Keep your application number for tracking",
    ],
  },
  {
    number: 5,
    title: "Track Your Application",
    description: "Monitor your application status in real-time through your dashboard. You'll be notified of any updates or required actions.",
    details: [
      "Log in to your dashboard to check status",
      "Track progress: Submitted → Under Review → Approved",
      "Respond to any revision requests promptly",
      "Receive notifications for status changes",
    ],
  },
  {
    number: 6,
    title: "Schedule Claim & Get Your Permit",
    description: "Once approved, schedule a time to claim your business permit at the LGU office. Bring your claim reference number and valid ID.",
    details: [
      "Receive your Claim Reference Number after approval",
      "Select a convenient date and time slot",
      "Visit the LGU office on your scheduled date",
      "Present your claim reference and valid ID",
      "Receive your official Business Permit",
    ],
  },
];

export default function HowToApplyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-blue-700">
            🏛️ Online Business Permit
          </Link>
          <nav className="flex gap-4">
            <Link href="/requirements" className="text-gray-600 hover:text-blue-600 text-sm">Requirements</Link>
            <Link href="/faqs" className="text-gray-600 hover:text-blue-600 text-sm">FAQs</Link>
            <Link href="/login" className="text-blue-600 font-medium text-sm">Login</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">How to Apply for a Business Permit</h1>
        <p className="text-gray-600 mb-10">
          Follow these simple steps to apply for your business permit online. The entire process can be completed from your computer or mobile device.
        </p>

        <div className="space-y-8">
          {steps.map((step) => (
            <div key={step.number} className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                  {step.number}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h2>
                  <p className="text-gray-600 mb-4">{step.description}</p>
                  <ul className="space-y-2">
                    {step.details.map((detail, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-2">Ready to Get Started?</h3>
          <p className="text-blue-100 mb-6">Create your account now and apply for your business permit in minutes.</p>
          <div className="flex gap-4 justify-center">
            <Link href="/register" className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors">
              Create Account
            </Link>
            <Link href="/requirements" className="border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors">
              View Requirements
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
