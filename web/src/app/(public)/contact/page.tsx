import type { Metadata } from "next";
import { PublicNav } from "@/components/public/public-nav";
import { PublicFooter } from "@/components/public/public-footer";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the LGU Business Permit Office for inquiries and support.",
};

const contactInfo = [
  {
    icon: (
      <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    bg: "bg-blue-100",
    title: "Office Address",
    lines: ["Business Permits & Licensing Office", "City/Municipal Hall", "[LGU Address], Philippines"],
  },
  {
    icon: (
      <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    bg: "bg-green-100",
    title: "Phone",
    lines: ["Trunk Line: (02) 8XXX-XXXX", "Mobile: 0917-XXX-XXXX", "Mon–Fri, 8:00 AM – 5:00 PM"],
  },
  {
    icon: (
      <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    bg: "bg-purple-100",
    title: "Email",
    lines: ["General: bplo@lgu.gov.ph", "Support: support@lgu.gov.ph", "We respond within 24–48 hours"],
  },
  {
    icon: (
      <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    bg: "bg-orange-100",
    title: "Office Hours",
    lines: ["Monday – Friday: 8:00 AM – 5:00 PM", "Saturday, Sunday & Holidays: Closed", "Online system available 24/7"],
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PublicNav />

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-8 sm:py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Contact Us</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Have questions or need assistance? Reach out to us through any of the channels below.
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {contactInfo.map((info) => (
            <div key={info.title} className="bg-white rounded-xl shadow-sm border p-5">
              <div className={`w-11 h-11 ${info.bg} rounded-lg flex items-center justify-center mb-3`}>
                {info.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{info.title}</h3>
              <div className="text-gray-600 text-sm space-y-0.5">
                {info.lines.map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-xl shadow-sm border p-5 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-5">Send Us a Message</h2>
          <ContactForm />
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
