import Link from "next/link";
import { Shield, Clock, CalendarCheck, CheckCircle, ArrowRight, Search } from "lucide-react";
import { PublicNav } from "@/components/public/public-nav";
import { PublicFooter } from "@/components/public/public-footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-4 py-14 text-white sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            {/* Text */}
            <div className="text-center lg:text-left">
              <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-100 mb-4">
                LGU Digital Services
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                Apply for Your Business Permit{" "}
                <span className="text-blue-200">Online</span>
              </h1>
              <p className="mt-4 text-base text-blue-100 sm:text-lg">
                Fast, secure, and convenient. Submit your application, track
                your status, and schedule your claiming — all from your phone or
                computer.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-base font-semibold text-blue-700 shadow-lg hover:bg-blue-50 transition-colors"
                >
                  Apply Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/track"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/40 px-6 py-3 text-base font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  <Search className="h-4 w-4" />
                  Track Application
                </Link>
              </div>
            </div>

            {/* Feature cards — visible on all screens (stack on mobile) */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {[
                { icon: <CheckCircle className="h-5 w-5 text-green-300" />, text: "100% Online Application" },
                { icon: <Clock className="h-5 w-5 text-yellow-300" />, text: "Real-Time Status Tracking" },
                { icon: <CalendarCheck className="h-5 w-5 text-blue-300" />, text: "Convenient Claim Scheduling" },
                { icon: <Shield className="h-5 w-5 text-purple-300" />, text: "Secure & DPA Compliant" },
              ].map((item) => (
                <div
                  key={item.text}
                  className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm"
                >
                  {item.icon}
                  <span className="text-sm font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions Bar */}
      <section className="border-b bg-blue-50 px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
            {[
              { href: "/requirements", label: "📋 View Requirements" },
              { href: "/how-to-apply", label: "📖 How to Apply" },
              { href: "/track", label: "🔍 Track Application" },
              { href: "/verify-permit", label: "✅ Verify Permit" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-blue-700 hover:text-blue-900 hover:underline"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              How It Works
            </h2>
            <p className="mt-3 text-base text-gray-600">
              Get your business permit in 4 simple steps
            </p>
          </div>          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(
              [
                {
                  step: "1",
                  title: "Create Account",
                  description:
                    "Register with your email and verify your identity through OTP verification.",
                },
                {
                  step: "2",
                  title: "Submit Application",
                  description:
                    "Fill out the form and upload required documents online. Save as draft anytime.",
                },
                {
                  step: "3",
                  title: "Track Status",
                  description:
                    "Monitor your application in real-time from submission to approval.",
                },
                {
                  step: "4",
                  title: "Schedule & Claim",
                  description:
                    "Pick your preferred date and time slot to claim your approved permit.",
                },
              ] as const
            ).map((feature) => (
              <div
                key={feature.step}
                className="relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-600">
                  {feature.step}
                </div>
                <h3 className="text-base font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/how-to-apply"
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View detailed guide <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { value: "24/7", label: "Online Access" },
              { value: "3–5 days", label: "Processing Time" },
              { value: "100%", label: "Paperless Process" },
              { value: "DPA", label: "RA 10173 Compliant" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl bg-white p-5 text-center shadow-sm border"
              >
                <p className="text-2xl font-extrabold text-blue-600 sm:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs font-medium text-gray-500 sm:text-sm">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 px-4 py-14 text-white sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Ready to Apply for Your Business Permit?
          </h2>
          <p className="mt-3 text-base text-gray-300 sm:text-lg">
            Join thousands of business owners who have simplified their permit
            application process.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-3 text-base font-semibold text-white hover:bg-blue-500 transition-colors sm:w-auto"
            >
              Get Started
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/requirements"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-600 px-8 py-3 text-base font-semibold text-gray-300 hover:bg-gray-800 transition-colors sm:w-auto"
            >
              View Requirements
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
