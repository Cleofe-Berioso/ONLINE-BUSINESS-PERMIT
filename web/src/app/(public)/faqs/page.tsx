import type { Metadata } from "next";
import Link from "next/link";
import { PublicNav } from "@/components/public/public-nav";
import { PublicFooter } from "@/components/public/public-footer";
import { FaqsClient } from "./faqs-client";
import { MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "Common questions and answers about the Online Business Permit Application System for Philippine LGUs.",
};

const faqs = [
  {
    category: "General",
    questions: [
      {
        q: "What is the Online Business Permit System?",
        a: "The Online Business Permit System is a digital platform that allows business owners to apply for, renew, and manage their business permits online. It eliminates the need for multiple visits to the LGU office.",
      },
      {
        q: "Who can use this system?",
        a: "Any business owner, sole proprietor, or authorized representative who needs to apply for or renew a business permit within the LGU's jurisdiction can use this system.",
      },
      {
        q: "Is there a fee for using the online system?",
        a: "Using the online application system is free. However, standard business permit fees, taxes, and other charges still apply as determined by the LGU.",
      },
      {
        q: "What are the operating hours of the system?",
        a: "The online system is available 24/7. You can submit your application and upload documents at any time. Processing and claiming are done during regular business hours (Monday–Friday, 8:00 AM–5:00 PM).",
      },
    ],
  },
  {
    category: "Application Process",
    questions: [
      {
        q: "How long does the application process take?",
        a: "Once submitted, applications are typically reviewed within 3–5 business days. The total processing time may vary depending on the completeness of your documents and the volume of applications.",
      },
      {
        q: "Can I save my application as a draft?",
        a: "Yes! You can save your application as a draft at any time and return to complete it later. Just log in to your account and continue from where you left off.",
      },
      {
        q: "What happens if my application is rejected?",
        a: "If your application is rejected, you will receive a notification explaining the reason. You may correct the issues and re-submit your application. Common reasons include incomplete documents or incorrect information.",
      },
      {
        q: "Can I apply for multiple business permits?",
        a: "Yes, you can submit separate applications for each business establishment. Each application will have its own unique application number and tracking.",
      },
    ],
  },
  {
    category: "Documents & Requirements",
    questions: [
      {
        q: "What file formats are accepted?",
        a: "We accept PDF, JPEG, PNG, and WebP formats. Each file must not exceed 10MB in size.",
      },
      {
        q: "What if I don't have a scanner?",
        a: "You can take a clear photo of your documents using your smartphone. Make sure the text is legible, the image is well-lit, and the entire document is visible.",
      },
      {
        q: "Can I upload additional documents after submitting?",
        a: "You may upload additional documents if requested by the reviewing staff. You will be notified if additional documents are needed.",
      },
    ],
  },
  {
    category: "Claiming & Permit",
    questions: [
      {
        q: "How do I claim my approved business permit?",
        a: "After your application is approved, you will receive a Claim Reference Number. Use it to schedule a claim appointment through the system. Visit the LGU office on your scheduled date with your reference number and valid ID.",
      },
      {
        q: "Can someone else claim my permit?",
        a: "Yes, an authorized representative can claim on your behalf. They must present: (1) a signed authorization letter, (2) a photocopy of your valid ID, and (3) their own valid ID.",
      },
      {
        q: "What is the validity of the business permit?",
        a: "Business permits are valid for one (1) year from the date of issue. They must be renewed annually, typically before January 20 of each year.",
      },
      {
        q: "Can I reschedule my claiming appointment?",
        a: "Yes, you can cancel and reschedule your claiming appointment through the system, subject to availability of time slots.",
      },
    ],
  },
  {
    category: "Account & Security",
    questions: [
      {
        q: "How do I create an account?",
        a: "Click Register on the homepage, fill in your details, and verify your email address with the OTP sent to you. Once verified, you can log in and start your application.",
      },
      {
        q: "I forgot my password. How do I reset it?",
        a: "Click 'Forgot Password' on the login page. Enter your registered email and follow the instructions sent to your inbox to reset your password.",
      },
      {
        q: "Is my personal data secure?",
        a: "Yes. We comply with Republic Act 10173 (Data Privacy Act of 2012). All personal data is encrypted and stored securely. We do not share your information with third parties without your consent.",
      },
      {
        q: "What is Two-Factor Authentication (2FA)?",
        a: "2FA adds an extra layer of security. When enabled, you'll need to enter a one-time code sent to your phone/email in addition to your password when logging in.",
      },
    ],
  },
];

export default function FaqsPage() {
  return (
    <div className="min-h-screen bg-[var(--surface-muted)] flex flex-col">
      <PublicNav />

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-8 sm:py-12">
        {/* Page Header */}
        <div className="mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-2">
            Frequently Asked Questions
          </h1>
          <p className="text-[var(--text-secondary)] text-sm sm:text-base">
            Find answers to common questions about the Online Business Permit System.
          </p>
        </div>

        {/* FAQ Accordion */}
        <FaqsClient faqs={faqs} />

        {/* Contact CTA */}
        <div className="mt-10 bg-[var(--surface)] rounded-xl border p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <MessageCircle className="h-6 w-6 text-[var(--accent)]" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Still have questions?</h3>
          <p className="text-[var(--text-secondary)] text-sm mb-5">
            Our support team is ready to assist you during business hours.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-[var(--accent)] text-white px-6 py-3 rounded-lg font-medium hover:bg-[var(--accent-hover)] transition-colors text-sm"
          >
            Contact Support
          </Link>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
