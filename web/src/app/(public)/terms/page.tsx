import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms and conditions for using the Online Business Permit System.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-blue-700">
            🏛️ Online Business Permit
          </Link>
          <nav className="flex gap-4">
            <Link href="/" className="text-gray-600 hover:text-blue-600 text-sm">Home</Link>
            <Link href="/privacy" className="text-gray-600 hover:text-blue-600 text-sm">Privacy</Link>
            <Link href="/login" className="text-blue-600 font-medium text-sm">Login</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: March 1, 2026</p>

        <div className="bg-white rounded-xl shadow-sm border p-8 prose prose-gray max-w-none">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using the Online Business Permit System, you agree to be bound by these Terms of Service.
            If you do not agree, please do not use the system.
          </p>

          <h2>2. Use of the System</h2>
          <p>The system is intended for:</p>
          <ul>
            <li>Submitting business permit applications (new and renewal)</li>
            <li>Uploading required documentary requirements</li>
            <li>Tracking application status</li>
            <li>Scheduling permit claiming appointments</li>
            <li>Managing business permit records</li>
          </ul>

          <h2>3. User Responsibilities</h2>
          <p>As a user, you agree to:</p>
          <ul>
            <li>Provide accurate and truthful information</li>
            <li>Upload authentic and valid documents</li>
            <li>Maintain the confidentiality of your account credentials</li>
            <li>Not attempt to gain unauthorized access to the system</li>
            <li>Not submit fraudulent applications</li>
            <li>Comply with all applicable local and national laws</li>
          </ul>

          <h2>4. Account Security</h2>
          <p>
            You are responsible for maintaining the security of your account. You must immediately notify us
            of any unauthorized use of your account. We recommend enabling Two-Factor Authentication (2FA)
            for enhanced security.
          </p>

          <h2>5. Intellectual Property</h2>
          <p>
            All content, designs, and technology of the system are owned by the Local Government Unit.
            You may not copy, modify, or distribute any part of the system without written permission.
          </p>

          <h2>6. Service Availability</h2>
          <p>
            While we strive to maintain 99.9% uptime, we do not guarantee uninterrupted access.
            Scheduled maintenance will be announced in advance. The system may be temporarily
            unavailable during updates or unforeseen technical issues.
          </p>

          <h2>7. Limitation of Liability</h2>
          <p>
            The LGU shall not be liable for any indirect, incidental, or consequential damages arising
            from the use of this system. Processing times are estimates and may vary.
          </p>

          <h2>8. Data Privacy</h2>
          <p>
            Your use of the system is also governed by our{" "}
            <Link href="/privacy">Privacy Policy</Link> and our{" "}
            <Link href="/data-privacy">Data Privacy Notice</Link>, in compliance with
            Republic Act No. 10173 (Data Privacy Act of 2012).
          </p>

          <h2>9. Amendments</h2>
          <p>
            We reserve the right to modify these terms at any time. Continued use of the system
            after changes constitutes acceptance of the updated terms.
          </p>

          <h2>10. Contact</h2>
          <p>
            For questions about these terms, please contact us through the{" "}
            <Link href="/contact">Contact Us</Link> page.
          </p>
        </div>
      </main>
    </div>
  );
}
