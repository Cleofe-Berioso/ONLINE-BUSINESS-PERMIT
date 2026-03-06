import Link from "next/link";
import { Shield } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="border-t bg-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-600" />
              <span className="font-bold text-gray-900">Business Permit System</span>
            </div>
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">
              A digital service of the Local Government Unit for fast, secure, and convenient business permit processing.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Services</h5>
            <ul className="mt-3 space-y-2 text-sm">
              {[
                { href: "/requirements", label: "Requirements" },
                { href: "/how-to-apply", label: "How to Apply" },
                { href: "/faqs", label: "FAQs" },
                { href: "/track", label: "Track Application" },
                { href: "/verify-permit", label: "Verify Permit" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-gray-500 hover:text-blue-600 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h5 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Legal</h5>
            <ul className="mt-3 space-y-2 text-sm">
              {[
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/terms", label: "Terms of Service" },
                { href: "/data-privacy", label: "Data Privacy Act" },
                { href: "/contact", label: "Contact Us" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-gray-500 hover:text-blue-600 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h5 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Contact</h5>
            <ul className="mt-3 space-y-2 text-sm text-gray-500">
              <li>Municipal Hall, Main Street</li>
              <li>(02) 8888-0000</li>
              <li>permits@lgu.gov.ph</li>
              <li>Mon–Fri, 8:00 AM – 5:00 PM</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Online Business Permit System. All rights reserved.
          </p>
          <p className="text-xs text-gray-400">
            Powered by the LGU Digital Transformation Initiative
          </p>
        </div>
      </div>
    </footer>
  );
}
