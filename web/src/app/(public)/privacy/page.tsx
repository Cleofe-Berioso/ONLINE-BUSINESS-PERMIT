import type { Metadata } from "next";
import Link from "next/link";
import { PublicNav } from "@/components/public/public-nav";
import { PublicFooter } from "@/components/public/public-footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy of the Online Business Permit System, compliant with RA 10173 (Data Privacy Act of 2012).",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--surface-muted)] flex flex-col">
      <PublicNav />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 sm:py-12">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-2">Privacy Policy</h1>
        <p className="text-sm text-[var(--text-secondary)] mb-8">Last updated: March 1, 2026</p>

        <div className="bg-[var(--surface)] rounded-xl shadow-sm border p-8 prose prose-gray max-w-none">
          <h2>1. Introduction</h2>
          <p>
            The Online Business Permit System (&quot;System&quot;) is committed to protecting your personal data in compliance with
            Republic Act No. 10173, also known as the Data Privacy Act of 2012, and its Implementing Rules and Regulations.
          </p>

          <h2>2. Information We Collect</h2>
          <p>We collect the following types of information:</p>
          <ul>
            <li><strong>Personal Information:</strong> Name, email address, phone number, government-issued ID details</li>
            <li><strong>Business Information:</strong> Business name, address, registration numbers (DTI/SEC, TIN, SSS), financial data</li>
            <li><strong>Technical Data:</strong> IP address, browser type, login timestamps, device information</li>
            <li><strong>Documents:</strong> Scanned copies of required business permit documents</li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <p>Your information is used for:</p>
          <ul>
            <li>Processing your business permit application</li>
            <li>Verifying your identity and documents</li>
            <li>Communicating application status updates</li>
            <li>Generating official permits and certificates</li>
            <li>Statistical reporting and system improvement</li>
            <li>Complying with legal and regulatory requirements</li>
          </ul>

          <h2>4. Data Storage & Security</h2>
          <p>
            All personal data is stored in encrypted databases with access controls. We implement industry-standard
            security measures including:
          </p>
          <ul>
            <li>AES-256 encryption for data at rest</li>
            <li>TLS 1.3 encryption for data in transit</li>
            <li>Role-based access control (RBAC)</li>
            <li>Multi-factor authentication for staff accounts</li>
            <li>Regular security audits and penetration testing</li>
          </ul>

          <h2>5. Data Sharing</h2>
          <p>
            We do not sell or share your personal data with third parties except as required by law or for
            legitimate government purposes related to business permit processing.
          </p>

          <h2>6. Your Rights</h2>
          <p>Under the Data Privacy Act, you have the right to:</p>
          <ul>
            <li>Be informed about how your data is processed</li>
            <li>Access your personal data</li>
            <li>Correct inaccurate or incomplete data</li>
            <li>Object to processing of your data</li>
            <li>Erasure or blocking of data under certain conditions</li>
            <li>File a complaint with the National Privacy Commission</li>
          </ul>

          <h2>7. Data Retention</h2>
          <p>
            Personal data is retained for the duration required by applicable laws and regulations. Business permit
            records are retained for a minimum of 10 years as required by local government regulations.
          </p>          <h2>8. Contact</h2>
          <p>
            For privacy-related inquiries, contact our Data Protection Officer at{" "}
            <a href="mailto:dpo@lgu.gov.ph">dpo@lgu.gov.ph</a> or visit the{" "}
            <Link href="/contact">Contact Us</Link> page.
          </p>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
