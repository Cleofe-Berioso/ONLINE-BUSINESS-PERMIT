import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Requirements",
  description: "Complete list of documentary requirements for business permit application in the Philippines.",
};

const requirements = [
  {
    category: "For New Business Permit Application",
    items: [
      { name: "DTI/SEC/CDA Certificate of Registration", description: "Original and photocopy" },
      { name: "Barangay Business Clearance", description: "From the barangay where the business is located" },
      { name: "Locational Clearance / Zoning Certificate", description: "From the City/Municipal Planning and Development Office" },
      { name: "Contract of Lease / Land Title", description: "If renting, submit notarized contract of lease; if owned, submit land title" },
      { name: "Community Tax Certificate (Cedula)", description: "Current year" },
      { name: "Public Liability Insurance", description: "For businesses with public access" },
      { name: "Fire Safety Inspection Certificate", description: "From the Bureau of Fire Protection (BFP)" },
      { name: "Sanitary Permit", description: "From the City/Municipal Health Office" },
      { name: "Environmental Compliance Certificate", description: "If applicable, from DENR" },
      { name: "SSS/PhilHealth/Pag-IBIG Employer Registration", description: "If with employees" },
      { name: "Valid Government-Issued ID", description: "Of the business owner/authorized representative" },
      { name: "2x2 ID Photo", description: "Recent photo of the business owner" },
    ],
  },
  {
    category: "For Business Permit Renewal",
    items: [
      { name: "Previous Year Business Permit", description: "Original and photocopy" },
      { name: "Barangay Business Clearance", description: "Current year" },
      { name: "Community Tax Certificate (Cedula)", description: "Current year" },
      { name: "Fire Safety Inspection Certificate", description: "Current year" },
      { name: "Sanitary Permit", description: "Current year renewal" },
      { name: "Financial Statement / ITR", description: "Audited or sworn statement for the previous year" },
      { name: "Updated SSS/PhilHealth/Pag-IBIG Records", description: "If with employees" },
      { name: "Public Liability Insurance", description: "If applicable, renewed policy" },
    ],
  },
  {
    category: "Additional Requirements (If Applicable)",
    items: [
      { name: "Occupational Permit", description: "For regulated professions" },
      { name: "FDA License", description: "For food and drug-related businesses" },
      { name: "DOT Accreditation", description: "For tourism-related businesses" },
      { name: "DENR ECC", description: "For environmentally critical projects" },
      { name: "Special Permits", description: "Depending on business nature (e.g., liquor license, firearms)" },
    ],
  },
];

export default function RequirementsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-blue-700">
            🏛️ Online Business Permit
          </Link>
          <nav className="flex gap-4">
            <Link href="/how-to-apply" className="text-gray-600 hover:text-blue-600 text-sm">How to Apply</Link>
            <Link href="/faqs" className="text-gray-600 hover:text-blue-600 text-sm">FAQs</Link>
            <Link href="/login" className="text-blue-600 font-medium text-sm">Login</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Documentary Requirements</h1>
        <p className="text-gray-600 mb-8">
          Please prepare the following documents before submitting your business permit application.
          All uploaded documents must be clear, legible, and in PDF, JPEG, or PNG format (max 10MB each).
        </p>

        <div className="space-y-8">
          {requirements.map((section) => (
            <div key={section.category} className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full" />
                {section.category}
              </h2>
              <div className="space-y-3">
                {section.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-blue-600 font-bold mt-0.5">{i + 1}.</span>
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2">📌 Important Reminders</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Ensure all documents are valid and not expired</li>
            <li>Scanned documents should be clear and readable</li>
            <li>File size per document must not exceed 10MB</li>
            <li>Accepted formats: PDF, JPEG, PNG, WebP</li>
            <li>Incomplete documents may delay your application processing</li>
          </ul>
        </div>

        <div className="mt-8 text-center">
          <Link href="/register" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Start Your Application →
          </Link>
        </div>
      </main>
    </div>
  );
}
