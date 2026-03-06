import type { Metadata } from "next";
import Link from "next/link";
import { PublicNav } from "@/components/public/public-nav";
import { PublicFooter } from "@/components/public/public-footer";

export const metadata: Metadata = {
  title: "Data Privacy Notice",
  description: "Data Privacy Notice pursuant to RA 10173 (Data Privacy Act of 2012) for the Online Business Permit System.",
};

export default function DataPrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PublicNav />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 sm:py-12">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Data Privacy Notice</h1>
        <p className="text-sm text-gray-500 mb-2">
          Pursuant to Republic Act No. 10173 (Data Privacy Act of 2012)
        </p>
        <p className="text-sm text-gray-500 mb-8">Last updated: March 1, 2026</p>

        <div className="bg-white rounded-xl shadow-sm border p-8 prose prose-gray max-w-none">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 not-prose">
            <p className="text-sm text-blue-800">
              <strong>🔒 Your data is protected.</strong> The Local Government Unit is committed to protecting
              your personal information in accordance with RA 10173 and its IRR, as well as NPC issuances.
            </p>
          </div>

          <h2>Personal Information Controller</h2>
          <p>
            <strong>Entity:</strong> [LGU Name] — Business Permits and Licensing Office<br />
            <strong>Address:</strong> [LGU Address], Philippines<br />
            <strong>Contact:</strong> bplo@lgu.gov.ph | (02) 8XXX-XXXX
          </p>

          <h2>Data Protection Officer</h2>
          <p>
            <strong>Name:</strong> [DPO Name]<br />
            <strong>Email:</strong> dpo@lgu.gov.ph<br />
            <strong>Phone:</strong> (02) 8XXX-XXXX loc. XXX
          </p>

          <h2>Purpose of Data Collection</h2>
          <table>
            <thead>
              <tr>
                <th>Data Collected</th>
                <th>Purpose</th>
                <th>Legal Basis</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Full Name, Email, Phone</td>
                <td>Account creation & communication</td>
                <td>Consent & Contractual necessity</td>
              </tr>
              <tr>
                <td>Business Name & Address</td>
                <td>Permit application processing</td>
                <td>Legal obligation (LGC)</td>
              </tr>
              <tr>
                <td>DTI/SEC, TIN, SSS Numbers</td>
                <td>Identity & registration verification</td>
                <td>Legal obligation</td>
              </tr>
              <tr>
                <td>Financial Information</td>
                <td>Tax assessment & fee computation</td>
                <td>Legal obligation (Tax Code)</td>
              </tr>
              <tr>
                <td>Uploaded Documents</td>
                <td>Compliance verification</td>
                <td>Legal obligation</td>
              </tr>
              <tr>
                <td>Login & Activity Logs</td>
                <td>Security & audit trail</td>
                <td>Legitimate interest</td>
              </tr>
            </tbody>
          </table>

          <h2>Data Sharing & Disclosure</h2>
          <p>Your data may be shared with:</p>
          <ul>
            <li>Other government agencies as required by law (BIR, DTI, DILG)</li>
            <li>Authorized LGU personnel for permit processing</li>
            <li>Law enforcement agencies when required by court order</li>
          </ul>
          <p>We do <strong>not</strong> sell, trade, or share your data with private third parties for commercial purposes.</p>

          <h2>Data Retention Period</h2>
          <ul>
            <li>Active accounts: Data retained while account is active</li>
            <li>Business permit records: 10 years per regulatory requirements</li>
            <li>Activity logs: 5 years for audit purposes</li>
            <li>Deleted accounts: Data anonymized after 1 year</li>
          </ul>

          <h2>Your Rights as a Data Subject</h2>
          <ol>
            <li><strong>Right to be Informed</strong> — Know how your data is being processed</li>
            <li><strong>Right to Access</strong> — Obtain a copy of your personal data</li>
            <li><strong>Right to Rectification</strong> — Correct inaccurate or incomplete data</li>
            <li><strong>Right to Erasure</strong> — Request deletion of data (subject to legal retention requirements)</li>
            <li><strong>Right to Object</strong> — Object to processing of your data</li>
            <li><strong>Right to Data Portability</strong> — Obtain your data in a structured format</li>
            <li><strong>Right to File a Complaint</strong> — Lodge a complaint with the National Privacy Commission</li>
          </ol>

          <h2>How to Exercise Your Rights</h2>
          <p>
            To exercise any of these rights, contact our Data Protection Officer at{" "}
            <a href="mailto:dpo@lgu.gov.ph">dpo@lgu.gov.ph</a> or visit the BPLO office.
            We will respond to your request within 30 days.
          </p>

          <h2>Filing a Complaint</h2>
          <p>
            If you believe your data privacy rights have been violated, you may file a complaint with the:
          </p>
          <p>
            <strong>National Privacy Commission</strong><br />
            3rd Floor, Core G, PSSC Building, Commonwealth Avenue, Quezon City<br />
            Website: <a href="https://privacy.gov.ph" target="_blank" rel="noopener noreferrer">privacy.gov.ph</a><br />            Email: complaints@privacy.gov.ph
          </p>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
