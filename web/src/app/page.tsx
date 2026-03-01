import Link from "next/link";
import {
  FileText,
  Shield,
  Clock,
  CalendarCheck,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Online Business Permit System
              </h1>
              <p className="text-xs text-gray-500">
                Local Government Unit
              </p>
            </div>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/requirements"
              className="text-sm text-gray-600 hover:text-blue-600"
            >
              Requirements
            </Link>
            <Link
              href="/how-to-apply"
              className="text-sm text-gray-600 hover:text-blue-600"
            >
              How to Apply
            </Link>
            <Link
              href="/faqs"
              className="text-sm text-gray-600 hover:text-blue-600"
            >
              FAQs
            </Link>
            <Link
              href="/contact"
              className="text-sm text-gray-600 hover:text-blue-600"
            >
              Contact Us
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-4 py-20 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                Apply for Your Business Permit{" "}
                <span className="text-blue-200">Online</span>
              </h2>
              <p className="mt-4 text-lg text-blue-100">
                Fast, secure, and convenient. Submit your business permit
                application, track your status, and schedule your claiming — all
                from the comfort of your home or office.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-semibold text-blue-700 shadow-lg hover:bg-blue-50"
                >
                  Apply Now
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/how-to-apply"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white/30 px-6 py-3 text-base font-semibold text-white hover:bg-white/10"
                >
                  Learn How
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="rounded-2xl bg-white/10 p-8 backdrop-blur-sm">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-lg bg-white/10 p-4">
                    <CheckCircle className="h-6 w-6 text-green-300" />
                    <span>100% Online Application</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg bg-white/10 p-4">
                    <Clock className="h-6 w-6 text-yellow-300" />
                    <span>Real-Time Status Tracking</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg bg-white/10 p-4">
                    <CalendarCheck className="h-6 w-6 text-blue-300" />
                    <span>Convenient Claim Scheduling</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg bg-white/10 p-4">
                    <Shield className="h-6 w-6 text-purple-300" />
                    <span>Secure & DPA Compliant</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h3 className="text-3xl font-bold text-gray-900">
              How It Works
            </h3>
            <p className="mt-3 text-lg text-gray-600">
              Get your business permit in 4 simple steps
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: "1",
                icon: FileText,
                title: "Create Account",
                description:
                  "Register with your email and verify your identity through OTP verification.",
              },
              {
                step: "2",
                icon: FileText,
                title: "Submit Application",
                description:
                  "Fill out the application form and upload required documents online.",
              },
              {
                step: "3",
                icon: Clock,
                title: "Track Status",
                description:
                  "Monitor your application status in real-time from submission to approval.",
              },
              {
                step: "4",
                icon: CalendarCheck,
                title: "Schedule & Claim",
                description:
                  "Pick your preferred date and time slot to claim your approved permit.",
              },
            ].map((feature) => (
              <div
                key={feature.step}
                className="relative rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-600">
                  {feature.step}
                </div>
                <h4 className="text-lg font-semibold text-gray-900">
                  {feature.title}
                </h4>
                <p className="mt-2 text-sm text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h3 className="text-3xl font-bold">
            Ready to Apply for Your Business Permit?
          </h3>
          <p className="mt-3 text-lg text-gray-300">
            Join thousands of business owners who have simplified their permit
            application process.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-3 text-lg font-semibold text-white hover:bg-blue-700"
          >
            Get Started
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <h5 className="font-semibold text-gray-900">
                Online Business Permit System
              </h5>
              <p className="mt-2 text-sm text-gray-600">
                A project of the Local Government Unit for digital
                transformation of business permit services.
              </p>
            </div>
            <div>
              <h5 className="font-semibold text-gray-900">Quick Links</h5>
              <ul className="mt-2 space-y-2 text-sm text-gray-600">
                <li>
                  <Link href="/requirements" className="hover:text-blue-600">
                    Requirements
                  </Link>
                </li>
                <li>
                  <Link href="/how-to-apply" className="hover:text-blue-600">
                    How to Apply
                  </Link>
                </li>
                <li>
                  <Link href="/faqs" className="hover:text-blue-600">
                    FAQs
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-gray-900">Legal</h5>
              <ul className="mt-2 space-y-2 text-sm text-gray-600">
                <li>
                  <Link href="/privacy" className="hover:text-blue-600">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-blue-600">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/data-privacy"
                    className="hover:text-blue-600"
                  >
                    Data Privacy Act (RA 10173)
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-gray-900">Contact</h5>
              <ul className="mt-2 space-y-2 text-sm text-gray-600">
                <li>Municipal Hall, Main Street</li>
                <li>Phone: (02) 8888-0000</li>
                <li>Email: permits@lgu.gov.ph</li>
                <li>Hours: Mon-Fri, 8:00 AM – 5:00 PM</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Online Business Permit System. All
            rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
